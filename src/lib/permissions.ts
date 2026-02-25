import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memberships, users } from "@/lib/db/schema";

export type Role = "admin" | "manager" | "member" | "consultant";

export async function requireRole(orgId: string, ...allowedRoles: Role[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.orgId, orgId)));

  if (!membership || !allowedRoles.includes(membership.role as Role)) {
    throw new Error("Forbidden");
  }

  return { user: session.user, membership };
}

export async function requireSuperAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id));

  if (!user || !user.isSuperAdmin) {
    throw new Error("Forbidden");
  }

  return { user };
}
