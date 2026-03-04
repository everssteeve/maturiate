## ADDED Requirements

### Requirement: Le header public affiche une navigation minimale

Le système DOIT afficher un header de navigation sur les pages publiques contenant le logo maturIAté, un lien vers le State of IA, et des boutons Connexion/Inscription.

#### Scenario: Affichage du header public pour un visiteur
- **WHEN** un visiteur non authentifié est sur une page publique
- **THEN** le header affiche le logo (lien vers `/`), un lien "State of IA" (vers `/state-of-ia`), et les boutons "Se connecter" et "Commencer" (vers `/login`)

#### Scenario: Affichage du header public pour un utilisateur connecté
- **WHEN** un utilisateur authentifié visualise la landing page (via un lien direct par exemple)
- **THEN** le header affiche le logo, le lien State of IA, et un lien vers le tableau de bord au lieu des boutons de connexion

### Requirement: Le header public est responsive

Le header DOIT s'adapter aux écrans mobiles avec un menu hamburger ou une navigation compacte.

#### Scenario: Header sur écran mobile
- **WHEN** le header est affiché sur un écran de largeur inférieure à 768px
- **THEN** la navigation est accessible via un menu compact (hamburger ou dropdown)

#### Scenario: Header sur écran desktop
- **WHEN** le header est affiché sur un écran de largeur supérieure à 768px
- **THEN** tous les éléments de navigation sont visibles directement dans le header

### Requirement: Le header public est réutilisable sur les pages publiques

Le composant PublicHeader DOIT pouvoir être utilisé indépendamment sur n'importe quelle page publique (landing, State of IA, pages de partage).

#### Scenario: Utilisation sur la landing page
- **WHEN** la landing page est rendue
- **THEN** le PublicHeader est affiché en haut de la page

#### Scenario: Réutilisation potentielle sur d'autres pages publiques
- **WHEN** un développeur importe PublicHeader dans une nouvelle page publique
- **THEN** le composant s'affiche correctement sans dépendances spécifiques à la landing page
