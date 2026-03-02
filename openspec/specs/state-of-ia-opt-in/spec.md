## ADDED Requirements

### Requirement: Toggle opt-in State of IA dans les paramètres
Le système SHALL afficher une section dédiée à l'opt-in State of IA dans la page paramètres de l'organisation.

#### Scenario: Affichage de la section opt-in (organisation non opt-in)
- **WHEN** un admin accède à la section State of IA des paramètres d'une organisation avec `opt_in_state_of_ia: false`
- **THEN** le système MUST afficher une carte avec : un titre "State of IA", une explication claire de ce que l'opt-in implique (données agrégées et anonymisées contribuent au rapport annuel, accès au benchmark "Mon positionnement"), et un bouton "Activer la participation"

#### Scenario: Affichage de la section opt-in (organisation opt-in)
- **WHEN** un admin accède à la section State of IA des paramètres d'une organisation avec `opt_in_state_of_ia: true`
- **THEN** le système MUST afficher : le statut "Participation active", la date d'opt-in, un bouton "Désactiver la participation", et un message rappelant les avantages (benchmark, positionnement)

#### Scenario: Activation de l'opt-in
- **WHEN** un admin clique sur "Activer la participation"
- **THEN** le système MUST mettre à jour `opt_in_state_of_ia: true` et `opt_in_date` à la date courante
- **AND** le système MUST afficher un message de confirmation "Participation au State of IA activée"

#### Scenario: Désactivation de l'opt-in
- **WHEN** un admin clique sur "Désactiver la participation"
- **THEN** le système MUST afficher un dialog de confirmation "Êtes-vous sûr ? Votre organisation ne contribuera plus au rapport annuel et n'aura plus accès au benchmark."
- **AND** si confirmé, le système MUST mettre à jour `opt_in_state_of_ia: false` et `opt_out_date` à la date courante
- **AND** le système MUST afficher "Participation au State of IA désactivée"

#### Scenario: Non-admin ne peut pas modifier l'opt-in
- **WHEN** un utilisateur avec le rôle "member", "manager" ou "consultant" accède à la section State of IA
- **THEN** le système MUST afficher le statut actuel de l'opt-in en lecture seule sans boutons d'action

### Requirement: Explication de l'anonymisation
Le système SHALL expliquer clairement le processus d'anonymisation dans la section opt-in.

#### Scenario: Contenu de l'explication
- **WHEN** la section State of IA est affichée
- **THEN** le système MUST afficher un texte explicatif mentionnant : les données sont agrégées au niveau de l'organisation (pas individuelles), l'identité de l'organisation est irréversiblement anonymisée (hash SHA-256), seuls le secteur et la taille sont conservés pour la segmentation, les données contribuent au rapport annuel "State of IA" publié par AIAD

### Requirement: Server Action toggleStateOfIaOptIn
Le système SHALL fournir une Server Action `toggleStateOfIaOptIn` pour activer/désactiver l'opt-in.

#### Scenario: Activation
- **WHEN** un admin appelle `toggleStateOfIaOptIn({ orgId, optIn: true })`
- **THEN** le système MUST vérifier le rôle admin via `requireRole(orgId, "admin")`, mettre à jour `opt_in_state_of_ia: true`, enregistrer `opt_in_date: now()`, et mettre `opt_out_date: null`

#### Scenario: Désactivation
- **WHEN** un admin appelle `toggleStateOfIaOptIn({ orgId, optIn: false })`
- **THEN** le système MUST vérifier le rôle admin, mettre à jour `opt_in_state_of_ia: false`, et enregistrer `opt_out_date: now()` (sans toucher à `opt_in_date`)
