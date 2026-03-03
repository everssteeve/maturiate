"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { fetchTeamMembersAction, fetchAvailableMembersAction } from "@/lib/actions/teams";
import { TeamsList } from "@/components/teams-list";
import { TeamMembersDialog } from "@/components/team-members-dialog";

interface Team {
  id: string;
  name: string;
  memberCount: number;
  createdAt: Date;
}

interface TeamMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

interface AvailableMember {
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

interface TeamsSectionProps {
  orgId: string;
  teams: Team[];
  isAdmin: boolean;
  isManager: boolean;
  managedTeamIds: string[];
}

export function TeamsSection({
  orgId,
  teams,
  isAdmin,
  isManager,
  managedTeamIds,
}: TeamsSectionProps) {
  const router = useRouter();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<AvailableMember[]>([]);
  const [, startTransition] = useTransition();

  function canManageTeam(teamId: string) {
    return isAdmin || (isManager && managedTeamIds.includes(teamId));
  }

  function loadTeamData(team: Team) {
    setSelectedTeam(team);
    startTransition(async () => {
      const [members, available] = await Promise.all([
        fetchTeamMembersAction(orgId, team.id),
        canManageTeam(team.id)
          ? fetchAvailableMembersAction(orgId, team.id)
          : Promise.resolve([]),
      ]);
      setTeamMembers(members);
      setAvailableMembers(available);
    });
  }

  function handleRefresh() {
    if (selectedTeam) {
      loadTeamData(selectedTeam);
    }
    router.refresh();
  }

  return (
    <>
      <TeamsList
        orgId={orgId}
        teams={teams}
        isAdmin={isAdmin}
        isManager={isManager}
        managedTeamIds={managedTeamIds}
        onManageMembers={loadTeamData}
      />

      {selectedTeam && (
        <TeamMembersDialog
          open={!!selectedTeam}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedTeam(null);
              router.refresh();
            }
          }}
          orgId={orgId}
          teamId={selectedTeam.id}
          teamName={selectedTeam.name}
          canManage={canManageTeam(selectedTeam.id)}
          members={teamMembers}
          availableMembers={availableMembers}
          onRefresh={handleRefresh}
        />
      )}
    </>
  );
}
