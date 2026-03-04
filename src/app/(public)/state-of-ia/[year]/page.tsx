import { notFound } from "next/navigation";
import type { Metadata } from "next";

import {
  getPublishedReport,
  getAggregatedStats,
  getTrendsByYear,
  getPublishedYears,
} from "@/lib/queries/state-of-ia";
import { ReportHeader } from "@/components/state-of-ia/report-header";
import { ReportSectionView } from "@/components/state-of-ia/report-section-view";
import { KeyInsights } from "@/components/state-of-ia/key-insights";
import { YearNav } from "@/components/state-of-ia/year-nav";
import { PrintButton } from "@/components/state-of-ia/print-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `State of IA ${year} — maturIAté`,
    description: `Rapport annuel sur la maturité IA des équipes de développement en France — Édition ${year}. Découvrez les tendances, niveaux de maturité et benchmarks par secteur.`,
    openGraph: {
      title: `State of IA ${year} — maturIAté`,
      description: `Rapport annuel sur la maturité IA des équipes de développement — Édition ${year}.`,
      type: "article",
    },
  };
}

export default async function StateOfIaPage({
  params,
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (isNaN(year)) notFound();

  const report = await getPublishedReport(year);
  if (!report) notFound();

  const stats = await getAggregatedStats(year);
  const trends = await getTrendsByYear();
  const publishedYears = await getPublishedYears();

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 print:px-0 print:py-0">
      {/* Navigation */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <YearNav currentYear={year} publishedYears={publishedYears} />
        <PrintButton />
      </div>

      {/* Header with stats */}
      <ReportHeader year={year} stats={stats} />

      {/* Introduction */}
      {report.content.introduction && (
        <div className="prose prose-sm mt-8 max-w-none">
          <p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-line">
            {report.content.introduction}
          </p>
        </div>
      )}

      {/* Sections */}
      {report.content.sections.map((section, i) => (
        <ReportSectionView
          key={i}
          section={section}
          stats={stats}
          trends={trends}
        />
      ))}

      {/* Key Insights */}
      {report.content.keyInsights.length > 0 && (
        <KeyInsights insights={report.content.keyInsights} />
      )}

      {/* Methodology */}
      {report.content.methodology && (
        <div className="mt-12 rounded-lg border bg-muted/50 p-6">
          <h2 className="mb-4 text-lg font-semibold">Méthodologie</h2>
          <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {report.content.methodology}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground print:mt-8">
        <p>
          State of IA {year} — Publié par{" "}
          <span className="font-medium">AIAD × maturIAté</span>
        </p>
      </div>
    </div>
  );
}
