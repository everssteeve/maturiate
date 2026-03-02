## ADDED Requirements

### Requirement: Lister les membres d'une organisation
Le système SHALL afficher la liste des membres d'une organisation avec leurs rôles et dates d'ajout.

#### Scenario: Affichage de la liste des membres
- **WHEN** un admin navigue vers la section membres de `/orgs/[orgId]/settings`
- **THEN** le système MUST afficher un tableau avec pour chaque membre : nom, email, avatar (ou initiales), rôle, date d'ajout
- **AND** le système MUST trier les membres par date d'ajout (plus récent en premier)

#### Scenario: Affichage du rôle de chaque membre
- **WHEN** la liste des membres est affichée
- **THEN** chaque membre MUST avoir un badge indiquant son rôle (Admin, Manager, Member, Consultant)

### Requirement: Modifier le rôle d'un membre
Le système SHALL permettre à un admin de modifier le rôle d'un membre de l'organisation.

#### Scenario: Changement de rôle réussi
- **WHEN** un admin change le rôle d'un membre de "member" à "manager"
- **THEN** le système MUST mettre à jour le rôle en base de données
- **AND** le système MUST afficher un message de confirmation "Rôle mis à jour"
- **AND** le changement MUST prendre effet immédiatement

#### Scenario: Un admin ne peut pas modifier son propre rôle
- **WHEN** un admin tente de modifier son propre rôle
- **THEN** le système MUST empêcher l'action et afficher "Vous ne pouvez pas modifier votre propre rôle"

#### Scenario: Un seul admin restant
- **WHEN** un admin tente de changer le rôle du dernier admin de l'organisation
- **THEN** le système MUST empêcher l'action et afficher "L'organisation doit avoir au moins un administrateur"

#### Scenario: Modification par un non-admin
- **WHEN** un utilisateur avec le rôle "member" ou "manager" tente de modifier un rôle
- **THEN** le système MUST retourner une erreur "Forbidden"

### Requirement: Retirer un membre de l'organisation
Le système SHALL permettre à un admin de retirer un membre de l'organisation.

#### Scenario: Retrait réussi avec confirmation
- **WHEN** un admin clique sur "Retirer" pour un membre
- **THEN** le système MUST afficher un dialog de confirmation "Êtes-vous sûr de vouloir retirer [nom] de l'organisation ?"
- **AND** si confirmé, le système MUST supprimer le membership de la base de données
- **AND** le système MUST afficher "Membre retiré de l'organisation"

#### Scenario: Un admin ne peut pas se retirer lui-même
- **WHEN** un admin tente de se retirer de l'organisation
- **THEN** le système MUST empêcher l'action et afficher "Vous ne pouvez pas vous retirer vous-même de l'organisation"

#### Scenario: Retrait du dernier admin
- **WHEN** un admin tente de retirer le dernier admin de l'organisation
- **THEN** le système MUST empêcher l'action et afficher "L'organisation doit avoir au moins un administrateur"

### Requirement: Server Action updateMemberRole
Le système SHALL fournir une Server Action `updateMemberRole` avec validation Zod.

#### Scenario: Validation et exécution
- **WHEN** un admin appelle `updateMemberRole({ orgId, membershipId, newRole: "manager" })`
- **THEN** le système MUST vérifier le rôle admin via `requireRole(orgId, "admin")`, valider que le membership existe et appartient à l'organisation, vérifier les garde-fous (pas soi-même, pas dernier admin), mettre à jour le rôle

### Requirement: Server Action removeMember
Le système SHALL fournir une Server Action `removeMember` avec validation Zod.

#### Scenario: Validation et exécution
- **WHEN** un admin appelle `removeMember({ orgId, membershipId })`
- **THEN** le système MUST vérifier le rôle admin via `requireRole(orgId, "admin")`, valider que le membership existe, vérifier les garde-fous (pas soi-même, pas dernier admin), supprimer le membership

### Requirement: Query listOrganizationMembers
Le système SHALL fournir une query `listOrganizationMembers(orgId)` retournant tous les membres avec leurs informations.

#### Scenario: Liste complète des membres
- **WHEN** un membre autorisé appelle `listOrganizationMembers(orgId)`
- **THEN** le système MUST vérifier l'appartenance à l'organisation et retourner pour chaque membre : id du membership, userId, nom, email, image, rôle, date de création du membership
