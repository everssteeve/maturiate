"use server";

import { eq, and, desc, isNotNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import {
  organizations,
  campaigns,
  diagnostics,
  teams,
  stateOfIaSnapshots,
  stateOfIaReports,
} from "@/lib/db/schema";
import { requireSuperAdmin } from "@/lib/permissions";
import { hashOrganization } from "@/lib/utils/anonymize";
import { DIMENSION_IDS } from "@/data/dimensions";
import { getLevelForScore } from "@/data/levels";
import {
  ExtractSnapshotsSchema,
  CreateReportSchema,
  UpdateReportSchema,
  PublishReportSchema,
  ReportContentSchema,
  defaultReportContent,
} from "@/lib/validations/state-of-ia";

// ── Types ────────────────────────────────────────

type ExtractionResult = {
  success: true;
  extracted: number;
  excluded: { orgName: string; reason: string }[];
  year: number;
};

// ── Extract Snapshots ────────────────────────────

export async function extractStateOfIaSnapshots(input: {
  year: number;
  replaceExisting?: boolean;
}): Promise<ExtractionResult | { error: string }> {
  const parsed = ExtractSnapshotsSchema.parse(input);
  await requireSuperAdmin();

  // Verify salt is configured
  if (!process.env.STATE_OF_IA_HASH_SALT) {
    return { error: "La variable STATE_OF_IA_HASH_SALT n'est pas configurée." };
  }

  // Check existing snapshots
  const existing = await db
    .select({ id: stateOfIaSnapshots.id })
    .from(stateOfIaSnapshots)
    .where(eq(stateOfIaSnapshots.year, parsed.year))
    .limit(1);

  if (existing.length > 0 && !parsed.replaceExisting) {
    return {
      error: `Des snapshots existent déjà pour l'année ${parsed.year}. Confirmez le remplacement.`,
    };
  }

  // Delete existing snapshots if replacing
  if (existing.length > 0 && parsed.replaceExisting) {
    await db
      .delete(stateOfIaSnapshots)
      .where(eq(stateOfIaSnapshots.year, parsed.year));
  }

  // Get all opt-in organizations
  const optInOrgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      sector: organizations.sector,
      size: organizations.size,
    })
    .from(organizations)
    .where(eq(organizations.optInStateOfIa, true));

  const excluded: { orgName: string; reason: string }[] = [];
  const snapshots: (typeof stateOfIaSnapshots.$inferInsert)[] = [];

  for (const org of optInOrgs) {
    // Find the latest closed campaign for this org
    const [latestCampaign] = await db
      .select({ id: campaigns.id })
      .from(campaigns)
      .where(and(eq(campaigns.orgId, org.id), eq(campaigns.status, "closed")))
      .orderBy(desc(campaigns.startDate))
      .limit(1);

    if (!latestCampaign) {
      excluded.push({
        orgName: org.name,
        reason: "Aucune campagne fermée.",
      });
      continue;
    }

    // Get completed diagnostics for this campaign
    const campaignDiags = await db
      .select({
        dimensionScores: diagnostics.dimensionScores,
        globalScore: diagnostics.globalScore,
      })
      .from(diagnostics)
      .innerJoin(teams, eq(diagnostics.teamId, teams.id))
      .where(
        and(
          eq(diagnostics.campaignId, latestCampaign.id),
          eq(teams.orgId, org.id),
          isNotNull(diagnostics.completedAt),
        ),
      );

    if (campaignDiags.length === 0) {
      excluded.push({
        orgName: org.name,
        reason: "Aucun diagnostic complété dans la dernière campagne fermée.",
      });
      continue;
    }

    // Compute average scores by dimension
    const avgByDimension: Record<string, number> = {};
    for (const dimId of DIMENSION_IDS) {
      const scores = campaignDiags
        .map((d) => (d.dimensionScores as Record<string, number>)[dimId])
        .filter((s) => s != null);
      if (scores.length > 0) {
        avgByDimension[dimId] =
          Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
      }
    }

    const dimValues = Object.values(avgByDimension);
    const globalScore =
      Math.round((dimValues.reduce((a, b) => a + b, 0) / dimValues.length) * 100) / 100;
    const globalLevel = getLevelForScore(globalScore).level;

    // Anonymize
    const organisationHash = hashOrganization(org.id);

    snapshots.push({
      year: parsed.year,
      organisationHash,
      sector: org.sector,
      size: org.size,
      scoresByDimension: avgByDimension,
      globalScore,
      globalLevel,
      teamCount: campaignDiags.length,
    });
  }

  // Bulk insert snapshots
  if (snapshots.length > 0) {
    await db.insert(stateOfIaSnapshots).values(snapshots);
  }

  revalidatePath("/admin/state-of-ia");

  return {
    success: true,
    extracted: snapshots.length,
    excluded,
    year: parsed.year,
  };
}

// ── Check if extraction exists ───────────────────

export async function checkExistingExtraction(year: number): Promise<boolean> {
  await requireSuperAdmin();

  const [existing] = await db
    .select({ id: stateOfIaSnapshots.id })
    .from(stateOfIaSnapshots)
    .where(eq(stateOfIaSnapshots.year, year))
    .limit(1);

  return !!existing;
}

// ── Report Management ────────────────────────────

export async function createReport(input: { year: number }) {
  const parsed = CreateReportSchema.parse(input);
  const { user } = await requireSuperAdmin();

  // Check if report already exists
  const [existing] = await db
    .select({ id: stateOfIaReports.id })
    .from(stateOfIaReports)
    .where(eq(stateOfIaReports.year, parsed.year));

  if (existing) {
    return { error: `Un rapport existe déjà pour l'année ${parsed.year}.` };
  }

  const [report] = await db
    .insert(stateOfIaReports)
    .values({
      year: parsed.year,
      content: defaultReportContent,
      createdBy: user.id,
    })
    .returning({ id: stateOfIaReports.id });

  revalidatePath("/admin/state-of-ia");

  return { success: true, reportId: report.id };
}

export async function updateReport(input: { reportId: string; content: unknown }) {
  const parsed = UpdateReportSchema.parse(input);
  await requireSuperAdmin();

  await db
    .update(stateOfIaReports)
    .set({
      content: parsed.content,
      updatedAt: new Date(),
    })
    .where(eq(stateOfIaReports.id, parsed.reportId));

  return { success: true };
}

export async function publishReport(input: { reportId: string }) {
  const parsed = PublishReportSchema.parse(input);
  await requireSuperAdmin();

  await db
    .update(stateOfIaReports)
    .set({ publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(stateOfIaReports.id, parsed.reportId));

  revalidatePath("/admin/state-of-ia");
  revalidatePath("/state-of-ia");

  return { success: true };
}

export async function unpublishReport(input: { reportId: string }) {
  const parsed = PublishReportSchema.parse(input);
  await requireSuperAdmin();

  await db
    .update(stateOfIaReports)
    .set({ publishedAt: null, updatedAt: new Date() })
    .where(eq(stateOfIaReports.id, parsed.reportId));

  revalidatePath("/admin/state-of-ia");
  revalidatePath("/state-of-ia");

  return { success: true };
}
