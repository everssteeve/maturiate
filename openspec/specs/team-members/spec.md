## ADDED Requirements

### Requirement: Ajouter un membre à une équipe
Le système SHALL permettre à un admin ou au manager de l'équipe d'ajouter un membre de l'organisation à une équipe.

#### Scenario: Ajout réussi
- **WHEN** un admin sélectionne un membre de l'organisation et l'ajoute à l'équipe "Équipe Backend"
- **THEN** le système MUST créer une entrée dans `team_members` avec le `teamId` et `userId` correspondants
- **AND** le système MUST afficher un message "Membre ajouté à l'équipe"
- **AND** le compteur de membres de l'équipe MUST être incrémenté

#### Scenario: Ajout d'un membre déjà dans l'équipe
- **WHEN** un admin tente d'ajouter un membre qui est déjà dans l'équipe
- **THEN** le système MUST afficher une erreur "Ce membre fait déjà partie de cette équipe"

#### Scenario: Ajout par un manager membre de l'équipe
- **WHEN** un manager qui est membre de l'équipe ajoute un membre de l'organisation à cette équipe
- **THEN** le système MUST créer l'entrée dans `team_members`
- **AND** le système MUST afficher un message "Membre ajouté à l'équipe"

#### Scenario: Ajout par un manager non membre de l'équipe
- **WHEN** un manager qui n'est PAS membre de l'équipe tente d'ajouter un membre
- **THEN** le système MUST retourner une erreur "Forbidden"

#### Scenario: Ajout par un member ou consultant
- **WHEN** un utilisateur avec le rôle "member" ou "consultant" tente d'ajouter un membre à une équipe
- **THEN** le système MUST retourner une erreur "Forbidden"

#### Scenario: Ajout d'un utilisateur non membre de l'organisation
- **WHEN** un admin tente d'ajouter un utilisateur qui n'est pas membre de l'organisation
- **THEN** le système MUST retourner une erreur "Cet utilisateur n'est pas membre de l'organisation"

### Requirement: Retirer un membre d'une équipe
Le système SHALL permettre à un admin ou au manager de l'équipe de retirer un membre d'une équipe.

#### Scenario: Retrait réussi avec confirmation
- **WHEN** un admin clique sur "Retirer" pour un membre de l'équipe
- **THEN** le système MUST afficher un dialog de confirmation "Retirer [nom] de l'équipe [nom équipe] ?"
- **AND** si confirmé, le système MUST supprimer l'entrée `team_members` correspondante
- **AND** le système MUST afficher "Membre retiré de l'équipe"

#### Scenario: Retrait par un manager membre de l'équipe
- **WHEN** un manager qui est membre de l'équipe retire un autre membre
- **THEN** le système MUST supprimer l'entrée `team_members`
- **AND** le système MUST afficher "Membre retiré de l'équipe"

#### Scenario: Un manager se retire lui-même d'une équipe
- **WHEN** un manager tente de se retirer lui-même d'une équipe
- **THEN** le système MUST permettre l'action (un manager peut quitter une équipe qu'il gère)

#### Scenario: Retrait par un non-autorisé
- **WHEN** un utilisateur avec le rôle "member" ou "consultant" tente de retirer un membre d'une équipe
- **THEN** le système MUST retourner une erreur "Forbidden"

### Requirement: Lister les membres d'une équipe
Le système SHALL afficher la liste des membres d'une équipe dans un dialog de gestion.

#### Scenario: Affichage des membres
- **WHEN** un utilisateur autorisé ouvre le dialog de gestion des membres d'une équipe
- **THEN** le système MUST afficher pour chaque membre : nom, email, avatar (ou initiales), rôle dans l'organisation
- **AND** le système MUST trier les membres par nom (ordre alphabétique)

#### Scenario: Équipe sans membres
- **WHEN** l'équipe n'a aucun membre
- **THEN** le système MUST afficher un état vide "Aucun membre dans cette équipe" avec un bouton "Ajouter un membre" (si autorisé)

### Requirement: Sélecteur de membres disponibles
Le système SHALL fournir un sélecteur permettant de choisir parmi les membres de l'organisation non encore assignés à l'équipe.

#### Scenario: Affichage des membres disponibles
- **WHEN** un admin ou manager ouvre le sélecteur d'ajout de membre
- **THEN** le système MUST afficher uniquement les membres de l'organisation qui ne font PAS déjà partie de l'équipe
- **AND** chaque option MUST afficher le nom, l'email et le rôle du membre

#### Scenario: Tous les membres déjà assignés
- **WHEN** tous les membres de l'organisation sont déjà dans l'équipe
- **THEN** le sélecteur MUST afficher "Tous les membres sont déjà dans cette équipe"

#### Scenario: Recherche dans le sélecteur
- **WHEN** un admin tape dans le champ de recherche du sélecteur
- **THEN** le système MUST filtrer les membres disponibles par nom ou email (recherche case-insensitive)

### Requirement: Server Action addTeamMember
Le système SHALL fournir une Server Action `addTeamMember` avec validation Zod.

#### Scenario: Validation et exécution
- **WHEN** un utilisateur autorisé appelle `addTeamMember({ orgId, teamId, userId })`
- **THEN** le système MUST vérifier le rôle via `requireRole(orgId, "admin", "manager")`, si manager vérifier qu'il est membre de l'équipe, valider que l'équipe appartient à l'organisation, valider que l'utilisateur est membre de l'organisation, vérifier qu'il n'est pas déjà dans l'équipe, créer l'entrée `team_members`

### Requirement: Server Action removeTeamMember
Le système SHALL fournir une Server Action `removeTeamMember` avec validation Zod.

#### Scenario: Validation et exécution
- **WHEN** un utilisateur autorisé appelle `removeTeamMember({ orgId, teamId, userId })`
- **THEN** le système MUST vérifier le rôle via `requireRole(orgId, "admin", "manager")`, si manager vérifier qu'il est membre de l'équipe, valider que l'entrée `team_members` existe, supprimer l'entrée

### Requirement: Query listTeamMembers
Le système SHALL fournir une query `listTeamMembers(teamId, orgId)` retournant les membres d'une équipe.

#### Scenario: Liste des membres d'une équipe
- **WHEN** un membre autorisé appelle `listTeamMembers(teamId, orgId)`
- **THEN** le système MUST vérifier que l'équipe appartient à l'organisation et retourner pour chaque membre : id du team_member, userId, nom, email, image, rôle dans l'organisation
- **AND** les résultats MUST être triés par nom (ordre alphabétique)

### Requirement: Query listAvailableMembers
Le système SHALL fournir une query `listAvailableMembers(teamId, orgId)` retournant les membres de l'organisation non assignés à l'équipe.

#### Scenario: Liste des membres disponibles
- **WHEN** un utilisateur autorisé appelle `listAvailableMembers(teamId, orgId)`
- **THEN** le système MUST retourner les membres de l'organisation qui n'ont PAS d'entrée dans `team_members` pour cette équipe
- **AND** chaque résultat MUST inclure : userId, nom, email, image, rôle dans l'organisation
