## ADDED Requirements

### Requirement: Récupérer les données du dashboard organisation
Le système DOIT fournir une fonction `getOrgDashboardData(orgId: string, options?: { campaignId?: string, teamIds?: string[] })` dans `lib/queries/org-dashboard.ts` qui retourne les données agrégées nécessaires au dashboard organisation.

#### Scenario: Organisation avec des diagnostics complétés
- **WHEN** `getOrgDashboardData` est appelée pour une organisation ayant des diagnostics dans plusieurs campagnes
- **THEN** elle retourne un objet contenant : la liste des campagnes, les diagnostics par équipe pour la campagne sélectionnée, et les scores agrégés organisation

#### Scenario: Organisation sans diagnostics
- **WHEN** `getOrgDashboardData` est appelée pour une organisation sans aucun diagnostic
- **THEN** elle retourne un objet avec des listes vides et des scores agrégés à `null`

#### Scenario: Filtrage par campagne
- **WHEN** `getOrgDashboardData` est appelée avec un `campaignId` spécifique
- **THEN** les diagnostics par équipe retournés correspondent uniquement à cette campagne

#### Scenario: Filtrage par équipes (vue manager)
- **WHEN** `getOrgDashboardData` est appelée avec un tableau de `teamIds`
- **THEN** seuls les diagnostics des équipes spécifiées sont retournés et les scores agrégés ne portent que sur ces équipes

### Requirement: Calcul des scores agrégés par dimension au niveau organisation
Le système DOIT calculer les scores moyens par dimension en faisant la moyenne des `dimensionScores` de tous les diagnostics (pour la campagne sélectionnée). Le résultat est un `Record<string, number>` avec les 6 IDs de dimension comme clés.

#### Scenario: Moyenne de dimension avec 3 équipes
- **WHEN** 3 équipes ont les scores suivants pour la dimension "tools" : [2.0, 3.0, 4.0]
- **THEN** le score agrégé pour "tools" est 3.0

#### Scenario: Seules les équipes avec diagnostic comptent
- **WHEN** une campagne cible 5 équipes mais seules 3 ont complété un diagnostic
- **THEN** les scores agrégés sont calculés sur les 3 équipes ayant un diagnostic (pas de division par 5)

### Requirement: Calcul du score global et du niveau de maturité organisation
Le système DOIT calculer le score global organisation comme la moyenne des 6 scores de dimension agrégés, et déterminer le niveau de maturité (1-4) en utilisant les mêmes seuils que `data/levels.ts`.

#### Scenario: Score global organisation
- **WHEN** les scores agrégés par dimension sont [2.0, 3.0, 2.5, 3.5, 2.0, 3.0]
- **THEN** le score global organisation est 2.67 et le niveau est 3 ("Intégration")

### Requirement: Données d'évolution temporelle
Le système DOIT fournir les scores globaux par campagne pour afficher l'évolution temporelle. Pour chaque campagne ayant au moins un diagnostic complété, retourner : le nom de la campagne, la date de début, le score global moyen et les scores par dimension moyens.

#### Scenario: Évolution sur 3 campagnes
- **WHEN** une organisation a 3 campagnes avec des diagnostics complétés
- **THEN** la fonction retourne 3 points de données ordonnés chronologiquement (par `startDate`) avec pour chacun le score global moyen et les scores par dimension

#### Scenario: Campagne sans diagnostic ignorée
- **WHEN** une campagne n'a aucun diagnostic complété
- **THEN** cette campagne n'apparaît pas dans les données d'évolution

### Requirement: Données de heatmap Équipes × Dimensions
Le système DOIT retourner pour chaque équipe de la campagne sélectionnée : le nom de l'équipe, l'ID de l'équipe, et soit les `dimensionScores` du diagnostic de cette campagne, soit `null` si l'équipe n'a pas encore complété le diagnostic.

#### Scenario: Équipe avec diagnostic complété
- **WHEN** l'équipe "Frontend" a complété le diagnostic pour la campagne sélectionnée
- **THEN** les données retournent `{ teamId, teamName: "Frontend", dimensionScores: { tools: 3.0, process: 2.5, ... }, globalScore: 2.8, globalLevel: 3 }`

#### Scenario: Équipe sans diagnostic pour la campagne
- **WHEN** l'équipe "Backend" n'a pas complété le diagnostic pour la campagne sélectionnée
- **THEN** les données retournent `{ teamId, teamName: "Backend", dimensionScores: null, globalScore: null, globalLevel: null }`

### Requirement: Toutes les queries sont scopées par organisation
Toutes les requêtes de `getOrgDashboardData` DOIVENT filtrer par `orgId` via une jointure ou un filtre sur les tables `teams` et `campaigns`. Aucune donnée d'une autre organisation ne DOIT être accessible.

#### Scenario: Isolation multi-tenant
- **WHEN** `getOrgDashboardData` est appelée avec un `orgId`
- **THEN** toutes les requêtes SQL incluent un filtre `WHERE ... org_id = orgId` directement ou via jointure

### Requirement: Liste des campagnes pour le sélecteur
Le système DOIT retourner la liste des campagnes de l'organisation (toutes sauf les drafts) triées par `startDate` décroissante, avec pour chacune : l'ID, le nom, le statut, la date de début, et le nombre de diagnostics complétés.

#### Scenario: Campagnes actives et fermées
- **WHEN** une organisation a 2 campagnes actives et 3 fermées
- **THEN** les 5 campagnes sont retournées, triées par date de début décroissante

#### Scenario: Campagnes en brouillon exclues
- **WHEN** une organisation a une campagne en statut "draft"
- **THEN** cette campagne n'apparaît pas dans la liste du sélecteur
