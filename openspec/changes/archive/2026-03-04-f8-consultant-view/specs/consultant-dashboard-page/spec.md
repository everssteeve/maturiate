## ADDED Requirements

### Requirement: Page consultant accessible à /consultant
Le système DOIT fournir une page accessible à la route `/consultant` affichant le tableau de bord consolidé multi-organisations. Cette page est réservée aux utilisateurs ayant le rôle `consultant` dans au moins une organisation.

#### Scenario: Consultant accède à la page
- **WHEN** un utilisateur avec au moins un membership `consultant` navigue vers `/consultant`
- **THEN** la page s'affiche avec la liste de ses organisations et les statistiques globales

#### Scenario: Utilisateur non consultant accède à la page
- **WHEN** un utilisateur sans aucun membership `consultant` navigue vers `/consultant`
- **THEN** le système redirige vers `/orgs` (page par défaut)

#### Scenario: Utilisateur non authentifié
- **WHEN** un utilisateur non authentifié navigue vers `/consultant`
- **THEN** le système redirige vers `/login`

### Requirement: Affichage des statistiques globales
La page DOIT afficher en haut un bandeau de statistiques globales contenant : le nombre d'organisations accompagnées, le score moyen global, et le nombre total d'équipes évaluées.

#### Scenario: Affichage des statistiques
- **WHEN** la page se charge avec des données
- **THEN** les statistiques globales sont affichées : "X organisations", "Score moyen : X.X/4", "X équipes évaluées"

#### Scenario: Aucune organisation avec des diagnostics
- **WHEN** toutes les organisations du consultant n'ont aucun diagnostic
- **THEN** le score moyen global affiche "—" et le nombre d'équipes évaluées est 0

### Requirement: Liste des organisations sous forme de cartes
La page DOIT afficher chaque organisation du consultant sous forme de carte contenant : nom de l'organisation, logo (ou initiale si pas de logo), score moyen, niveau de maturité (badge coloré), nombre d'équipes évaluées sur le total, dernière campagne (nom et date), tendance (si disponible).

#### Scenario: Organisation avec données complètes
- **WHEN** une organisation a des diagnostics et des campagnes
- **THEN** la carte affiche le nom, le score moyen (ex: "2.8/4"), le badge de niveau (ex: "Niveau 2"), le nombre d'équipes (ex: "3/5 équipes"), la dernière campagne (ex: "Q4 2025 — 15 janv. 2026"), et la tendance (ex: "+0.3")

#### Scenario: Organisation sans diagnostic
- **WHEN** une organisation n'a aucun diagnostic complété
- **THEN** la carte affiche le nom, "Aucun diagnostic" pour le score, et pas de tendance

#### Scenario: Organisation sans logo
- **WHEN** une organisation n'a pas de logo
- **THEN** la carte affiche l'initiale du nom de l'organisation dans un cercle coloré

### Requirement: Navigation vers le dashboard organisation
Chaque carte organisation DOIT être cliquable et rediriger vers le dashboard organisation existant (`/orgs/[orgId]`).

#### Scenario: Clic sur une carte organisation
- **WHEN** le consultant clique sur la carte d'une organisation
- **THEN** il est redirigé vers `/orgs/[orgId]` où il voit le dashboard F6 en lecture seule

### Requirement: État vide
Lorsque le consultant n'a aucune organisation, la page DOIT afficher un message explicatif avec une indication de la marche à suivre.

#### Scenario: Aucune organisation
- **WHEN** le consultant n'a aucun membership
- **THEN** la page affiche un message "Vous n'êtes consultant dans aucune organisation" avec une explication que les invitations sont gérées par les administrateurs des organisations

### Requirement: Lien consultant dans le header
Le header de l'application DOIT afficher un lien "Vue consultant" visible uniquement pour les utilisateurs ayant au moins un membership avec le rôle `consultant`. Ce lien redirige vers `/consultant`.

#### Scenario: Utilisateur consultant voit le lien
- **WHEN** un utilisateur avec au moins un membership `consultant` est connecté
- **THEN** un lien "Vue consultant" est visible dans le header à côté de l'org-switcher

#### Scenario: Utilisateur non consultant
- **WHEN** un utilisateur connecté n'a aucun membership `consultant`
- **THEN** le lien "Vue consultant" n'est pas affiché dans le header

### Requirement: Tri des organisations
Les organisations DOIVENT être triées par score moyen décroissant par défaut (les mieux notées en premier). Les organisations sans diagnostic sont affichées en fin de liste.

#### Scenario: Tri par défaut
- **WHEN** la page se charge
- **THEN** les organisations sont triées par score moyen décroissant, celles sans diagnostic en dernier

### Requirement: Responsive design
La page consultant DOIT être responsive. Les cartes d'organisations s'affichent en grille : 3 colonnes sur desktop, 2 sur tablette, 1 sur mobile.

#### Scenario: Affichage desktop
- **WHEN** la page est consultée sur un écran large (> 1024px)
- **THEN** les cartes s'affichent sur 3 colonnes

#### Scenario: Affichage mobile
- **WHEN** la page est consultée sur un écran mobile (< 640px)
- **THEN** les cartes s'affichent sur 1 colonne
