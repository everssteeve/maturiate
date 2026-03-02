import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.orgId, orgId)));

  if (!membership) {
    throw new Error("Forbidden");
  }

  return <>{children}</>;
}
