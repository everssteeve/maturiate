import { eq, and, desc, isNotNull, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import { stateOfIaSnapshots, stateOfIaReports } from "@/lib/db/schema";
import { DIMENSION_IDS } from "@/data/dimensions";
import type { ReportContent } from "@/lib/validations/state-of-ia";

// ── Types ────────────────────────────────────────

export type BenchmarkPercentiles = {
  globalPercentile: number;
  dimensionPercentiles: Record<string, number>;
  globalScore: number;
  dimensionScores: Record<string, number>;
  totalOrganizations: number;
};

export type AggregatedStats = {
  totalOrganizations: number;
  totalTeams: number;
  avgGlobalScore: number;
  avgGlobalLevel: number;
  distributionByLevel: { level: number; count: number; percentage: number }[];
  avgByDimension: Record<string, number>;
  bySegment: {
    bySector: { sector: string; avgScore: number; count: number }[];
    bySize: { size: string; avgScore: number; count: number }[];
  };
};

export type SegmentFilters = {
  sector?: string;
  size?: string;
};

// ── Queries ──────────────────────────────────────

export async function getLatestPublishedYear(): Promise<number | null> {
  const [report] = await db
    .select({ year: stateOfIaReports.year })
    .from(stateOfIaReports)
    .where(isNotNull(stateOfIaReports.publishedAt))
    .orderBy(desc(stateOfIaReports.year))
    .limit(1);

  return report?.year ?? null;
}

export async function getPublishedYears(): Promise<number[]> {
  const reports = await db
    .select({ year: stateOfIaReports.year })
    .from(stateOfIaReports)
    .where(isNotNull(stateOfIaReports.publishedAt))
    .orderBy(desc(stateOfIaReports.year));

  return reports.map((r) => r.year);
}

export async function getReport(year: number) {
  const [report] = await db
    .select()
    .from(stateOfIaReports)
    .where(eq(stateOfIaReports.year, year));

  return report ?? null;
}

export async function getPublishedReport(year: number) {
  const [report] = await db
    .select()
    .from(stateOfIaReports)
    .where(
      and(eq(stateOfIaReports.year, year), isNotNull(stateOfIaReports.publishedAt)),
    );

  if (!report) return null;

  return {
    ...report,
    content: report.content as ReportContent,
  };
}

export async function listReports() {
  return db
    .select()
    .from(stateOfIaReports)
    .orderBy(desc(stateOfIaReports.year));
}

export async function getSnapshotsForYear(year: number) {
  return db
    .select()
    .from(stateOfIaSnapshots)
    .where(eq(stateOfIaSnapshots.year, year));
}

export async function getExtractionHistory() {
  const results = await db
    .select({
      year: stateOfIaSnapshots.year,
      count: sql<number>`count(*)::int`,
      extractedAt: sql<Date>`max(${stateOfIaSnapshots.extractedAt})`,
    })
    .from(stateOfIaSnapshots)
    .groupBy(stateOfIaSnapshots.year)
    .orderBy(desc(stateOfIaSnapshots.year));

  return results;
}

export async function getSegmentCounts(year: number) {
  const bySector = await db
    .select({
      sector: stateOfIaSnapshots.sector,
      count: sql<number>`count(*)::int`,
    })
    .from(stateOfIaSnapshots)
    .where(eq(stateOfIaSnapshots.year, year))
    .groupBy(stateOfIaSnapshots.sector);

  const bySize = await db
    .select({
      size: stateOfIaSnapshots.size,
      count: sql<number>`count(*)::int`,
    })
    .from(stateOfIaSnapshots)
    .where(eq(stateOfIaSnapshots.year, year))
    .groupBy(stateOfIaSnapshots.size);

  return { bySector, bySize };
}

export async function getBenchmarkPercentiles(
  year: number,
  orgHash: string,
  filters?: SegmentFilters,
): Promise<BenchmarkPercentiles | null> {
  // Get all snapshots for the year (optionally filtered)
  const conditions = [eq(stateOfIaSnapshots.year, year)];
  if (filters?.sector) {
    conditions.push(sql`${stateOfIaSnapshots.sector} = ${filters.sector}`);
  }
  if (filters?.size) {
    conditions.push(sql`${stateOfIaSnapshots.size} = ${filters.size}`);
  }

  const snapshots = await db
    .select()
    .from(stateOfIaSnapshots)
    .where(and(...conditions));

  if (snapshots.length === 0) return null;

  // Find the org's snapshot
  const orgSnapshot = snapshots.find((s) => s.organisationHash === orgHash);
  if (!orgSnapshot) return null;

  // Calculate percentiles
  const globalScores = snapshots.map((s) => s.globalScore).sort((a, b) => a - b);
  const globalPercentile = computePercentile(globalScores, orgSnapshot.globalScore);

  const dimensionPercentiles: Record<string, number> = {};
  const orgDimScores = orgSnapshot.scoresByDimension as Record<string, number>;

  for (const dimId of DIMENSION_IDS) {
    const dimScores = snapshots
      .map((s) => (s.scoresByDimension as Record<string, number>)[dimId])
      .filter((s) => s != null)
      .sort((a, b) => a - b);

    if (dimScores.length > 0 && orgDimScores[dimId] != null) {
      dimensionPercentiles[dimId] = computePercentile(dimScores, orgDimScores[dimId]);
    }
  }

  return {
    globalPercentile,
    dimensionPercentiles,
    globalScore: orgSnapshot.globalScore,
    dimensionScores: orgDimScores,
    totalOrganizations: snapshots.length,
  };
}

export async function getAggregatedStats(year: number): Promise<AggregatedStats | null> {
  const snapshots = await db
    .select()
    .from(stateOfIaSnapshots)
    .where(eq(stateOfIaSnapshots.year, year));

  if (snapshots.length === 0) return null;

  const totalOrganizations = snapshots.length;
  const totalTeams = snapshots.reduce((sum, s) => sum + s.teamCount, 0);
  const avgGlobalScore =
    Math.round(
      (snapshots.reduce((sum, s) => sum + s.globalScore, 0) / totalOrganizations) * 100,
    ) / 100;
  const avgGlobalLevel =
    Math.round(
      (snapshots.reduce((sum, s) => sum + s.globalLevel, 0) / totalOrganizations) * 100,
    ) / 100;

  // Distribution by level
  const levelCounts = [0, 0, 0, 0]; // levels 1-4
  for (const s of snapshots) {
    if (s.globalLevel >= 1 && s.globalLevel <= 4) {
      levelCounts[s.globalLevel - 1]++;
    }
  }
  const distributionByLevel = levelCounts.map((count, i) => ({
    level: i + 1,
    count,
    percentage: Math.round((count / totalOrganizations) * 100),
  }));

  // Average by dimension
  const avgByDimension: Record<string, number> = {};
  for (const dimId of DIMENSION_IDS) {
    const scores = snapshots
      .map((s) => (s.scoresByDimension as Record<string, number>)[dimId])
      .filter((s) => s != null);
    if (scores.length > 0) {
      avgByDimension[dimId] =
        Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
    }
  }

  // By segment
  const sectorMap = new Map<string, { total: number; count: number }>();
  const sizeMap = new Map<string, { total: number; count: number }>();

  for (const s of snapshots) {
    if (s.sector) {
      const entry = sectorMap.get(s.sector) ?? { total: 0, count: 0 };
      entry.total += s.globalScore;
      entry.count++;
      sectorMap.set(s.sector, entry);
    }
    if (s.size) {
      const entry = sizeMap.get(s.size) ?? { total: 0, count: 0 };
      entry.total += s.globalScore;
      entry.count++;
      sizeMap.set(s.size, entry);
    }
  }

  const bySector = Array.from(sectorMap.entries()).map(([sector, { total, count }]) => ({
    sector,
    avgScore: Math.round((total / count) * 100) / 100,
    count,
  }));

  const bySize = Array.from(sizeMap.entries()).map(([size, { total, count }]) => ({
    size,
    avgScore: Math.round((total / count) * 100) / 100,
    count,
  }));

  return {
    totalOrganizations,
    totalTeams,
    avgGlobalScore,
    avgGlobalLevel,
    distributionByLevel,
    avgByDimension,
    bySegment: { bySector, bySize },
  };
}

export async function getTrendsByYear(): Promise<
  { year: number; avgGlobalScore: number; totalOrganizations: number }[]
> {
  const results = await db
    .select({
      year: stateOfIaSnapshots.year,
      avgGlobalScore: sql<number>`round(avg(${stateOfIaSnapshots.globalScore})::numeric, 2)::float`,
      totalOrganizations: sql<number>`count(*)::int`,
    })
    .from(stateOfIaSnapshots)
    .groupBy(stateOfIaSnapshots.year)
    .orderBy(stateOfIaSnapshots.year);

  return results;
}

// ── Helpers ──────────────────────────────────────

function computePercentile(sortedValues: number[], value: number): number {
  if (sortedValues.length <= 1) return 50;

  const below = sortedValues.filter((v) => v < value).length;
  const equal = sortedValues.filter((v) => v === value).length;

  const percentile = ((below + 0.5 * equal) / sortedValues.length) * 100;
  return Math.round(percentile);
}
