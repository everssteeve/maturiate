## ADDED Requirements

### Requirement: Affichage des recommandations personnalisées par dimension
Le système DOIT afficher une section de recommandations personnalisées basées sur le dernier diagnostic de l'équipe. Pour chaque dimension, une carte affiche : le nom de la dimension, le score actuel, le niveau correspondant, la recommandation textuelle issue de `data/recommendations.ts`, et l'indicateur de tendance.

#### Scenario: Recommandation pour une dimension en amélioration
- **WHEN** la dimension "Outils" a un score actuel de 3.0 (Intégration) et le précédent était 2.0
- **THEN** la carte affiche "Outils & Environnement — 3.00 / 4 — Intégration", la recommandation du niveau 3 pour "tools", et un indicateur ↑ avec "+1.00"

#### Scenario: Recommandation pour une dimension en régression
- **WHEN** la dimension "Process" a un score actuel de 1.5 (Découverte) et le précédent était 2.5
- **THEN** la carte affiche "Process & Méthodologie — 1.50 / 4 — Découverte", la recommandation du niveau 1 pour "process", et un indicateur ↓ avec "-1.00"

#### Scenario: Recommandation pour une dimension stable
- **WHEN** la dimension "Collaboration" a un score actuel de 2.5 et le précédent était 2.45
- **THEN** la carte affiche la recommandation du niveau 3 et un indicateur → "Stable"

#### Scenario: Premier diagnostic (pas de tendance)
- **WHEN** l'équipe n'a qu'un seul diagnostic
- **THEN** les cartes affichent les recommandations sans indicateur de tendance

### Requirement: Ordre d'affichage des recommandations
Le système DOIT afficher les recommandations triées par score croissant (les dimensions les plus faibles en premier) pour orienter l'attention vers les axes d'amélioration prioritaires.

#### Scenario: Tri par score croissant
- **WHEN** les scores par dimension sont : Outils=3.0, Process=1.5, Docs=2.0, Qualité=3.5, Collab=2.5, Vision=2.0
- **THEN** les cartes sont affichées dans l'ordre : Process (1.5), Docs (2.0), Vision (2.0), Collab (2.5), Outils (3.0), Qualité (3.5)

### Requirement: Calcul des tendances par dimension
Le système DOIT calculer la tendance pour chaque dimension individuellement en comparant le score du dernier diagnostic avec celui de l'avant-dernier. Les seuils sont les mêmes que la tendance globale : `"up"` si +0.1, `"down"` si -0.1, `"stable"` sinon.

#### Scenario: Tendances mixtes
- **WHEN** entre les 2 derniers diagnostics, Outils passe de 2.0 à 3.0, Process de 2.5 à 2.0, et Docs de 2.0 à 2.05
- **THEN** les tendances sont : Outils=up (+1.0), Process=down (-0.5), Docs=stable (+0.05)

### Requirement: Layout responsive des recommandations
Les cartes de recommandation DOIVENT s'afficher en grille responsive : 1 colonne sur mobile, 2 colonnes sur tablette, 3 colonnes sur desktop.

#### Scenario: Desktop (>= 1024px)
- **WHEN** les recommandations sont affichées sur un écran large
- **THEN** les 6 cartes sont affichées en grille de 3 colonnes sur 2 rangées

#### Scenario: Mobile (< 768px)
- **WHEN** les recommandations sont affichées sur un écran mobile
- **THEN** les 6 cartes sont empilées en une seule colonne

### Requirement: Pas de section recommandations sans diagnostic
Le système NE DOIT PAS afficher la section recommandations si l'équipe n'a aucun diagnostic complété.

#### Scenario: Aucun diagnostic
- **WHEN** l'équipe n'a aucun diagnostic
- **THEN** la section recommandations n'est pas rendue dans le DOM
