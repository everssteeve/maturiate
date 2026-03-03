import { notFound } from "next/navigation";

import { requireRole } from "@/lib/permissions";
import { getTeam } from "@/lib/queries/teams";
import { listActiveBonusQuestions } from "@/lib/queries/diagnostics";
import { getCampaign } from "@/lib/queries/campaigns";
import { QuizWizard } from "@/components/diagnostic/quiz-wizard";

export default async function DiagnosticPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgId: string; teamId: string }>;
  searchParams: Promise<{ campaignId?: string }>;
}) {
  const { orgId, teamId } = await params;
  const { campaignId } = await searchParams;

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

  let campaignName: string | undefined;
  let campaignEndDate: Date | undefined;

  if (campaignId) {
    const campaign = await getCampaign(campaignId, orgId);
    if (campaign && campaign.status === "active") {
      campaignName = campaign.name;
      campaignEndDate = campaign.endDate ?? undefined;
    }
  }

  return (
    <div className="py-6">
      {campaignName && (
        <div className="mx-auto mb-4 max-w-2xl rounded-lg border bg-muted/50 px-4 py-3">
          <p className="text-sm font-medium">Campagne : {campaignName}</p>
          {campaignEndDate && (
            <p className="text-xs text-muted-foreground">
              À compléter avant le{" "}
              {new Date(campaignEndDate).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      )}
      <QuizWizard
        orgId={orgId}
        teamId={teamId}
        teamName={team.name}
        bonusQuestions={bonusQuestionsFormatted}
        campaignId={campaignId}
      />
    </div>
  );
}
