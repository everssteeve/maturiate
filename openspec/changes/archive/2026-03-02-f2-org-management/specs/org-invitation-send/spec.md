## ADDED Requirements

### Requirement: Envoyer une invitation par email
Le système SHALL permettre à un admin d'inviter un utilisateur par email avec un rôle attribué.

#### Scenario: Envoi d'invitation réussi
- **WHEN** un admin soumet le formulaire d'invitation avec l'email "user@example.com" et le rôle "manager"
- **THEN** le système MUST créer une entrée dans la table `invitations` avec un token unique, `expires_at` à 7 jours, et le rôle sélectionné
- **AND** le système MUST envoyer un email via Resend contenant le lien `/invite/[token]`, le nom de l'organisation, et le rôle attribué
- **AND** le système MUST afficher "Invitation envoyée à user@example.com"

#### Scenario: Email déjà membre de l'organisation
- **WHEN** un admin tente d'inviter un email déjà associé à un membre de l'organisation
- **THEN** le système MUST afficher "Cet utilisateur est déjà membre de l'organisation"
- **AND** le système MUST ne pas créer d'invitation

#### Scenario: Invitation en attente existante pour cet email
- **WHEN** un admin tente d'inviter un email ayant déjà une invitation en attente (non expirée, non acceptée) pour cette organisation
- **THEN** le système MUST afficher "Une invitation est déjà en attente pour cet email"
- **AND** le système MUST ne pas créer de nouvelle invitation

#### Scenario: Email invalide
- **WHEN** un admin soumet un email invalide
- **THEN** le système MUST afficher une erreur de validation "Adresse email invalide"

#### Scenario: Envoi par un non-admin
- **WHEN** un utilisateur avec le rôle "member" ou "manager" tente d'envoyer une invitation
- **THEN** le système MUST retourner une erreur "Forbidden"

### Requirement: Formulaire d'invitation dans les paramètres
Le système SHALL afficher un formulaire d'invitation dans la section invitations de la page paramètres.

#### Scenario: Affichage du formulaire
- **WHEN** un admin accède à la section invitations de `/orgs/[orgId]/settings`
- **THEN** le système MUST afficher un formulaire avec : champ email (requis), sélecteur de rôle (admin, manager, member, consultant), et un bouton "Envoyer l'invitation"

#### Scenario: Rôle par défaut
- **WHEN** le formulaire d'invitation est affiché
- **THEN** le sélecteur de rôle MUST avoir "member" comme valeur par défaut

### Requirement: Lister les invitations en attente
Le système SHALL afficher la liste des invitations en attente pour l'organisation.

#### Scenario: Affichage des invitations en attente
- **WHEN** un admin accède à la section invitations
- **THEN** le système MUST afficher un tableau des invitations non acceptées et non expirées avec : email, rôle attribué, date d'envoi, nom de l'invitant, et actions (renvoyer, annuler)

#### Scenario: Aucune invitation en attente
- **WHEN** il n'y a aucune invitation en attente
- **THEN** le système MUST afficher "Aucune invitation en attente"

### Requirement: Renvoyer une invitation
Le système SHALL permettre à un admin de renvoyer une invitation en attente.

#### Scenario: Renvoi réussi
- **WHEN** un admin clique sur "Renvoyer" pour une invitation en attente
- **THEN** le système MUST générer un nouveau token, mettre à jour `expires_at` à 7 jours à partir de maintenant, et renvoyer l'email d'invitation
- **AND** le système MUST afficher "Invitation renvoyée"

#### Scenario: Renvoi d'une invitation expirée
- **WHEN** un admin clique sur "Renvoyer" pour une invitation expirée
- **THEN** le système MUST générer un nouveau token, mettre à jour `expires_at`, et envoyer l'email
- **AND** le système MUST afficher "Invitation renvoyée"

### Requirement: Annuler une invitation
Le système SHALL permettre à un admin d'annuler une invitation en attente.

#### Scenario: Annulation réussie
- **WHEN** un admin clique sur "Annuler" pour une invitation en attente
- **THEN** le système MUST supprimer l'invitation de la base de données
- **AND** le système MUST afficher "Invitation annulée"

### Requirement: Template email d'invitation
Le système SHALL envoyer un email d'invitation formaté avec React Email.

#### Scenario: Contenu de l'email d'invitation
- **WHEN** une invitation est envoyée
- **THEN** l'email MUST contenir : le nom de l'organisation invitante, le rôle attribué, un bouton/lien vers `/invite/[token]`, et une mention que l'invitation expire dans 7 jours

### Requirement: Server Action inviteMember
Le système SHALL fournir une Server Action `inviteMember` avec validation Zod.

#### Scenario: Validation et exécution
- **WHEN** un admin appelle `inviteMember({ orgId, email, role })`
- **THEN** le système MUST vérifier le rôle admin via `requireRole(orgId, "admin")`, valider l'email et le rôle, vérifier que l'email n'est pas déjà membre, vérifier qu'il n'y a pas d'invitation en attente, créer l'invitation avec un token crypto-random, et envoyer l'email

### Requirement: Server Action cancelInvitation
Le système SHALL fournir une Server Action `cancelInvitation`.

#### Scenario: Annulation par admin
- **WHEN** un admin appelle `cancelInvitation({ orgId, invitationId })`
- **THEN** le système MUST vérifier le rôle admin, valider que l'invitation appartient à l'organisation, et supprimer l'invitation

### Requirement: Server Action resendInvitation
Le système SHALL fournir une Server Action `resendInvitation`.

#### Scenario: Renvoi par admin
- **WHEN** un admin appelle `resendInvitation({ orgId, invitationId })`
- **THEN** le système MUST vérifier le rôle admin, générer un nouveau token, mettre à jour `expires_at`, et renvoyer l'email

### Requirement: Query listPendingInvitations
Le système SHALL fournir une query `listPendingInvitations(orgId)` retournant les invitations non acceptées.

#### Scenario: Invitations filtrées
- **WHEN** un admin appelle `listPendingInvitations(orgId)`
- **THEN** le système MUST retourner les invitations où `accepted_at IS NULL`, triées par date de création décroissante, avec : id, email, rôle, token, invited_by (nom de l'invitant), created_at, expires_at, et un indicateur `isExpired`
