import type { Dimension } from "@/types";

export const DIMENSIONS: readonly Dimension[] = [
  {
    id: "tools",
    label: "Outils & Environnement",
    short: "Outils",
    description:
      "Adoption et maîtrise des outils d'IA dans l'environnement de développement (assistants de code, génération, IDE augmentés).",
  },
  {
    id: "process",
    label: "Processus & Workflow",
    short: "Process",
    description:
      "Intégration de l'IA dans les processus de développement (code review, CI/CD, planification, estimation).",
  },
  {
    id: "docs",
    label: "Documentation & Connaissances",
    short: "Docs",
    description:
      "Utilisation de l'IA pour la documentation, le partage de connaissances et la capitalisation technique.",
  },
  {
    id: "quality",
    label: "Qualité & Tests",
    short: "Qualité",
    description:
      "Utilisation de l'IA pour améliorer la qualité du code, la couverture de tests et la détection de bugs.",
  },
  {
    id: "collab",
    label: "Collaboration & Pratiques",
    short: "Collab",
    description:
      "Pratiques collaboratives autour de l'IA : pair programming augmenté, partage de prompts, montée en compétences collective.",
  },
  {
    id: "vision",
    label: "Vision & Stratégie",
    short: "Vision",
    description:
      "Alignement stratégique, gouvernance de l'IA, mesure de l'impact et vision à long terme de l'équipe et de l'organisation.",
  },
] as const;

export const DIMENSION_IDS = DIMENSIONS.map((d) => d.id);
