import { Header } from "@/components/layout/header";
import { OrgSummaryCard } from "@/components/homepage/org-summary-card";
import { EmptyState } from "@/components/homepage/empty-state";
import type { HomepageSummary } from "@/lib/queries/homepage";

interface AuthenticatedHomepageProps {
  summary: HomepageSummary;
  user: { name: string; email: string; image?: string | null };
}

export function AuthenticatedHomepage({ summary, user }: AuthenticatedHomepageProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {summary.organizations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Tableau de bord
            </h1>
            <p className="mt-1 text-muted-foreground">
              Vue d&apos;ensemble de vos organisations et actions en attente.
            </p>
            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              {summary.organizations.map((org) => (
                <OrgSummaryCard key={org.id} org={org} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
