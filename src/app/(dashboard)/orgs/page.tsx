import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Plus, Building2, Users } from "lucide-react";

import { auth } from "@/lib/auth";
import { listUserOrganizations } from "@/lib/queries/organizations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SECTOR_LABELS: Record<string, string> = {
  esn: "ESN",
  editor: "Éditeur",
  dsi: "DSI",
  startup: "Startup",
  other: "Autre",
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Membre",
  consultant: "Consultant",
};

export default async function OrgsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?callbackUrl=/orgs");

  const orgs = await listUserOrganizations(session.user.id);

  if (orgs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <Building2 className="mb-4 size-12 text-muted-foreground" />
        <h1 className="mb-2 text-2xl font-bold">Vous n&apos;appartenez à aucune organisation</h1>
        <p className="mb-6 text-muted-foreground">
          Créez votre première organisation pour commencer.
        </p>
        <Button asChild>
          <Link href="/orgs/new">
            <Plus className="mr-2 size-4" />
            Créer votre première organisation
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mes organisations</h1>
        <Button asChild>
          <Link href="/orgs/new">
            <Plus className="mr-2 size-4" />
            Créer une organisation
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map((org) => (
          <Link key={org.id} href={`/orgs/${org.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start gap-4 p-5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-lg font-bold text-primary">
                  {org.logo ? (
                    <img
                      src={org.logo}
                      alt={org.name}
                      className="size-12 rounded-lg object-cover"
                    />
                  ) : (
                    org.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">{org.name}</h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{ROLE_LABELS[org.role] ?? org.role}</Badge>
                    {org.sector && (
                      <span className="text-xs text-muted-foreground">
                        {SECTOR_LABELS[org.sector] ?? org.sector}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3" />
                    {org.memberCount} membre{org.memberCount > 1 ? "s" : ""}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
