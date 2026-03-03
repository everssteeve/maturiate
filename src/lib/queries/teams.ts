import { eq, and, sql, notInArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { teams, teamMembers, users, memberships } from "@/lib/db/schema";

export async function listTeams(orgId: string) {
  const results = await db
    .select({
      id: teams.id,
      name: teams.name,
      memberCount: sql<number>`(
        SELECT count(*)::int FROM team_members tm
        WHERE tm.team_id = ${teams.id}
      )`,
      createdAt: teams.createdAt,
    })
    .from(teams)
    .where(eq(teams.orgId, orgId))
    .orderBy(teams.name);

  return results;
}

export async function getTeam(teamId: string, orgId: string) {
  const [team] = await db
    .select({
      id: teams.id,
      name: teams.name,
      orgId: teams.orgId,
      createdAt: teams.createdAt,
      updatedAt: teams.updatedAt,
    })
    .from(teams)
    .where(and(eq(teams.id, teamId), eq(teams.orgId, orgId)));

  return team ?? null;
}

export async function listTeamMembers(teamId: string, orgId: string) {
  const results = await db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      name: users.name,
      email: users.email,
      image: users.image,
      role: memberships.role,
    })
    .from(teamMembers)
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .innerJoin(
      memberships,
      and(eq(memberships.userId, teamMembers.userId), eq(memberships.orgId, teams.orgId)),
    )
    .where(and(eq(teamMembers.teamId, teamId), eq(teams.orgId, orgId)))
    .orderBy(users.name);

  return results;
}

export async function listAvailableMembers(teamId: string, orgId: string) {
  const existingMemberIds = db
    .select({ userId: teamMembers.userId })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId));

  const results = await db
    .select({
      userId: memberships.userId,
      name: users.name,
      email: users.email,
      image: users.image,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(users, eq(memberships.userId, users.id))
    .where(
      and(eq(memberships.orgId, orgId), notInArray(memberships.userId, existingMemberIds)),
    )
    .orderBy(users.name);

  return results;
}

export async function listUserTeamIds(userId: string, orgId: string) {
  const results = await db
    .select({ teamId: teamMembers.teamId })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(and(eq(teamMembers.userId, userId), eq(teams.orgId, orgId)));

  return results.map((r) => r.teamId);
}
