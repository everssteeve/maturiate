import { eq, and, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { diagnostics, teams, users, bonusQuestions } from "@/lib/db/schema";

export async function getDiagnostic(diagnosticId: string, orgId: string) {
  const [result] = await db
    .select({
      id: diagnostics.id,
      teamId: diagnostics.teamId,
      teamName: teams.name,
      campaignId: diagnostics.campaignId,
      filledBy: diagnostics.filledBy,
      filledByName: users.name,
      answers: diagnostics.answers,
      bonusAnswers: diagnostics.bonusAnswers,
      dimensionScores: diagnostics.dimensionScores,
      globalScore: diagnostics.globalScore,
      globalLevel: diagnostics.globalLevel,
      startedAt: diagnostics.startedAt,
      completedAt: diagnostics.completedAt,
      createdAt: diagnostics.createdAt,
    })
    .from(diagnostics)
    .innerJoin(teams, eq(diagnostics.teamId, teams.id))
    .innerJoin(users, eq(diagnostics.filledBy, users.id))
    .where(and(eq(diagnostics.id, diagnosticId), eq(teams.orgId, orgId)));

  return result ?? null;
}

export async function listTeamDiagnostics(teamId: string, orgId: string) {
  const results = await db
    .select({
      id: diagnostics.id,
      teamId: diagnostics.teamId,
      campaignId: diagnostics.campaignId,
      filledBy: diagnostics.filledBy,
      filledByName: users.name,
      globalScore: diagnostics.globalScore,
      globalLevel: diagnostics.globalLevel,
      completedAt: diagnostics.completedAt,
    })
    .from(diagnostics)
    .innerJoin(teams, eq(diagnostics.teamId, teams.id))
    .innerJoin(users, eq(diagnostics.filledBy, users.id))
    .where(and(eq(diagnostics.teamId, teamId), eq(teams.orgId, orgId)))
    .orderBy(desc(diagnostics.completedAt));

  return results;
}

export async function getLatestDiagnostic(teamId: string, orgId: string) {
  const [result] = await db
    .select({
      id: diagnostics.id,
      teamId: diagnostics.teamId,
      teamName: teams.name,
      filledByName: users.name,
      dimensionScores: diagnostics.dimensionScores,
      globalScore: diagnostics.globalScore,
      globalLevel: diagnostics.globalLevel,
      completedAt: diagnostics.completedAt,
    })
    .from(diagnostics)
    .innerJoin(teams, eq(diagnostics.teamId, teams.id))
    .innerJoin(users, eq(diagnostics.filledBy, users.id))
    .where(and(eq(diagnostics.teamId, teamId), eq(teams.orgId, orgId)))
    .orderBy(desc(diagnostics.completedAt))
    .limit(1);

  return result ?? null;
}

export async function listBonusQuestions(orgId: string) {
  const results = await db
    .select()
    .from(bonusQuestions)
    .where(eq(bonusQuestions.orgId, orgId))
    .orderBy(bonusQuestions.createdAt);

  return results;
}

export async function listActiveBonusQuestions(orgId: string) {
  const results = await db
    .select()
    .from(bonusQuestions)
    .where(and(eq(bonusQuestions.orgId, orgId), eq(bonusQuestions.active, true)))
    .orderBy(bonusQuestions.createdAt);

  return results;
}
