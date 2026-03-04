import Link from "next/link";
import { eq } from "drizzle-orm";
import { Plus } from "lucide-react";

import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getExtractionHistory, listReports } from "@/lib/queries/state-of-ia";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExtractionPanel } from "@/components/admin/extraction-panel";

export default async function AdminStateOfIaPage() {
  const optInOrgs = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(eq(organizations.optInStateOfIa, true));

  const history = await getExtractionHistory();
  const reports = await listReports();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">State of IA — Administration</h1>
        <p className="text-sm text-muted-foreground">
          Extraction des données anonymisées et gestion des rapports annuels.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Organisations opt-in</p>
            <p className="text-3xl font-bold">{optInOrgs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Extractions réalisées</p>
            <p className="text-3xl font-bold">{history.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Rapports créés</p>
            <p className="text-3xl font-bold">{reports.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Extraction */}
      <ExtractionPanel
        optInCount={optInOrgs.length}
        existingYears={history.map((h) => h.year)}
      />

      {/* Extraction History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des extractions</CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune extraction réalisée.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div
                  key={h.year}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div>
                    <span className="font-medium">{h.year}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      — {h.count} organisations
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(h.extractedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Rapports annuels</CardTitle>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun rapport créé.</p>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between rounded-md border px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{r.year}</span>
                    {r.publishedAt ? (
                      <Badge variant="default">Publié</Badge>
                    ) : (
                      <Badge variant="secondary">Brouillon</Badge>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/state-of-ia/reports/${r.year}`}>Éditer</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
