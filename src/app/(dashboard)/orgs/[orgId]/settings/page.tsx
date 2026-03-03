import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getOrganization } from "@/lib/queries/organizations";
import { listOrganizationMembers } from "@/lib/queries/members";
import { listPendingInvitations } from "@/lib/queries/invitations";
import { listTeams, listUserTeamIds } from "@/lib/queries/teams";
import { listBonusQuestions } from "@/lib/queries/diagnostics";
import { requireRole } from "@/lib/permissions";
import { OrgSettingsForm } from "@/components/org-settings-form";
import { MembersList } from "@/components/members-list";
import { MemberInviteForm } from "@/components/member-invite-form";
import { PendingInvitationsList } from "@/components/pending-invitations-list";
import { StateOfIaOptInCard } from "@/components/state-of-ia-opt-in-card";
import { TeamsSection } from "@/components/teams-section";
import { BonusQuestionsManager } from "@/components/bonus-questions-manager";

export default async function OrgSettingsPage({
  params,
}: {
  params: Promise<{ orgId: string }>;
}) {
  const { orgId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const org = await getOrganization(orgId);
  if (!org) throw new Error("Organisation introuvable.");

  let isAdmin = false;
  let isManager = false;
  try {
    await requireRole(orgId, "admin");
    isAdmin = true;
  } catch {
    try {
      await requireRole(orgId, "manager");
      isManager = true;
    } catch {
      // member or consultant — read-only view
    }
  }

  const [members, teamsList, bonusQuestionsList] = await Promise.all([
    listOrganizationMembers(orgId),
    listTeams(orgId),
    isAdmin ? listBonusQuestions(orgId) : Promise.resolve([]),
  ]);

  // For managers, determine which teams they belong to
  const managedTeamIds = isManager
    ? await listUserTeamIds(session.user.id, orgId)
    : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Paramètres — {org.name}</h1>

      <OrgSettingsForm
        org={{
          id: org.id,
          name: org.name,
          logo: org.logo,
          sector: org.sector,
          size: org.size,
        }}
        readOnly={!isAdmin}
      />

      {isAdmin && (
        <>
          <MembersList orgId={orgId} members={members} currentUserId={session.user.id} />

          <MemberInviteForm orgId={orgId} />

          <PendingInvitationsSection orgId={orgId} />
        </>
      )}

      <TeamsSection
        orgId={orgId}
        teams={teamsList}
        isAdmin={isAdmin}
        isManager={isManager}
        managedTeamIds={managedTeamIds}
      />

      {isAdmin && (
        <BonusQuestionsManager
          orgId={orgId}
          questions={bonusQuestionsList.map((q) => ({
            ...q,
            options: q.options as string[],
          }))}
        />
      )}

      <StateOfIaOptInCard
        orgId={orgId}
        optIn={org.optInStateOfIa}
        optInDate={org.optInDate}
        readOnly={!isAdmin}
      />
    </div>
  );
}

async function PendingInvitationsSection({ orgId }: { orgId: string }) {
  const invitations = await listPendingInvitations(orgId);

  return <PendingInvitationsList orgId={orgId} invitations={invitations} />;
}
