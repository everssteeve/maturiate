import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Settings, Megaphone, Lock } from "lucide-react";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memberships, teamMembers, teams } from "@/lib/db/schema";
import { getOrganization } from "@/lib/queries/organizations";
import { getOrgDashboardData } from "@/lib/queries/org-dashboard";
import { listShareLinksByTarget } from "@/lib/queries/share-links";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OrgDashboard } from "@/components/dashboard/org-dashboard";
import { ShareButton } from "@/components/share/share-button";

export default async function OrgPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ campaign?: string }>;
}) {
  const { orgId } = await params;
  const { campaign: campaignId } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const org = await getOrganization(orgId);
  if (!org) throw new Error("Organisation introuvable.");

  // Get user membership
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.orgId, orgId)));

  if (!membership) throw new Error("Forbidden");

  const role = membership.role as "admin" | "manager" | "member" | "consultant";
  const isAdmin = role === "admin";

  // Members cannot access the org dashboard
  if (role === "member") {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{org.name}</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Lock className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">Accès restreint</p>
              <p className="text-sm text-muted-foreground">
                Le dashboard organisation est réservé aux administrateurs et managers.
                Consultez les résultats de vos équipes directement.
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href={`/orgs/${orgId}/teams`}>Voir mes équipes</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // For managers, filter to only their teams
  let teamIds: string[] | undefined;
  if (role === "manager") {
    const userTeams = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .where(and(eq(teamMembers.userId, session.user.id), eq(teams.orgId, orgId)));
    teamIds = userTeams.map((t) => t.teamId);
  }

  const data = await getOrgDashboardData(orgId, { campaignId, teamIds });

  const canShare = role === "admin" || role === "consultant";
  const orgShareLinks = canShare
    ? await listShareLinksByTarget(orgId, "org", orgId)
    : [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{org.name}</h1>
        <div className="flex items-center gap-2">
          {canShare && (
            <ShareButton
              orgId={orgId}
              type="org"
              targetId={orgId}
              existingLinks={orgShareLinks.map((l) => ({
                id: l.id,
                token: l.token,
                expiresAt: l.expiresAt,
                createdAt: l.createdAt,
              }))}
            />
          )}
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href={`/orgs/${orgId}/campaigns`}>
                <Megaphone className="mr-2 size-4" />
                Campagnes
              </Link>
            </Button>
          )}
          {isAdmin && (
            <Button variant="outline" asChild>
              <Link href={`/orgs/${orgId}/settings`}>
                <Settings className="mr-2 size-4" />
                Paramètres
              </Link>
            </Button>
          )}
        </div>
      </div>

      <OrgDashboard orgId={orgId} data={data} />
    </div>
  );
}
