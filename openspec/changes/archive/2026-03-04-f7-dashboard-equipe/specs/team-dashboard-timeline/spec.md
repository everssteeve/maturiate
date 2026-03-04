## ADDED Requirements

### Requirement: Affichage de la timeline des diagnostics
Le système DOIT afficher une timeline chronologique de tous les diagnostics de l'équipe, du plus récent au plus ancien. Chaque entrée de la timeline affiche : la date de complétion, le score global, le niveau de maturité (avec badge coloré), le nom de la personne ayant rempli, et le nom de la campagne (si applicable).

#### Scenario: Timeline avec plusieurs diagnostics
- **WHEN** l'équipe a 5 diagnostics complétés
- **THEN** la timeline affiche 5 entrées ordonnées du plus récent au plus ancien, chacune avec date, score, niveau, auteur et campagne

#### Scenario: Diagnostic ad hoc dans la timeline
- **WHEN** un diagnostic a été rempli en dehors d'une campagne
- **THEN** l'entrée de la timeline affiche "Diagnostic ad hoc" à la place du nom de campagne

#### Scenario: Timeline avec un seul diagnostic
- **WHEN** l'équipe n'a qu'un seul diagnostic
- **THEN** la timeline affiche une seule entrée sans connecteur vertical

### Requirement: Sélection de diagnostics pour comparaison radar
Le système DOIT permettre à l'utilisateur de sélectionner jusqu'à 2 diagnostics dans la timeline pour les comparer sur le radar chart. Le dernier diagnostic est toujours pré-sélectionné. L'utilisateur peut cliquer sur un second diagnostic pour activer la comparaison.

#### Scenario: Sélection par défaut
- **WHEN** la timeline s'affiche pour la première fois
- **THEN** le diagnostic le plus récent est sélectionné (mis en surbrillance) et le radar chart affiche ses scores

#### Scenario: Sélection d'un second diagnostic
- **WHEN** l'utilisateur clique sur un diagnostic dans la timeline (autre que celui déjà sélectionné)
- **THEN** ce diagnostic est ajouté comme second élément de comparaison et le radar chart affiche les deux ensembles de scores superposés

#### Scenario: Désélection du second diagnostic
- **WHEN** l'utilisateur clique à nouveau sur le second diagnostic sélectionné
- **THEN** ce diagnostic est désélectionné et le radar chart revient à l'affichage du seul diagnostic principal

#### Scenario: Maximum 2 sélections
- **WHEN** 2 diagnostics sont déjà sélectionnés et l'utilisateur clique sur un troisième
- **THEN** le troisième remplace le second diagnostic de comparaison (le premier reste le plus récent)

### Requirement: Indicateur visuel de sélection
Le système DOIT afficher un indicateur visuel clair sur les entrées de la timeline sélectionnées pour la comparaison. Le diagnostic principal (le plus récent) DOIT avoir un style distinct du diagnostic de comparaison.

#### Scenario: Diagnostic principal sélectionné
- **WHEN** le diagnostic le plus récent est sélectionné
- **THEN** son entrée dans la timeline est mise en surbrillance avec la couleur primaire et un label "Actuel"

#### Scenario: Diagnostic de comparaison sélectionné
- **WHEN** un second diagnostic est sélectionné pour comparaison
- **THEN** son entrée est mise en surbrillance avec une couleur secondaire et un label "Comparaison"

### Requirement: Badge de niveau de maturité
Chaque entrée de la timeline DOIT afficher un badge coloré correspondant au niveau de maturité du diagnostic (1-4).

#### Scenario: Badge niveau Découverte
- **WHEN** un diagnostic a le niveau 1 (Découverte)
- **THEN** le badge affiche "Découverte" avec une couleur rouge/orange

#### Scenario: Badge niveau Transformation
- **WHEN** un diagnostic a le niveau 4 (Transformation)
- **THEN** le badge affiche "Transformation" avec une couleur verte
