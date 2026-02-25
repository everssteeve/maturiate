import { notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";

import { auth } from "@/lib/auth";
import { getInvitationByToken } from "@/lib/queries/invitations";
import { LoginForm } from "@/components/auth/login-form";
import { AcceptInvitationButton } from "@/components/auth/accept-invitation-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  manager: "Manager",
  member: "Membre",
  consultant: "Consultant",
};

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await getInvitationByToken(token);

  if (!invitation) notFound();

  if (invitation.acceptedAt) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Invitation déjà acceptée</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Cette invitation a déjà été acceptée.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block text-sm font-medium text-primary underline"
          >
            Se connecter
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Invitation expirée</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Cette invitation a expiré. Contactez l&apos;administrateur de l&apos;organisation
            pour en recevoir une nouvelle.
          </p>
        </CardContent>
      </Card>
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });

  const hasGoogle = !!process.env.GOOGLE_CLIENT_ID;
  const hasMicrosoft = !!process.env.MICROSOFT_CLIENT_ID;

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-sm text-muted-foreground">Vous êtes invité à rejoindre</p>
          <p className="mt-1 text-lg font-semibold">{invitation.orgName}</p>
          <Badge variant="secondary" className="mt-2">
            {ROLE_LABELS[invitation.role] ?? invitation.role}
          </Badge>
        </CardContent>
      </Card>

      {session ? (
        <AcceptInvitationButton token={token} />
      ) : (
        <LoginForm
          callbackUrl={`/invite/${token}`}
          hasGoogle={hasGoogle}
          hasMicrosoft={hasMicrosoft}
          title="Connectez-vous pour accepter"
          description="Connectez-vous ou créez un compte pour rejoindre l'organisation."
        />
      )}
    </div>
  );
}
