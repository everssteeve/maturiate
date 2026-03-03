"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { teams, teamMembers, memberships } from "@/lib/db/schema";
import { requireRole } from "@/lib/permissions";
import { listTeamMembers as queryListTeamMembers, listAvailableMembers as queryListAvailableMembers } from "@/lib/queries/teams";

// ── Schemas ──────────────────────────────────────

const CreateTeamSchema = z.object({
  orgId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom de l'équipe est requis.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
});

const UpdateTeamSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom de l'équipe est requis.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
});

const DeleteTeamSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
});

const AddTeamMemberSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().min(1),
});

const RemoveTeamMemberSchema = z.object({
  orgId: z.string().uuid(),
  teamId: z.string().uuid(),
  userId: z.string().min(1),
});

// ── Helpers ──────────────────────────────────────

async function verifyManagerScope(orgId: string, teamId: string, userId: string) {
  const [membership] = await db
    .select()
    .from(teamMembers)
    .innerJoin(teams, eq(teamMembers.teamId, teams.id))
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.userId, userId),
        eq(teams.orgId, orgId),
      ),
    );

  if (!membership) {
    throw new Error("Forbidden");
  }
}

async function checkTeamNameUnique(orgId: string, name: string, excludeTeamId?: string) {
  const existing = await db
    .select({ id: teams.id })
    .from(teams)
    .where(and(eq(teams.orgId, orgId), eq(teams.name, name)));

  if (existing.length > 0 && existing[0].id !== excludeTeamId) {
    return false;
  }
  return true;
}

// ── Team CRUD Actions ────────────────────────────

export async function createTeam(input: { orgId: string; name: string }) {
  const parsed = CreateTeamSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  const isUnique = await checkTeamNameUnique(parsed.orgId, parsed.name);
  if (!isUnique) {
    return { error: "Une équipe avec ce nom existe déjà dans cette organisation." };
  }

  await db.insert(teams).values({
    name: parsed.name,
    orgId: parsed.orgId,
  });

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

export async function updateTeam(input: { orgId: string; teamId: string; name: string }) {
  const parsed = UpdateTeamSchema.parse(input);
  const { membership } = await requireRole(parsed.orgId, "admin", "manager");

  // Verify team belongs to org
  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, parsed.teamId), eq(teams.orgId, parsed.orgId)));

  if (!team) {
    return { error: "Équipe introuvable." };
  }

  // Manager scope: must be member of the team
  if (membership.role === "manager") {
    await verifyManagerScope(parsed.orgId, parsed.teamId, membership.userId);
  }

  const isUnique = await checkTeamNameUnique(parsed.orgId, parsed.name, parsed.teamId);
  if (!isUnique) {
    return { error: "Une équipe avec ce nom existe déjà dans cette organisation." };
  }

  await db
    .update(teams)
    .set({ name: parsed.name, updatedAt: new Date() })
    .where(eq(teams.id, parsed.teamId));

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

export async function deleteTeam(input: { orgId: string; teamId: string }) {
  const parsed = DeleteTeamSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  // Verify team belongs to org
  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, parsed.teamId), eq(teams.orgId, parsed.orgId)));

  if (!team) {
    return { error: "Équipe introuvable." };
  }

  await db.delete(teams).where(eq(teams.id, parsed.teamId));

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

// ── Team Member Actions ──────────────────────────

export async function addTeamMember(input: { orgId: string; teamId: string; userId: string }) {
  const parsed = AddTeamMemberSchema.parse(input);
  const { membership } = await requireRole(parsed.orgId, "admin", "manager");

  // Verify team belongs to org
  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, parsed.teamId), eq(teams.orgId, parsed.orgId)));

  if (!team) {
    return { error: "Équipe introuvable." };
  }

  // Manager scope: must be member of the team
  if (membership.role === "manager") {
    await verifyManagerScope(parsed.orgId, parsed.teamId, membership.userId);
  }

  // Verify user is member of the organization
  const [orgMembership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, parsed.userId), eq(memberships.orgId, parsed.orgId)));

  if (!orgMembership) {
    return { error: "Cet utilisateur n'est pas membre de l'organisation." };
  }

  // Check if already a member of the team
  const [existing] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, parsed.teamId), eq(teamMembers.userId, parsed.userId)));

  if (existing) {
    return { error: "Ce membre fait déjà partie de cette équipe." };
  }

  await db.insert(teamMembers).values({
    teamId: parsed.teamId,
    userId: parsed.userId,
  });

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

export async function removeTeamMember(input: {
  orgId: string;
  teamId: string;
  userId: string;
}) {
  const parsed = RemoveTeamMemberSchema.parse(input);
  const { membership } = await requireRole(parsed.orgId, "admin", "manager");

  // Verify team belongs to org
  const [team] = await db
    .select()
    .from(teams)
    .where(and(eq(teams.id, parsed.teamId), eq(teams.orgId, parsed.orgId)));

  if (!team) {
    return { error: "Équipe introuvable." };
  }

  // Manager scope: must be member of the team
  if (membership.role === "manager") {
    await verifyManagerScope(parsed.orgId, parsed.teamId, membership.userId);
  }

  // Verify team membership exists
  const [existing] = await db
    .select()
    .from(teamMembers)
    .where(and(eq(teamMembers.teamId, parsed.teamId), eq(teamMembers.userId, parsed.userId)));

  if (!existing) {
    return { error: "Ce membre ne fait pas partie de cette équipe." };
  }

  await db
    .delete(teamMembers)
    .where(and(eq(teamMembers.teamId, parsed.teamId), eq(teamMembers.userId, parsed.userId)));

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

// ── Query Actions (for Client Components) ────────

export async function fetchTeamMembersAction(orgId: string, teamId: string) {
  await requireRole(orgId, "admin", "manager", "member", "consultant");
  return queryListTeamMembers(teamId, orgId);
}

export async function fetchAvailableMembersAction(orgId: string, teamId: string) {
  await requireRole(orgId, "admin", "manager");
  return queryListAvailableMembers(teamId, orgId);
}
