## ADDED Requirements

### Requirement: Récupérer un diagnostic par son ID
Le système DOIT fournir une fonction `getDiagnostic(diagnosticId: string)` qui retourne un diagnostic complet avec les données relationnelles (nom de l'équipe, nom de celui qui a rempli).

#### Scenario: Diagnostic existant
- **WHEN** `getDiagnostic` est appelée avec un ID valide
- **THEN** elle retourne le diagnostic avec `team.name`, `filledByUser.name`, `answers`, `dimensionScores`, `globalScore`, `globalLevel`, `completedAt`

#### Scenario: Diagnostic inexistant
- **WHEN** `getDiagnostic` est appelée avec un ID invalide
- **THEN** elle retourne `null`

### Requirement: Lister les diagnostics d'une équipe
Le système DOIT fournir une fonction `listTeamDiagnostics(teamId: string)` qui retourne tous les diagnostics d'une équipe, triés par `completedAt` décroissant (plus récent en premier).

#### Scenario: Équipe avec plusieurs diagnostics
- **WHEN** `listTeamDiagnostics` est appelée pour une équipe ayant 3 diagnostics
- **THEN** elle retourne les 3 diagnostics triés du plus récent au plus ancien

#### Scenario: Équipe sans diagnostic
- **WHEN** `listTeamDiagnostics` est appelée pour une équipe sans diagnostic
- **THEN** elle retourne un tableau vide

### Requirement: Récupérer le dernier diagnostic d'une équipe
Le système DOIT fournir une fonction `getLatestDiagnostic(teamId: string)` qui retourne le diagnostic le plus récent d'une équipe, ou `null` s'il n'y en a pas.

#### Scenario: Dernier diagnostic existant
- **WHEN** `getLatestDiagnostic` est appelée pour une équipe ayant des diagnostics
- **THEN** elle retourne le diagnostic avec le `completedAt` le plus récent

#### Scenario: Aucun diagnostic
- **WHEN** `getLatestDiagnostic` est appelée pour une équipe sans diagnostic
- **THEN** elle retourne `null`

### Requirement: Toutes les queries sont scopées par organisation
Toutes les fonctions de lecture DOIVENT vérifier que l'entité demandée appartient à l'organisation de l'utilisateur connecté, via une jointure ou un filtre `orgId`.

#### Scenario: Accès autorisé
- **WHEN** un utilisateur demande un diagnostic appartenant à une équipe de son organisation
- **THEN** les données sont retournées

#### Scenario: Accès interdit
- **WHEN** un utilisateur tente d'accéder à un diagnostic d'une équipe d'une autre organisation
- **THEN** le système retourne `null` ou une erreur "Forbidden"
