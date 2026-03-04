import Link from "next/link";
import { Building2, Users, TrendingUp, TrendingDown, Minus, Calendar } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getLevelForScore } from "@/data/levels";
import { getLevelColor } from "@/lib/utils/level-colors";
import type { ConsultantOrgSummary } from "@/lib/queries/consultant";

function OrgAvatar({ name, logo }: { name: string; logo: string | null }) {
  if (logo) {
    return (
      <img
        src={logo}
        alt={name}
        className="size-10 rounded-full object-cover"
      />
    );
  }

  const initial = name.charAt(0).toUpperCase();
  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
      {initial}
    </div>
  );
}

function TrendIndicator({ trend }: { trend: number | null }) {
  if (trend == null) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  if (trend > 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
        <TrendingUp className="size-3" />
        +{trend.toFixed(2)}
      </span>
    );
  }

  if (trend < 0) {
    return (
      <span className="flex items-center gap-1 text-xs font-medium text-red-600">
        <TrendingDown className="size-3" />
        {trend.toFixed(2)}
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Minus className="size-3" />
      0.00
    </span>
  );
}

export function ConsultantOrgCard({ org }: { org: ConsultantOrgSummary }) {
  const hasData = org.avgScore != null;
  const level = hasData ? getLevelForScore(org.avgScore!) : null;
  const levelColor = hasData ? getLevelColor(org.avgScore!) : null;

  return (
    <Link href={`/orgs/${org.orgId}`}>
      <Card className="transition-all hover:shadow-md hover:border-primary/30 cursor-pointer h-full">
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <OrgAvatar name={org.orgName} logo={org.orgLogo} />
              <div>
                <h3 className="font-semibold leading-tight">{org.orgName}</h3>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="size-3" />
                  {org.evaluatedTeams}/{org.totalTeams} équipes
                </div>
              </div>
            </div>
            <TrendIndicator trend={org.trend} />
          </div>

          {hasData ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {org.avgScore!.toFixed(2)}
                  <span className="text-sm font-normal text-muted-foreground"> / 4</span>
                </p>
              </div>
              {level && levelColor && (
                <Badge className={`${levelColor.bg} ${levelColor.text} border-0`}>
                  {level.name}
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg bg-muted/50 py-3">
              <p className="text-sm text-muted-foreground">Aucun diagnostic</p>
            </div>
          )}

          {org.lastCampaign && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t pt-3">
              <Calendar className="size-3" />
              <span className="truncate">{org.lastCampaign.name}</span>
              <span>—</span>
              <span>
                {org.lastCampaign.startDate.toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
