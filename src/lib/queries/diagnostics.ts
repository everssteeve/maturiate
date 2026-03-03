import { eq, and, desc, asc, isNotNull, inArray } from "drizzle-orm";

import { db } from "@/lib/db";
import { diagnostics, teams, users, bonusQuestions, campaigns } from "@/lib/db/schema";

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
      dimensionScores: diagnostics.dimensionScores,
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

export async function listCampaignDiagnostics(campaignId: string, orgId: string) {
  const results = await db
    .select({
      id: diagnostics.id,
      teamId: diagnostics.teamId,
      teamName: teams.name,
      dimensionScores: diagnostics.dimensionScores,
      globalScore: diagnostics.globalScore,
      globalLevel: diagnostics.globalLevel,
      completedAt: diagnostics.completedAt,
    })
    .from(diagnostics)
    .innerJoin(teams, eq(diagnostics.teamId, teams.id))
    .where(and(eq(diagnostics.campaignId, campaignId), eq(teams.orgId, orgId)))
    .orderBy(asc(teams.name));

  return results;
}

export async function listOrgDiagnosticsByCampaign(
  orgId: string,
  teamIds?: string[],
) {
  const baseConditions = [
    eq(teams.orgId, orgId),
    isNotNull(diagnostics.campaignId),
  ];
  if (teamIds && teamIds.length > 0) {
    baseConditions.push(inArray(diagnostics.teamId, teamIds));
  }

  const results = await db
    .select({
      campaignId: campaigns.id,
      campaignName: campaigns.name,
      campaignStartDate: campaigns.startDate,
      dimensionScores: diagnostics.dimensionScores,
      globalScore: diagnostics.globalScore,
    })
    .from(diagnostics)
    .innerJoin(teams, eq(diagnostics.teamId, teams.id))
    .innerJoin(campaigns, eq(diagnostics.campaignId, campaigns.id))
    .where(and(...baseConditions))
    .orderBy(asc(campaigns.startDate));

  const grouped = new Map<
    string,
    {
      campaignId: string;
      campaignName: string;
      campaignStartDate: Date;
      diagnostics: { dimensionScores: Record<string, number>; globalScore: number }[];
    }
  >();

  for (const row of results) {
    if (!grouped.has(row.campaignId)) {
      grouped.set(row.campaignId, {
        campaignId: row.campaignId,
        campaignName: row.campaignName,
        campaignStartDate: row.campaignStartDate,
        diagnostics: [],
      });
    }
    grouped.get(row.campaignId)!.diagnostics.push({
      dimensionScores: row.dimensionScores as Record<string, number>,
      globalScore: row.globalScore,
    });
  }

  return Array.from(grouped.values());
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
