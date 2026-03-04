import { BarChart3, Clock, Shield, Users } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const benefits = [
  {
    icon: Clock,
    title: "Diagnostic rapide",
    description:
      "14 questions ciblées, 6 dimensions d'analyse, un résultat clair en moins de 5 minutes par équipe.",
  },
  {
    icon: BarChart3,
    title: "Suivi dans le temps",
    description:
      "Lancez des campagnes trimestrielles et visualisez l'évolution de chaque équipe avec des courbes et heatmaps.",
  },
  {
    icon: Shield,
    title: "Benchmark anonymisé",
    description:
      "Comparez vos résultats au rapport annuel State of IA, basé sur des données agrégées et anonymisées.",
  },
  {
    icon: Users,
    title: "Vue multi-organisations",
    description:
      "Les consultants suivent plusieurs clients depuis un tableau de bord consolidé, avec des rapports personnalisés.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Pourquoi maturIAté ?
        </h2>
        <p className="mt-4 text-center text-muted-foreground">
          Tout ce dont vous avez besoin pour piloter l&apos;adoption de
          l&apos;IA dans vos équipes.
        </p>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit.title}>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="size-5 text-primary" />
                </div>
                <CardTitle className="mt-3">{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
