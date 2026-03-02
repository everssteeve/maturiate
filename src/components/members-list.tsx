"use client";

import { useState, useTransition } from "react";
import { MoreHorizontal } from "lucide-react";

import { updateMemberRole, removeMember } from "@/lib/actions/members";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Membre",
  consultant: "Consultant",
};

const ROLE_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  admin: "default",
  manager: "secondary",
  member: "outline",
  consultant: "outline",
};

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  createdAt: Date;
}

interface MembersListProps {
  orgId: string;
  members: Member[];
  currentUserId: string;
}

export function MembersList({ orgId, members, currentUserId }: MembersListProps) {
  const [pending, startTransition] = useTransition();
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null);
  const [roleTarget, setRoleTarget] = useState<Member | null>(null);
  const [newRole, setNewRole] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleChangeRole() {
    if (!roleTarget || !newRole) return;
    startTransition(async () => {
      const result = await updateMemberRole({
        orgId,
        membershipId: roleTarget.id,
        newRole,
      });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Rôle mis à jour." });
      }
      setRoleTarget(null);
      setNewRole("");
    });
  }

  function handleRemove() {
    if (!removeTarget) return;
    startTransition(async () => {
      const result = await removeMember({
        orgId,
        membershipId: removeTarget.id,
      });
      if (result?.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({ type: "success", text: "Membre retiré de l'organisation." });
      }
      setRemoveTarget(null);
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Membres ({members.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <p
            className={`mb-3 text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}
          >
            {message.text}
          </p>
        )}

        <div className="space-y-3">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {member.image ? (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="size-9 rounded-full object-cover"
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
                <Badge variant={ROLE_VARIANTS[member.role] ?? "outline"}>
                  {ROLE_LABELS[member.role] ?? member.role}
                </Badge>
                {member.userId !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="size-8 p-0">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setRoleTarget(member);
                          setNewRole(member.role);
                        }}
                      >
                        Modifier le rôle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setRemoveTarget(member)}
                      >
                        Retirer de l&apos;organisation
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Change role dialog */}
        <Dialog open={!!roleTarget} onOpenChange={() => setRoleTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier le rôle</DialogTitle>
              <DialogDescription>
                Changer le rôle de {roleTarget?.name} dans l&apos;organisation.
              </DialogDescription>
            </DialogHeader>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Membre</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button variant="outline" onClick={() => setRoleTarget(null)}>
                Annuler
              </Button>
              <Button onClick={handleChangeRole} disabled={pending}>
                Confirmer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Remove member dialog */}
        <Dialog open={!!removeTarget} onOpenChange={() => setRemoveTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Retirer un membre</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir retirer {removeTarget?.name} de l&apos;organisation ?
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
      </CardContent>
    </Card>
  );
}
