import { BarChart3, Target, TrendingUp, TrendingDown, Minus, ClipboardList } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { getLevelForScore } from "@/data/levels";
import { getLevelColor } from "@/lib/utils/level-colors";
import type { Trend } from "@/lib/queries/team-dashboard";

interface TeamScoreSummaryProps {
  globalScore: number;
  globalLevel: number;
  trend: Trend | null;
  diagnosticCount: number;
}

function TrendIndicator({ trend }: { trend: Trend | null }) {
  if (!trend) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">Tendance</p>
        <p className="text-lg font-medium text-muted-foreground">— Premier diagnostic</p>
      </div>
    );
  }

  const sign = trend.diff > 0 ? "+" : "";
  const formattedDiff = `${sign}${trend.diff.toFixed(2)}`;

  if (trend.direction === "up") {
    return (
      <div>
        <p className="text-sm text-muted-foreground">Tendance</p>
        <p className="text-2xl font-bold text-emerald-600">↑ {formattedDiff}</p>
      </div>
    );
  }
  if (trend.direction === "down") {
    return (
      <div>
        <p className="text-sm text-muted-foreground">Tendance</p>
        <p className="text-2xl font-bold text-red-600">↓ {formattedDiff}</p>
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm text-muted-foreground">Tendance</p>
      <p className="text-2xl font-bold text-muted-foreground">→ Stable</p>
    </div>
  );
}

function TrendIcon({ trend }: { trend: Trend | null }) {
  if (!trend) return <Minus className="size-5 text-muted-foreground" />;
  if (trend.direction === "up") return <TrendingUp className="size-5 text-emerald-700" />;
  if (trend.direction === "down") return <TrendingDown className="size-5 text-red-700" />;
  return <Minus className="size-5 text-muted-foreground" />;
}

export function TeamScoreSummary({
  globalScore,
  globalLevel,
  trend,
  diagnosticCount,
}: TeamScoreSummaryProps) {
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
          <div className={`rounded-lg p-2 ${
            trend?.direction === "up" ? "bg-emerald-100" :
            trend?.direction === "down" ? "bg-red-100" :
            "bg-primary/10"
          }`}>
            <TrendIcon trend={trend} />
          </div>
          <TrendIndicator trend={trend} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="rounded-lg bg-primary/10 p-2">
            <ClipboardList className="size-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Diagnostics</p>
            <p className="text-2xl font-bold">{diagnosticCount}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
