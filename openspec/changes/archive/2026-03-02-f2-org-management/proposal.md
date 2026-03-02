## Why

F1 (authentification) est terminé : les utilisateurs peuvent se connecter et accepter des invitations. Mais il n'existe aucun moyen de créer une organisation, de gérer ses membres ou de configurer ses paramètres. F2 est le prérequis de toutes les fonctionnalités métier (F3 équipes, F4 diagnostics, F5 campagnes) — sans organisations, la plateforme est inutilisable.

## What Changes

- **Création d'organisation** : un utilisateur authentifié peut créer une organisation (nom obligatoire, secteur/taille optionnels) et en devient automatiquement admin
- **Page paramètres organisation** : l'admin peut modifier le nom, logo, secteur, taille de l'organisation
- **Gestion des membres** : l'admin voit la liste des membres avec leurs rôles, peut changer un rôle ou retirer un membre
- **Envoi d'invitations** : l'admin invite par email avec attribution de rôle, email envoyé via Resend avec token 7 jours
- **Sélecteur d'organisation** : composant dans le header permettant de naviguer entre les organisations de l'utilisateur
- **Opt-in State of IA** : toggle explicite dans les paramètres avec explication claire, dates d'opt-in/opt-out enregistrées
- **Page liste des organisations** : page `/orgs` listant toutes les organisations de l'utilisateur avec accès rapide

## Capabilities

### New Capabilities

- `org-crud`: Création et modification d'organisation (nom, logo, secteur, taille). Page paramètres organisation.
- `org-members-management`: Listing des membres, modification de rôle, suppression de membre. Panel dans la page paramètres.
- `org-invitation-send`: Envoi d'invitations par email côté admin. Formulaire d'invitation, listing des invitations en attente, renvoi/annulation.
- `org-switcher`: Composant de navigation entre organisations dans le header. Page `/orgs` listant les organisations.
- `state-of-ia-opt-in`: Gestion de l'opt-in/opt-out State of IA dans les paramètres organisation. Explication, toggle, historique.

### Modified Capabilities

- `dashboard-layout`: Intégration du sélecteur d'organisation dans le header existant. Ajout de la navigation vers les paramètres organisation.

## Impact

- **Pages** : création de `/orgs` (liste), `/orgs/new` (création), `/orgs/[orgId]/settings` (paramètres)
- **Server Actions** : `createOrganization`, `updateOrganization`, `inviteMember`, `cancelInvitation`, `resendInvitation`, `removeMember`, `updateMemberRole`
- **Queries** : `getOrganization`, `listUserOrganizations`, `listOrganizationMembers`, `listPendingInvitations`
- **Emails** : template d'invitation via React Email + Resend
- **Composants** : org-switcher (header), member-invite-form, members-list, org-settings-form, state-of-ia-opt-in-card
- **Dépendances** : F1 (auth, invitation-acceptance, database-schema, permissions-system, dashboard-layout)
- **Tables DB** : utilisation des tables existantes `organizations`, `memberships`, `invitations` (déjà définies dans le schéma F1)
