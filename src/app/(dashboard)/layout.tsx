import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { listUserOrganizations } from "@/lib/queries/organizations";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });

  const organizations = session
    ? (await listUserOrganizations(session.user.id)).map((o) => ({
        id: o.id,
        name: o.name,
        logo: o.logo,
      }))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Header organizations={organizations} />
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
