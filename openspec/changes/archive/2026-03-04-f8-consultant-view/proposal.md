## Why

Les consultants/coaches AIAD accompagnent plusieurs organisations simultanément dans leur adoption du framework IA. Actuellement, ils doivent naviguer manuellement entre les organisations (via l'org-switcher) pour consulter chaque dashboard individuellement. Il n'existe aucune vue consolidée leur permettant de comparer les organisations, identifier les tendances globales, ou prioriser leurs interventions. La vue consultant est essentielle pour permettre un accompagnement multi-organisations efficace et structuré.

## What Changes

- Ajout d'une **page consultant** (`/consultant`) accessible uniquement aux utilisateurs ayant le rôle `consultant` dans au moins une organisation
- Affichage d'un **tableau de bord consolidé** montrant toutes les organisations auxquelles le consultant a accès, avec pour chacune : nom, logo, score moyen, niveau de maturité, nombre d'équipes, dernière campagne
- Affichage de **statistiques agrégées** : nombre total d'organisations, score moyen global, tendances (progression/régression)
- Ajout de **cartes cliquables par organisation** redirigeant vers le dashboard organisation existant (F6) en lecture seule
- Ajout de **queries Drizzle** pour agréger les données multi-organisations côté consultant
- Vérification des permissions : seul le rôle `consultant` accède à cette vue, avec un accès strictement en lecture seule

## Capabilities

### New Capabilities
- `consultant-overview-queries`: Fonctions de requête pour récupérer et agréger les données de toutes les organisations du consultant (scores moyens, dernières campagnes, nombre d'équipes, tendances)
- `consultant-dashboard-page`: Page du tableau de bord consultant avec la liste consolidée des organisations, statistiques globales et navigation vers les dashboards individuels

### Modified Capabilities

## Impact

- **Routes** : Modification de `app/(dashboard)/consultant/page.tsx` (remplacement du placeholder existant)
- **Queries** : Nouveau fichier `lib/queries/consultant.ts`
- **Composants** : Nouveaux composants dans `components/dashboard/` (consultant-dashboard, org-summary-card)
- **Dépendances** : Utilisation de Recharts (déjà dans le projet) pour les mini-visualisations par organisation
- **Permissions** : Utilisation de `requireRole` sur chaque organisation pour vérifier le rôle `consultant` ; la vue `/consultant` est filtrée par les memberships de l'utilisateur
- **Tables impactées** : Lecture seule sur `memberships`, `organizations`, `teams`, `diagnostics`, `campaigns`
