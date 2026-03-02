## MODIFIED Requirements

### Requirement: Layout authentifié avec header utilisateur
Le système SHALL afficher un layout pour les routes `(dashboard)` incluant un header avec les informations de l'utilisateur connecté et un sélecteur d'organisation.

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

#### Scenario: Sélecteur d'organisation dans le header
- **WHEN** un utilisateur authentifié accède à une page sous `(dashboard)` et se trouve dans le contexte d'une organisation (`/orgs/[orgId]/*`)
- **THEN** le header MUST afficher le composant OrgSwitcher entre le titre "maturIAté" et le menu utilisateur

#### Scenario: Header sans contexte d'organisation
- **WHEN** un utilisateur authentifié accède à `/orgs` ou `/profile` (pas de contexte orgId)
- **THEN** le header MUST ne pas afficher le composant OrgSwitcher
