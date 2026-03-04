import { eq, and, desc } from "drizzle-orm";

import { db } from "@/lib/db";
import { diagnostics, teams, users, campaigns } from "@/lib/db/schema";
import { DIMENSION_IDS } from "@/data/dimensions";
import { getLevelForScore } from "@/data/levels";
import type { DimensionId } from "@/types";

export type TrendDirection = "up" | "down" | "stable";

export type Trend = {
  direction: TrendDirection;
  diff: number;
};

export type TeamDiagnosticEntry = {
  id: string;
  completedAt: Date;
  filledByName: string;
  globalScore: number;
  globalLevel: number;
  dimensionScores: Record<string, number>;
  campaignId: string | null;
  campaignName: string | null;
};

export type EvolutionPoint = {
  date: Date;
  label: string;
  globalScore: number;
  dimensionScores: Record<string, number>;
};

export type TeamDashboardData = {
  team: {
    id: string;
    name: string;
  };
  diagnostics: TeamDiagnosticEntry[];
  latestDiagnostic: TeamDiagnosticEntry | null;
  evolution: EvolutionPoint[];
  globalTrend: Trend | null;
  dimensionTrends: Record<string, Trend> | null;
};

export function computeTrend(current: number, previous: number): Trend {
  const diff = Math.round((current - previous) * 100) / 100;
  if (diff > 0.1) return { direction: "up", diff };
  if (diff < -0.1) return { direction: "down", diff };
  return { direction: "stable", diff };
}

export function computeDimensionTrends(
  currentScores: Record<string, number>,
  previousScores: Record<string, number>,
): Record<string, Trend> {
  const trends: Record<string, Trend> = {};
  for (const dimId of DIMENSION_IDS) {
    const current = currentScores[dimId];
    const previous = previousScores[dimId];
    if (current != null && previous != null) {
      trends[dimId] = computeTrend(current, previous);
    }
  }
  return trends;
}

export async function getTeamDashboardData(
  teamId: string,
  orgId: string,
): Promise<TeamDashboardData | null> {
  // 1. Verify team exists and belongs to org
  const [team] = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(and(eq(teams.id, teamId), eq(teams.orgId, orgId)));

  if (!team) return null;

  // 2. Get all diagnostics for the team with campaign info
  const rawDiagnostics = await db
    .select({
      id: diagnostics.id,
      completedAt: diagnostics.completedAt,
      filledByName: users.name,
      globalScore: diagnostics.globalScore,
      globalLevel: diagnostics.globalLevel,
      dimensionScores: diagnostics.dimensionScores,
      campaignId: diagnostics.campaignId,
      campaignName: campaigns.name,
    })
    .from(diagnostics)
    .innerJoin(teams, eq(diagnostics.teamId, teams.id))
    .innerJoin(users, eq(diagnostics.filledBy, users.id))
    .leftJoin(campaigns, eq(diagnostics.campaignId, campaigns.id))
    .where(and(eq(diagnostics.teamId, teamId), eq(teams.orgId, orgId)))
    .orderBy(desc(diagnostics.completedAt));

  const teamDiagnostics: TeamDiagnosticEntry[] = rawDiagnostics.map((d) => ({
    id: d.id,
    completedAt: d.completedAt,
    filledByName: d.filledByName,
    globalScore: d.globalScore,
    globalLevel: d.globalLevel,
    dimensionScores: d.dimensionScores as Record<string, number>,
    campaignId: d.campaignId,
    campaignName: d.campaignName,
  }));

  const latestDiagnostic = teamDiagnostics.length > 0 ? teamDiagnostics[0] : null;

  // 3. Build evolution data (chronological order, oldest first)
  const evolution: EvolutionPoint[] = [...teamDiagnostics]
    .reverse()
    .map((d) => ({
      date: d.completedAt,
      label: d.campaignName ?? formatDate(d.completedAt),
      globalScore: d.globalScore,
      dimensionScores: d.dimensionScores,
    }));

  // 4. Compute global trend
  let globalTrend: Trend | null = null;
  let dimensionTrends: Record<string, Trend> | null = null;

  if (teamDiagnostics.length >= 2) {
    const current = teamDiagnostics[0];
    const previous = teamDiagnostics[1];
    globalTrend = computeTrend(current.globalScore, previous.globalScore);
    dimensionTrends = computeDimensionTrends(
      current.dimensionScores,
      previous.dimensionScores,
    );
  }

  return {
    team,
    diagnostics: teamDiagnostics,
    latestDiagnostic,
    evolution,
    globalTrend,
    dimensionTrends,
  };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
