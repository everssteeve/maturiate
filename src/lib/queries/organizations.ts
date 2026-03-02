import { eq, sql, and, count } from "drizzle-orm";

import { db } from "@/lib/db";
import { organizations, memberships, users } from "@/lib/db/schema";

export async function listUserOrganizations(userId: string) {
  const results = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      logo: organizations.logo,
      sector: organizations.sector,
      role: memberships.role,
      memberCount: sql<number>`(
        SELECT count(*)::int FROM memberships m2
        WHERE m2.org_id = ${organizations.id}
      )`,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(eq(memberships.userId, userId));

  return results;
}

export async function getOrganization(orgId: string) {
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      logo: organizations.logo,
      sector: organizations.sector,
      size: organizations.size,
      optInStateOfIa: organizations.optInStateOfIa,
      optInDate: organizations.optInDate,
      optOutDate: organizations.optOutDate,
      createdAt: organizations.createdAt,
      memberCount: sql<number>`(
        SELECT count(*)::int FROM memberships m
        WHERE m.org_id = ${organizations.id}
      )`,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId));

  return org ?? null;
}
