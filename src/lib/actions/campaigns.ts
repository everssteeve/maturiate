"use server";

import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { campaigns, teams, diagnostics, teamMembers, memberships, users } from "@/lib/db/schema";
import { requireRole } from "@/lib/permissions";
import { getResend } from "@/lib/email";
import { CampaignInvitationEmail } from "@/lib/email/templates/campaign-invitation";
import { CampaignReminderEmail } from "@/lib/email/templates/campaign-reminder";
import {
  CreateCampaignSchema,
  UpdateCampaignSchema,
} from "@/lib/validations/campaigns";

// ── Helpers ──────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

async function getTeamManagers(orgId: string) {
  const results = await db
    .select({
      teamId: teamMembers.teamId,
      teamName: teams.name,
      userId: teamMembers.userId,
      email: users.email,
      userName: users.name,
    })
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .innerJoin(users, eq(teamMembers.userId, users.id))
    .innerJoin(
      memberships,
      and(eq(memberships.userId, teamMembers.userId), eq(memberships.orgId, teams.orgId)),
    )
    .where(and(eq(teams.orgId, orgId), eq(memberships.role, "manager")));

  return results;
}

async function getTeamsWithoutDiagnostic(campaignId: string, orgId: string) {
  const allTeams = await db
    .select({ id: teams.id, name: teams.name })
    .from(teams)
    .where(eq(teams.orgId, orgId));

  const respondedTeamIds = await db
    .select({ teamId: diagnostics.teamId })
    .from(diagnostics)
    .where(eq(diagnostics.campaignId, campaignId));

  const respondedSet = new Set(respondedTeamIds.map((r) => r.teamId));
  return allTeams.filter((t) => !respondedSet.has(t.id));
}

// ── Create Campaign ──────────────────────────────

export async function createCampaign(input: {
  orgId: string;
  name: string;
  startDate: Date;
  endDate?: Date;
}) {
  const parsed = CreateCampaignSchema.parse(input);
  const { user } = await requireRole(parsed.orgId, "admin");

  const [campaign] = await db
    .insert(campaigns)
    .values({
      name: parsed.name,
      orgId: parsed.orgId,
      createdBy: user.id,
      startDate: parsed.startDate,
      endDate: parsed.endDate ?? null,
    })
    .returning({ id: campaigns.id });

  revalidatePath(`/orgs/${parsed.orgId}/campaigns`);
  redirect(`/orgs/${parsed.orgId}/campaigns/${campaign.id}`);
}

// ── Update Campaign ──────────────────────────────

export async function updateCampaign(input: {
  orgId: string;
  campaignId: string;
  name: string;
  startDate: Date;
  endDate?: Date;
}) {
  const parsed = UpdateCampaignSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, parsed.campaignId), eq(campaigns.orgId, parsed.orgId)));

  if (!campaign) {
    return { error: "Campagne introuvable." };
  }

  if (campaign.status !== "draft") {
    return { error: "Seules les campagnes en brouillon peuvent être modifiées." };
  }

  await db
    .update(campaigns)
    .set({
      name: parsed.name,
      startDate: parsed.startDate,
      endDate: parsed.endDate ?? null,
      updatedAt: new Date(),
    })
    .where(eq(campaigns.id, parsed.campaignId));

  revalidatePath(`/orgs/${parsed.orgId}/campaigns`);
  revalidatePath(`/orgs/${parsed.orgId}/campaigns/${parsed.campaignId}`);
  return { success: true };
}

// ── Delete Campaign ──────────────────────────────

export async function deleteCampaign(input: { orgId: string; campaignId: string }) {
  await requireRole(input.orgId, "admin");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, input.campaignId), eq(campaigns.orgId, input.orgId)));

  if (!campaign) {
    return { error: "Campagne introuvable." };
  }

  if (campaign.status !== "draft") {
    return { error: "Seules les campagnes en brouillon peuvent être supprimées." };
  }

  const [existing] = await db
    .select({ id: diagnostics.id })
    .from(diagnostics)
    .where(eq(diagnostics.campaignId, input.campaignId))
    .limit(1);

  if (existing) {
    return { error: "Impossible de supprimer : des diagnostics sont associés à cette campagne." };
  }

  await db.delete(campaigns).where(eq(campaigns.id, input.campaignId));

  revalidatePath(`/orgs/${input.orgId}/campaigns`);
  return { success: true };
}

// ── Launch Campaign ──────────────────────────────

export async function launchCampaign(input: { orgId: string; campaignId: string }) {
  await requireRole(input.orgId, "admin");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, input.campaignId), eq(campaigns.orgId, input.orgId)));

  if (!campaign) {
    return { error: "Campagne introuvable." };
  }

  if (campaign.status !== "draft") {
    return { error: "La campagne est déjà lancée ou clôturée." };
  }

  const orgTeams = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.orgId, input.orgId));

  if (orgTeams.length === 0) {
    return { error: "Impossible de lancer : aucune équipe dans l'organisation." };
  }

  await db
    .update(campaigns)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(campaigns.id, input.campaignId));

  // Send invitation emails to team managers
  const managers = await getTeamManagers(input.orgId);
  const baseUrl = getBaseUrl();

  for (const manager of managers) {
    const diagnosticUrl = `${baseUrl}/orgs/${input.orgId}/diagnostic/${manager.teamId}?campaignId=${input.campaignId}`;

    await getResend().emails.send({
      from: process.env.EMAIL_FROM || "maturIAté <onboarding@resend.dev>",
      to: manager.email,
      subject: `Campagne : ${campaign.name} — Diagnostic en attente`,
      react: CampaignInvitationEmail({
        campaignName: campaign.name,
        teamName: manager.teamName,
        diagnosticUrl,
        endDate: campaign.endDate ? formatDate(campaign.endDate) : undefined,
      }),
    });
  }

  revalidatePath(`/orgs/${input.orgId}/campaigns`);
  revalidatePath(`/orgs/${input.orgId}/campaigns/${input.campaignId}`);
  return { success: true };
}

// ── Close Campaign ───────────────────────────────

export async function closeCampaign(input: { orgId: string; campaignId: string }) {
  await requireRole(input.orgId, "admin");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, input.campaignId), eq(campaigns.orgId, input.orgId)));

  if (!campaign) {
    return { error: "Campagne introuvable." };
  }

  if (campaign.status !== "active") {
    return { error: "Seules les campagnes actives peuvent être clôturées." };
  }

  await db
    .update(campaigns)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(campaigns.id, input.campaignId));

  revalidatePath(`/orgs/${input.orgId}/campaigns`);
  revalidatePath(`/orgs/${input.orgId}/campaigns/${input.campaignId}`);
  return { success: true };
}

// ── Send Campaign Reminders ──────────────────────

export async function sendCampaignReminders(input: { orgId: string; campaignId: string }) {
  await requireRole(input.orgId, "admin");

  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, input.campaignId), eq(campaigns.orgId, input.orgId)));

  if (!campaign) {
    return { error: "Campagne introuvable." };
  }

  if (campaign.status !== "active") {
    return { error: "Les relances ne sont possibles que pour les campagnes actives." };
  }

  const pendingTeams = await getTeamsWithoutDiagnostic(input.campaignId, input.orgId);

  if (pendingTeams.length === 0) {
    return { error: "Toutes les équipes ont déjà répondu." };
  }

  const managers = await getTeamManagers(input.orgId);
  const pendingTeamIds = new Set(pendingTeams.map((t) => t.id));
  const pendingManagers = managers.filter((m) => pendingTeamIds.has(m.teamId));

  const baseUrl = getBaseUrl();
  const daysRemaining = campaign.endDate
    ? Math.max(0, Math.ceil((campaign.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : undefined;

  let sentCount = 0;
  for (const manager of pendingManagers) {
    const diagnosticUrl = `${baseUrl}/orgs/${input.orgId}/diagnostic/${manager.teamId}?campaignId=${input.campaignId}`;

    await getResend().emails.send({
      from: process.env.EMAIL_FROM || "maturIAté <onboarding@resend.dev>",
      to: manager.email,
      subject: `Rappel : ${campaign.name} — Diagnostic en attente`,
      react: CampaignReminderEmail({
        campaignName: campaign.name,
        teamName: manager.teamName,
        diagnosticUrl,
        daysRemaining,
      }),
    });
    sentCount++;
  }

  revalidatePath(`/orgs/${input.orgId}/campaigns/${input.campaignId}`);
  return { success: true, sentCount };
}
