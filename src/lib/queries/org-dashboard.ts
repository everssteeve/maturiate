import { eq, and, ne, desc, asc } from "drizzle-orm";

import { db } from "@/lib/db";
import { campaigns, teams, diagnostics } from "@/lib/db/schema";
import { DIMENSION_IDS } from "@/data/dimensions";
import { getLevelForScore } from "@/data/levels";

export type TeamHeatmapRow = {
  teamId: string;
  teamName: string;
  dimensionScores: Record<string, number> | null;
  globalScore: number | null;
  globalLevel: number | null;
};

export type CampaignEvolutionPoint = {
  campaignId: string;
  campaignName: string;
  campaignStartDate: Date;
  avgDimensionScores: Record<string, number>;
  avgGlobalScore: number;
  teamCount: number;
};

export type OrgDashboardData = {
  campaigns: {
    id: string;
    name: string;
    status: string;
    startDate: Date;
    diagnosticCount: number;
  }[];
  selectedCampaignId: string | null;
  heatmap: TeamHeatmapRow[];
  orgScores: {
    byDimension: Record<string, number>;
    globalScore: number;
    globalLevel: number;
    evaluatedTeams: number;
    totalTeams: number;
    strongDimensions: number;
  } | null;
  evolution: CampaignEvolutionPoint[];
};

export function computeAggregateScores(
  diagnosticsList: { dimensionScores: Record<string, number>; globalScore: number }[],
) {
  if (diagnosticsList.length === 0) return null;

  const byDimension: Record<string, number> = {};
  for (const dimId of DIMENSION_IDS) {
    const scores = diagnosticsList
      .map((d) => d.dimensionScores[dimId])
      .filter((s) => s != null);
    if (scores.length > 0) {
      byDimension[dimId] = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
    }
  }

  const dimValues = Object.values(byDimension);
  const globalScore =
    Math.round((dimValues.reduce((a, b) => a + b, 0) / dimValues.length) * 100) / 100;
  const globalLevel = getLevelForScore(globalScore).level;

  const strongDimensions = dimValues.filter((s) => s >= 2.5).length;

  return { byDimension, globalScore, globalLevel, strongDimensions };
}

export async function getOrgDashboardData(
  orgId: string,
  options?: { campaignId?: string; teamIds?: string[] },
): Promise<OrgDashboardData> {
  // 1. Get all non-draft campaigns
  const orgCampaigns = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      status: campaigns.status,
      startDate: campaigns.startDate,
    })
    .from(campaigns)
    .where(and(eq(campaigns.orgId, orgId), ne(campaigns.status, "draft")))
    .orderBy(desc(campaigns.startDate));

  // Count diagnostics per campaign
  const campaignsWithCount = await Promise.all(
    orgCampaigns.map(async (c) => {
      const diags = await db
        .select({ id: diagnostics.id })
        .from(diagnostics)
        .innerJoin(teams, eq(diagnostics.teamId, teams.id))
        .where(and(eq(diagnostics.campaignId, c.id), eq(teams.orgId, orgId)));
      return { ...c, diagnosticCount: diags.length };
    }),
  );

  // 2. Select campaign (provided or most recent)
  const selectedCampaignId =
    options?.campaignId ?? (campaignsWithCount.length > 0 ? campaignsWithCount[0].id : null);

  // 3. Get all teams (possibly filtered)
  const allTeams = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(eq(teams.orgId, orgId))
    .orderBy(asc(teams.name));

  const filteredTeams =
    options?.teamIds && options.teamIds.length > 0
      ? allTeams.filter((t) => options.teamIds!.includes(t.id))
      : allTeams;

  // 4. Get diagnostics for selected campaign
  let heatmap: TeamHeatmapRow[] = [];
  let orgScores: OrgDashboardData["orgScores"] = null;

  if (selectedCampaignId) {
    const campaignDiags = await db
      .select({
        teamId: diagnostics.teamId,
        dimensionScores: diagnostics.dimensionScores,
        globalScore: diagnostics.globalScore,
        globalLevel: diagnostics.globalLevel,
      })
      .from(diagnostics)
      .innerJoin(teams, eq(diagnostics.teamId, teams.id))
      .where(and(eq(diagnostics.campaignId, selectedCampaignId), eq(teams.orgId, orgId)));

    const diagByTeam = new Map(campaignDiags.map((d) => [d.teamId, d]));

    heatmap = filteredTeams.map((team) => {
      const diag = diagByTeam.get(team.id);
      return {
        teamId: team.id,
        teamName: team.name,
        dimensionScores: diag ? (diag.dimensionScores as Record<string, number>) : null,
        globalScore: diag ? diag.globalScore : null,
        globalLevel: diag ? diag.globalLevel : null,
      };
    });

    // Compute aggregate scores
    const completedDiags = campaignDiags
      .filter((d) => options?.teamIds == null || options.teamIds.includes(d.teamId))
      .map((d) => ({
        dimensionScores: d.dimensionScores as Record<string, number>,
        globalScore: d.globalScore,
      }));

    const aggregate = computeAggregateScores(completedDiags);
    if (aggregate) {
      orgScores = {
        ...aggregate,
        evaluatedTeams: completedDiags.length,
        totalTeams: filteredTeams.length,
      };
    }
  }

  // 5. Get evolution data (all campaigns)
  const evolution: CampaignEvolutionPoint[] = [];
  for (const campaign of campaignsWithCount) {
    if (campaign.diagnosticCount === 0) continue;

    const diags = await db
      .select({
        teamId: diagnostics.teamId,
        dimensionScores: diagnostics.dimensionScores,
        globalScore: diagnostics.globalScore,
      })
      .from(diagnostics)
      .innerJoin(teams, eq(diagnostics.teamId, teams.id))
      .where(and(eq(diagnostics.campaignId, campaign.id), eq(teams.orgId, orgId)));

    const relevantDiags =
      options?.teamIds && options.teamIds.length > 0
        ? diags.filter((d) => options.teamIds!.includes(d.teamId))
        : diags;

    if (relevantDiags.length === 0) continue;

    const aggregate = computeAggregateScores(
      relevantDiags.map((d) => ({
        dimensionScores: d.dimensionScores as Record<string, number>,
        globalScore: d.globalScore,
      })),
    );

    if (aggregate) {
      evolution.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        campaignStartDate: campaign.startDate,
        avgDimensionScores: aggregate.byDimension,
        avgGlobalScore: aggregate.globalScore,
        teamCount: relevantDiags.length,
      });
    }
  }

  // Sort evolution chronologically (ascending)
  evolution.sort((a, b) => a.campaignStartDate.getTime() - b.campaignStartDate.getTime());

  return {
    campaigns: campaignsWithCount,
    selectedCampaignId,
    heatmap,
    orgScores,
    evolution,
  };
}
