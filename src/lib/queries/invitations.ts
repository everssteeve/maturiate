import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { invitations, organizations } from "@/lib/db/schema";

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
