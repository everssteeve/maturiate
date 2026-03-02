## ADDED Requirements

### Requirement: Sélecteur d'organisation dans le header
Le système SHALL afficher un composant de sélection d'organisation dans le header du layout dashboard permettant de naviguer entre les organisations de l'utilisateur.

#### Scenario: Utilisateur avec plusieurs organisations
- **WHEN** un utilisateur appartenant à 3 organisations accède au dashboard
- **THEN** le header MUST afficher un dropdown listant les 3 organisations avec leur nom et logo (ou initiale si pas de logo)
- **AND** l'organisation courante MUST être mise en évidence

#### Scenario: Utilisateur avec une seule organisation
- **WHEN** un utilisateur appartenant à une seule organisation accède au dashboard
- **THEN** le header MUST afficher le nom de l'organisation sans dropdown (navigation directe)

#### Scenario: Changement d'organisation
- **WHEN** un utilisateur sélectionne une autre organisation dans le dropdown
- **THEN** le système MUST naviguer vers `/orgs/[orgId]` de l'organisation sélectionnée

#### Scenario: Lien vers toutes les organisations
- **WHEN** le dropdown est ouvert
- **THEN** le système MUST afficher un lien "Toutes les organisations" qui navigue vers `/orgs`

#### Scenario: Lien vers création d'organisation
- **WHEN** le dropdown est ouvert
- **THEN** le système MUST afficher un lien "Créer une organisation" qui navigue vers `/orgs/new`

### Requirement: Page liste des organisations à /orgs
Le système SHALL afficher une page listant toutes les organisations de l'utilisateur.

#### Scenario: Affichage de la liste
- **WHEN** un utilisateur authentifié navigue vers `/orgs`
- **THEN** le système MUST afficher une grille/liste de cartes, une par organisation, montrant : nom, logo (ou initiale), secteur, nombre de membres, rôle de l'utilisateur dans l'organisation

#### Scenario: Clic sur une organisation
- **WHEN** l'utilisateur clique sur une carte d'organisation
- **THEN** le système MUST naviguer vers `/orgs/[orgId]`

#### Scenario: Bouton de création
- **WHEN** la page `/orgs` est affichée
- **THEN** le système MUST afficher un bouton "Créer une organisation" qui navigue vers `/orgs/new`

#### Scenario: Aucune organisation
- **WHEN** un utilisateur sans organisation navigue vers `/orgs`
- **THEN** le système MUST afficher un état vide avec le message "Vous n'appartenez à aucune organisation" et un bouton "Créer votre première organisation"

#### Scenario: Utilisateur non authentifié
- **WHEN** un utilisateur non authentifié navigue vers `/orgs`
- **THEN** le système MUST rediriger vers `/login?callbackUrl=/orgs`

### Requirement: Page organisation à /orgs/[orgId]
Le système SHALL afficher une page d'accueil pour l'organisation (placeholder pour le futur dashboard F4+).

#### Scenario: Accès à la page d'organisation
- **WHEN** un membre de l'organisation navigue vers `/orgs/[orgId]`
- **THEN** le système MUST afficher le nom de l'organisation, un message "Dashboard à venir", et un lien vers les paramètres (pour les admins)

#### Scenario: Accès par un non-membre
- **WHEN** un utilisateur non-membre navigue vers `/orgs/[orgId]`
- **THEN** le système MUST retourner une erreur "Forbidden"
