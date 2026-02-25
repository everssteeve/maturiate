## ADDED Requirements

### Requirement: Page de profil utilisateur à /profile
Le système SHALL afficher une page de profil utilisateur accessible depuis le header du layout authentifié.

#### Scenario: Accès à la page de profil
- **WHEN** un utilisateur authentifié navigue vers `/profile`
- **THEN** le système MUST afficher le nom, l'email et l'avatar de l'utilisateur avec des champs éditables pour le nom et l'avatar

#### Scenario: Utilisateur non authentifié
- **WHEN** un utilisateur non authentifié tente d'accéder à `/profile`
- **THEN** le système MUST rediriger vers `/login?callbackUrl=/profile`

### Requirement: Modification du nom
Le système SHALL permettre à l'utilisateur de modifier son nom d'affichage.

#### Scenario: Modification réussie du nom
- **WHEN** l'utilisateur modifie son nom avec une valeur valide (1-100 caractères) et soumet le formulaire
- **THEN** le système MUST mettre à jour le nom en base de données, afficher un message de succès, et refléter le changement dans le header

#### Scenario: Nom vide
- **WHEN** l'utilisateur soumet le formulaire avec un nom vide
- **THEN** le système MUST afficher un message d'erreur de validation « Le nom est requis. »

### Requirement: Modification de l'avatar
Le système SHALL permettre à l'utilisateur de modifier son avatar via une URL d'image.

#### Scenario: Mise à jour de l'avatar
- **WHEN** l'utilisateur renseigne une URL d'avatar valide et soumet le formulaire
- **THEN** le système MUST mettre à jour l'avatar en base de données et refléter le changement dans le header

#### Scenario: Suppression de l'avatar
- **WHEN** l'utilisateur vide le champ avatar et soumet le formulaire
- **THEN** le système MUST supprimer l'avatar (valeur null) et afficher les initiales par défaut dans le header

### Requirement: L'email est affiché en lecture seule
Le système SHALL afficher l'email de l'utilisateur sans permettre sa modification.

#### Scenario: Affichage de l'email
- **WHEN** la page de profil est affichée
- **THEN** l'email MUST être visible mais non modifiable (champ désactivé ou texte simple)
