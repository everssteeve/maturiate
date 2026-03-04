import { eq, and, sql } from "drizzle-orm";

import { db } from "@/lib/db";
import {
  organizations,
  memberships,
  campaigns,
  teams,
  diagnostics,
  teamMembers,
} from "@/lib/db/schema";

export type PendingAction = {
  type: "fill_diagnostic" | "launch_campaign" | "no_teams";
  label: string;
  link: string;
};

export type OrgHomepageSummary = {
  id: string;
  name: string;
  logo: string | null;
  role: string;
  activeCampaign: {
    id: string;
    name: string;
    completionPercent: number;
    pendingTeams: number;
    totalTeams: number;
  } | null;
  pendingActions: PendingAction[];
};

export type HomepageSummary = {
  organizations: OrgHomepageSummary[];
};

export async function getHomepageSummary(
  userId: string,
): Promise<HomepageSummary> {
  // 1. Get user's organizations with their roles
  const userOrgs = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      logo: organizations.logo,
      role: memberships.role,
    })
    .from(memberships)
    .innerJoin(organizations, eq(memberships.orgId, organizations.id))
    .where(eq(memberships.userId, userId));

  if (userOrgs.length === 0) {
    return { organizations: [] };
  }

  // 2. For each org, get active campaign + compute pending actions
  const orgSummaries: OrgHomepageSummary[] = await Promise.all(
    userOrgs.map(async (org) => {
      // Get active campaign for this org
      const [activeCampaign] = await db
        .select({
          id: campaigns.id,
          name: campaigns.name,
          totalTeams: sql<number>`(
            SELECT count(*)::int FROM teams t
            WHERE t.org_id = "campaigns"."org_id"
          )`,
          respondedTeams: sql<number>`(
            SELECT count(DISTINCT d.team_id)::int FROM diagnostics d
            INNER JOIN teams t ON d.team_id = t.id
            WHERE d.campaign_id = "campaigns"."id"
              AND t.org_id = "campaigns"."org_id"
          )`,
        })
        .from(campaigns)
        .where(and(eq(campaigns.orgId, org.id), eq(campaigns.status, "active")))
        .limit(1);

      const campaignData = activeCampaign
        ? {
            id: activeCampaign.id,
            name: activeCampaign.name,
            totalTeams: activeCampaign.totalTeams,
            pendingTeams:
              activeCampaign.totalTeams - activeCampaign.respondedTeams,
            completionPercent:
              activeCampaign.totalTeams > 0
                ? Math.round(
                    (activeCampaign.respondedTeams /
                      activeCampaign.totalTeams) *
                      100,
                  )
                : 0,
          }
        : null;

      // Compute pending actions based on role
      const pendingActions: PendingAction[] = [];

      if (org.role === "manager" && campaignData) {
        // Find teams this manager belongs to that haven't submitted yet
        const managerTeams = await db
          .select({
            teamId: teamMembers.teamId,
            teamName: teams.name,
          })
          .from(teamMembers)
          .innerJoin(teams, eq(teamMembers.teamId, teams.id))
          .where(
            and(
              eq(teamMembers.userId, userId),
              eq(teams.orgId, org.id),
            ),
          );

        for (const team of managerTeams) {
          const [existing] = await db
            .select({ id: diagnostics.id })
            .from(diagnostics)
            .where(
              and(
                eq(diagnostics.teamId, team.teamId),
                eq(diagnostics.campaignId, campaignData.id),
              ),
            )
            .limit(1);

          if (!existing) {
            pendingActions.push({
              type: "fill_diagnostic",
              label: `Remplir le diagnostic pour ${team.teamName}`,
              link: `/orgs/${org.id}/quiz?team=${team.teamId}&campaign=${campaignData.id}`,
            });
          }
        }
      }

      if (org.role === "admin") {
        if (!campaignData) {
          // Check if org has teams first
          const [teamCount] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(teams)
            .where(eq(teams.orgId, org.id));

          if (teamCount.count === 0) {
            pendingActions.push({
              type: "no_teams",
              label: "Créer votre première équipe",
              link: `/orgs/${org.id}/teams`,
            });
          } else {
            pendingActions.push({
              type: "launch_campaign",
              label: "Lancer une nouvelle campagne",
              link: `/orgs/${org.id}/campaigns`,
            });
          }
        }
      }

      return {
        id: org.id,
        name: org.name,
        logo: org.logo,
        role: org.role,
        activeCampaign: campaignData,
        pendingActions,
      };
    }),
  );

  return { organizations: orgSummaries };
}
