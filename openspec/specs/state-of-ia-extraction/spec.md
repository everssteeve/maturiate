## ADDED Requirements

### Requirement: Extraction annuelle des snapshots anonymisés
Le système SHALL permettre à un super-admin de déclencher l'extraction annuelle des données des organisations opt-in vers la table `state_of_ia_snapshots`. L'extraction agrège les données au niveau organisation (moyenne des scores de toutes les équipes sur la campagne la plus récente complétée) et anonymise irréversiblement l'identité de l'organisation.

#### Scenario: Déclenchement de l'extraction
- **WHEN** un super-admin accède à la page back-office State of IA et clique sur "Lancer l'extraction" pour l'année 2026
- **THEN** le système MUST collecter toutes les organisations avec `opt_in_state_of_ia: true`, calculer pour chacune les scores moyens par dimension (moyenne des diagnostics de la dernière campagne complétée), le score global, le niveau de maturité, et le nombre d'équipes évaluées
- **AND** le système MUST anonymiser chaque organisation via `SHA-256(org_id + STATE_OF_IA_HASH_SALT)` en utilisant `crypto.createHash('sha256')`
- **AND** le système MUST insérer un enregistrement par organisation dans `state_of_ia_snapshots` avec les champs : `year`, `organisation_hash`, `sector`, `size`, `scores_by_dimension`, `global_score`, `global_level`, `team_count`, `extracted_at`

#### Scenario: Organisation sans campagne complétée
- **WHEN** une organisation opt-in n'a aucune campagne avec au moins un diagnostic complété
- **THEN** le système MUST exclure cette organisation de l'extraction et l'afficher dans un résumé d'avertissement

#### Scenario: Extraction déjà effectuée pour l'année
- **WHEN** un super-admin lance l'extraction pour une année qui a déjà des snapshots
- **THEN** le système MUST afficher un dialog de confirmation "Des snapshots existent déjà pour {année}. Voulez-vous les remplacer ?"
- **AND** si confirmé, le système MUST supprimer les anciens snapshots de cette année avant de réinsérer les nouveaux

#### Scenario: Variable d'environnement manquante
- **WHEN** la variable `STATE_OF_IA_HASH_SALT` n'est pas définie
- **THEN** le système MUST refuser l'extraction et afficher une erreur "La variable STATE_OF_IA_HASH_SALT n'est pas configurée"

### Requirement: Page back-office d'extraction
Le système SHALL afficher une page d'administration à `/admin/state-of-ia` accessible uniquement aux super-admins.

#### Scenario: Accès super-admin
- **WHEN** un super-admin accède à `/admin/state-of-ia`
- **THEN** le système MUST afficher : le nombre d'organisations opt-in, l'année courante pré-remplie, un bouton "Lancer l'extraction", et l'historique des extractions passées (année, nombre de snapshots, date d'extraction)

#### Scenario: Accès non super-admin
- **WHEN** un utilisateur non super-admin tente d'accéder à `/admin/state-of-ia`
- **THEN** le système MUST rediriger vers la page d'accueil avec un message d'erreur

#### Scenario: Résumé post-extraction
- **WHEN** l'extraction se termine avec succès
- **THEN** le système MUST afficher un résumé : nombre d'organisations extraites, nombre d'organisations exclues (avec raison), année de l'extraction

### Requirement: Server Action extractStateOfIaSnapshots
Le système SHALL fournir une Server Action `extractStateOfIaSnapshots` pour l'extraction.

#### Scenario: Appel valide
- **WHEN** un super-admin appelle `extractStateOfIaSnapshots({ year: 2026 })`
- **THEN** le système MUST vérifier `isSuperAdmin`, vérifier la présence de `STATE_OF_IA_HASH_SALT`, collecter les organisations opt-in, calculer les agrégations, anonymiser, et insérer les snapshots

#### Scenario: Appel par non super-admin
- **WHEN** un utilisateur non super-admin appelle `extractStateOfIaSnapshots`
- **THEN** le système MUST lever une erreur "Unauthorized"

### Requirement: Sélection de la campagne source pour l'extraction
Le système SHALL utiliser la campagne complétée la plus récente de chaque organisation pour calculer les scores agrégés.

#### Scenario: Organisation avec plusieurs campagnes
- **WHEN** une organisation a 3 campagnes (Q1 fermée, Q2 fermée, Q3 active)
- **THEN** le système MUST utiliser la campagne Q2 (dernière fermée) pour les scores

#### Scenario: Calcul des scores moyens
- **WHEN** une organisation a une campagne avec 5 équipes ayant complété le diagnostic et 2 sans réponse
- **THEN** le système MUST calculer la moyenne des scores par dimension uniquement sur les 5 équipes ayant répondu, et indiquer `team_count: 5`
