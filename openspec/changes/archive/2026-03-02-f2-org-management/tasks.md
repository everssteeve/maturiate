## 1. Queries et Server Actions — Organisation CRUD

- [x] 1.1 Créer la query `listUserOrganizations(userId)` dans `src/lib/queries/organizations.ts` — retourne les organisations de l'utilisateur avec rôle et nombre de membres
- [x] 1.2 Créer la query `getOrganization(orgId)` dans `src/lib/queries/organizations.ts` — retourne les détails d'une organisation avec le nombre de membres
- [x] 1.3 Créer la Server Action `createOrganization` dans `src/lib/actions/organizations.ts` — validation Zod (name requis 1-100 chars, sector/size optionnels), création org + membership admin, retourne orgId
- [x] 1.4 Créer la Server Action `updateOrganization` dans `src/lib/actions/organizations.ts` — validation Zod, requireRole admin, mise à jour nom/logo/sector/size

## 2. Queries et Server Actions — Membres

- [x] 2.1 Créer la query `listOrganizationMembers(orgId)` dans `src/lib/queries/members.ts` — retourne les membres avec nom, email, image, rôle, date
- [x] 2.2 Créer la Server Action `updateMemberRole` dans `src/lib/actions/members.ts` — requireRole admin, garde-fous (pas soi-même, pas dernier admin), mise à jour du rôle
- [x] 2.3 Créer la Server Action `removeMember` dans `src/lib/actions/members.ts` — requireRole admin, garde-fous, suppression du membership

## 3. Queries et Server Actions — Invitations

- [x] 3.1 Créer la query `listPendingInvitations(orgId)` dans `src/lib/queries/invitations.ts` — invitations non acceptées avec indicateur isExpired et nom de l'invitant
- [x] 3.2 Créer le template email d'invitation avec React Email dans `src/lib/email/templates/invitation.tsx` — nom org, rôle, lien /invite/[token], mention expiration 7 jours
- [x] 3.3 Créer la Server Action `inviteMember` dans `src/lib/actions/invitations.ts` — requireRole admin, vérification doublon membre/invitation, génération token crypto-random, envoi email via Resend
- [x] 3.4 Créer la Server Action `resendInvitation` dans `src/lib/actions/invitations.ts` — requireRole admin, nouveau token, nouvelle date expiration, renvoi email
- [x] 3.5 Créer la Server Action `cancelInvitation` dans `src/lib/actions/invitations.ts` — requireRole admin, suppression de l'invitation

## 4. Server Action — State of IA Opt-in

- [x] 4.1 Créer la Server Action `toggleStateOfIaOptIn` dans `src/lib/actions/organizations.ts` — requireRole admin, mise à jour opt_in_state_of_ia + opt_in_date/opt_out_date

## 5. Pages et composants — Liste et création d'organisations

- [x] 5.1 Créer la page `/orgs` (`src/app/(dashboard)/orgs/page.tsx`) — Server Component, grille de cartes organisations avec nom, logo/initiale, secteur, membres, rôle, état vide, bouton créer
- [x] 5.2 Créer la page `/orgs/new` (`src/app/(dashboard)/orgs/new/page.tsx`) — formulaire création avec champs nom, secteur, taille, soumission via createOrganization, redirection vers settings

## 6. Pages et composants — Paramètres organisation

- [x] 6.1 Créer le layout `/orgs/[orgId]` (`src/app/(dashboard)/orgs/[orgId]/layout.tsx`) — vérifie membership, fournit le contexte orgId
- [x] 6.2 Créer la page `/orgs/[orgId]` (`src/app/(dashboard)/orgs/[orgId]/page.tsx`) — page d'accueil organisation placeholder ("Dashboard à venir"), lien paramètres pour admin
- [x] 6.3 Créer le composant `OrgSettingsForm` (`src/components/org-settings-form.tsx`) — Client Component, formulaire modification nom/logo/sector/size avec prévisualisation logo
- [x] 6.4 Créer le composant `MembersList` (`src/components/members-list.tsx`) — Client Component, tableau des membres avec badges rôle, actions changement de rôle et retrait (dialog confirmation)
- [x] 6.5 Créer le composant `MemberInviteForm` (`src/components/member-invite-form.tsx`) — Client Component, formulaire email + sélecteur rôle (défaut: member)
- [x] 6.6 Créer le composant `PendingInvitationsList` (`src/components/pending-invitations-list.tsx`) — Client Component, tableau invitations en attente avec actions renvoyer/annuler
- [x] 6.7 Créer le composant `StateOfIaOptInCard` (`src/components/state-of-ia-opt-in-card.tsx`) — Client Component, carte explicative avec toggle opt-in/opt-out et dialog confirmation pour désactivation
- [x] 6.8 Créer la page `/orgs/[orgId]/settings` (`src/app/(dashboard)/orgs/[orgId]/settings/page.tsx`) — Server Component, assemble les sections : OrgSettingsForm, MembersList, MemberInviteForm + PendingInvitationsList, StateOfIaOptInCard. Lecture seule pour non-admins.

## 7. Composant OrgSwitcher et intégration header

- [x] 7.1 Créer le composant `OrgSwitcher` (`src/components/org-switcher.tsx`) — Client Component, dropdown listant les organisations de l'utilisateur avec logos/initiales, liens "Toutes les organisations" et "Créer une organisation"
- [x] 7.2 Intégrer le composant OrgSwitcher dans le header du layout dashboard — affiché uniquement dans le contexte `/orgs/[orgId]/*`, entre le titre et le menu utilisateur

## 8. Tests

- [x] 8.1 Tests unitaires des Server Actions (createOrganization, updateOrganization, updateMemberRole, removeMember, inviteMember, cancelInvitation, resendInvitation, toggleStateOfIaOptIn) — validation Zod, garde-fous, permissions
- [x] 8.2 Tests unitaires des queries (listUserOrganizations, getOrganization, listOrganizationMembers, listPendingInvitations)
- [x] 8.3 Tests E2E avec Playwright — parcours création d'organisation, invitation de membre, modification de rôle, opt-in State of IA, navigation via org switcher
