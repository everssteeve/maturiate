"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart } from "@/components/charts/radar-chart";
import { OrgHeatmap } from "@/components/dashboard/org-heatmap";
import { OrgEvolutionChart } from "@/components/dashboard/org-evolution-chart";
import { OrgScoreSummary } from "@/components/dashboard/org-score-summary";
import type { OrgDashboardData } from "@/lib/queries/org-dashboard";
import type { DimensionScores } from "@/types";

interface SharedOrgDashboardProps {
  data: OrgDashboardData;
}

export function SharedOrgDashboard({ data }: SharedOrgDashboardProps) {
  if (!data.orgScores && data.campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <p className="text-lg font-medium">Aucune donnée disponible</p>
          <p className="text-sm text-muted-foreground">
            Cette organisation n&apos;a pas encore de campagne ou de diagnostic.
          </p>
        </CardContent>
      </Card>
    );
  }

  const hasData = data.orgScores !== null;

  return (
    <div className="space-y-6">
      {!hasData && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12">
            <p className="text-lg font-medium">Aucun diagnostic complété</p>
            <p className="text-sm text-muted-foreground">
              Aucune équipe n&apos;a encore rempli de diagnostic pour cette campagne.
            </p>
          </CardContent>
        </Card>
      )}

      {data.orgScores && (
        <OrgScoreSummary
          globalScore={data.orgScores.globalScore}
          globalLevel={data.orgScores.globalLevel}
          evaluatedTeams={data.orgScores.evaluatedTeams}
          totalTeams={data.orgScores.totalTeams}
          strongDimensions={data.orgScores.strongDimensions}
        />
      )}

      {data.heatmap.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Heatmap Équipes &times; Dimensions</CardTitle>
          </CardHeader>
          <CardContent>
            <OrgHeatmap data={data.heatmap} />
          </CardContent>
        </Card>
      )}

      {(data.orgScores || data.evolution.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {data.orgScores && (
            <Card>
              <CardHeader>
                <CardTitle>Profil de maturité</CardTitle>
              </CardHeader>
              <CardContent>
                <RadarChart
                  dimensionScores={data.orgScores.byDimension as DimensionScores}
                />
              </CardContent>
            </Card>
          )}

          {data.evolution.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Évolution temporelle</CardTitle>
              </CardHeader>
              <CardContent>
                <OrgEvolutionChart data={data.evolution} />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
