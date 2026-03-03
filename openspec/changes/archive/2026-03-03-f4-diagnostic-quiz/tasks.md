## 1. Logique de scoring

- [x] 1.1 Créer `src/lib/scoring.ts` avec la fonction `computeScores(answers: Record<string, number>)` qui calcule les scores par dimension, le score global et le niveau de maturité
- [x] 1.2 Créer `tests/unit/scoring.test.ts` avec tests unitaires exhaustifs : scores min/max, moyennes, frontières de niveaux, cas limites

## 2. Server Actions et queries diagnostics

- [x] 2.1 Créer `src/lib/actions/diagnostics.ts` avec la Server Action `submitDiagnostic` : validation Zod (14 réponses core, valeurs 1-4), vérification permissions (admin/manager), calcul des scores via `computeScores`, persistance en base, revalidation cache, redirection vers résultats
- [x] 2.2 Créer `src/lib/queries/diagnostics.ts` avec les fonctions `getDiagnostic(diagnosticId)`, `listTeamDiagnostics(teamId)`, `getLatestDiagnostic(teamId)` — toutes scopées par orgId

## 3. Gestion des questions bonus (CRUD)

- [x] 3.1 Ajouter dans `src/lib/actions/diagnostics.ts` les Server Actions `createBonusQuestion`, `updateBonusQuestion`, `toggleBonusQuestion` avec validation Zod et vérification permission admin
- [x] 3.2 Ajouter dans `src/lib/queries/diagnostics.ts` les fonctions `listBonusQuestions(orgId)` (toutes) et `listActiveBonusQuestions(orgId)` (actives uniquement)

## 4. Composants UI du quiz

- [x] 4.1 Créer `src/components/diagnostic/question-card.tsx` — Client Component affichant une question avec ses 4 options, sélection visuelle de la réponse
- [x] 4.2 Créer `src/components/diagnostic/progress-bar.tsx` — Barre de progression indiquant l'avancement (X / total questions)
- [x] 4.3 Créer `src/components/diagnostic/quiz-wizard.tsx` — Client Component principal du quiz : gestion de l'état des réponses, navigation séquentielle (avant/arrière), intégration questions core + bonus, écran de récapitulatif, soumission via Server Action
- [x] 4.4 Créer `src/components/diagnostic/quiz-summary.tsx` — Récapitulatif des réponses avant soumission, avec possibilité de modifier une réponse

## 5. Page de quiz

- [x] 5.1 Créer `src/app/(dashboard)/orgs/[orgId]/diagnostic/[teamId]/page.tsx` — Server Component qui vérifie les permissions (admin/manager), fetch l'équipe et les questions bonus actives, passe les données au QuizWizard

## 6. Composants de résultats

- [x] 6.1 Créer `src/components/charts/radar-chart.tsx` — Client Component Recharts affichant un radar chart des 6 dimensions
- [x] 6.2 Créer `src/components/diagnostic/results-panel.tsx` — Affichage du score global, niveau de maturité, détail par dimension avec recommandations, métadonnées du diagnostic (équipe, date, auteur, durée)

## 7. Page de résultats

- [x] 7.1 Créer `src/app/(dashboard)/orgs/[orgId]/diagnostic/[teamId]/results/[diagnosticId]/page.tsx` — Server Component qui fetch le diagnostic, vérifie l'appartenance à l'organisation, affiche le ResultsPanel avec le radar chart

## 8. Intégration dans l'UI existante

- [x] 8.1 Ajouter un bouton/lien "Remplir un diagnostic" dans la page d'équipe ou la liste des équipes, pointant vers `/orgs/[orgId]/diagnostic/[teamId]`
- [x] 8.2 Créer un dialog de gestion des questions bonus dans la page paramètres de l'organisation (`/orgs/[orgId]/settings`), accessible aux admins uniquement

## 9. Tests

- [x] 9.1 Créer `tests/unit/scoring.test.ts` (si pas déjà fait en 1.2) avec couverture > 90% de la logique de scoring
- [x] 9.2 Créer `tests/e2e/diagnostic-flow.spec.ts` — Test E2E du parcours complet : accéder au quiz, répondre aux 14 questions, soumettre, vérifier la page de résultats
