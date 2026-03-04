import { eq, and, desc, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { campaigns, teams, diagnostics, users } from "@/lib/db/schema";

export async function listCampaigns(orgId: string) {
  const results = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      status: campaigns.status,
      startDate: campaigns.startDate,
      endDate: campaigns.endDate,
      createdAt: campaigns.createdAt,
      totalTeams: sql<number>`(
        SELECT count(*)::int FROM teams t
        WHERE t.org_id = campaigns.org_id
      )`,
      respondedTeams: sql<number>`(
        SELECT count(DISTINCT d.team_id)::int FROM diagnostics d
        INNER JOIN teams t ON d.team_id = t.id
        WHERE d.campaign_id = campaigns.id
          AND t.org_id = campaigns.org_id
      )`,
    })
    .from(campaigns)
    .where(eq(campaigns.orgId, orgId))
    .orderBy(desc(campaigns.createdAt));

  return results.map((c) => ({
    ...c,
    completionPercent:
      c.totalTeams > 0 ? Math.round((c.respondedTeams / c.totalTeams) * 100) : 0,
  }));
}

export async function getCampaign(campaignId: string, orgId: string) {
  const [result] = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      status: campaigns.status,
      startDate: campaigns.startDate,
      endDate: campaigns.endDate,
      createdBy: campaigns.createdBy,
      createdAt: campaigns.createdAt,
      updatedAt: campaigns.updatedAt,
    })
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.orgId, orgId)));

  return result ?? null;
}

export async function getCampaignDetail(campaignId: string, orgId: string) {
  const campaign = await getCampaign(campaignId, orgId);
  if (!campaign) return null;

  const allTeams = await db
    .select({
      teamId: teams.id,
      teamName: teams.name,
    })
    .from(teams)
    .where(eq(teams.orgId, orgId))
    .orderBy(teams.name);

  const campaignDiagnostics = await db
    .select({
      teamId: diagnostics.teamId,
      diagnosticId: diagnostics.id,
      filledBy: diagnostics.filledBy,
      filledByName: users.name,
      globalScore: diagnostics.globalScore,
      globalLevel: diagnostics.globalLevel,
      completedAt: diagnostics.completedAt,
    })
    .from(diagnostics)
    .innerJoin(users, eq(diagnostics.filledBy, users.id))
    .where(eq(diagnostics.campaignId, campaignId));

  const diagnosticsByTeam = new Map(
    campaignDiagnostics.map((d) => [d.teamId, d]),
  );

  const teamsStatus = allTeams.map((t) => {
    const diag = diagnosticsByTeam.get(t.teamId);
    return {
      teamId: t.teamId,
      teamName: t.teamName,
      diagnosticId: diag?.diagnosticId ?? null,
      filledByName: diag?.filledByName ?? null,
      globalScore: diag?.globalScore ?? null,
      globalLevel: diag?.globalLevel ?? null,
      completedAt: diag?.completedAt ?? null,
    };
  });

  const totalTeams = allTeams.length;
  const respondedTeams = campaignDiagnostics.length;

  return {
    campaign,
    teamsStatus,
    totalTeams,
    respondedTeams,
    completionPercent:
      totalTeams > 0 ? Math.round((respondedTeams / totalTeams) * 100) : 0,
  };
}
