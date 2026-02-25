"use client";

import { useActionState } from "react";

import { acceptInvitation } from "@/lib/actions/invitations";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AcceptInvitationButton({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return await acceptInvitation(formData);
    },
    null,
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={formAction}>
          <input type="hidden" name="token" value={token} />
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Acceptation en cours..." : "Accepter l'invitation"}
          </Button>
        </form>
        {state?.error && (
          <p className="mt-2 text-center text-sm text-destructive">{state.error}</p>
        )}
      </CardContent>
    </Card>
  );
}
