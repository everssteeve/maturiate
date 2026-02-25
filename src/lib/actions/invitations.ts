"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { invitations, memberships } from "@/lib/db/schema";

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
