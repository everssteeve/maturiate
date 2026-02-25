## ADDED Requirements

### Requirement: Layout authentifié avec header utilisateur
Le système SHALL afficher un layout pour les routes `(dashboard)` incluant un header avec les informations de l'utilisateur connecté.

#### Scenario: Header avec informations utilisateur
- **WHEN** un utilisateur authentifié accède à une page sous `(dashboard)`
- **THEN** le header MUST afficher le nom de l'utilisateur, son avatar (ou ses initiales si pas d'avatar), et un menu déroulant

#### Scenario: Menu déroulant utilisateur
- **WHEN** l'utilisateur clique sur son avatar/nom dans le header
- **THEN** le système MUST afficher un menu déroulant avec les options « Mon profil » et « Se déconnecter »

#### Scenario: Clic sur Mon profil
- **WHEN** l'utilisateur clique sur « Mon profil » dans le menu déroulant
- **THEN** le système MUST naviguer vers `/profile`

#### Scenario: Clic sur Se déconnecter
- **WHEN** l'utilisateur clique sur « Se déconnecter » dans le menu déroulant
- **THEN** le système MUST appeler `signOut()` et rediriger vers `/login`

### Requirement: Layout auth minimaliste
Le système SHALL afficher un layout minimal pour les routes `(auth)` (login, invitation).

#### Scenario: Layout de la page de connexion
- **WHEN** un utilisateur accède à `/login` ou `/invite/[token]`
- **THEN** le layout MUST être centré verticalement et horizontalement, avec le logo maturIAté en haut, sans sidebar ni navigation

### Requirement: Le header affiche le titre maturIAté
Le système SHALL afficher le nom de la plateforme dans le header du layout authentifié.

#### Scenario: Logo/titre dans le header
- **WHEN** un utilisateur authentifié accède à une page du dashboard
- **THEN** le header MUST afficher « maturIAté » à gauche, cliquable, redirigeant vers `/orgs`
