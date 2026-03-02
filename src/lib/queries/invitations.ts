import { eq, and, isNull, desc, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { invitations, organizations, users } from "@/lib/db/schema";

export async function getInvitationByToken(token: string) {
  const [result] = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      orgId: invitations.orgId,
      role: invitations.role,
      token: invitations.token,
      acceptedAt: invitations.acceptedAt,
      expiresAt: invitations.expiresAt,
      orgName: organizations.name,
    })
    .from(invitations)
    .innerJoin(organizations, eq(invitations.orgId, organizations.id))
    .where(eq(invitations.token, token));

  return result ?? null;
}

export async function listPendingInvitations(orgId: string) {
  const results = await db
    .select({
      id: invitations.id,
      email: invitations.email,
      role: invitations.role,
      token: invitations.token,
      invitedByName: users.name,
      createdAt: invitations.createdAt,
      expiresAt: invitations.expiresAt,
      isExpired: sql<boolean>`${invitations.expiresAt} < now()`,
    })
    .from(invitations)
    .innerJoin(users, eq(invitations.invitedBy, users.id))
    .where(and(eq(invitations.orgId, orgId), isNull(invitations.acceptedAt)))
    .orderBy(desc(invitations.createdAt));

  return results;
}
