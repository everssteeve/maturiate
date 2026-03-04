import { eq, and, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  shareLinks,
  organizations,
  teams,
  campaigns,
} from "@/lib/db/schema";

export type ShareLinkRow = {
  id: string;
  token: string;
  type: string;
  targetId: string;
  orgId: string;
  createdBy: string;
  expiresAt: Date | null;
  createdAt: Date;
};

export async function getShareLinkByToken(token: string) {
  const [link] = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.token, token));

  return link ?? null;
}

export async function listShareLinksByTarget(
  orgId: string,
  type: string,
  targetId: string,
): Promise<ShareLinkRow[]> {
  return db
    .select()
    .from(shareLinks)
    .where(
      and(
        eq(shareLinks.orgId, orgId),
        eq(shareLinks.type, type),
        eq(shareLinks.targetId, targetId),
      ),
    )
    .orderBy(desc(shareLinks.createdAt));
}

type ValidateResult =
  | { valid: false; reason: "not_found" | "expired" }
  | { valid: true; link: ShareLinkRow; targetName: string };

export async function validateShareLink(token: string): Promise<ValidateResult> {
  const link = await getShareLinkByToken(token);
  if (!link) return { valid: false, reason: "not_found" as const };

  if (link.expiresAt && link.expiresAt < new Date()) {
    return { valid: false, reason: "expired" as const };
  }

  // Verify target still exists
  if (link.type === "org") {
    const [org] = await db
      .select({ id: organizations.id, name: organizations.name })
      .from(organizations)
      .where(eq(organizations.id, link.targetId));
    if (!org) return { valid: false, reason: "not_found" as const };
    return { valid: true, link, targetName: org.name };
  }

  if (link.type === "team") {
    const [team] = await db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .where(and(eq(teams.id, link.targetId), eq(teams.orgId, link.orgId)));
    if (!team) return { valid: false, reason: "not_found" as const };
    return { valid: true, link, targetName: team.name };
  }

  if (link.type === "campaign") {
    const [campaign] = await db
      .select({ id: campaigns.id, name: campaigns.name })
      .from(campaigns)
      .where(
        and(eq(campaigns.id, link.targetId), eq(campaigns.orgId, link.orgId)),
      );
    if (!campaign) return { valid: false, reason: "not_found" as const };
    return { valid: true, link, targetName: campaign.name };
  }

  return { valid: false, reason: "not_found" as const };
}
