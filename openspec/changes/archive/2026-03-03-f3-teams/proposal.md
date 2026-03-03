## Why

F2 (organisations) est terminé : les utilisateurs peuvent créer des organisations, gérer les membres et les invitations. Mais il n'existe aucun moyen de structurer une organisation en équipes. F3 est le dernier maillon des fondations et le prérequis direct de F4 (diagnostics) — chaque diagnostic est rattaché à une équipe. Sans équipes, aucun diagnostic ne peut être créé ni aucune campagne lancée.

## What Changes

- **CRUD équipes** : un admin peut créer, renommer et supprimer des équipes au sein de son organisation
- **Attribution de membres aux équipes** : un admin peut assigner des membres de l'organisation à une ou plusieurs équipes, et les en retirer
- **Gestion par le manager** : un manager peut voir et modifier les équipes qu'il gère (renommer, ajouter/retirer des membres de ses équipes)
- **Page équipes dans les paramètres** : section dédiée dans `/orgs/[orgId]/settings` pour la gestion des équipes, ou page dédiée `/orgs/[orgId]/teams`
- **Liste des équipes** : affichage de toutes les équipes de l'organisation avec leur nombre de membres

## Capabilities

### New Capabilities

- `team-crud`: Création, modification (renommage) et suppression d'équipes. Interface de gestion dans les paramètres de l'organisation. Server Actions et queries associées.
- `team-members`: Attribution et retrait de membres d'organisation aux équipes. Un membre peut appartenir à plusieurs équipes. Interface de gestion des membres par équipe.

### Modified Capabilities

_(aucune modification de spec existante)_

## Impact

- **Pages** : ajout d'une section/page équipes dans `/orgs/[orgId]/settings` ou `/orgs/[orgId]/teams`
- **Server Actions** : `createTeam`, `updateTeam`, `deleteTeam`, `addTeamMember`, `removeTeamMember`
- **Queries** : `listTeams(orgId)`, `getTeam(teamId)`, `listTeamMembers(teamId)`
- **Composants** : formulaire de création/édition d'équipe, liste des équipes, gestion des membres d'équipe (sélecteur de membres)
- **Tables DB** : utilisation des tables existantes `teams` et `team_members` (déjà définies dans le schéma F1)
- **Permissions** : admin = CRUD complet, manager = modification de ses équipes uniquement, member/consultant = lecture seule
- **Dépendances** : F2 (org-crud, org-members-management, permissions-system, dashboard-layout)
