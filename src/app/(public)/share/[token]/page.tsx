import { validateShareLink } from "@/lib/queries/share-links";
import { getTeamDashboardData } from "@/lib/queries/team-dashboard";
import { getOrgDashboardData } from "@/lib/queries/org-dashboard";
import { getOrganization } from "@/lib/queries/organizations";
import { ShareNotFound, ShareExpired } from "@/components/share/share-error";
import { SharedTeamResults } from "@/components/share/shared-team-results";
import { SharedCampaignResults } from "@/components/share/shared-campaign-results";
import { SharedOrgDashboard } from "@/components/share/shared-org-dashboard";

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const result = await validateShareLink(token);

  if (!result.valid) {
    if (result.reason === "expired") {
      return <ShareExpired />;
    }
    return <ShareNotFound />;
  }

  const { link, targetName } = result;

  // Render based on share link type
  if (link.type === "team") {
    const data = await getTeamDashboardData(link.targetId, link.orgId);
    if (!data) return <ShareNotFound />;

    const org = await getOrganization(link.orgId);

    return (
      <div>
        <div className="mb-6">
          {org && (
            <p className="text-sm text-muted-foreground">{org.name}</p>
          )}
          <h1 className="text-2xl font-bold">{targetName}</h1>
        </div>
        <SharedTeamResults data={data} />
      </div>
    );
  }

  if (link.type === "campaign") {
    const data = await getOrgDashboardData(link.orgId, {
      campaignId: link.targetId,
    });

    const org = await getOrganization(link.orgId);

    return (
      <div>
        <div className="mb-6">
          {org && (
            <p className="text-sm text-muted-foreground">{org.name}</p>
          )}
          <h1 className="text-2xl font-bold">Résultats de campagne</h1>
        </div>
        <SharedCampaignResults campaignName={targetName!} data={data} />
      </div>
    );
  }

  if (link.type === "org") {
    const data = await getOrgDashboardData(link.orgId);

    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{targetName}</h1>
          <p className="text-sm text-muted-foreground">Dashboard organisation</p>
        </div>
        <SharedOrgDashboard data={data} />
      </div>
    );
  }

  return <ShareNotFound />;
}
