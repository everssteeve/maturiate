## ADDED Requirements

### Requirement: Radar chart agrégé de l'organisation
Le système DOIT afficher un radar chart montrant les scores moyens de l'organisation sur les 6 dimensions, en réutilisant le composant `RadarChart` existant de `components/charts/radar-chart.tsx`.

#### Scenario: Radar chart avec données
- **WHEN** le dashboard affiche les scores agrégés d'une campagne avec des diagnostics complétés
- **THEN** un radar chart est affiché avec les 6 axes et les scores moyens de l'organisation

#### Scenario: Radar chart sans données
- **WHEN** la campagne sélectionnée n'a aucun diagnostic complété
- **THEN** le radar chart n'est pas affiché et un message indique l'absence de données

### Requirement: Courbe d'évolution du score global
Le système DOIT afficher un line chart (Recharts `LineChart`) montrant l'évolution du score global moyen de l'organisation au fil des campagnes. L'axe X représente les campagnes (ordonnées chronologiquement par date de début) et l'axe Y le score global (échelle 1-4).

#### Scenario: Évolution sur plusieurs campagnes
- **WHEN** l'organisation a 4 campagnes avec des diagnostics complétés
- **THEN** le line chart affiche 4 points reliés par une ligne, avec le nom de la campagne en label X

#### Scenario: Évolution avec une seule campagne
- **WHEN** l'organisation n'a qu'une seule campagne avec des diagnostics
- **THEN** le line chart affiche un seul point (pas de courbe)

#### Scenario: Aucune campagne avec diagnostics
- **WHEN** aucune campagne n'a de diagnostics complétés
- **THEN** le graphique d'évolution n'est pas affiché et un message indique l'absence de données

### Requirement: Courbes d'évolution par dimension
Le système DOIT permettre d'afficher l'évolution des scores par dimension en superposition sur le line chart. Chaque dimension est une ligne avec une couleur distincte et peut être activée/désactivée via une légende interactive.

#### Scenario: Toutes les dimensions activées
- **WHEN** l'utilisateur active l'affichage de toutes les dimensions
- **THEN** 6 lignes de couleurs différentes sont superposées sur le line chart avec une légende identifiant chaque dimension

#### Scenario: Désactivation d'une dimension
- **WHEN** l'utilisateur clique sur "Outils" dans la légende
- **THEN** la ligne "Outils" disparaît du graphique et le label est grisé dans la légende

### Requirement: Tooltip interactif sur les charts
Les line charts DOIVENT afficher un tooltip au survol d'un point de données montrant : le nom de la campagne, la date, le score global, et les scores par dimension (si les courbes par dimension sont activées).

#### Scenario: Tooltip au survol
- **WHEN** l'utilisateur survole un point de données sur le line chart
- **THEN** un tooltip affiche le nom de la campagne, sa date de début, et le score correspondant

### Requirement: Axes et échelle des charts
Les line charts DOIVENT utiliser une échelle Y fixe de 1 à 4 (correspondant aux niveaux de maturité). Des lignes de référence horizontales optionnelles PEUVENT être affichées aux seuils de niveau (1.75, 2.5, 3.25) avec des labels discrets.

#### Scenario: Échelle Y fixe
- **WHEN** le line chart s'affiche
- **THEN** l'axe Y va de 1 à 4 avec des graduations à chaque entier
