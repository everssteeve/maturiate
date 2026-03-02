## ADDED Requirements

### Requirement: Créer une organisation
Le système SHALL permettre à un utilisateur authentifié de créer une organisation avec un nom obligatoire et des métadonnées optionnelles (secteur, taille).

#### Scenario: Création avec nom uniquement
- **WHEN** un utilisateur authentifié soumet le formulaire de création avec le nom "Mon ESN"
- **THEN** le système MUST créer une organisation avec `name: "Mon ESN"`, `sector: null`, `size: null`, `opt_in_state_of_ia: false`
- **AND** le système MUST créer un membership avec `role: "admin"` pour l'utilisateur créateur
- **AND** le système MUST rediriger vers `/orgs/[orgId]/settings`

#### Scenario: Création avec toutes les métadonnées
- **WHEN** un utilisateur authentifié soumet le formulaire avec nom "TechCorp", secteur "esn", taille "51-200"
- **THEN** le système MUST créer l'organisation avec toutes les métadonnées renseignées
- **AND** le système MUST créer un membership admin pour le créateur

#### Scenario: Nom manquant
- **WHEN** un utilisateur soumet le formulaire sans nom d'organisation
- **THEN** le système MUST afficher une erreur de validation "Le nom de l'organisation est requis"
- **AND** le système MUST ne pas créer d'organisation

#### Scenario: Nom trop long
- **WHEN** un utilisateur soumet un nom dépassant 100 caractères
- **THEN** le système MUST afficher une erreur de validation "Le nom ne doit pas dépasser 100 caractères"

### Requirement: Page de création d'organisation à /orgs/new
Le système SHALL afficher une page de création d'organisation accessible aux utilisateurs authentifiés.

#### Scenario: Affichage du formulaire de création
- **WHEN** un utilisateur authentifié navigue vers `/orgs/new`
- **THEN** le système MUST afficher un formulaire avec : champ nom (requis), sélecteur de secteur (optionnel avec les valeurs : ESN, Éditeur, DSI, Startup, Autre), sélecteur de taille (optionnel avec les valeurs : 1-10, 11-50, 51-200, 201-1000, 1000+), et un bouton "Créer l'organisation"

#### Scenario: Utilisateur non authentifié
- **WHEN** un utilisateur non authentifié navigue vers `/orgs/new`
- **THEN** le système MUST rediriger vers `/login?callbackUrl=/orgs/new`

### Requirement: Modifier les informations d'une organisation
Le système SHALL permettre à un admin de modifier le nom, le logo (URL), le secteur et la taille de l'organisation.

#### Scenario: Modification du nom
- **WHEN** un admin modifie le nom de l'organisation en "Nouveau Nom" et sauvegarde
- **THEN** le système MUST mettre à jour le nom de l'organisation en base
- **AND** le système MUST afficher un message de confirmation "Organisation mise à jour"

#### Scenario: Modification du logo par URL
- **WHEN** un admin renseigne une URL de logo "https://example.com/logo.png" et sauvegarde
- **THEN** le système MUST mettre à jour le champ `logo` de l'organisation
- **AND** le système MUST afficher un aperçu du logo dans le formulaire

#### Scenario: URL de logo invalide
- **WHEN** un admin renseigne une valeur qui n'est pas une URL valide dans le champ logo
- **THEN** le système MUST afficher une erreur de validation "L'URL du logo n'est pas valide"

#### Scenario: Modification par un non-admin
- **WHEN** un utilisateur avec le rôle "member" ou "manager" tente de modifier l'organisation
- **THEN** le système MUST retourner une erreur "Forbidden"

#### Scenario: Modification par un consultant
- **WHEN** un utilisateur avec le rôle "consultant" accède à la page paramètres
- **THEN** le système MUST afficher les informations en lecture seule sans bouton de sauvegarde

### Requirement: Page paramètres organisation à /orgs/[orgId]/settings
Le système SHALL afficher une page de paramètres pour l'organisation avec les sections : informations générales, membres, invitations, opt-in State of IA.

#### Scenario: Accès admin à la page paramètres
- **WHEN** un admin navigue vers `/orgs/[orgId]/settings`
- **THEN** le système MUST afficher toutes les sections avec les formulaires éditables

#### Scenario: Accès non-membre
- **WHEN** un utilisateur non-membre de l'organisation navigue vers `/orgs/[orgId]/settings`
- **THEN** le système MUST retourner une erreur "Forbidden"

#### Scenario: Accès member/manager en lecture seule
- **WHEN** un member ou manager navigue vers `/orgs/[orgId]/settings`
- **THEN** le système MUST afficher les informations de l'organisation en lecture seule
- **AND** le système MUST masquer les sections d'administration (membres, invitations)

### Requirement: Server Action createOrganization
Le système SHALL fournir une Server Action `createOrganization` avec validation Zod.

#### Scenario: Validation du schéma d'entrée
- **WHEN** la Server Action est appelée avec des données
- **THEN** le système MUST valider avec Zod : `name` (string, 1-100 chars, requis), `sector` (enum org_sector, optionnel), `size` (enum org_size, optionnel)

#### Scenario: Création réussie
- **WHEN** la Server Action est appelée avec des données valides par un utilisateur authentifié
- **THEN** le système MUST créer l'organisation, créer le membership admin, et retourner l'ID de l'organisation créée

### Requirement: Server Action updateOrganization
Le système SHALL fournir une Server Action `updateOrganization` avec validation Zod et vérification de rôle admin.

#### Scenario: Mise à jour réussie par admin
- **WHEN** un admin appelle `updateOrganization` avec `{ orgId, name: "New Name", sector: "dsi" }`
- **THEN** le système MUST vérifier le rôle admin via `requireRole(orgId, "admin")`, valider les données, mettre à jour l'organisation, et retourner succès

#### Scenario: Mise à jour par non-admin
- **WHEN** un member appelle `updateOrganization`
- **THEN** le système MUST rejeter avec "Forbidden" via `requireRole`

### Requirement: Query getOrganization
Le système SHALL fournir une query `getOrganization(orgId)` retournant les détails de l'organisation avec le nombre de membres.

#### Scenario: Organisation existante
- **WHEN** un membre de l'organisation appelle `getOrganization(orgId)`
- **THEN** le système MUST retourner l'organisation avec ses champs (name, logo, sector, size, opt_in_state_of_ia, created_at) et le nombre total de membres

### Requirement: Query listUserOrganizations
Le système SHALL fournir une query `listUserOrganizations(userId)` retournant toutes les organisations auxquelles l'utilisateur appartient.

#### Scenario: Utilisateur avec plusieurs organisations
- **WHEN** un utilisateur appartenant à 3 organisations appelle `listUserOrganizations`
- **THEN** le système MUST retourner les 3 organisations avec pour chacune : id, name, logo, sector, role de l'utilisateur dans l'organisation, et le nombre de membres
