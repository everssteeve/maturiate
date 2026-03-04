import { NextResponse } from "next/server";
import { and, eq, gt, lt, isNotNull } from "drizzle-orm";

import { db } from "@/lib/db";
import { campaigns, teams, diagnostics, teamMembers, memberships, users } from "@/lib/db/schema";
import { getResend } from "@/lib/email";
import { CampaignReminderEmail } from "@/lib/email/templates/campaign-reminder";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  // Find active campaigns with endDate within 3 days
  const dueSoonCampaigns = await db
    .select()
    .from(campaigns)
    .where(
      and(
        eq(campaigns.status, "active"),
        isNotNull(campaigns.endDate),
        gt(campaigns.endDate, now),
        lt(campaigns.endDate, threeDaysFromNow),
      ),
    );

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  let totalSent = 0;

  for (const campaign of dueSoonCampaigns) {
    // Get all teams in the org
    const orgTeams = await db
      .select({ id: teams.id, name: teams.name })
      .from(teams)
      .where(eq(teams.orgId, campaign.orgId));

    // Get teams that already responded
    const responded = await db
      .select({ teamId: diagnostics.teamId })
      .from(diagnostics)
      .where(eq(diagnostics.campaignId, campaign.id));

    const respondedSet = new Set(responded.map((r) => r.teamId));
    const pendingTeams = orgTeams.filter((t) => !respondedSet.has(t.id));

    if (pendingTeams.length === 0) continue;

    const pendingTeamIds = new Set(pendingTeams.map((t) => t.id));
    const daysRemaining = campaign.endDate
      ? Math.max(0, Math.ceil((campaign.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : undefined;

    // Get managers of pending teams
    const managers = await db
      .select({
        teamId: teamMembers.teamId,
        teamName: teams.name,
        email: users.email,
      })
      .from(teamMembers)
      .innerJoin(teams, eq(teamMembers.teamId, teams.id))
      .innerJoin(users, eq(teamMembers.userId, users.id))
      .innerJoin(
        memberships,
        and(eq(memberships.userId, teamMembers.userId), eq(memberships.orgId, teams.orgId)),
      )
      .where(and(eq(teams.orgId, campaign.orgId), eq(memberships.role, "manager")));

    const pendingManagers = managers.filter((m) => pendingTeamIds.has(m.teamId));

    for (const manager of pendingManagers) {
      const diagnosticUrl = `${baseUrl}/orgs/${campaign.orgId}/diagnostic/${manager.teamId}?campaignId=${campaign.id}`;

      await getResend().emails.send({
        from: process.env.EMAIL_FROM || "maturIAté <onboarding@resend.dev>",
        to: manager.email,
        subject: `Rappel : ${campaign.name} — Diagnostic en attente`,
        react: CampaignReminderEmail({
          campaignName: campaign.name,
          teamName: manager.teamName,
          diagnosticUrl,
          daysRemaining,
        }),
      });
      totalSent++;
    }
  }

  return NextResponse.json({
    campaignsProcessed: dueSoonCampaigns.length,
    remindersSent: totalSent,
  });
}
