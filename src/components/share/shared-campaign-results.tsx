"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart } from "@/components/charts/radar-chart";
import { OrgHeatmap } from "@/components/dashboard/org-heatmap";
import { OrgScoreSummary } from "@/components/dashboard/org-score-summary";
import type { OrgDashboardData } from "@/lib/queries/org-dashboard";
import type { DimensionScores } from "@/types";

interface SharedCampaignResultsProps {
  campaignName: string;
  data: OrgDashboardData;
}

export function SharedCampaignResults({ campaignName, data }: SharedCampaignResultsProps) {
  if (!data.orgScores) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12">
          <p className="text-lg font-medium">Résultats pas encore disponibles</p>
          <p className="text-sm text-muted-foreground">
            Aucune équipe n&apos;a encore complété de diagnostic pour cette campagne.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Campagne</p>
        <h2 className="text-xl font-semibold">{campaignName}</h2>
      </div>

      <OrgScoreSummary
        globalScore={data.orgScores.globalScore}
        globalLevel={data.orgScores.globalLevel}
        evaluatedTeams={data.orgScores.evaluatedTeams}
        totalTeams={data.orgScores.totalTeams}
        strongDimensions={data.orgScores.strongDimensions}
      />

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
    </div>
  );
}
