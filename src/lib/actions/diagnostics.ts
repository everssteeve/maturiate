"use server";

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { diagnostics, teams, bonusQuestions } from "@/lib/db/schema";
import { requireRole } from "@/lib/permissions";
import { computeScores } from "@/lib/scoring";
import { QUESTIONS } from "@/data/questions";
import { DIMENSION_IDS } from "@/data/dimensions";

// ── Schemas ──────────────────────────────────────

const coreQuestionIds = QUESTIONS.map((q) => q.id);

const SubmitDiagnosticSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
  campaignId: z.string().uuid().optional(),
  answers: z.record(z.string(), z.number().int().min(1).max(4)),
  bonusAnswers: z.record(z.string(), z.number().int().min(1).max(4)).optional(),
  startedAt: z.coerce.date().optional(),
});

const CreateBonusQuestionSchema = z.object({
  orgId: z.string().uuid(),
  dimensionId: z.enum(["tools", "process", "docs", "quality", "collab", "vision"]),
  text: z.string().min(1, "Le texte de la question est requis.").max(500),
  options: z
    .array(z.string().min(1, "Chaque option doit être remplie."))
    .length(4, "Exactement 4 options sont requises."),
});

const UpdateBonusQuestionSchema = z.object({
  orgId: z.string().uuid(),
  questionId: z.string().uuid(),
  dimensionId: z.enum(["tools", "process", "docs", "quality", "collab", "vision"]).optional(),
  text: z.string().min(1).max(500).optional(),
  options: z
    .array(z.string().min(1))
    .length(4)
    .optional(),
});

const ToggleBonusQuestionSchema = z.object({
  orgId: z.string().uuid(),
  questionId: z.string().uuid(),
  active: z.boolean(),
});

// ── Submit Diagnostic ────────────────────────────

export async function submitDiagnostic(input: {
  orgId: string;
  teamId: string;
  campaignId?: string;
  answers: Record<string, number>;
  bonusAnswers?: Record<string, number>;
  startedAt?: Date;
}) {
  const parsed = SubmitDiagnosticSchema.parse(input);

  // Check permissions
  const { user } = await requireRole(parsed.orgId, "admin", "manager");

  // Verify team belongs to org
  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, parsed.teamId), eq(teams.orgId, parsed.orgId)));

  if (!team) {
    return { error: "Équipe introuvable." };
  }

  // Validate all 14 core questions are answered
  const missingQuestions = coreQuestionIds.filter((qId) => parsed.answers[qId] == null);
  if (missingQuestions.length > 0) {
    return {
      error: `Questions manquantes : ${missingQuestions.join(", ")}`,
    };
  }

  // Compute scores from core answers only
  const { dimensionScores, globalScore, globalLevel } = computeScores(parsed.answers);

  // Insert diagnostic
  const [diagnostic] = await db
    .insert(diagnostics)
    .values({
      teamId: parsed.teamId,
      campaignId: parsed.campaignId ?? null,
      filledBy: user.id,
      answers: parsed.answers,
      bonusAnswers: parsed.bonusAnswers ?? null,
      dimensionScores,
      globalScore,
      globalLevel,
      startedAt: parsed.startedAt ?? null,
      completedAt: new Date(),
    })
    .returning({ id: diagnostics.id });

  revalidatePath(`/orgs/${parsed.orgId}/diagnostic/${parsed.teamId}`);
  revalidatePath(`/orgs/${parsed.orgId}/settings`);

  redirect(`/orgs/${parsed.orgId}/diagnostic/${parsed.teamId}/results/${diagnostic.id}`);
}

// ── Bonus Questions CRUD ─────────────────────────

export async function createBonusQuestion(input: {
  orgId: string;
  dimensionId: string;
  text: string;
  options: string[];
}) {
  const parsed = CreateBonusQuestionSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  await db.insert(bonusQuestions).values({
    orgId: parsed.orgId,
    dimensionId: parsed.dimensionId,
    text: parsed.text,
    options: parsed.options,
  });

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

export async function updateBonusQuestion(input: {
  orgId: string;
  questionId: string;
  dimensionId?: string;
  text?: string;
  options?: string[];
}) {
  const parsed = UpdateBonusQuestionSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  // Verify question belongs to org
  const [question] = await db
    .select()
    .from(bonusQuestions)
    .where(and(eq(bonusQuestions.id, parsed.questionId), eq(bonusQuestions.orgId, parsed.orgId)));

  if (!question) {
    return { error: "Question introuvable." };
  }

  const updates: Partial<typeof question> = {};
  if (parsed.dimensionId) updates.dimensionId = parsed.dimensionId;
  if (parsed.text) updates.text = parsed.text;
  if (parsed.options) updates.options = parsed.options;

  await db
    .update(bonusQuestions)
    .set(updates)
    .where(eq(bonusQuestions.id, parsed.questionId));

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

export async function toggleBonusQuestion(input: {
  orgId: string;
  questionId: string;
  active: boolean;
}) {
  const parsed = ToggleBonusQuestionSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  // Verify question belongs to org
  const [question] = await db
    .select()
    .from(bonusQuestions)
    .where(and(eq(bonusQuestions.id, parsed.questionId), eq(bonusQuestions.orgId, parsed.orgId)));

  if (!question) {
    return { error: "Question introuvable." };
  }

  await db
    .update(bonusQuestions)
    .set({ active: parsed.active })
    .where(eq(bonusQuestions.id, parsed.questionId));

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}
