## ADDED Requirements

### Requirement: Page de résultats accessible après soumission
Le système DOIT fournir une page de résultats à l'URL `/orgs/[orgId]/diagnostic/[teamId]/results/[diagnosticId]` accessible aux membres de l'organisation (tous rôles).

#### Scenario: Accès aux résultats
- **WHEN** un membre de l'organisation navigue vers la page de résultats d'un diagnostic existant
- **THEN** la page affiche les résultats complets du diagnostic

#### Scenario: Diagnostic inexistant
- **WHEN** l'URL contient un `diagnosticId` invalide
- **THEN** une page 404 est affichée

### Requirement: Affichage du score global et du niveau de maturité
Le système DOIT afficher le score global (ex: "2.67 / 4") et le niveau de maturité (nom + description) de manière proéminente en haut de la page de résultats.

#### Scenario: Affichage du niveau
- **WHEN** la page de résultats s'affiche pour un diagnostic avec un score de 2.8
- **THEN** le score "2.80 / 4" est affiché ainsi que le niveau "Intégration" avec sa description

### Requirement: Radar chart des scores par dimension
Le système DOIT afficher un radar chart (Recharts) montrant les 6 scores de dimension. Chaque axe du radar correspond à une dimension avec son label court.

#### Scenario: Radar chart avec données
- **WHEN** la page de résultats s'affiche
- **THEN** un radar chart est affiché avec 6 axes (Outils, Process, Docs, Qualité, Collab, Vision) et les scores correspondants

### Requirement: Détail par dimension avec score et recommandation
Le système DOIT afficher pour chaque dimension : le label, le score, le niveau correspondant, et la recommandation personnalisée (depuis `data/recommendations.ts`) correspondant au niveau de cette dimension.

#### Scenario: Détail d'une dimension au niveau 2
- **WHEN** la dimension "Outils" a un score de 2.0 (niveau 2 "Exploration")
- **THEN** la section affiche "Outils & Environnement — 2.0/4 — Exploration" avec la recommandation du niveau 2 pour la dimension "tools"

### Requirement: Informations contextuelles du diagnostic
Le système DOIT afficher les métadonnées du diagnostic : nom de l'équipe, date de complétion, nom de la personne qui a rempli, durée (si `startedAt` est disponible).

#### Scenario: Affichage des métadonnées
- **WHEN** la page de résultats s'affiche
- **THEN** le nom de l'équipe, la date et l'auteur sont affichés

#### Scenario: Durée de complétion
- **WHEN** le diagnostic a un `startedAt` et un `completedAt`
- **THEN** la durée est calculée et affichée (ex: "Complété en 12 minutes")

### Requirement: Lien de retour vers l'équipe
Le système DOIT fournir un lien permettant de revenir à la page de l'équipe ou de refaire un nouveau diagnostic.

#### Scenario: Navigation retour
- **WHEN** l'utilisateur clique sur le lien de retour
- **THEN** il est redirigé vers la page de gestion de l'équipe
