import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Shield, BarChart3 } from "lucide-react";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [user] = await db
    .select({ isSuperAdmin: users.isSuperAdmin })
    .from(users)
    .where(eq(users.id, session.user.id));

  if (!user?.isSuperAdmin) {
    redirect("/orgs");
  }

  return (
    <div className="flex gap-6">
      <aside className="hidden w-56 shrink-0 md:block">
        <div className="sticky top-20 space-y-1">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Shield className="size-4" />
            Administration
          </div>
          <Link
            href="/admin/state-of-ia"
            className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
          >
            <BarChart3 className="size-4" />
            State of IA
          </Link>
        </div>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}
