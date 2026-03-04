## ADDED Requirements

### Requirement: Page benchmark "Mon positionnement"
Le système SHALL afficher une page "Mon positionnement" à `/orgs/[orgId]/benchmark` pour les organisations ayant `opt_in_state_of_ia: true` et pour lesquelles des snapshots State of IA existent.

#### Scenario: Organisation opt-in avec snapshots
- **WHEN** un admin d'une organisation opt-in accède à `/orgs/[orgId]/benchmark` et des snapshots existent pour la dernière année publiée
- **THEN** le système MUST afficher le positionnement de l'organisation : percentile par dimension (6 dimensions), percentile sur le score global, et le nombre total d'organisations dans le benchmark

#### Scenario: Organisation non opt-in
- **WHEN** un utilisateur accède à `/orgs/[orgId]/benchmark` pour une organisation avec `opt_in_state_of_ia: false`
- **THEN** le système MUST afficher un message invitant à activer la participation au State of IA dans les paramètres, avec un lien vers la page paramètres

#### Scenario: Organisation opt-in sans snapshots
- **WHEN** un admin accède à `/orgs/[orgId]/benchmark` pour une organisation opt-in mais aucun snapshot n'existe encore
- **THEN** le système MUST afficher un message "Le premier rapport State of IA n'a pas encore été publié. Vos données seront incluses lors de la prochaine extraction annuelle."

#### Scenario: Accès consultant
- **WHEN** un consultant accède à `/orgs/[orgId]/benchmark`
- **THEN** le système MUST afficher la même page benchmark en lecture seule

#### Scenario: Accès member
- **WHEN** un member accède à `/orgs/[orgId]/benchmark`
- **THEN** le système MUST rediriger ou afficher un message indiquant qu'il n'a pas accès à cette page

### Requirement: Affichage des percentiles par dimension
Le système SHALL afficher le percentile de l'organisation pour chaque dimension sous forme de barres de progression ou indicateurs visuels.

#### Scenario: Affichage du percentile
- **WHEN** l'organisation est au 72e percentile sur la dimension "Outils"
- **THEN** le système MUST afficher "72e percentile" avec une barre de progression remplie à 72%, le nom de la dimension, et le score brut de l'organisation

#### Scenario: Affichage du percentile global
- **WHEN** l'organisation est au 58e percentile sur le score global
- **THEN** le système MUST afficher en évidence "58e percentile" avec une indication visuelle de la position (ex : marqueur sur une courbe de distribution)

### Requirement: Filtrage par segment
Le système SHALL permettre de filtrer le benchmark par secteur d'activité et/ou taille d'organisation.

#### Scenario: Filtre par secteur disponible
- **WHEN** le secteur "ESN / Consulting" contient 8 organisations dans les snapshots
- **THEN** le filtre par secteur MUST être disponible et les percentiles recalculés sur ce sous-ensemble

#### Scenario: Filtre par secteur indisponible (seuil non atteint)
- **WHEN** le secteur "Santé" ne contient que 3 organisations dans les snapshots
- **THEN** le filtre "Santé" MUST être désactivé (grisé) avec un tooltip "Données insuffisantes (minimum 5 organisations)"

#### Scenario: Filtre combiné secteur + taille
- **WHEN** l'utilisateur sélectionne le secteur "ESN / Consulting" et la taille "51-200"
- **AND** ce croisement contient au moins 5 organisations
- **THEN** les percentiles MUST être recalculés sur ce sous-ensemble

#### Scenario: Filtre combiné sous le seuil
- **WHEN** le croisement secteur × taille contient moins de 5 organisations
- **THEN** le système MUST afficher un avertissement et proposer d'élargir le filtre (secteur seul ou taille seule)

### Requirement: Query getBenchmarkPercentiles
Le système SHALL fournir une query `getBenchmarkPercentiles(year, orgHash, filters?)` retournant les percentiles de l'organisation.

#### Scenario: Calcul des percentiles sans filtre
- **WHEN** `getBenchmarkPercentiles(2026, "hash123")` est appelé
- **THEN** le système MUST retourner un objet avec : le percentile par dimension (6 valeurs entre 0 et 100), le percentile global, le nombre total d'organisations, et le score brut de l'organisation

#### Scenario: Calcul avec filtre secteur
- **WHEN** `getBenchmarkPercentiles(2026, "hash123", { sector: "esn_consulting" })` est appelé et le secteur contient >= 5 organisations
- **THEN** les percentiles MUST être calculés uniquement sur les organisations de ce secteur

### Requirement: Année du benchmark
Le système SHALL afficher les données du dernier rapport publié (année la plus récente avec un rapport `state_of_ia_reports` ayant un `published_at` non null).

#### Scenario: Sélection de l'année
- **WHEN** des rapports existent pour 2025 (publié) et 2026 (brouillon)
- **THEN** le système MUST afficher les données de 2025
- **AND** un sélecteur d'année MUST permettre de consulter les années précédentes si disponibles
