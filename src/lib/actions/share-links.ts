"use server";

import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { shareLinks, teamMembers, teams } from "@/lib/db/schema";
import { requireRole } from "@/lib/permissions";
import { getBaseUrl } from "@/lib/utils";
import {
  CreateShareLinkSchema,
  DeleteShareLinkSchema,
} from "@/lib/validations/share-links";

// ── Create Share Link ───────────────────────────

export async function createShareLink(input: {
  orgId: string;
  type: "team" | "campaign" | "org";
  targetId: string;
  expiresAt?: Date;
}) {
  const parsed = CreateShareLinkSchema.parse(input);

  // Permission check depends on type
  const allowedRoles =
    parsed.type === "team"
      ? (["admin", "manager", "consultant"] as const)
      : (["admin", "consultant"] as const);

  const { user, membership } = await requireRole(parsed.orgId, ...allowedRoles);

  // Manager can only share their own teams
  if (parsed.type === "team" && membership.role === "manager") {
    const [teamMembership] = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(
        and(
          eq(teamMembers.userId, user.id),
          eq(teamMembers.teamId, parsed.targetId),
          eq(teams.orgId, parsed.orgId),
        ),
      );

    if (!teamMembership) {
      return { error: "Vous ne pouvez partager que les équipes dont vous êtes membre." };
    }
  }

  const token = crypto.randomUUID();

  await db.insert(shareLinks).values({
    token,
    type: parsed.type,
    targetId: parsed.targetId,
    orgId: parsed.orgId,
    createdBy: user.id,
    expiresAt: parsed.expiresAt ?? null,
  });

  const shareUrl = `${getBaseUrl()}/share/${token}`;

  revalidatePath(`/orgs/${parsed.orgId}`);
  return { success: true, shareUrl, token };
}

// ── Delete Share Link ───────────────────────────

export async function deleteShareLink(input: {
  orgId: string;
  linkId: string;
}) {
  const parsed = DeleteShareLinkSchema.parse(input);
  const { user, membership } = await requireRole(
    parsed.orgId,
    "admin",
    "manager",
    "consultant",
  );

  const [link] = await db
    .select()
    .from(shareLinks)
    .where(
      and(eq(shareLinks.id, parsed.linkId), eq(shareLinks.orgId, parsed.orgId)),
    );

  if (!link) {
    return { error: "Lien introuvable." };
  }

  // Only creator or admin can delete
  if (link.createdBy !== user.id && membership.role !== "admin") {
    return { error: "Seul le créateur du lien ou un administrateur peut le supprimer." };
  }

  await db.delete(shareLinks).where(eq(shareLinks.id, parsed.linkId));

  revalidatePath(`/orgs/${parsed.orgId}`);
  return { success: true };
}
