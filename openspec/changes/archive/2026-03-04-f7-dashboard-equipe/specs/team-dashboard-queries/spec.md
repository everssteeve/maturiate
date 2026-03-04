## ADDED Requirements

### Requirement: Récupérer les données complètes du dashboard équipe
Le système DOIT fournir une fonction `getTeamDashboardData(teamId: string, orgId: string)` dans `lib/queries/team-dashboard.ts` qui retourne toutes les données nécessaires au dashboard équipe en un seul appel.

#### Scenario: Équipe avec des diagnostics
- **WHEN** `getTeamDashboardData` est appelée pour une équipe ayant 5 diagnostics répartis sur 3 campagnes
- **THEN** elle retourne un objet contenant : les informations de l'équipe (`name`, `id`), la liste des diagnostics ordonnés chronologiquement, les données d'évolution formatées, et le dernier diagnostic avec ses scores

#### Scenario: Équipe sans diagnostic
- **WHEN** `getTeamDashboardData` est appelée pour une équipe sans aucun diagnostic
- **THEN** elle retourne les informations de l'équipe avec des listes de diagnostics vides et `latestDiagnostic` à `null`

#### Scenario: Équipe inexistante ou d'une autre organisation
- **WHEN** `getTeamDashboardData` est appelée avec un `teamId` inexistant ou appartenant à une autre organisation
- **THEN** elle retourne `null`

### Requirement: Format des diagnostics pour la timeline
Le système DOIT retourner pour chaque diagnostic de l'équipe : l'ID du diagnostic, la date de complétion (`completedAt`), le nom de la personne ayant rempli le diagnostic, le score global, le niveau de maturité, les `dimensionScores`, et optionnellement le nom et l'ID de la campagne associée.

#### Scenario: Diagnostic avec campagne
- **WHEN** un diagnostic est associé à une campagne
- **THEN** le résultat inclut `campaignName` et `campaignId`

#### Scenario: Diagnostic ad hoc (sans campagne)
- **WHEN** un diagnostic a été fait en dehors d'une campagne (ad hoc)
- **THEN** le résultat a `campaignName` à `null` et `campaignId` à `null`

### Requirement: Données d'évolution temporelle pour les charts
Le système DOIT retourner les données formatées pour les courbes d'évolution : un tableau de points ordonnés chronologiquement par `completedAt`, chaque point contenant le score global et les 6 scores par dimension.

#### Scenario: Évolution sur 4 diagnostics
- **WHEN** l'équipe a 4 diagnostics complétés
- **THEN** le tableau d'évolution contient 4 points ordonnés chronologiquement avec `{ date, label, globalScore, dimensionScores }`

#### Scenario: Un seul diagnostic
- **WHEN** l'équipe n'a qu'un seul diagnostic
- **THEN** le tableau d'évolution contient un seul point (pas de courbe, mais le point est affiché)

### Requirement: Calcul de la tendance
Le système DOIT calculer la tendance en comparant le score global du dernier diagnostic avec celui de l'avant-dernier. La tendance est : `"up"` si le score a augmenté de plus de 0.1, `"down"` si le score a diminué de plus de 0.1, `"stable"` si la différence est <= 0.1 en valeur absolue, `null` s'il n'y a qu'un seul diagnostic.

#### Scenario: Tendance à la hausse
- **WHEN** le dernier diagnostic a un score de 3.0 et l'avant-dernier 2.5
- **THEN** la tendance est `"up"` avec une différence de +0.5

#### Scenario: Tendance à la baisse
- **WHEN** le dernier diagnostic a un score de 2.0 et l'avant-dernier 2.8
- **THEN** la tendance est `"down"` avec une différence de -0.8

#### Scenario: Tendance stable
- **WHEN** le dernier diagnostic a un score de 2.5 et l'avant-dernier 2.45
- **THEN** la tendance est `"stable"` avec une différence de +0.05

#### Scenario: Premier diagnostic
- **WHEN** l'équipe n'a qu'un seul diagnostic
- **THEN** la tendance est `null`

### Requirement: Données pour le radar chart comparatif
Le système DOIT retourner les `dimensionScores` de chaque diagnostic pour permettre la comparaison de 2 diagnostics sur un radar chart. Les données sont déjà incluses dans la liste des diagnostics retournée.

#### Scenario: Comparaison entre 2 diagnostics
- **WHEN** le dashboard sélectionne 2 diagnostics pour comparaison
- **THEN** les `dimensionScores` des 2 diagnostics sont disponibles dans la liste retournée par la query

### Requirement: Isolation multi-tenant
Toutes les requêtes de `getTeamDashboardData` DOIVENT filtrer par `orgId`. L'équipe demandée DOIT appartenir à l'organisation spécifiée.

#### Scenario: Accès autorisé
- **WHEN** `getTeamDashboardData` est appelée avec un `teamId` appartenant à l'organisation `orgId`
- **THEN** les données sont retournées

#### Scenario: Tentative d'accès inter-organisation
- **WHEN** `getTeamDashboardData` est appelée avec un `teamId` d'une autre organisation
- **THEN** la fonction retourne `null`
