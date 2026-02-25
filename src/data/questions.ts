import type { Question } from "@/types";

export const QUESTIONS: readonly Question[] = [
  // ── Outils & Environnement (tools) ──────────────────
  {
    id: "q_0",
    dimensionId: "tools",
    text: "Comment votre équipe utilise-t-elle les assistants de code IA (Copilot, Cursor, Claude Code…) ?",
    options: [
      "Aucun assistant IA n'est utilisé par l'équipe",
      "Quelques membres expérimentent individuellement, sans cadre défini",
      "La majorité de l'équipe utilise un assistant IA au quotidien avec des pratiques partagées",
      "L'assistant IA est intégré dans le workflow standard, avec des guidelines d'usage et un suivi d'efficacité",
    ],
  },
  {
    id: "q_1",
    dimensionId: "tools",
    text: "Quel est le niveau d'adoption des outils de génération de code par IA dans l'équipe ?",
    options: [
      "Aucun outil de génération de code n'est utilisé",
      "Des outils sont testés ponctuellement pour des tâches isolées (boilerplate, snippets)",
      "Les outils de génération sont utilisés régulièrement pour accélérer le développement",
      "La génération de code IA est systématique et intégrée dans la chaîne de production avec validation humaine",
    ],
  },
  {
    id: "q_2",
    dimensionId: "tools",
    text: "Comment l'équipe gère-t-elle la configuration et le partage des outils IA ?",
    options: [
      "Chacun utilise ses propres outils sans coordination",
      "Des recommandations informelles existent mais chacun reste libre",
      "Un kit d'outils IA standardisé est défini et partagé dans l'équipe",
      "L'environnement IA est versionné, documenté et fait partie de l'onboarding des nouveaux membres",
    ],
  },

  // ── Processus & Workflow (process) ──────────────────
  {
    id: "q_3",
    dimensionId: "process",
    text: "Comment l'IA est-elle intégrée dans le processus de code review ?",
    options: [
      "L'IA n'intervient pas dans les revues de code",
      "Certains membres utilisent l'IA pour préparer ou faciliter leurs reviews",
      "L'IA est utilisée systématiquement pour une première passe de review avant la review humaine",
      "La code review combine IA et humain dans un workflow défini, avec des métriques de qualité",
    ],
  },
  {
    id: "q_4",
    dimensionId: "process",
    text: "L'IA est-elle intégrée dans votre pipeline CI/CD ou vos processus d'automatisation ?",
    options: [
      "L'IA n'est pas présente dans notre CI/CD ni nos automatisations",
      "Nous avons exploré des usages ponctuels (génération de config, scripts)",
      "L'IA est utilisée dans certaines étapes du pipeline (analyse statique augmentée, génération de tests)",
      "L'IA est intégrée de bout en bout dans notre chaîne d'automatisation avec monitoring",
    ],
  },

  // ── Documentation & Connaissances (docs) ────────────
  {
    id: "q_5",
    dimensionId: "docs",
    text: "Comment l'IA est-elle utilisée pour la documentation technique ?",
    options: [
      "La documentation est entièrement manuelle, l'IA n'est pas utilisée",
      "L'IA est parfois utilisée pour rédiger ou reformuler de la documentation",
      "La génération de documentation par IA fait partie du workflow (docstrings, README, ADR)",
      "La documentation est générée et maintenue avec l'IA, intégrée dans la CI avec vérification de cohérence",
    ],
  },
  {
    id: "q_6",
    dimensionId: "docs",
    text: "Comment l'équipe capitalise-t-elle les connaissances liées à l'utilisation de l'IA ?",
    options: [
      "Il n'y a pas de capitalisation — chacun apprend de son côté",
      "Des échanges informels ont lieu (Slack, discussions) mais rien n'est formalisé",
      "Une base de connaissances existe (prompts, patterns, retours d'expérience) et est alimentée régulièrement",
      "La capitalisation est structurée avec des revues régulières, un catalogue de prompts et des formations internes",
    ],
  },

  // ── Qualité & Tests (quality) ───────────────────────
  {
    id: "q_7",
    dimensionId: "quality",
    text: "Comment l'IA est-elle utilisée pour l'écriture de tests ?",
    options: [
      "Les tests sont écrits manuellement, l'IA n'est pas utilisée",
      "L'IA est utilisée occasionnellement pour générer des tests unitaires simples",
      "L'IA génère régulièrement des tests (unitaires, intégration) qui sont revus et intégrés",
      "La génération de tests par IA est systématique, avec des objectifs de couverture et des métriques suivies",
    ],
  },
  {
    id: "q_8",
    dimensionId: "quality",
    text: "Comment l'IA contribue-t-elle à la détection et la résolution de bugs ?",
    options: [
      "L'IA n'est pas utilisée pour le débogage",
      "L'IA est utilisée ponctuellement pour comprendre des erreurs ou suggérer des corrections",
      "L'IA est un outil courant pour le diagnostic de bugs et la suggestion de correctifs",
      "L'IA est intégrée dans le processus de monitoring et de résolution, avec analyse prédictive des zones à risque",
    ],
  },

  // ── Collaboration & Pratiques (collab) ──────────────
  {
    id: "q_9",
    dimensionId: "collab",
    text: "Comment l'équipe partage-t-elle ses pratiques et prompts IA ?",
    options: [
      "Il n'y a pas de partage — chacun utilise l'IA indépendamment",
      "Des échanges spontanés ont lieu mais sans structure",
      "L'équipe a un canal ou une pratique dédiée au partage de prompts et de techniques IA",
      "Un système de partage structuré existe avec des sessions régulières, un catalogue et des retours collectifs",
    ],
  },
  {
    id: "q_10",
    dimensionId: "collab",
    text: "Comment l'IA est-elle intégrée dans les pratiques de pair/mob programming ?",
    options: [
      "L'IA n'est pas utilisée lors des sessions de pair ou mob programming",
      "Certains binômes utilisent l'IA comme troisième participant de manière informelle",
      "L'IA est régulièrement utilisée comme co-pilote lors des sessions de pair programming",
      "Le pair programming augmenté par l'IA est une pratique établie avec des formats définis",
    ],
  },

  // ── Vision & Stratégie (vision) ─────────────────────
  {
    id: "q_11",
    dimensionId: "vision",
    text: "Existe-t-il une stratégie d'adoption de l'IA au niveau de l'équipe ou de l'organisation ?",
    options: [
      "Il n'y a pas de réflexion stratégique sur l'adoption de l'IA",
      "Des discussions informelles ont lieu mais sans plan défini",
      "Une feuille de route d'adoption IA existe avec des objectifs à court terme",
      "Une stratégie IA formalisée guide les investissements, la formation et les choix d'outils avec des KPIs",
    ],
  },
  {
    id: "q_12",
    dimensionId: "vision",
    text: "Comment l'impact de l'IA sur la productivité et la qualité est-il mesuré ?",
    options: [
      "L'impact n'est pas mesuré — l'adoption est intuitive",
      "Des observations qualitatives sont partagées mais sans données objectives",
      "Des métriques ponctuelles sont collectées (temps gagné, satisfaction, couverture de tests)",
      "Un tableau de bord de suivi de l'impact IA existe avec des métriques régulièrement analysées",
    ],
  },
  {
    id: "q_13",
    dimensionId: "vision",
    text: "Comment l'équipe gère-t-elle les enjeux éthiques et de gouvernance liés à l'IA ?",
    options: [
      "Ces sujets ne sont pas abordés",
      "Des discussions ponctuelles ont lieu (propriété intellectuelle, confidentialité)",
      "Des guidelines existent sur l'usage responsable de l'IA (données sensibles, review du code généré)",
      "Une politique de gouvernance IA est en place avec des règles claires, une veille et des formations régulières",
    ],
  },
] as const;
