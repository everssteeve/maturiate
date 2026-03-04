## Why

Les managers et admins ont besoin de visualiser l'évolution de la maturité IA au niveau de chaque équipe, pas seulement au niveau organisation. Le dashboard organisation (F6) donne une vue macro, mais ne permet pas de comprendre la trajectoire individuelle d'une équipe, son historique de diagnostics, ni de fournir des recommandations ciblées. Le dashboard équipe complète la boucle de feedback en offrant une vue détaillée par équipe avec timeline, évolution radar, et recommandations personnalisées.

## What Changes

- Ajout d'une page dashboard équipe sur la route `/orgs/[orgId]/teams/[teamId]`
- Affichage d'une timeline historique de tous les diagnostics de l'équipe (score, niveau, date, campagne associée)
- Visualisation de l'évolution du radar chart dans le temps (superposition de plusieurs diagnostics ou sélecteur de comparaison)
- Courbe d'évolution du score global et par dimension au fil des campagnes
- Recommandations personnalisées basées sur le dernier diagnostic et la tendance d'évolution
- Contrôle d'accès par rôle : admin voit toutes les équipes, manager voit ses équipes, member voit son équipe uniquement

## Capabilities

### New Capabilities
- `team-dashboard-page`: Page Server Component du dashboard équipe avec layout, permissions, et orchestration des données
- `team-dashboard-queries`: Fonctions de lecture pour récupérer les données du dashboard équipe (historique diagnostics, scores d'évolution, données pour les charts)
- `team-dashboard-timeline`: Composant timeline affichant l'historique chronologique des diagnostics d'une équipe
- `team-dashboard-charts`: Composants de visualisation : radar chart comparatif (superposition), courbe d'évolution scores, avec interactions (sélection de diagnostics à comparer)
- `team-recommendations`: Logique de génération des recommandations personnalisées basées sur le dernier diagnostic et l'évolution des scores

### Modified Capabilities
_Aucune modification de spec existante requise. Les queries existantes (`listTeamDiagnostics`, `getLatestDiagnostic` de `diagnostic-queries`) fournissent déjà les données de base nécessaires._

## Impact

- **Routes** : Ajout de `src/app/(dashboard)/orgs/[orgId]/teams/[teamId]/page.tsx`
- **Composants** : Ajout dans `src/components/dashboard/` (team-timeline, team-radar-comparison, team-evolution-chart, team-recommendations)
- **Queries** : Ajout dans `src/lib/queries/team-dashboard.ts`
- **Données** : Utilisation de `data/recommendations.ts` et `data/dimensions.ts` existants
- **Charts existants** : Réutilisation de `components/charts/radar-chart.tsx` et `components/charts/evolution-chart.tsx` (avec adaptation pour la comparaison multi-diagnostics)
- **Permissions** : Utilisation de `requireRole()` existant, scope par `orgId` + vérification d'appartenance à l'équipe pour les managers/members
- **Dépendances** : Aucune nouvelle dépendance — Recharts et shadcn/ui sont déjà disponibles
