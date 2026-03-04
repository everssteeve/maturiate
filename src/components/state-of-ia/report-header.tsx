import { Users, Building2, Target, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getLevelForScore } from "@/data/levels";
import type { AggregatedStats } from "@/lib/queries/state-of-ia";

export function ReportHeader({
  year,
  stats,
}: {
  year: number;
  stats: AggregatedStats | null;
}) {
  return (
    <div>
      <h1 className="text-4xl font-bold">State of IA {year}</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Rapport annuel sur la maturité IA des équipes de développement
      </p>

      {stats && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Building2 className="size-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalOrganizations}</p>
                <p className="text-xs text-muted-foreground">Organisations</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Users className="size-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.totalTeams}</p>
                <p className="text-xs text-muted-foreground">Équipes évaluées</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Target className="size-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.avgGlobalScore.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">Score moyen / 4</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <TrendingUp className="size-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {getLevelForScore(stats.avgGlobalScore).name}
                </p>
                <p className="text-xs text-muted-foreground">Niveau moyen</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
