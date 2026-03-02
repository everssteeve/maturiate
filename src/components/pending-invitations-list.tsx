"use client";

import { useTransition, useState } from "react";
import { Clock, RotateCcw, X } from "lucide-react";

import { resendInvitation, cancelInvitation } from "@/lib/actions/invitations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  manager: "Manager",
  member: "Membre",
  consultant: "Consultant",
};

interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedByName: string;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
}

interface PendingInvitationsListProps {
  orgId: string;
  invitations: Invitation[];
}

export function PendingInvitationsList({ orgId, invitations }: PendingInvitationsListProps) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function handleResend(invitationId: string) {
    startTransition(async () => {
      const result = await resendInvitation({ orgId, invitationId });
      if (result?.success) {
        setMessage({ type: "success", text: "Invitation renvoyée." });
      }
    });
  }

  function handleCancel(invitationId: string) {
    startTransition(async () => {
      const result = await cancelInvitation({ orgId, invitationId });
      if (result?.success) {
        setMessage({ type: "success", text: "Invitation annulée." });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitations en attente</CardTitle>
      </CardHeader>
      <CardContent>
        {message && (
          <p
            className={`mb-3 text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}
          >
            {message.text}
          </p>
        )}

        {invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune invitation en attente.</p>
        ) : (
          <div className="space-y-3">
            {invitations.map((inv) => (
              <div
                key={inv.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{inv.email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge variant="outline">{ROLE_LABELS[inv.role] ?? inv.role}</Badge>
                    {inv.isExpired && (
                      <Badge variant="destructive" className="text-xs">
                        Expirée
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      par {inv.invitedByName}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleResend(inv.id)}
                    disabled={pending}
                    title="Renvoyer"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCancel(inv.id)}
                    disabled={pending}
                    title="Annuler"
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
