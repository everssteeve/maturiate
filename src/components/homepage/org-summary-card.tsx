import Link from "next/link";
import { Building2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PendingActions } from "@/components/homepage/pending-actions";
import { QuickLinks } from "@/components/homepage/quick-links";
import type { OrgHomepageSummary } from "@/lib/queries/homepage";

const roleLabels: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Membre",
  consultant: "Consultant",
};

interface OrgSummaryCardProps {
  org: OrgHomepageSummary;
}

export function OrgSummaryCard({ org }: OrgSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="size-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle>{org.name}</CardTitle>
            <CardDescription>{roleLabels[org.role] ?? org.role}</CardDescription>
          </div>
          <Badge variant="secondary">{roleLabels[org.role] ?? org.role}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Active campaign */}
        {org.activeCampaign ? (
          <div className="rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/orgs/${org.id}/campaigns/${org.activeCampaign.id}`}
                className="text-sm font-medium hover:underline"
              >
                {org.activeCampaign.name}
              </Link>
              <span className="text-sm text-muted-foreground">
                {org.activeCampaign.completionPercent}%
              </span>
            </div>
            <Progress
              value={org.activeCampaign.completionPercent}
              className="mt-2"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              {org.activeCampaign.pendingTeams > 0
                ? `${org.activeCampaign.pendingTeams} équipe${org.activeCampaign.pendingTeams > 1 ? "s" : ""} en attente sur ${org.activeCampaign.totalTeams}`
                : "Toutes les équipes ont répondu"}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucune campagne active
          </p>
        )}

        {/* Pending actions */}
        {org.pendingActions.length > 0 && (
          <PendingActions actions={org.pendingActions} />
        )}

        {/* Quick links */}
        <QuickLinks orgId={org.id} role={org.role} />
      </CardContent>
    </Card>
  );
}
