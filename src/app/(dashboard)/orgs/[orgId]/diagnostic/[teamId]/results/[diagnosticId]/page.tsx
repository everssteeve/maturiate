import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ClipboardList } from "lucide-react";

import { requireRole } from "@/lib/permissions";
import { getDiagnostic } from "@/lib/queries/diagnostics";
import { ResultsPanel } from "@/components/diagnostic/results-panel";
import { Button } from "@/components/ui/button";
import type { DimensionScores } from "@/types";

export default async function DiagnosticResultsPage({
  params,
}: {
  params: Promise<{ orgId: string; teamId: string; diagnosticId: string }>;
}) {
  const { orgId, teamId, diagnosticId } = await params;

  await requireRole(orgId, "admin", "manager", "member", "consultant");

  const diagnostic = await getDiagnostic(diagnosticId, orgId);
  if (!diagnostic) notFound();

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="mb-6 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/orgs/${orgId}/settings`}>
            <ArrowLeft className="mr-1 size-4" />
            Retour
          </Link>
        </Button>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/orgs/${orgId}/diagnostic/${teamId}`}>
            <ClipboardList className="mr-1 size-4" />
            Nouveau diagnostic
          </Link>
        </Button>
      </div>

      <ResultsPanel
        teamName={diagnostic.teamName}
        filledByName={diagnostic.filledByName}
        dimensionScores={diagnostic.dimensionScores as DimensionScores}
        globalScore={diagnostic.globalScore}
        globalLevel={diagnostic.globalLevel}
        completedAt={diagnostic.completedAt}
        startedAt={diagnostic.startedAt}
      />
    </div>
  );
}
