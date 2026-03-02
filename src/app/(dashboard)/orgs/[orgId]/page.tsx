import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Settings, BarChart3 } from "lucide-react";

import { auth } from "@/lib/auth";
import { getOrganization } from "@/lib/queries/organizations";
import { requireRole } from "@/lib/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function OrgPage({ params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const org = await getOrganization(orgId);
  if (!org) throw new Error("Organisation introuvable.");

  let isAdmin = false;
  try {
    await requireRole(orgId, "admin");
    isAdmin = true;
  } catch {
    // not admin
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{org.name}</h1>
        {isAdmin && (
          <Button variant="outline" asChild>
            <Link href={`/orgs/${orgId}/settings`}>
              <Settings className="mr-2 size-4" />
              Paramètres
            </Link>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Le dashboard de l&apos;organisation sera disponible après la création des équipes et
            l&apos;exécution des premiers diagnostics.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
