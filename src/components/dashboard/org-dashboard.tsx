"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Megaphone } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadarChart } from "@/components/charts/radar-chart";
import { OrgHeatmap } from "@/components/dashboard/org-heatmap";
import { OrgEvolutionChart } from "@/components/dashboard/org-evolution-chart";
import { OrgScoreSummary } from "@/components/dashboard/org-score-summary";
import type { OrgDashboardData } from "@/lib/queries/org-dashboard";
import type { DimensionScores } from "@/types";

interface OrgDashboardProps {
  orgId: string;
  data: OrgDashboardData;
}

export function OrgDashboard({ orgId, data }: OrgDashboardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const selectedCampaignId = data.selectedCampaignId ?? "";

  function handleCampaignChange(campaignId: string) {
    router.push(`${pathname}?campaign=${campaignId}`);
  }

  // No campaigns at all
  if (data.campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <Megaphone className="size-12 text-muted-foreground" />
          <div className="text-center">
            <p className="text-lg font-medium">Aucune campagne</p>
            <p className="text-sm text-muted-foreground">
              Créez votre première campagne pour commencer à collecter des diagnostics.
            </p>
          </div>
          <Button asChild>
            <Link href={`/orgs/${orgId}/campaigns`}>Créer une campagne</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedCampaign = data.campaigns.find((c) => c.id === selectedCampaignId);
  const hasData = data.orgScores !== null;

  return (
    <div className="space-y-6">
      {/* Campaign selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-muted-foreground">Campagne :</label>
        <Select value={selectedCampaignId} onValueChange={handleCampaignChange}>
          <SelectTrigger className="w-[280px]">
            <SelectValue placeholder="Sélectionner une campagne" />
          </SelectTrigger>
          <SelectContent>
            {data.campaigns.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
                {campaign.status === "active" && " (active)"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedCampaign && (
          <span className="text-xs text-muted-foreground">
            {selectedCampaign.diagnosticCount} diagnostic(s)
          </span>
        )}
      </div>

      {/* Empty state for selected campaign */}
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

      {/* Score summary cards */}
      {data.orgScores && (
        <OrgScoreSummary
          globalScore={data.orgScores.globalScore}
          globalLevel={data.orgScores.globalLevel}
          evaluatedTeams={data.orgScores.evaluatedTeams}
          totalTeams={data.orgScores.totalTeams}
          strongDimensions={data.orgScores.strongDimensions}
        />
      )}

      {/* Heatmap */}
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

      {/* Radar + Evolution side by side */}
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
