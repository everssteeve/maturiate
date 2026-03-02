"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import { requireRole } from "@/lib/permissions";

const UpdateMemberRoleSchema = z.object({
  orgId: z.string().uuid(),
  membershipId: z.string().uuid(),
  newRole: z.enum(["admin", "manager", "member", "consultant"]),
});

export async function updateMemberRole(input: {
  orgId: string;
  membershipId: string;
  newRole: string;
}) {
  const parsed = UpdateMemberRoleSchema.parse(input);
  const { user } = await requireRole(parsed.orgId, "admin");

  const [target] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, parsed.membershipId), eq(memberships.orgId, parsed.orgId)));

  if (!target) {
    throw new Error("Membre introuvable.");
  }

  if (target.userId === user.id) {
    return { error: "Vous ne pouvez pas modifier votre propre rôle." };
  }

  if (target.role === "admin" && parsed.newRole !== "admin") {
    const adminCount = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.orgId, parsed.orgId), eq(memberships.role, "admin")));

    if (adminCount.length <= 1) {
      return { error: "L'organisation doit avoir au moins un administrateur." };
    }
  }

  await db
    .update(memberships)
    .set({ role: parsed.newRole })
    .where(eq(memberships.id, parsed.membershipId));

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

const RemoveMemberSchema = z.object({
  orgId: z.string().uuid(),
  membershipId: z.string().uuid(),
});

export async function removeMember(input: { orgId: string; membershipId: string }) {
  const parsed = RemoveMemberSchema.parse(input);
  const { user } = await requireRole(parsed.orgId, "admin");

  const [target] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.id, parsed.membershipId), eq(memberships.orgId, parsed.orgId)));

  if (!target) {
    throw new Error("Membre introuvable.");
  }

  if (target.userId === user.id) {
    return { error: "Vous ne pouvez pas vous retirer vous-même de l'organisation." };
  }

  if (target.role === "admin") {
    const adminCount = await db
      .select()
      .from(memberships)
      .where(and(eq(memberships.orgId, parsed.orgId), eq(memberships.role, "admin")));

    if (adminCount.length <= 1) {
      return { error: "L'organisation doit avoir au moins un administrateur." };
    }
  }

  await db.delete(memberships).where(eq(memberships.id, parsed.membershipId));

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}
