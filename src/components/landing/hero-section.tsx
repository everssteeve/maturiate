import Link from "next/link";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Mesurez la maturité IA de vos équipes
        </h1>
        <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
          Diagnostiquez, suivez et comparez l&apos;adoption de l&apos;IA dans
          vos équipes de développement. En moins de 5 minutes par équipe.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button size="lg" asChild>
            <Link href="/login">Commencer gratuitement</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#comment-ca-marche">Découvrir</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
