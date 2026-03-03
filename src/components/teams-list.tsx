"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, MoreHorizontal, Plus, Users } from "lucide-react";

import { createTeam, updateTeam, deleteTeam } from "@/lib/actions/teams";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Team {
  id: string;
  name: string;
  memberCount: number;
  createdAt: Date;
}

interface TeamsListProps {
  orgId: string;
  teams: Team[];
  isAdmin: boolean;
  isManager: boolean;
  managedTeamIds: string[];
  onManageMembers: (team: Team) => void;
}

export function TeamsList({
  orgId,
  teams,
  isAdmin,
  isManager,
  managedTeamIds,
  onManageMembers,
}: TeamsListProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Create team state
  const [showCreate, setShowCreate] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");

  // Edit team state
  const [editTarget, setEditTarget] = useState<Team | null>(null);
  const [editName, setEditName] = useState("");

  // Delete team state
  const [deleteTarget, setDeleteTarget] = useState<Team | null>(null);

  const canManageTeam = (teamId: string) => isAdmin || (isManager && managedTeamIds.includes(teamId));

  function handleCreate() {
    if (!newTeamName.trim()) return;
    startTransition(async () => {
      const result = await createTeam({ orgId, name: newTeamName.trim() });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Équipe créée." });
        setNewTeamName("");
        setShowCreate(false);
      }
    });
  }

  function handleUpdate() {
    if (!editTarget || !editName.trim()) return;
    startTransition(async () => {
      const result = await updateTeam({
        orgId,
        teamId: editTarget.id,
        name: editName.trim(),
      });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Équipe renommée." });
      }
      setEditTarget(null);
      setEditName("");
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;
    startTransition(async () => {
      const result = await deleteTeam({ orgId, teamId: deleteTarget.id });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Équipe supprimée." });
      }
      setDeleteTarget(null);
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Équipes ({teams.length})</CardTitle>
        {isAdmin && (
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="mr-1 size-4" />
            Créer une équipe
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {message && (
          <p
            className={`mb-3 text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}
          >
            {message.text}
          </p>
        )}

        {teams.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune équipe.</p>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <div key={team.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10">
                    <Users className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{team.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {team.memberCount} membre{team.memberCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{team.memberCount}</Badge>
                  {canManageTeam(team.id) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="size-8 p-0">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => router.push(`/orgs/${orgId}/diagnostic/${team.id}`)}
                        >
                          <ClipboardList className="mr-2 size-4" />
                          Remplir un diagnostic
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onManageMembers(team)}>
                          Gérer les membres
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditTarget(team);
                            setEditName(team.name);
                          }}
                        >
                          Renommer
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteTarget(team)}
                            >
                              Supprimer
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create team dialog */}
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une équipe</DialogTitle>
              <DialogDescription>
                Donnez un nom à votre nouvelle équipe.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Nom de l'équipe"
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
              }}
              maxLength={100}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreate(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={pending || !newTeamName.trim()}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit team dialog */}
        <Dialog open={!!editTarget} onOpenChange={() => setEditTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Renommer l&apos;équipe</DialogTitle>
              <DialogDescription>
                Modifier le nom de l&apos;équipe &laquo;{editTarget?.name}&raquo;.
              </DialogDescription>
            </DialogHeader>
            <Input
              placeholder="Nouveau nom"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUpdate();
              }}
              maxLength={100}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTarget(null)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate} disabled={pending || !editName.trim()}>
                Renommer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete team dialog */}
        <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Supprimer l&apos;équipe</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer l&apos;équipe &laquo;{deleteTarget?.name}&raquo; ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={pending}>
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
