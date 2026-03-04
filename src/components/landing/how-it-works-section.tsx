const steps = [
  {
    number: "1",
    title: "Créez votre organisation",
    description:
      "Inscrivez-vous, créez votre organisation et invitez vos managers d'équipe en quelques clics.",
  },
  {
    number: "2",
    title: "Invitez vos équipes",
    description:
      "Structurez vos équipes et assignez les managers qui rempliront les diagnostics pour leurs équipes.",
  },
  {
    number: "3",
    title: "Lancez une campagne",
    description:
      "Lancez une campagne de diagnostic et suivez en temps réel les taux de complétion et les résultats.",
  },
];

export function HowItWorksSection() {
  return (
    <section id="comment-ca-marche" className="py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Comment ça marche ?
        </h2>
        <p className="mt-4 text-center text-muted-foreground">
          Trois étapes simples pour évaluer la maturité IA de vos équipes.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                {step.number}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
