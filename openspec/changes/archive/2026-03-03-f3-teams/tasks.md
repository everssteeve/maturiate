## 1. Queries — Accès aux données équipes

- [x] 1.1 Créer `src/lib/queries/teams.ts` avec la query `listTeams(orgId)` : retourne les équipes de l'organisation avec le count de membres, triées par nom
- [x] 1.2 Ajouter la query `getTeam(teamId, orgId)` : retourne le détail d'une équipe avec vérification d'appartenance à l'organisation
- [x] 1.3 Ajouter la query `listTeamMembers(teamId, orgId)` : retourne les membres d'une équipe avec nom, email, image, rôle org
- [x] 1.4 Ajouter la query `listAvailableMembers(teamId, orgId)` : retourne les membres de l'organisation non assignés à l'équipe

## 2. Server Actions — Mutations équipes

- [x] 2.1 Créer `src/lib/actions/teams.ts` avec la Server Action `createTeam({ orgId, name })` : validation Zod, requireRole admin, vérification unicité nom, création équipe, revalidatePath
- [x] 2.2 Ajouter la Server Action `updateTeam({ orgId, teamId, name })` : validation Zod, requireRole admin/manager, vérification scope manager (membre de l'équipe), unicité nom, mise à jour
- [x] 2.3 Ajouter la Server Action `deleteTeam({ orgId, teamId })` : validation Zod, requireRole admin, vérification appartenance org, suppression (cascade team_members)

## 3. Server Actions — Mutations membres d'équipe

- [x] 3.1 Ajouter la Server Action `addTeamMember({ orgId, teamId, userId })` : validation Zod, requireRole admin/manager, vérification scope manager, vérification que l'utilisateur est membre de l'org, vérification doublon, création team_member
- [x] 3.2 Ajouter la Server Action `removeTeamMember({ orgId, teamId, userId })` : validation Zod, requireRole admin/manager, vérification scope manager, vérification existence, suppression team_member

## 4. Composants UI — Liste et gestion des équipes

- [x] 4.1 Créer le composant `TeamsList` (Server Component) : affiche la liste des équipes avec nom, nombre de membres, date de création. Actions conditionnelles selon le rôle.
- [x] 4.2 Créer le composant `CreateTeamForm` (Client Component) : formulaire inline ou dialog pour créer une équipe (champ nom + bouton). Visible uniquement pour les admins.
- [x] 4.3 Créer le composant `EditTeamDialog` (Client Component) : dialog pour renommer une équipe avec champ nom pré-rempli.
- [x] 4.4 Créer le composant `DeleteTeamDialog` (Client Component) : dialog de confirmation de suppression d'équipe.

## 5. Composants UI — Gestion des membres d'équipe

- [x] 5.1 Créer le composant `TeamMembersDialog` (Client Component) : dialog affichant les membres de l'équipe avec nom, email, initiales/avatar, rôle org. Bouton "Retirer" conditionnel.
- [x] 5.2 Créer le composant `AddTeamMemberSelect` (Client Component) : sélecteur avec recherche (nom/email) parmi les membres disponibles de l'organisation. Gère le cas "tous déjà assignés".
- [x] 5.3 Créer le composant `RemoveTeamMemberDialog` (Client Component) : dialog de confirmation de retrait d'un membre.

## 6. Intégration page paramètres

- [x] 6.1 Ajouter la section "Équipes" dans `/orgs/[orgId]/settings/page.tsx` : titre de section, composant TeamsList, bouton créer équipe (admin only). État vide si aucune équipe.

## 7. Tests

- [x] 7.1 Tests Vitest pour les Server Actions : createTeam, updateTeam, deleteTeam, addTeamMember, removeTeamMember (validation, permissions, cas limites)
- [x] 7.2 Tests Vitest pour les queries : listTeams, getTeam, listTeamMembers, listAvailableMembers
- [x] 7.3 Tests E2E Playwright : parcours complet création d'équipe, ajout de membres, renommage, retrait de membre, suppression d'équipe
