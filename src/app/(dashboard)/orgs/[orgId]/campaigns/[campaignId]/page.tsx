import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireRole } from "@/lib/permissions";
import { getCampaignDetail } from "@/lib/queries/campaigns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignActions } from "@/components/campaigns/campaign-actions";
import { CampaignTeamsTable } from "@/components/campaigns/campaign-teams-table";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  closed: { label: "Clôturée", variant: "outline" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ orgId: string; campaignId: string }>;
}) {
  const { orgId, campaignId } = await params;
  const { membership } = await requireRole(orgId, "admin", "manager", "consultant");
  const isAdmin = membership.role === "admin";

  const detail = await getCampaignDetail(campaignId, orgId);
  if (!detail) notFound();

  const { campaign, teamsStatus, totalTeams, respondedTeams, completionPercent } = detail;
  const status = STATUS_LABELS[campaign.status] ?? STATUS_LABELS.draft;

  return (
    <div>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/orgs/${orgId}/campaigns`}>
            <ArrowLeft className="mr-1 size-4" />
            Retour aux campagnes
          </Link>
        </Button>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDate(campaign.startDate)}
            {campaign.endDate && ` — ${formatDate(campaign.endDate)}`}
          </p>
        </div>
        {isAdmin && (
          <CampaignActions
            orgId={orgId}
            campaignId={campaignId}
            status={campaign.status}
            hasTeams={totalTeams > 0}
            allResponded={respondedTeams === totalTeams && totalTeams > 0}
          />
        )}
      </div>

      {campaign.status !== "draft" && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Équipes</p>
              <p className="text-2xl font-bold">{totalTeams}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Réponses</p>
              <p className="text-2xl font-bold">
                {respondedTeams} / {totalTeams}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Complétion</p>
              <p className="text-2xl font-bold">{completionPercent}%</p>
              <div className="mt-2 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {campaign.status !== "draft" && (
        <Card>
          <CardHeader>
            <CardTitle>Suivi par équipe</CardTitle>
          </CardHeader>
          <CardContent>
            <CampaignTeamsTable
              orgId={orgId}
              campaignId={campaignId}
              teamsStatus={teamsStatus}
            />
          </CardContent>
        </Card>
      )}

      {campaign.status === "draft" && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Lancez la campagne pour commencer à collecter les diagnostics de vos équipes.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
