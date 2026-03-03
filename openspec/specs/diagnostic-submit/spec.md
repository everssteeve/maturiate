## ADDED Requirements

### Requirement: Soumission d'un diagnostic par un admin ou manager
Le système DOIT permettre à un utilisateur ayant le rôle `admin` ou `manager` dans l'organisation de soumettre un diagnostic pour une équipe de cette organisation. Le diagnostic PEUT optionnellement être lié à une campagne via un paramètre `campaignId`.

#### Scenario: Soumission réussie par un admin
- **WHEN** un admin soumet un diagnostic avec 14 réponses core valides pour une équipe de son organisation
- **THEN** le diagnostic est créé en base avec les réponses, les scores calculés, le niveau de maturité, et `filledBy` = l'id de l'admin

#### Scenario: Soumission réussie par un manager
- **WHEN** un manager soumet un diagnostic pour une équipe de son organisation
- **THEN** le diagnostic est créé en base avec les mêmes données

#### Scenario: Soumission refusée pour un member
- **WHEN** un utilisateur avec le rôle `member` tente de soumettre un diagnostic
- **THEN** le système retourne une erreur "Forbidden"

#### Scenario: Soumission refusée pour une équipe d'une autre organisation
- **WHEN** un admin tente de soumettre un diagnostic pour une équipe qui n'appartient pas à son organisation
- **THEN** le système retourne une erreur "Forbidden"

#### Scenario: Soumission avec campaignId valide
- **WHEN** un admin soumet un diagnostic avec un `campaignId` correspondant à une campagne active de l'organisation
- **THEN** le diagnostic est créé avec `campaign_id` renseigné et lié à la campagne

#### Scenario: Soumission refusée si la campagne n'est pas active
- **WHEN** un admin soumet un diagnostic avec un `campaignId` correspondant à une campagne en statut `draft` ou `closed`
- **THEN** le système retourne une erreur indiquant que la campagne n'est pas active

#### Scenario: Soumission refusée si doublon équipe-campagne
- **WHEN** un admin soumet un diagnostic pour une équipe qui a déjà un diagnostic pour cette campagne
- **THEN** le système retourne une erreur indiquant qu'un diagnostic existe déjà pour cette équipe dans cette campagne

### Requirement: Validation des réponses à la soumission
Le système DOIT valider que toutes les 14 questions core ont une réponse valide (entier entre 1 et 4) avant de persister le diagnostic.

#### Scenario: Réponses incomplètes
- **WHEN** un diagnostic est soumis avec seulement 10 réponses sur 14
- **THEN** le système retourne une erreur de validation indiquant les questions manquantes

#### Scenario: Réponse hors limites
- **WHEN** un diagnostic est soumis avec une réponse de valeur 5
- **THEN** le système retourne une erreur de validation indiquant la valeur invalide

#### Scenario: Réponses bonus optionnelles
- **WHEN** un diagnostic est soumis avec les 14 réponses core mais sans réponses bonus
- **THEN** le diagnostic est créé avec `bonusAnswers` à null

### Requirement: Calcul automatique des scores à la soumission
Le système DOIT calculer automatiquement les scores par dimension, le score global et le niveau de maturité lors de la soumission, et les persister dans la table `diagnostics`.

#### Scenario: Scores persistés après soumission
- **WHEN** un diagnostic est soumis avec des réponses valides
- **THEN** la ligne créée en base contient `dimensionScores`, `globalScore` et `globalLevel` calculés correctement

### Requirement: Support du diagnostic ad hoc
Le système DOIT permettre la soumission d'un diagnostic sans campagne associée (`campaignId: null`). Le champ `campaignId` est optionnel. Plusieurs diagnostics ad hoc peuvent être soumis pour la même équipe sans contrainte d'unicité.

#### Scenario: Diagnostic ad hoc
- **WHEN** un diagnostic est soumis sans `campaignId`
- **THEN** le diagnostic est créé avec `campaignId` à null

#### Scenario: Soumission ad hoc multiple pour une même équipe
- **WHEN** un admin soumet deux diagnostics ad hoc (sans campaignId) pour la même équipe
- **THEN** les deux diagnostics sont créés sans erreur (pas de contrainte d'unicité sur les ad hoc)

### Requirement: Horodatage du diagnostic
Le système DOIT enregistrer `completedAt` au moment de la soumission. Le champ `startedAt` est optionnel et peut être fourni par le client pour mesurer la durée du quiz.

#### Scenario: Timestamps enregistrés
- **WHEN** un diagnostic est soumis avec un `startedAt` fourni
- **THEN** `startedAt` est persisté et `completedAt` est la date/heure de soumission

### Requirement: Revalidation du cache après soumission
Le système DOIT revalider le cache Next.js pour les chemins affectés après la soumission d'un diagnostic (page équipe, page diagnostics).

#### Scenario: Cache revalidé
- **WHEN** un diagnostic est soumis avec succès
- **THEN** les chemins `/orgs/[orgId]/diagnostic/[teamId]` et `/orgs/[orgId]/teams` sont revalidés
