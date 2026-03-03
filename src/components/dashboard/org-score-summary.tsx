import { BarChart3, Target, Users, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getLevelForScore } from "@/data/levels";
import { getLevelColor } from "@/lib/utils/level-colors";

interface OrgScoreSummaryProps {
  globalScore: number;
  globalLevel: number;
  evaluatedTeams: number;
  totalTeams: number;
  strongDimensions: number;
}

export function OrgScoreSummary({
  globalScore,
  globalLevel,
  evaluatedTeams,
  totalTeams,
  strongDimensions,
}: OrgScoreSummaryProps) {
  const level = getLevelForScore(globalScore);
  const { bg, text } = getLevelColor(globalScore);

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="rounded-lg bg-primary/10 p-2">
            <BarChart3 className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Score global</p>
            <p className="text-2xl font-bold">{globalScore.toFixed(2)} <span className="text-sm font-normal text-muted-foreground">/ 4</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <div className={`rounded-lg p-2 ${bg}`}>
            <Target className={`size-5 ${text}`} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Niveau</p>
            <p className="text-2xl font-bold">{level.name}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="rounded-lg bg-primary/10 p-2">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Équipes évaluées</p>
            <p className="text-2xl font-bold">{evaluatedTeams} <span className="text-sm font-normal text-muted-foreground">/ {totalTeams}</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="rounded-lg bg-emerald-100 p-2">
            <TrendingUp className="size-5 text-emerald-700" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Dimensions fortes</p>
            <p className="text-2xl font-bold">{strongDimensions} <span className="text-sm font-normal text-muted-foreground">/ 6</span></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
