"use client";

import { useState, useTransition } from "react";
import { Search, X } from "lucide-react";

import { addTeamMember, removeTeamMember } from "@/lib/actions/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Membre",
  consultant: "Consultant",
};

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

interface TeamMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgId: string;
  teamId: string;
  teamName: string;
  canManage: boolean;
  members: TeamMember[];
  availableMembers: AvailableMember[];
  onRefresh: () => void;
}

export function TeamMembersDialog({
  open,
  onOpenChange,
  orgId,
  teamId,
  teamName,
  canManage,
  members,
  availableMembers,
  onRefresh,
}: TeamMembersDialogProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddMember, setShowAddMember] = useState(false);

  const filteredAvailable = availableMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  function handleAdd(userId: string) {
    startTransition(async () => {
      const result = await addTeamMember({ orgId, teamId, userId });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Membre ajouté à l'équipe." });
        onRefresh();
      }
    });
  }

  function handleRemove() {
    if (!removeTarget) return;
    startTransition(async () => {
      const result = await removeTeamMember({
        orgId,
        teamId,
        userId: removeTarget.userId,
      });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Membre retiré de l'équipe." });
        onRefresh();
      }
      setRemoveTarget(null);
    });
  }

  return (
    <>
      <Dialog open={open && !removeTarget} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Membres — {teamName}</DialogTitle>
            <DialogDescription>
              Gérer les membres de l&apos;équipe.
            </DialogDescription>
          </DialogHeader>

          {message && (
            <p
              className={`text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}
            >
              {message.text}
            </p>
          )}

          {/* Current members */}
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun membre dans cette équipe.</p>
          ) : (
            <div className="space-y-2">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {member.image ? (
                        <img
                          src={member.image}
                          alt={member.name}
                          className="size-8 rounded-full object-cover"
                        />
                      ) : (
                        member.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{ROLE_LABELS[member.role] ?? member.role}</Badge>
                    {canManage && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-7 p-0 text-muted-foreground hover:text-destructive"
                        onClick={() => setRemoveTarget(member)}
                        title="Retirer de l'équipe"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add member section */}
          {canManage && (
            <div className="border-t pt-3">
              {!showAddMember ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddMember(true)}
                  className="w-full"
                >
                  Ajouter un membre
                </Button>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher par nom ou email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {availableMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Tous les membres sont déjà dans cette équipe.
                    </p>
                  ) : filteredAvailable.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun résultat.</p>
                  ) : (
                    <div className="max-h-48 space-y-1 overflow-y-auto">
                      {filteredAvailable.map((member) => (
                        <button
                          key={member.userId}
                          className="flex w-full items-center justify-between rounded-lg border p-2 text-left hover:bg-accent disabled:opacity-50"
                          onClick={() => handleAdd(member.userId)}
                          disabled={pending}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                              {member.image ? (
                                <img
                                  src={member.image}
                                  alt={member.name}
                                  className="size-8 rounded-full object-cover"
                                />
                              ) : (
                                member.name
                                  .split(" ")
                                  .map((p) => p[0])
                                  .join("")
                                  .toUpperCase()
                                  .slice(0, 2)
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{ROLE_LABELS[member.role] ?? member.role}</Badge>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove member confirmation dialog */}
      <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Retirer un membre</DialogTitle>
            <DialogDescription>
              Retirer {removeTarget?.name} de l&apos;équipe &laquo;{teamName}&raquo; ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleRemove} disabled={pending}>
              Retirer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
