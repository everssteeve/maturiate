## ADDED Requirements

### Requirement: Affichage de la heatmap Équipes × Dimensions
Le système DOIT afficher une grille visuelle où les lignes représentent les équipes et les colonnes les 6 dimensions de maturité. Chaque cellule affiche le score de la dimension pour cette équipe.

#### Scenario: Heatmap complète
- **WHEN** toutes les équipes d'une campagne ont complété leur diagnostic
- **THEN** la heatmap affiche une grille complète avec le score numérique dans chaque cellule et un code couleur correspondant au niveau de maturité

#### Scenario: Heatmap avec équipes manquantes
- **WHEN** certaines équipes n'ont pas complété le diagnostic de la campagne
- **THEN** les cellules correspondantes affichent "—" avec un fond grisé

### Requirement: Code couleur des niveaux de maturité
Chaque cellule de la heatmap DOIT utiliser un code couleur cohérent basé sur le niveau de maturité du score de la dimension :
- Niveau 1 (Découverte, score < 1.75) : rouge/orange clair
- Niveau 2 (Exploration, score >= 1.75 et < 2.5) : orange/jaune
- Niveau 3 (Intégration, score >= 2.5 et < 3.25) : vert clair
- Niveau 4 (Transformation, score >= 3.25) : vert foncé

#### Scenario: Cellule au niveau 1
- **WHEN** une équipe a un score de 1.2 pour la dimension "tools"
- **THEN** la cellule affiche "1.2" avec un fond rouge/orange clair

#### Scenario: Cellule au niveau 4
- **WHEN** une équipe a un score de 3.8 pour la dimension "collab"
- **THEN** la cellule affiche "3.8" avec un fond vert foncé

### Requirement: En-têtes de la heatmap
La heatmap DOIT afficher les labels courts des dimensions en en-têtes de colonnes (Outils, Process, Docs, Qualité, Collab, Vision) et les noms des équipes en en-têtes de lignes. Une colonne supplémentaire DOIT afficher le score global de chaque équipe.

#### Scenario: En-têtes visibles
- **WHEN** la heatmap s'affiche
- **THEN** les 6 labels courts des dimensions sont affichés en en-tête de colonnes avec une colonne "Global" en dernière position

### Requirement: Score global par équipe dans la heatmap
La heatmap DOIT afficher une colonne "Global" montrant le score global de chaque équipe pour la campagne sélectionnée, avec le même code couleur que les cellules de dimension.

#### Scenario: Score global affiché
- **WHEN** une équipe a un score global de 2.8
- **THEN** la colonne "Global" affiche "2.8" avec le code couleur du niveau 3

### Requirement: Tri des équipes dans la heatmap
Les équipes DOIVENT être triées par nom alphabétique par défaut dans la heatmap.

#### Scenario: Tri alphabétique
- **WHEN** la heatmap affiche les équipes "Frontend", "Backend", "DevOps"
- **THEN** l'ordre affiché est "Backend", "DevOps", "Frontend"

### Requirement: Responsivité de la heatmap
La heatmap DOIT être scrollable horizontalement sur les écrans étroits tout en gardant la colonne des noms d'équipes fixe (sticky).

#### Scenario: Affichage sur tablette
- **WHEN** la heatmap est affichée sur un écran de 768px de large
- **THEN** la colonne des noms d'équipes reste visible et le reste de la grille peut scroller horizontalement
