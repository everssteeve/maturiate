"use server";

import { z } from "zod";
import crypto from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invitations, memberships, organizations, users } from "@/lib/db/schema";
import { requireRole } from "@/lib/permissions";
import { getResend } from "@/lib/email";
import { InvitationEmail } from "@/lib/email/templates/invitation";
import { getBaseUrl } from "@/lib/utils";

const AcceptInvitationSchema = z.object({
  token: z.string().min(1),
});

export async function acceptInvitation(formData: FormData) {
  const parsed = AcceptInvitationSchema.safeParse({
    token: formData.get("token"),
  });

  if (!parsed.success) {
    return { error: "Token invalide." };
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(eq(invitations.token, parsed.data.token));

  if (!invitation) {
    return { error: "Invitation introuvable." };
  }

  if (invitation.acceptedAt) {
    return { error: "Cette invitation a déjà été acceptée." };
  }

  if (invitation.expiresAt < new Date()) {
    return { error: "Cette invitation a expiré." };
  }

  const [existingMembership] = await db
    .select()
    .from(memberships)
    .where(
      and(eq(memberships.userId, session.user.id), eq(memberships.orgId, invitation.orgId)),
    );

  if (existingMembership) {
    redirect(`/orgs/${invitation.orgId}`);
  }

  await db.insert(memberships).values({
    userId: session.user.id,
    orgId: invitation.orgId,
    role: invitation.role,
  });

  await db
    .update(invitations)
    .set({ acceptedAt: new Date() })
    .where(eq(invitations.id, invitation.id));

  redirect(`/orgs/${invitation.orgId}`);
}

// ── Invite Member (Admin) ──────────────────────────

const InviteMemberSchema = z.object({
  orgId: z.string().uuid(),
  email: z.string().email("Adresse email invalide."),
  role: z.enum(["admin", "manager", "member", "consultant"]),
});

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function inviteMember(_prev: unknown, formData: FormData) {
  const parsed = InviteMemberSchema.safeParse({
    orgId: formData.get("orgId"),
    email: formData.get("email"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { user } = await requireRole(parsed.data.orgId, "admin");

  // Check if email is already a member
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, parsed.data.email));

  if (existingUser) {
    const [existingMembership] = await db
      .select()
      .from(memberships)
      .where(
        and(eq(memberships.userId, existingUser.id), eq(memberships.orgId, parsed.data.orgId)),
      );

    if (existingMembership) {
      return { error: { email: ["Cet utilisateur est déjà membre de l'organisation."] } };
    }
  }

  // Check for pending invitation
  const [pendingInvitation] = await db
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.email, parsed.data.email),
        eq(invitations.orgId, parsed.data.orgId),
        isNull(invitations.acceptedAt),
      ),
    );

  if (pendingInvitation && pendingInvitation.expiresAt > new Date()) {
    return { error: { email: ["Une invitation est déjà en attente pour cet email."] } };
  }

  // Get org name for email
  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, parsed.data.orgId));

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db.insert(invitations).values({
    email: parsed.data.email,
    orgId: parsed.data.orgId,
    role: parsed.data.role,
    token,
    invitedBy: user.id,
    expiresAt,
  });

  const inviteUrl = `${getBaseUrl()}/invite/${token}`;

  const { error: emailError } = await getResend().emails.send({
    from: process.env.EMAIL_FROM || "maturIAté <onboarding@resend.dev>",
    to: parsed.data.email,
    subject: `Invitation à rejoindre ${org.name} — maturIAté`,
    react: InvitationEmail({ orgName: org.name, role: parsed.data.role, inviteUrl }),
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return { error: { email: [`Échec de l'envoi de l'email : ${emailError.message}`] } };
  }

  revalidatePath(`/orgs/${parsed.data.orgId}/settings`);
  return { success: true };
}

// ── Resend Invitation (Admin) ──────────────────────

const ResendInvitationSchema = z.object({
  orgId: z.string().uuid(),
  invitationId: z.string().uuid(),
});

export async function resendInvitation(input: { orgId: string; invitationId: string }) {
  const parsed = ResendInvitationSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, parsed.invitationId), eq(invitations.orgId, parsed.orgId)));

  if (!invitation) {
    throw new Error("Invitation introuvable.");
  }

  const [org] = await db
    .select({ name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, parsed.orgId));

  const newToken = generateToken();
  const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await db
    .update(invitations)
    .set({ token: newToken, expiresAt: newExpiresAt })
    .where(eq(invitations.id, parsed.invitationId));

  const inviteUrl = `${getBaseUrl()}/invite/${newToken}`;

  const { error: emailError } = await getResend().emails.send({
    from: process.env.EMAIL_FROM || "maturIAté <onboarding@resend.dev>",
    to: invitation.email,
    subject: `Invitation à rejoindre ${org.name} — maturIAté`,
    react: InvitationEmail({ orgName: org.name, role: invitation.role, inviteUrl }),
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return { error: `Échec de l'envoi de l'email : ${emailError.message}` };
  }

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}

// ── Cancel Invitation (Admin) ──────────────────────

const CancelInvitationSchema = z.object({
  orgId: z.string().uuid(),
  invitationId: z.string().uuid(),
});

export async function cancelInvitation(input: { orgId: string; invitationId: string }) {
  const parsed = CancelInvitationSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  const [invitation] = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.id, parsed.invitationId), eq(invitations.orgId, parsed.orgId)));

  if (!invitation) {
    throw new Error("Invitation introuvable.");
  }

  await db.delete(invitations).where(eq(invitations.id, parsed.invitationId));

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}
