import Link from "next/link";

import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight">
          Prêt à évaluer vos équipes ?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Créez votre organisation et lancez votre première campagne de
          diagnostic en quelques minutes.
        </p>
        <Button size="lg" className="mt-8" asChild>
          <Link href="/login">Commencer gratuitement</Link>
        </Button>
      </div>
    </section>
  );
}
