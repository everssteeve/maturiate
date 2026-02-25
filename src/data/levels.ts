import type { Level } from "@/types";

export const LEVELS: readonly Level[] = [
  {
    level: 1,
    name: "Découverte",
    description:
      "L'équipe commence à s'intéresser à l'IA sans usage structuré. Les initiatives sont individuelles et sporadiques.",
    minScore: 1.0,
    maxScore: 1.75,
  },
  {
    level: 2,
    name: "Exploration",
    description:
      "L'équipe expérimente activement l'IA. Des premiers usages émergent mais restent informels et non standardisés.",
    minScore: 1.75,
    maxScore: 2.5,
  },
  {
    level: 3,
    name: "Intégration",
    description:
      "L'IA est intégrée dans les pratiques quotidiennes de l'équipe avec des processus définis et des résultats mesurables.",
    minScore: 2.5,
    maxScore: 3.25,
  },
  {
    level: 4,
    name: "Transformation",
    description:
      "L'IA est un pilier stratégique. L'équipe optimise continuellement ses pratiques IA avec une gouvernance mature.",
    minScore: 3.25,
    maxScore: 4.0,
  },
] as const;

export function getLevelForScore(score: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (score >= LEVELS[i].minScore) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}
