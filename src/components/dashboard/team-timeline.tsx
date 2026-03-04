"use client";

import { Calendar, User } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLevelForScore } from "@/data/levels";
import { getLevelColor } from "@/lib/utils/level-colors";
import type { TeamDiagnosticEntry } from "@/lib/queries/team-dashboard";

interface TeamTimelineProps {
  diagnostics: TeamDiagnosticEntry[];
  selectedIds: [string] | [string, string];
  onSelect: (diagnosticId: string) => void;
}

export function TeamTimeline({ diagnostics, selectedIds, onSelect }: TeamTimelineProps) {
  const primaryId = selectedIds[0];
  const comparisonId = selectedIds.length === 2 ? selectedIds[1] : null;

  return (
    <div className="space-y-0">
      {diagnostics.map((diag, index) => {
        const level = getLevelForScore(diag.globalScore);
        const { bg, text } = getLevelColor(diag.globalScore);
        const isPrimary = diag.id === primaryId;
        const isComparison = diag.id === comparisonId;
        const isSelected = isPrimary || isComparison;

        return (
          <div key={diag.id} className="relative flex gap-4">
            {/* Vertical connector line */}
            <div className="flex flex-col items-center">
              <div
                className={`size-3 rounded-full border-2 ${
                  isPrimary
                    ? "border-primary bg-primary"
                    : isComparison
                      ? "border-violet-500 bg-violet-500"
                      : "border-muted-foreground/40 bg-background"
                }`}
              />
              {index < diagnostics.length - 1 && (
                <div className="w-px flex-1 bg-border" />
              )}
            </div>

            {/* Timeline entry */}
            <button
              type="button"
              onClick={() => onSelect(diag.id)}
              className={`mb-3 flex-1 rounded-lg border p-3 text-left transition-colors hover:bg-accent/50 ${
                isPrimary
                  ? "border-primary bg-primary/5"
                  : isComparison
                    ? "border-violet-500 bg-violet-50 dark:bg-violet-500/10"
                    : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge className={`${bg} ${text} border-0`}>
                    {level.name}
                  </Badge>
                  <span className="text-lg font-bold">
                    {diag.globalScore.toFixed(2)}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 4</span>
                </div>
                {isPrimary && (
                  <Badge variant="default" className="text-xs">
                    Actuel
                  </Badge>
                )}
                {isComparison && (
                  <Badge variant="outline" className="border-violet-500 text-xs text-violet-600">
                    Comparaison
                  </Badge>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3" />
                  {diag.completedAt.toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <User className="size-3" />
                  {diag.filledByName}
                </span>
                <span className="text-muted-foreground/70">
                  {diag.campaignName ?? "Diagnostic ad hoc"}
                </span>
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
