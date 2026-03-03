## MODIFIED Requirements

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

#### Scenario: Soumission ad hoc sans campaignId
- **WHEN** un admin soumet un diagnostic sans fournir de `campaignId`
- **THEN** le diagnostic est créé avec `campaign_id = null` (comportement actuel préservé)

#### Scenario: Soumission ad hoc multiple pour une même équipe
- **WHEN** un admin soumet deux diagnostics ad hoc (sans campaignId) pour la même équipe
- **THEN** les deux diagnostics sont créés sans erreur (pas de contrainte d'unicité sur les ad hoc)
