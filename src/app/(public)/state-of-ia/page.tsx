import { redirect } from "next/navigation";

import { getLatestPublishedYear } from "@/lib/queries/state-of-ia";

export default async function StateOfIaIndexPage() {
  const latestYear = await getLatestPublishedYear();

  if (latestYear) {
    redirect(`/state-of-ia/${latestYear}`);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <h1 className="text-3xl font-bold">State of IA</h1>
      <p className="mt-4 text-muted-foreground">
        Aucun rapport n&apos;a encore été publié. Revenez bientôt pour découvrir le
        premier rapport annuel sur la maturité IA des équipes de développement.
      </p>
    </div>
  );
}
