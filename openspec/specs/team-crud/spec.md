## ADDED Requirements

### Requirement: Créer une équipe
Le système SHALL permettre à un admin de créer une équipe au sein de son organisation avec un nom obligatoire.

#### Scenario: Création réussie
- **WHEN** un admin soumet le formulaire de création avec le nom "Équipe Backend"
- **THEN** le système MUST créer une équipe avec `name: "Équipe Backend"` et `orgId` correspondant à l'organisation courante
- **AND** le système MUST afficher un message de confirmation "Équipe créée"
- **AND** l'équipe MUST apparaître dans la liste des équipes

#### Scenario: Nom manquant
- **WHEN** un admin soumet le formulaire sans nom d'équipe
- **THEN** le système MUST afficher une erreur de validation "Le nom de l'équipe est requis"
- **AND** le système MUST ne pas créer d'équipe

#### Scenario: Nom trop long
- **WHEN** un admin soumet un nom dépassant 100 caractères
- **THEN** le système MUST afficher une erreur de validation "Le nom ne doit pas dépasser 100 caractères"

#### Scenario: Nom déjà utilisé dans l'organisation
- **WHEN** un admin soumet un nom d'équipe identique à une équipe existante dans la même organisation
- **THEN** le système MUST afficher une erreur "Une équipe avec ce nom existe déjà dans cette organisation"
- **AND** le système MUST ne pas créer d'équipe

#### Scenario: Création par un non-admin
- **WHEN** un utilisateur avec le rôle "member" ou "manager" tente de créer une équipe
- **THEN** le système MUST retourner une erreur "Forbidden"

### Requirement: Renommer une équipe
Le système SHALL permettre à un admin ou au manager de l'équipe de renommer une équipe.

#### Scenario: Renommage réussi par un admin
- **WHEN** un admin modifie le nom de l'équipe "Équipe Backend" en "Équipe API"
- **THEN** le système MUST mettre à jour le nom en base de données
- **AND** le système MUST afficher un message "Équipe renommée"

#### Scenario: Renommage réussi par un manager membre de l'équipe
- **WHEN** un manager qui est membre de l'équipe modifie le nom de l'équipe
- **THEN** le système MUST mettre à jour le nom en base de données
- **AND** le système MUST afficher un message "Équipe renommée"

#### Scenario: Renommage par un manager non membre de l'équipe
- **WHEN** un manager qui n'est PAS membre de l'équipe tente de la renommer
- **THEN** le système MUST retourner une erreur "Forbidden"

#### Scenario: Nouveau nom déjà utilisé
- **WHEN** un admin renomme une équipe avec un nom déjà utilisé par une autre équipe de la même organisation
- **THEN** le système MUST afficher une erreur "Une équipe avec ce nom existe déjà dans cette organisation"

### Requirement: Supprimer une équipe
Le système SHALL permettre à un admin de supprimer une équipe de son organisation.

#### Scenario: Suppression avec confirmation
- **WHEN** un admin clique sur "Supprimer" pour une équipe
- **THEN** le système MUST afficher un dialog de confirmation "Êtes-vous sûr de vouloir supprimer l'équipe [nom] ? Cette action est irréversible."
- **AND** si confirmé, le système MUST supprimer l'équipe et ses associations de membres (cascade `team_members`)
- **AND** le système MUST afficher "Équipe supprimée"

#### Scenario: Suppression par un non-admin
- **WHEN** un utilisateur avec le rôle "manager", "member" ou "consultant" tente de supprimer une équipe
- **THEN** le système MUST retourner une erreur "Forbidden"

### Requirement: Lister les équipes d'une organisation
Le système SHALL afficher la liste des équipes d'une organisation dans la section paramètres.

#### Scenario: Affichage de la liste des équipes
- **WHEN** un membre de l'organisation navigue vers la section équipes de `/orgs/[orgId]/settings`
- **THEN** le système MUST afficher un tableau/liste avec pour chaque équipe : nom, nombre de membres, date de création
- **AND** le système MUST trier les équipes par nom (ordre alphabétique)

#### Scenario: Organisation sans équipes
- **WHEN** l'organisation n'a aucune équipe
- **THEN** le système MUST afficher un état vide avec le message "Aucune équipe" et un bouton "Créer une équipe" (visible uniquement pour les admins)

#### Scenario: Visibilité des actions selon le rôle
- **WHEN** un admin consulte la liste des équipes
- **THEN** le système MUST afficher les boutons "Créer", "Modifier" et "Supprimer"
- **WHEN** un manager consulte la liste des équipes
- **THEN** le système MUST afficher le bouton "Modifier" uniquement pour les équipes dont il est membre
- **WHEN** un member ou consultant consulte la liste des équipes
- **THEN** le système MUST ne pas afficher de boutons d'action de gestion

### Requirement: Server Action createTeam
Le système SHALL fournir une Server Action `createTeam` avec validation Zod.

#### Scenario: Validation et exécution
- **WHEN** un admin appelle `createTeam({ orgId, name })`
- **THEN** le système MUST vérifier le rôle admin via `requireRole(orgId, "admin")`, valider que le nom est non vide et ≤ 100 caractères, vérifier l'unicité du nom dans l'organisation, créer l'équipe, et revalider le path `/orgs/[orgId]/settings`

### Requirement: Server Action updateTeam
Le système SHALL fournir une Server Action `updateTeam` avec validation Zod.

#### Scenario: Validation et exécution par admin
- **WHEN** un admin appelle `updateTeam({ orgId, teamId, name })`
- **THEN** le système MUST vérifier le rôle admin ou manager via `requireRole(orgId, "admin", "manager")`, valider que l'équipe existe et appartient à l'organisation, si manager vérifier qu'il est membre de l'équipe, vérifier l'unicité du nouveau nom, mettre à jour l'équipe

### Requirement: Server Action deleteTeam
Le système SHALL fournir une Server Action `deleteTeam` avec validation Zod.

#### Scenario: Validation et exécution
- **WHEN** un admin appelle `deleteTeam({ orgId, teamId })`
- **THEN** le système MUST vérifier le rôle admin via `requireRole(orgId, "admin")`, valider que l'équipe existe et appartient à l'organisation, supprimer l'équipe (cascade sur `team_members`)

### Requirement: Query listTeams
Le système SHALL fournir une query `listTeams(orgId)` retournant toutes les équipes d'une organisation.

#### Scenario: Liste complète des équipes
- **WHEN** un membre autorisé appelle `listTeams(orgId)`
- **THEN** le système MUST vérifier l'appartenance à l'organisation et retourner pour chaque équipe : id, nom, nombre de membres (count), date de création
- **AND** les résultats MUST être triés par nom (ordre alphabétique)

### Requirement: Query getTeam
Le système SHALL fournir une query `getTeam(teamId, orgId)` retournant le détail d'une équipe.

#### Scenario: Récupération d'une équipe
- **WHEN** un membre autorisé appelle `getTeam(teamId, orgId)`
- **THEN** le système MUST vérifier que l'équipe appartient à l'organisation et retourner : id, nom, orgId, date de création, date de mise à jour
