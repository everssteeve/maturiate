import { eq, and, desc, ne, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { memberships, organizations, teams, diagnostics, campaigns } from "@/lib/db/schema";
import { getLevelForScore } from "@/data/levels";
import { computeAggregateScores } from "@/lib/queries/org-dashboard";

export type ConsultantOrgSummary = {
  orgId: string;
  orgName: string;
  orgLogo: string | null;
  sector: string | null;
  size: string | null;
  avgScore: number | null;
  globalLevel: number | null;
  evaluatedTeams: number;
  totalTeams: number;
  lastCampaign: {
    name: string;
    status: string;
    startDate: Date;
    completionRate: number;
  } | null;
  trend: number | null;
};

export type ConsultantOverviewData = {
  organizations: ConsultantOrgSummary[];
  stats: {
    totalOrganizations: number;
    avgGlobalScore: number | null;
    totalEvaluatedTeams: number;
  };
};

/**
 * Check if a user has at least one membership with the consultant role.
 */
export async function isConsultant(userId: string): Promise<boolean> {
  const [result] = await db
    .select({ id: memberships.id })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), eq(memberships.role, "consultant")))
    .limit(1);

  return !!result;
}

/**
 * Get consolidated overview data for a consultant across all their organizations.
 */
export async function getConsultantOverview(userId: string): Promise<ConsultantOverviewData> {
  // 1. Get all organizations where user is consultant
  const consultantOrgs = await db
    .select({
      orgId: organizations.id,
      orgName: organizations.name,
      orgLogo: organizations.logo,
      sector: organizations.sector,
      size: organizations.size,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(and(eq(memberships.userId, userId), eq(memberships.role, "consultant")));

  if (consultantOrgs.length === 0) {
    return {
      organizations: [],
      stats: { totalOrganizations: 0, avgGlobalScore: null, totalEvaluatedTeams: 0 },
    };
  }

  const orgSummaries: ConsultantOrgSummary[] = [];

  for (const org of consultantOrgs) {
    // 2. Get all teams for this org
    const orgTeams = await db
      .select({ id: teams.id })
      .from(teams)
      .where(eq(teams.orgId, org.orgId));

    const totalTeams = orgTeams.length;

    // 3. Get latest diagnostic per team (across all campaigns)
    const latestDiagnostics = await db
      .select({
        teamId: diagnostics.teamId,
        globalScore: diagnostics.globalScore,
        dimensionScores: diagnostics.dimensionScores,
        completedAt: diagnostics.completedAt,
      })
      .from(diagnostics)
      .innerJoin(teams, eq(diagnostics.teamId, teams.id))
      .where(
        and(
          eq(teams.orgId, org.orgId),
          sql`${diagnostics.id} = (
            SELECT d2.id FROM diagnostics d2
            WHERE d2.team_id = ${diagnostics.teamId}
            ORDER BY d2.completed_at DESC
            LIMIT 1
          )`,
        ),
      );

    const evaluatedTeams = latestDiagnostics.length;

    // Compute aggregate score
    let avgScore: number | null = null;
    let globalLevel: number | null = null;

    if (latestDiagnostics.length > 0) {
      const aggregate = computeAggregateScores(
        latestDiagnostics.map((d) => ({
          dimensionScores: d.dimensionScores as Record<string, number>,
          globalScore: d.globalScore,
        })),
      );
      if (aggregate) {
        avgScore = aggregate.globalScore;
        globalLevel = aggregate.globalLevel;
      }
    }

    // 4. Get last campaign
    const orgCampaigns = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        status: campaigns.status,
        startDate: campaigns.startDate,
      })
      .from(campaigns)
      .where(and(eq(campaigns.orgId, org.orgId), ne(campaigns.status, "draft")))
      .orderBy(desc(campaigns.startDate))
      .limit(2);

    let lastCampaign: ConsultantOrgSummary["lastCampaign"] = null;
    if (orgCampaigns.length > 0) {
      const latestCamp = orgCampaigns[0];
      const diagCount = await db
        .select({ id: diagnostics.id })
        .from(diagnostics)
        .innerJoin(teams, eq(diagnostics.teamId, teams.id))
        .where(and(eq(diagnostics.campaignId, latestCamp.id), eq(teams.orgId, org.orgId)));

      lastCampaign = {
        name: latestCamp.name,
        status: latestCamp.status,
        startDate: latestCamp.startDate,
        completionRate: totalTeams > 0 ? diagCount.length / totalTeams : 0,
      };
    }

    // 5. Compute trend (delta between last 2 campaigns)
    let trend: number | null = null;
    if (orgCampaigns.length >= 2) {
      const campaignScores = await Promise.all(
        orgCampaigns.slice(0, 2).map(async (camp) => {
          const diags = await db
            .select({ globalScore: diagnostics.globalScore })
            .from(diagnostics)
            .innerJoin(teams, eq(diagnostics.teamId, teams.id))
            .where(and(eq(diagnostics.campaignId, camp.id), eq(teams.orgId, org.orgId)));

          if (diags.length === 0) return null;
          return diags.reduce((sum, d) => sum + d.globalScore, 0) / diags.length;
        }),
      );

      if (campaignScores[0] != null && campaignScores[1] != null) {
        trend = Math.round((campaignScores[0] - campaignScores[1]) * 100) / 100;
      }
    }

    orgSummaries.push({
      orgId: org.orgId,
      orgName: org.orgName,
      orgLogo: org.orgLogo,
      sector: org.sector,
      size: org.size,
      avgScore,
      globalLevel,
      evaluatedTeams,
      totalTeams,
      lastCampaign,
      trend,
    });
  }

  // 6. Compute global stats
  const orgsWithScores = orgSummaries.filter((o) => o.avgScore != null);
  const avgGlobalScore =
    orgsWithScores.length > 0
      ? Math.round(
          (orgsWithScores.reduce((sum, o) => sum + o.avgScore!, 0) / orgsWithScores.length) * 100,
        ) / 100
      : null;

  const totalEvaluatedTeams = orgSummaries.reduce((sum, o) => sum + o.evaluatedTeams, 0);

  return {
    organizations: orgSummaries,
    stats: {
      totalOrganizations: orgSummaries.length,
      avgGlobalScore,
      totalEvaluatedTeams,
    },
  };
}
