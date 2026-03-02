"use client";

import { useActionState } from "react";

import { inviteMember } from "@/lib/actions/invitations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MemberInviteFormProps {
  orgId: string;
}

export function MemberInviteForm({ orgId }: MemberInviteFormProps) {
  const [state, action, pending] = useActionState(inviteMember, null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inviter un membre</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="space-y-4">
          <input type="hidden" name="orgId" value={orgId} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="colleague@example.com"
              required
            />
            {state?.error?.email && (
              <p className="text-sm text-destructive">{state.error.email[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select name="role" defaultValue="member">
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="member">Membre</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state?.success && (
            <p className="text-sm text-green-600">Invitation envoyée.</p>
          )}

          <Button type="submit" disabled={pending}>
            {pending ? "Envoi en cours..." : "Envoyer l'invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
