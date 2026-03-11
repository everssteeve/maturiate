import type { Metadata } from "next";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getHomepageSummary } from "@/lib/queries/homepage";
import { LandingPage } from "@/components/landing/landing-page";
import { AuthenticatedHomepage } from "@/components/homepage/authenticated-homepage";

export const metadata: Metadata = {
  title: "maturIAté — Mesurez la maturité IA de vos équipes",
  description:
    "Diagnostiquez, suivez et comparez l'adoption de l'IA dans vos équipes de développement. Campagnes de diagnostic, dashboards, benchmark anonymisé.",
  openGraph: {
    title: "maturIAté — Mesurez la maturité IA de vos équipes",
    description:
      "Diagnostiquez, suivez et comparez l'adoption de l'IA dans vos équipes de développement.",
    type: "website",
    locale: "fr_FR",
  },
};

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return <LandingPage />;
  }

  const summary = await getHomepageSummary(session.user.id);

  const user = {
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
  };

  return <AuthenticatedHomepage summary={summary} user={user} />;
}
