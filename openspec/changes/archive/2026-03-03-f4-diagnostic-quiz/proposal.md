## Why

La plateforme dispose désormais des fondations (auth F1, organisations F2, équipes F3) mais ne permet pas encore de réaliser sa fonction principale : diagnostiquer la maturité IA d'une équipe. F4 est le cœur fonctionnel de maturIAté — sans le quiz et le calcul de scores, aucune fonctionnalité ultérieure (campagnes, dashboards, benchmark) ne peut exister.

## What Changes

- Ajout de la logique de scoring : calcul des scores par dimension (moyenne des réponses de la dimension) et du score global (moyenne des 6 dimensions), détermination du niveau de maturité (1-4)
- Ajout des Server Actions pour soumettre un diagnostic (`submitDiagnostic`) et gérer les questions bonus CRUD
- Ajout des queries pour récupérer les diagnostics d'une équipe et les détails d'un diagnostic
- Création de la page de quiz interactive : navigation entre questions, barre de progression, sélection des réponses, soumission
- Création de la page de résultats : radar chart par dimension, score global avec niveau de maturité, recommandations personnalisées par dimension
- Support des questions bonus (spécifiques à l'organisation, optionnelles, non comptées dans le score comparatif)
- Ajout d'un lien "Remplir un diagnostic" dans l'interface de gestion d'équipe

## Capabilities

### New Capabilities
- `diagnostic-scoring`: Logique métier de calcul des scores par dimension et du score global, détermination du niveau de maturité
- `diagnostic-submit`: Server Action de soumission d'un diagnostic avec validation, vérification des permissions et persistance en base
- `diagnostic-queries`: Fonctions de lecture pour récupérer les diagnostics (par équipe, par id) avec données relationnelles
- `quiz-page`: Page interactive du quiz — navigation entre les 14 questions core + questions bonus, barre de progression, sélection de réponses
- `diagnostic-results`: Page de résultats post-soumission — radar chart, score global, niveau de maturité, détail par dimension, recommandations
- `bonus-questions-crud`: Gestion des questions bonus par l'admin (création, modification, activation/désactivation)

### Modified Capabilities
_(aucune capacité existante modifiée au niveau des exigences)_

## Impact

- **Nouveaux fichiers** :
  - `src/lib/scoring.ts` — Logique de calcul des scores
  - `src/lib/actions/diagnostics.ts` — Server Actions (submitDiagnostic, CRUD bonus questions)
  - `src/lib/queries/diagnostics.ts` — Queries de lecture
  - `src/app/(dashboard)/orgs/[orgId]/diagnostic/[teamId]/page.tsx` — Page quiz
  - `src/components/diagnostic/question-card.tsx` — Composant question
  - `src/components/diagnostic/progress-bar.tsx` — Barre de progression
  - `src/components/diagnostic/results-panel.tsx` — Panel résultats
  - `src/components/charts/radar-chart.tsx` — Radar chart maturité
- **Tables DB utilisées** : `diagnostics`, `bonus_questions` (déjà dans le schéma)
- **Données constantes utilisées** : `data/questions.ts`, `data/dimensions.ts`, `data/levels.ts`, `data/recommendations.ts` (déjà créées)
- **Dépendances** : Recharts (déjà dans le projet), pas de nouvelle dépendance
- **Permissions** : `admin` et `manager` peuvent soumettre un diagnostic ; `admin` gère les questions bonus
