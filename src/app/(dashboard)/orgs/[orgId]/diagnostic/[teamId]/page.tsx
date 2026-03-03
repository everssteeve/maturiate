import { notFound } from "next/navigation";

import { requireRole } from "@/lib/permissions";
import { getTeam } from "@/lib/queries/teams";
import { listActiveBonusQuestions } from "@/lib/queries/diagnostics";
import { QuizWizard } from "@/components/diagnostic/quiz-wizard";

export default async function DiagnosticPage({
  params,
}: {
  params: Promise<{ orgId: string; teamId: string }>;
}) {
  const { orgId, teamId } = await params;

  await requireRole(orgId, "admin", "manager");

  const team = await getTeam(teamId, orgId);
  if (!team) notFound();

  const bonusQuestions = await listActiveBonusQuestions(orgId);

  const bonusQuestionsFormatted = bonusQuestions.map((q) => ({
    id: q.id,
    dimensionId: q.dimensionId,
    text: q.text,
    options: q.options as string[],
  }));

  return (
    <div className="py-6">
      <QuizWizard
        orgId={orgId}
        teamId={teamId}
        teamName={team.name}
        bonusQuestions={bonusQuestionsFormatted}
      />
    </div>
  );
}
