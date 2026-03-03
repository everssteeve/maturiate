## Why

Actuellement, la page d'organisation (`/orgs/[orgId]`) affiche un placeholder statique. Les administrateurs et consultants n'ont aucun moyen de visualiser la maturité IA de leur organisation de manière consolidée. Les diagnostics sont remplis par les managers (F4) dans le cadre de campagnes (F5), mais il n'existe aucune vue agrégée permettant de comparer les équipes, suivre l'évolution dans le temps, ou identifier les dimensions à travailler en priorité. Ce dashboard est le cœur décisionnel de la plateforme.

## What Changes

- Ajout d'une vue **heatmap Équipes × Dimensions** montrant les niveaux de maturité par cellule avec un code couleur (1-4) pour une campagne sélectionnée
- Ajout d'un **radar chart organisation** montrant le profil moyen de maturité sur les 6 dimensions
- Ajout de **courbes d'évolution temporelle** montrant la progression du score global et par dimension au fil des campagnes
- Affichage des **scores agrégés** : score moyen organisation, niveau de maturité global, nombre d'équipes évaluées
- Ajout de **filtres interactifs** : sélection de campagne, filtrage par équipe, filtrage par période
- Remplacement du placeholder actuel de la page organisation par le dashboard complet
- Ajout de **queries Drizzle** pour l'agrégation des données diagnostiques au niveau organisation
- Restriction d'accès selon les rôles : admin/consultant voient tout, manager voit uniquement ses équipes

## Capabilities

### New Capabilities
- `org-dashboard-queries`: Fonctions de requête pour agréger les données diagnostiques au niveau organisation (scores moyens par dimension, par équipe, par campagne, évolution temporelle)
- `org-dashboard-heatmap`: Composant de visualisation heatmap Équipes × Dimensions avec code couleur des niveaux de maturité
- `org-dashboard-charts`: Composants de visualisation : radar chart organisation et courbes d'évolution temporelle
- `org-dashboard-page`: Page principale du dashboard organisation avec filtres, agrégats et orchestration des composants de visualisation

### Modified Capabilities
- `diagnostic-queries`: Ajout de fonctions d'agrégation multi-équipes nécessaires pour le dashboard organisation

## Impact

- **Routes** : Modification de `app/(dashboard)/orgs/[orgId]/page.tsx` (remplacement du placeholder)
- **Queries** : Nouveau fichier `lib/queries/org-dashboard.ts` + extension de `lib/queries/diagnostics.ts`
- **Composants** : Nouveaux composants dans `components/dashboard/` (heatmap, radar, evolution chart, filtres)
- **Dépendances** : Utilisation de Recharts (déjà dans le projet pour le radar chart de F4)
- **Permissions** : Utilisation de `requireRole` et filtrage côté query pour les managers
- **Tables impactées** : Lecture seule sur `diagnostics`, `teams`, `campaigns`, `team_members`, `memberships`
