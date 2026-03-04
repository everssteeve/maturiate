import { Card, CardContent } from "@/components/ui/card";
import { DistributionChart, DimensionsChart, TrendsChart, SegmentsChart } from "./charts";
import type { ReportSection } from "@/lib/validations/state-of-ia";
import type { AggregatedStats } from "@/lib/queries/state-of-ia";

export function ReportSectionView({
  section,
  stats,
  trends,
}: {
  section: ReportSection;
  stats: AggregatedStats | null;
  trends: { year: number; avgGlobalScore: number; totalOrganizations: number }[];
}) {
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold">{section.title}</h2>

      {section.body && (
        <p className="mt-3 leading-relaxed text-muted-foreground whitespace-pre-line">
          {section.body}
        </p>
      )}

      {section.chartType && stats && (
        <Card className="mt-4">
          <CardContent className="pt-6">
            {section.chartType === "distribution" && (
              <DistributionChart stats={stats} />
            )}
            {section.chartType === "dimensions" && (
              <DimensionsChart stats={stats} />
            )}
            {section.chartType === "trends" && <TrendsChart trends={trends} />}
            {section.chartType === "segments" && <SegmentsChart stats={stats} />}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
