import Link from "next/link";
import { Plus } from "lucide-react";

import { requireRole } from "@/lib/permissions";
import { listCampaigns } from "@/lib/queries/campaigns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  draft: { label: "Brouillon", variant: "secondary" },
  active: { label: "Active", variant: "default" },
  closed: { label: "Clôturée", variant: "outline" },
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const { membership } = await requireRole(orgId, "admin", "manager", "consultant");
  const isAdmin = membership.role === "admin";

  const campaignsList = await listCampaigns(orgId);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campagnes</h1>
        {isAdmin && (
          <Button asChild>
            <Link href={`/orgs/${orgId}/campaigns/new`}>
              <Plus className="mr-2 size-4" />
              Nouvelle campagne
            </Link>
          </Button>
        )}
      </div>

      {campaignsList.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {isAdmin
                ? "Aucune campagne. Créez votre première campagne pour collecter les diagnostics de vos équipes."
                : "Aucune campagne pour le moment."}
            </p>
            {isAdmin && (
              <Button asChild className="mt-4">
                <Link href={`/orgs/${orgId}/campaigns/new`}>
                  <Plus className="mr-2 size-4" />
                  Créer une campagne
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {campaignsList.map((campaign) => {
            const status = STATUS_LABELS[campaign.status] ?? STATUS_LABELS.draft;
            return (
              <Link
                key={campaign.id}
                href={`/orgs/${orgId}/campaigns/${campaign.id}`}
                className="block"
              >
                <Card className="transition-colors hover:bg-muted/50">
                  <CardContent className="flex items-center justify-between py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{campaign.name}</span>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(campaign.startDate)}
                        {campaign.endDate && ` — ${formatDate(campaign.endDate)}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {campaign.respondedTeams} / {campaign.totalTeams} équipes
                      </p>
                      <div className="mt-1 h-2 w-24 rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${campaign.completionPercent}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
