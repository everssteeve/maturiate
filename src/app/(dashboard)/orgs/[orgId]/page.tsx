import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Settings, Megaphone, Lock, BarChart3, ArrowRight } from "lucide-react";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memberships, teamMembers, teams } from "@/lib/db/schema";
import { getOrganization } from "@/lib/queries/organizations";
import { getOrgDashboardData } from "@/lib/queries/org-dashboard";
import { getLatestPublishedYear, getBenchmarkPercentiles } from "@/lib/queries/state-of-ia";
import { hashOrganization } from "@/lib/utils/anonymize";
import { listShareLinksByTarget } from "@/lib/queries/share-links";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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

  // Benchmark card (only for opt-in orgs with published report)
  let benchmarkPercentile: number | null = null;
  let benchmarkTotalOrgs: number | null = null;
  if (org.optInStateOfIa) {
    const latestYear = await getLatestPublishedYear();
    if (latestYear) {
      try {
        const orgHash = hashOrganization(orgId);
        const percentiles = await getBenchmarkPercentiles(latestYear, orgHash);
        if (percentiles) {
          benchmarkPercentile = percentiles.globalPercentile;
          benchmarkTotalOrgs = percentiles.totalOrganizations;
        }
      } catch {
        // Salt not configured — skip benchmark
      }
    }
  }

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

      {/* Benchmark card for opt-in orgs */}
      {benchmarkPercentile != null && (
        <Card className="mt-6">
          <CardContent className="flex items-center gap-6 py-6">
            <BarChart3 className="size-10 shrink-0 text-primary" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">Mon positionnement — State of IA</p>
                  <p className="text-sm text-muted-foreground">
                    Vous êtes au {benchmarkPercentile}e percentile sur {benchmarkTotalOrgs}{" "}
                    organisations
                  </p>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/orgs/${orgId}/benchmark`}>
                    Voir le détail
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </div>
              <Progress value={benchmarkPercentile} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
