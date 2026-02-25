import type { DimensionId } from "@/types";

export const RECOMMENDATIONS: Record<DimensionId, Record<number, string>> = {
  tools: {
    1: "Commencez par installer un assistant de code IA (GitHub Copilot, Cursor ou Claude Code) pour au moins un membre de l'équipe. Organisez une session de découverte pour démontrer les gains possibles.",
    2: "Standardisez l'assistant IA utilisé dans l'équipe et définissez des cas d'usage concrets (génération de boilerplate, refactoring, complétion). Partagez les premières bonnes pratiques.",
    3: "Documentez et partagez votre configuration d'outils IA. Mesurez les gains de productivité et explorez des outils complémentaires (génération d'images, recherche de code sémantique).",
    4: "Votre maîtrise des outils est excellente. Contribuez à la communauté en partageant vos retours d'expérience et explorez les outils émergents pour garder votre avance.",
  },
  process: {
    1: "Identifiez une étape de votre workflow où l'IA pourrait apporter de la valeur rapidement (par exemple, la préparation de code reviews). Testez sur un sprint.",
    2: "Intégrez l'IA dans votre processus de code review comme premier filtre. Documentez les critères de review automatisés et les limites identifiées.",
    3: "Étendez l'usage de l'IA à d'autres étapes du pipeline (analyse statique augmentée, génération de scripts CI). Mesurez l'impact sur le temps de cycle.",
    4: "Votre intégration IA dans les processus est mature. Partagez vos patterns d'intégration avec d'autres équipes et optimisez avec des métriques avancées.",
  },
  docs: {
    1: "Expérimentez la génération de docstrings ou de commentaires avec l'IA sur un module existant. Évaluez la qualité et le gain de temps.",
    2: "Mettez en place une pratique de génération de documentation assistée par IA pour les nouvelles fonctionnalités. Créez un template de prompts pour garantir la cohérence.",
    3: "Intégrez la génération de documentation dans votre CI (vérification de cohérence, complétude). Créez un catalogue de prompts de documentation partagé.",
    4: "Votre documentation est exemplaire. Explorez la génération automatique de diagrammes d'architecture et la maintenance proactive de la documentation existante.",
  },
  quality: {
    1: "Commencez par utiliser l'IA pour générer des tests unitaires sur une partie du code. Comparez la couverture avant/après sur un module pilote.",
    2: "Systématisez la génération de tests par IA pour les nouvelles fonctionnalités. Définissez des critères de qualité pour les tests générés (lisibilité, pertinence des assertions).",
    3: "Intégrez la génération de tests dans votre workflow (pre-commit hooks, CI). Explorez l'analyse prédictive des zones à risque pour prioriser les efforts de test.",
    4: "Votre approche qualité IA est avancée. Explorez le mutation testing assisté par IA et la détection proactive de dette technique.",
  },
  collab: {
    1: "Organisez une session de partage informelle où chaque membre montre son usage de l'IA. Créez un canal dédié (Slack, Teams) pour les tips et prompts.",
    2: "Formalisez le partage : mettez en place une session hebdomadaire de 15 minutes sur les découvertes IA. Créez un document partagé pour les prompts utiles.",
    3: "Structurez le catalogue de prompts et organisez des sessions de pair programming augmenté par l'IA. Identifiez les champions IA qui forment les autres.",
    4: "Votre collaboration IA est exemplaire. Partagez vos pratiques avec d'autres équipes de l'organisation et contribuez aux communautés externes.",
  },
  vision: {
    1: "Initiez une discussion d'équipe sur les opportunités de l'IA dans vos pratiques. Identifiez 2-3 quick wins à tester dans le prochain sprint.",
    2: "Définissez une feuille de route d'adoption IA pour le trimestre avec des objectifs concrets et mesurables. Désignez un référent IA dans l'équipe.",
    3: "Mettez en place un tableau de bord de suivi de l'impact IA (temps gagné, qualité, satisfaction). Présentez les résultats régulièrement au management.",
    4: "Votre maturité stratégique est élevée. Contribuez à définir la stratégie IA au niveau de l'organisation et partagez vos métriques d'impact.",
  },
};
