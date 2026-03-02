import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { memberships, users } from "@/lib/db/schema";

export async function listOrganizationMembers(orgId: string) {
  const results = await db
    .select({
      id: memberships.id,
      userId: memberships.userId,
      name: users.name,
      email: users.email,
      image: users.image,
      role: memberships.role,
      createdAt: memberships.createdAt,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(eq(memberships.orgId, orgId))
    .orderBy(memberships.createdAt);

  return results;
}
