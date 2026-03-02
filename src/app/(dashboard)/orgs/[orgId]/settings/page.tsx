import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getOrganization } from "@/lib/queries/organizations";
import { listOrganizationMembers } from "@/lib/queries/members";
import { listPendingInvitations } from "@/lib/queries/invitations";
import { requireRole } from "@/lib/permissions";
import { OrgSettingsForm } from "@/components/org-settings-form";
import { MembersList } from "@/components/members-list";
import { MemberInviteForm } from "@/components/member-invite-form";
import { PendingInvitationsList } from "@/components/pending-invitations-list";
import { StateOfIaOptInCard } from "@/components/state-of-ia-opt-in-card";

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
  try {
    await requireRole(orgId, "admin");
    isAdmin = true;
  } catch {
    // not admin — read-only view
  }

  const members = await listOrganizationMembers(orgId);

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
