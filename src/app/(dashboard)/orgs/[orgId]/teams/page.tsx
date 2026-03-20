import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memberships, teamMembers, teams } from "@/lib/db/schema";
import { listTeams } from "@/lib/queries/teams";
import { listUserTeamIds } from "@/lib/queries/teams";
import { Card, CardContent } from "@/components/ui/card";

export default async function TeamsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Get user membership
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.orgId, orgId)));

  if (!membership) throw new Error("Forbidden");

  const role = membership.role as "admin" | "manager" | "member" | "consultant";

  const allTeams = await listTeams(orgId);

  // Filter teams for manager/member roles
  let visibleTeams = allTeams;
  if (role === "manager" || role === "member") {
    const userTeamIds = await listUserTeamIds(session.user.id, orgId);
    visibleTeams = allTeams.filter((t) => userTeamIds.includes(t.id));
  }

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
        <h1 className="text-2xl font-bold">Équipes</h1>
      </div>

      {visibleTeams.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Users className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">Aucune équipe</p>
              <p className="text-sm text-muted-foreground">
                {role === "admin"
                  ? "Créez votre première équipe dans les paramètres de l'organisation."
                  : "Vous n'êtes membre d'aucune équipe pour le moment."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTeams.map((team) => (
            <Link key={team.id} href={`/orgs/${orgId}/teams/${team.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 py-6">
                  <Users className="size-8 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {team.memberCount} {team.memberCount > 1 ? "membres" : "membre"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
