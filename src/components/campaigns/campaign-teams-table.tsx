"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LEVEL_LABELS: Record<number, string> = {
  1: "Découverte",
  2: "Exploration",
  3: "Intégration",
  4: "Transformation",
};

interface TeamStatus {
  teamId: string;
  teamName: string;
  diagnosticId: string | null;
  filledByName: string | null;
  globalScore: number | null;
  globalLevel: number | null;
  completedAt: Date | null;
}

interface CampaignTeamsTableProps {
  orgId: string;
  campaignId: string;
  teamsStatus: TeamStatus[];
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function CampaignTeamsTable({ orgId, campaignId, teamsStatus }: CampaignTeamsTableProps) {
  if (teamsStatus.length === 0) {
    return <p className="text-sm text-muted-foreground">Aucune équipe dans l&apos;organisation.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left">
            <th className="pb-2 font-medium">Équipe</th>
            <th className="pb-2 font-medium">Statut</th>
            <th className="pb-2 font-medium">Rempli par</th>
            <th className="pb-2 font-medium">Score</th>
            <th className="pb-2 font-medium">Niveau</th>
            <th className="pb-2 font-medium">Date</th>
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {teamsStatus.map((team) => (
            <tr key={team.teamId} className="border-b last:border-0">
              <td className="py-3 font-medium">{team.teamName}</td>
              <td className="py-3">
                {team.diagnosticId ? (
                  <Badge variant="default">Répondu</Badge>
                ) : (
                  <Badge variant="secondary">En attente</Badge>
                )}
              </td>
              <td className="py-3 text-muted-foreground">{team.filledByName ?? "—"}</td>
              <td className="py-3">
                {team.globalScore != null ? team.globalScore.toFixed(2) : "—"}
              </td>
              <td className="py-3">
                {team.globalLevel != null ? (
                  <Badge variant="outline">{LEVEL_LABELS[team.globalLevel] ?? `N${team.globalLevel}`}</Badge>
                ) : (
                  "—"
                )}
              </td>
              <td className="py-3 text-muted-foreground">
                {team.completedAt ? formatDate(team.completedAt) : "—"}
              </td>
              <td className="py-3 text-right">
                {!team.diagnosticId && (
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      href={`/orgs/${orgId}/diagnostic/${team.teamId}?campaignId=${campaignId}`}
                    >
                      Remplir
                    </Link>
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
