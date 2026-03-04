import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function StateOfIATeaser() {
  return (
    <section className="rounded-lg border bg-muted/50 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          State of IA
        </h2>
        <p className="mt-4 text-muted-foreground">
          Découvrez le rapport annuel sur la maturité IA des équipes de
          développement en France. Données anonymisées et agrégées pour un
          benchmark fiable.
        </p>
        <Button variant="outline" className="mt-6" asChild>
          <Link href="/state-of-ia">
            Consulter le rapport
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
