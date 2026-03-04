import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

import { auth } from "@/lib/auth";
import { isConsultant, getConsultantOverview } from "@/lib/queries/consultant";
import { Card, CardContent } from "@/components/ui/card";
import { ConsultantDashboard } from "@/components/dashboard/consultant-dashboard";

export default async function ConsultantPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const hasConsultantRole = await isConsultant(session.user.id);
  if (!hasConsultantRole) redirect("/orgs");

  const data = await getConsultantOverview(session.user.id);

  if (data.organizations.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">Vue consultant</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <Building2 className="size-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg font-medium">
                Vous n&apos;êtes consultant dans aucune organisation
              </p>
              <p className="text-sm text-muted-foreground">
                Les administrateurs des organisations peuvent vous inviter en tant que consultant.
                Vous verrez alors leurs données ici.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Vue consultant</h1>
      <ConsultantDashboard data={data} />
    </div>
  );
}
