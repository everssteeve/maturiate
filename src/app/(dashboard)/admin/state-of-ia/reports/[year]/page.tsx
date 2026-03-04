import { notFound } from "next/navigation";

import { getReport, getSnapshotsForYear } from "@/lib/queries/state-of-ia";
import { ReportEditor } from "@/components/admin/report-editor";
import type { ReportContent } from "@/lib/validations/state-of-ia";

export default async function AdminReportPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);

  if (isNaN(year)) notFound();

  const report = await getReport(year);
  if (!report) notFound();

  const snapshots = await getSnapshotsForYear(year);
  const hasSnapshots = snapshots.length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rapport State of IA {year}</h1>
        <p className="text-sm text-muted-foreground">
          {hasSnapshots
            ? `${snapshots.length} organisations dans les données.`
            : "Aucune donnée extraite pour cette année."}
        </p>
      </div>

      <ReportEditor
        reportId={report.id}
        year={year}
        initialContent={report.content as ReportContent}
        isPublished={!!report.publishedAt}
        hasSnapshots={hasSnapshots}
      />
    </div>
  );
}
