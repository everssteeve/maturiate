import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { BarChart3, Lock, Settings } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { memberships, organizations } from "@/lib/db/schema";
import { hashOrganization } from "@/lib/utils/anonymize";
import {
  getLatestPublishedYear,
  getPublishedYears,
  getBenchmarkPercentiles,
  getSegmentCounts,
} from "@/lib/queries/state-of-ia";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BenchmarkView } from "@/components/benchmark/benchmark-view";

export default async function BenchmarkPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { orgId } = await params;
  const { year: yearParam } = await searchParams;

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  // Check membership and role
  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.orgId, orgId)));

  if (!membership) throw new Error("Forbidden");

  const role = membership.role as "admin" | "manager" | "member" | "consultant";

  // Members and managers cannot see the benchmark
  if (role === "member" || role === "manager") {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Mon positionnement</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Lock className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">Accès restreint</p>
              <p className="text-sm text-muted-foreground">
                Le benchmark State of IA est réservé aux administrateurs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check opt-in status
  const [org] = await db
    .select({
      name: organizations.name,
      optInStateOfIa: organizations.optInStateOfIa,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId));

  if (!org) throw new Error("Organisation introuvable.");

  if (!org.optInStateOfIa) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Mon positionnement</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <BarChart3 className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">Participation non activée</p>
              <p className="text-sm text-muted-foreground">
                Activez la participation au State of IA dans les paramètres de votre
                organisation pour accéder au benchmark et vous positionner par rapport aux
                autres organisations.
              </p>
            </div>
            {role === "admin" && (
              <Button variant="outline" asChild>
                <Link href={`/orgs/${orgId}/settings`}>
                  <Settings className="mr-2 size-4" />
                  Paramètres
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check published years
  const publishedYears = await getPublishedYears();
  const selectedYear = yearParam ? parseInt(yearParam, 10) : await getLatestPublishedYear();

  if (!selectedYear || publishedYears.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Mon positionnement</h1>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <BarChart3 className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">Données pas encore disponibles</p>
              <p className="text-sm text-muted-foreground">
                Le premier rapport State of IA n&apos;a pas encore été publié. Vos données
                seront incluses lors de la prochaine extraction annuelle.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get benchmark data
  const orgHash = hashOrganization(orgId);
  const percentiles = await getBenchmarkPercentiles(selectedYear, orgHash);
  const segmentCounts = await getSegmentCounts(selectedYear);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Mon positionnement — {org.name}</h1>
        <p className="text-sm text-muted-foreground">
          Benchmark State of IA {selectedYear}
        </p>
      </div>

      <BenchmarkView
        orgId={orgId}
        orgHash={orgHash}
        year={selectedYear}
        publishedYears={publishedYears}
        percentiles={percentiles}
        segmentCounts={segmentCounts}
      />
    </div>
  );
}
