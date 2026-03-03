## MODIFIED Requirements

### Requirement: Lister les diagnostics d'une équipe
Le système DOIT fournir une fonction `listTeamDiagnostics(teamId: string, orgId: string)` qui retourne tous les diagnostics d'une équipe, triés par `completedAt` décroissant (plus récent en premier). La fonction DOIT également retourner les `dimensionScores` de chaque diagnostic pour permettre l'agrégation côté dashboard.

#### Scenario: Équipe avec plusieurs diagnostics
- **WHEN** `listTeamDiagnostics` est appelée pour une équipe ayant 3 diagnostics
- **THEN** elle retourne les 3 diagnostics triés du plus récent au plus ancien, incluant `dimensionScores` pour chaque diagnostic

#### Scenario: Équipe sans diagnostic
- **WHEN** `listTeamDiagnostics` est appelée pour une équipe sans diagnostic
- **THEN** elle retourne un tableau vide

## ADDED Requirements

### Requirement: Lister les diagnostics d'une campagne pour une organisation
Le système DOIT fournir une fonction `listCampaignDiagnostics(campaignId: string, orgId: string)` qui retourne tous les diagnostics d'une campagne, avec les informations d'équipe associées, triés par nom d'équipe.

#### Scenario: Campagne avec diagnostics
- **WHEN** `listCampaignDiagnostics` est appelée pour une campagne ayant 5 diagnostics
- **THEN** elle retourne les 5 diagnostics avec `teamId`, `teamName`, `dimensionScores`, `globalScore`, `globalLevel`, triés par `teamName`

#### Scenario: Campagne sans diagnostic
- **WHEN** `listCampaignDiagnostics` est appelée pour une campagne sans diagnostic
- **THEN** elle retourne un tableau vide

#### Scenario: Isolation multi-tenant
- **WHEN** `listCampaignDiagnostics` est appelée avec un `orgId`
- **THEN** seuls les diagnostics d'équipes appartenant à cette organisation sont retournés

### Requirement: Lister les diagnostics de toutes les campagnes d'une organisation
Le système DOIT fournir une fonction `listOrgDiagnosticsByCampaign(orgId: string)` qui retourne les diagnostics groupés par campagne, pour calculer l'évolution temporelle. Seules les campagnes avec au moins un diagnostic sont incluses.

#### Scenario: Organisation avec plusieurs campagnes
- **WHEN** `listOrgDiagnosticsByCampaign` est appelée pour une organisation avec 3 campagnes dont 2 ont des diagnostics
- **THEN** elle retourne les diagnostics groupés pour les 2 campagnes ayant des diagnostics, avec les informations de campagne (nom, startDate)

#### Scenario: Filtrage par équipes
- **WHEN** `listOrgDiagnosticsByCampaign` est appelée avec un paramètre optionnel `teamIds`
- **THEN** seuls les diagnostics des équipes spécifiées sont retournés
