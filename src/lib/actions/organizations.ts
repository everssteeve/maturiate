"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { organizations, memberships } from "@/lib/db/schema";
import { requireRole } from "@/lib/permissions";

const CreateOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, "Le nom de l'organisation est requis.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  sector: z.enum(["esn", "editor", "dsi", "startup", "other"]).optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).optional(),
});

const UpdateOrganizationSchema = z.object({
  orgId: z.string().uuid(),
  name: z
    .string()
    .min(1, "Le nom de l'organisation est requis.")
    .max(100, "Le nom ne doit pas dépasser 100 caractères."),
  logo: z.string().url("L'URL du logo n'est pas valide.").optional().or(z.literal("")),
  sector: z.enum(["esn", "editor", "dsi", "startup", "other"]).nullable().optional(),
  size: z.enum(["1-10", "11-50", "51-200", "201-1000", "1000+"]).nullable().optional(),
});

export async function createOrganization(_prev: unknown, formData: FormData) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const parsed = CreateOrganizationSchema.safeParse({
    name: formData.get("name"),
    sector: formData.get("sector") || undefined,
    size: formData.get("size") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const [org] = await db
    .insert(organizations)
    .values({
      name: parsed.data.name,
      sector: parsed.data.sector ?? null,
      size: parsed.data.size ?? null,
    })
    .returning({ id: organizations.id });

  await db.insert(memberships).values({
    userId: session.user.id,
    orgId: org.id,
    role: "admin",
  });

  redirect(`/orgs/${org.id}/settings`);
}

export async function updateOrganization(_prev: unknown, formData: FormData) {
  const parsed = UpdateOrganizationSchema.safeParse({
    orgId: formData.get("orgId"),
    name: formData.get("name"),
    logo: formData.get("logo") || undefined,
    sector: formData.get("sector") || null,
    size: formData.get("size") || null,
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  await requireRole(parsed.data.orgId, "admin");

  await db
    .update(organizations)
    .set({
      name: parsed.data.name,
      logo: parsed.data.logo || null,
      sector: parsed.data.sector ?? null,
      size: parsed.data.size ?? null,
      updatedAt: new Date(),
    })
    .where(eq(organizations.id, parsed.data.orgId));

  revalidatePath(`/orgs/${parsed.data.orgId}/settings`);
  return { success: true };
}

const ToggleStateOfIaOptInSchema = z.object({
  orgId: z.string().uuid(),
  optIn: z.boolean(),
});

export async function toggleStateOfIaOptIn(input: { orgId: string; optIn: boolean }) {
  const parsed = ToggleStateOfIaOptInSchema.parse(input);
  await requireRole(parsed.orgId, "admin");

  const now = new Date();

  if (parsed.optIn) {
    await db
      .update(organizations)
      .set({
        optInStateOfIa: true,
        optInDate: now,
        optOutDate: null,
        updatedAt: now,
      })
      .where(eq(organizations.id, parsed.orgId));
  } else {
    await db
      .update(organizations)
      .set({
        optInStateOfIa: false,
        optOutDate: now,
        updatedAt: now,
      })
      .where(eq(organizations.id, parsed.orgId));
  }

  revalidatePath(`/orgs/${parsed.orgId}/settings`);
  return { success: true };
}
