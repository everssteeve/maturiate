"use client";

import { Building2, BarChart3, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { ConsultantOrgCard } from "@/components/dashboard/consultant-org-card";
import type { ConsultantOverviewData } from "@/lib/queries/consultant";

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-6">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="size-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">
            {value}
            {suffix && <span className="text-sm font-normal text-muted-foreground"> {suffix}</span>}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConsultantDashboard({ data }: { data: ConsultantOverviewData }) {
  // Sort: orgs with scores first (descending), then without scores
  const sortedOrgs = [...data.organizations].sort((a, b) => {
    if (a.avgScore == null && b.avgScore == null) return 0;
    if (a.avgScore == null) return 1;
    if (b.avgScore == null) return -1;
    return b.avgScore - a.avgScore;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={Building2}
          label="Organisations"
          value={String(data.stats.totalOrganizations)}
        />
        <StatCard
          icon={BarChart3}
          label="Score moyen"
          value={data.stats.avgGlobalScore != null ? data.stats.avgGlobalScore.toFixed(2) : "—"}
          suffix={data.stats.avgGlobalScore != null ? "/ 4" : undefined}
        />
        <StatCard
          icon={Users}
          label="Équipes évaluées"
          value={String(data.stats.totalEvaluatedTeams)}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedOrgs.map((org) => (
          <ConsultantOrgCard key={org.orgId} org={org} />
        ))}
      </div>
    </div>
  );
}
