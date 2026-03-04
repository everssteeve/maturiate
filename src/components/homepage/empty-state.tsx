import Link from "next/link";
import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted">
        <Building2 className="size-8 text-muted-foreground" />
      </div>
      <h2 className="mt-6 text-xl font-semibold">
        Bienvenue sur maturIAté !
      </h2>
      <p className="mt-2 max-w-sm text-muted-foreground">
        Vous ne faites partie d&apos;aucune organisation pour le moment. Créez
        votre organisation pour commencer à évaluer la maturité IA de vos
        équipes.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/orgs/new">Créer une organisation</Link>
      </Button>
    </div>
  );
}
