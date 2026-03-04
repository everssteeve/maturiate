import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memberships, teamMembers, teams } from "@/lib/db/schema";
import { getTeamDashboardData } from "@/lib/queries/team-dashboard";
import { listShareLinksByTarget } from "@/lib/queries/share-links";
import { TeamDashboard } from "@/components/dashboard/team-dashboard";
import { ShareButton } from "@/components/share/share-button";

export default async function TeamDashboardPage({
  params,
}: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const { orgId, teamId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Get user membership
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.orgId, orgId)));

  if (!membership) throw new Error("Forbidden");

  const role = membership.role as "admin" | "manager" | "member" | "consultant";

  // Permission check: manager and member can only see their own teams
  if (role === "manager" || role === "member") {
    const [teamMembership] = await db
      .select({ id: teamMembers.id })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(
        and(
          eq(teamMembers.userId, session.user.id),
          eq(teamMembers.teamId, teamId),
          eq(teams.orgId, orgId),
        ),
      );

    if (!teamMembership) {
      notFound();
    }
  }

  // Fetch dashboard data
  const data = await getTeamDashboardData(teamId, orgId);
  if (!data) notFound();

  const canStartDiagnostic = role === "admin" || role === "manager";
  const canShare = role === "admin" || role === "manager" || role === "consultant";

  const teamShareLinks = canShare
    ? await listShareLinksByTarget(orgId, "team", teamId)
    : [];

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/orgs/${orgId}`}
          className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Retour au dashboard
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{data.team.name}</h1>
          {canShare && (
            <ShareButton
              orgId={orgId}
              type="team"
              targetId={teamId}
              existingLinks={teamShareLinks.map((l) => ({
                id: l.id,
                token: l.token,
                expiresAt: l.expiresAt,
                createdAt: l.createdAt,
              }))}
            />
          )}
        </div>
      </div>

      <TeamDashboard data={data} orgId={orgId} canStartDiagnostic={canStartDiagnostic} />
    </div>
  );
}
