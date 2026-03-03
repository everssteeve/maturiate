## Context

F2 a livré le CRUD organisation, la gestion des membres (liste, rôle, retrait), l'envoi d'invitations, le sélecteur d'organisation et l'opt-in State of IA. L'utilisateur peut créer une organisation, inviter des membres et gérer les rôles. Mais une organisation n'a pas encore de structure interne — les équipes sont le niveau d'unité où les diagnostics seront remplis (F4).

Le schéma DB est déjà complet : les tables `teams` et `team_members` existent depuis F1. Pas de migration nécessaire.

**Contraintes :**
- Multi-tenant strict : tout accès DB scopé par `orgId`
- Les tables `teams` (id, name, org_id, created_at, updated_at) et `team_members` (id, team_id, user_id) existent déjà
- Un diagnostic est rattaché à une équipe (`diagnostics.team_id`) — F3 est un prérequis structurel de F4
- Interface en français, code en anglais

## Goals / Non-Goals

**Goals :**
- Permettre à un admin de créer, renommer et supprimer des équipes dans son organisation
- Permettre d'assigner des membres de l'organisation à des équipes (N:M — un membre peut être dans plusieurs équipes)
- Permettre à un manager de gérer les équipes qui lui sont assignées (renommer, gérer les membres)
- Fournir une interface de gestion des équipes intégrée aux paramètres de l'organisation

**Non-Goals :**
- Diagnostic d'équipe (F4) — traité dans la fonctionnalité suivante
- Dashboard équipe (F7) — hors scope, nécessite les diagnostics
- Hiérarchie d'équipes (sous-équipes) — hors scope V1
- Limitation du nombre d'équipes par organisation — pas nécessaire pour le MVP
- Attribution automatique de managers aux équipes — le manager est un membre de l'équipe avec le rôle `manager` au niveau organisation

## Decisions

### 1. Section équipes dans la page paramètres existante

**Choix** : Ajouter une section "Équipes" dans `/orgs/[orgId]/settings` plutôt qu'une page dédiée `/orgs/[orgId]/teams`.

**Alternatives considérées** :
- Page dédiée `/orgs/[orgId]/teams` : trop lourd pour le nombre d'équipes attendu au MVP (< 20 équipes par org)
- Tab dans la page paramètres : possible, mais les sections avec ancres fonctionnent bien (pattern F2)

**Rationale** : Cohérent avec le pattern F2 où membres et invitations sont des sections dans la même page paramètres. Quand le nombre d'équipes grandira, on pourra migrer vers une page dédiée. La gestion des membres d'une équipe se fait via un dialog/panel pour éviter de surcharger la page.

### 2. Dialog pour la gestion des membres d'une équipe

**Choix** : Un dialog modal s'ouvre quand on clique sur "Gérer les membres" d'une équipe, affichant les membres actuels et un sélecteur pour en ajouter.

**Alternatives considérées** :
- Page dédiée par équipe (`/teams/[teamId]/members`) : trop de navigation
- Expansion inline dans la liste : prend trop de place si plusieurs équipes

**Rationale** : Le dialog permet de gérer les membres sans quitter le contexte de la page paramètres. Le sélecteur de membres filtre les membres de l'organisation qui ne sont pas encore dans l'équipe.

### 3. Scope manager basé sur le membership d'équipe

**Choix** : Un manager peut gérer une équipe s'il en est membre. La relation manager↔équipe est déterminée par la présence du manager dans `team_members` + son rôle `manager` dans `memberships`.

**Alternatives considérées** :
- Champ `managed_by` sur la table `teams` : rigide (un seul manager par équipe)
- Table dédiée `team_managers` : overhead inutile, la relation est déjà implicite

**Rationale** : Le PRD indique "un manager peut gérer une ou plusieurs équipes". En utilisant l'appartenance à l'équipe comme critère, un manager qui est membre de 3 équipes peut les gérer toutes. Cela évite une table ou un champ supplémentaire. L'admin, lui, peut gérer toutes les équipes quelle que soit son appartenance.

### 4. Suppression d'équipe avec confirmation

**Choix** : La suppression d'une équipe est réservée à l'admin, avec un dialog de confirmation. La suppression cascade sur `team_members` (et sur `diagnostics` en DB, mais il n'y en aura pas encore à ce stade).

**Alternatives considérées** :
- Soft delete (champ `deleted_at`) : complexité inutile au MVP
- Interdire la suppression si des diagnostics existent : sera pertinent en F4+, pas maintenant

**Rationale** : Au moment de F3, aucune équipe n'aura de diagnostics. La cascade DB est déjà configurée dans le schéma. En F4+, on ajoutera un garde-fou si des diagnostics existent.

### 5. Validation du nom d'équipe unique par organisation

**Choix** : Le nom d'équipe DOIT être unique au sein d'une organisation. Validation côté serveur.

**Rationale** : Deux équipes avec le même nom dans la même organisation créeraient de la confusion dans les dashboards et heatmaps (F6). La contrainte d'unicité est logique métier, pas nécessairement un index unique en DB (validé dans la Server Action).

## Risks / Trade-offs

**[Pas de garde-fou suppression avec diagnostics]** → Pour F3, la suppression d'équipe est directe (cascade DB). Mitigation : à l'ajout de F4, implémenter un garde-fou qui empêche la suppression d'une équipe ayant des diagnostics, ou qui demande une confirmation renforcée.

**[Scope manager par appartenance à l'équipe]** → Si un manager est retiré d'une équipe, il perd immédiatement l'accès à sa gestion. Mitigation : c'est le comportement souhaité. L'admin contrôle les affectations.

**[Pas de pagination des équipes ni des membres]** → Au MVP, les organisations ont < 20 équipes et < 200 membres. Mitigation : suffisant pour V1. Pagination à ajouter en V2 si nécessaire.

**[Nom unique non enforced par index DB]** → La vérification se fait dans la Server Action. En théorie, une race condition pourrait créer deux équipes avec le même nom. Mitigation : probabilité extrêmement faible, correction manuelle possible. Index unique à ajouter si le problème se manifeste.
