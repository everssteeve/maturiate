"use client";

import { DIMENSIONS } from "@/data/dimensions";
import { getLevelColor } from "@/lib/utils/level-colors";
import type { TeamHeatmapRow } from "@/lib/queries/org-dashboard";

interface OrgHeatmapProps {
  data: TeamHeatmapRow[];
}

function ScoreCell({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <td className="border border-border bg-muted px-3 py-2 text-center text-sm text-muted-foreground">
        —
      </td>
    );
  }

  const { bg, text } = getLevelColor(score);

  return (
    <td className={`border border-border px-3 py-2 text-center text-sm font-medium ${bg} ${text}`}>
      {score.toFixed(1)}
    </td>
  );
}

export function OrgHeatmap({ data }: OrgHeatmapProps) {
  const sortedTeams = [...data].sort((a, b) => a.teamName.localeCompare(b.teamName));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 border border-border bg-background px-4 py-2 text-left text-sm font-semibold">
              Équipe
            </th>
            {DIMENSIONS.map((dim) => (
              <th
                key={dim.id}
                className="border border-border bg-background px-3 py-2 text-center text-sm font-semibold"
              >
                {dim.short}
              </th>
            ))}
            <th className="border border-border bg-background px-3 py-2 text-center text-sm font-semibold">
              Global
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTeams.map((team) => (
            <tr key={team.teamId}>
              <td className="sticky left-0 z-10 border border-border bg-background px-4 py-2 text-sm font-medium">
                {team.teamName}
              </td>
              {DIMENSIONS.map((dim) => (
                <ScoreCell
                  key={dim.id}
                  score={team.dimensionScores ? (team.dimensionScores[dim.id] ?? null) : null}
                />
              ))}
              <ScoreCell score={team.globalScore} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
