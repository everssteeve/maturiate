## ADDED Requirements

### Requirement: Radar chart comparatif de 2 diagnostics
Le système DOIT afficher un radar chart permettant de comparer visuellement les scores par dimension de 2 diagnostics sélectionnés. Le radar chart réutilise le composant `RadarChart` existant de `components/charts/radar-chart.tsx` avec support de 2 jeux de données superposés.

#### Scenario: Affichage avec un seul diagnostic
- **WHEN** un seul diagnostic est sélectionné (le plus récent par défaut)
- **THEN** le radar chart affiche les 6 scores de dimension avec un seul polygone plein

#### Scenario: Affichage avec 2 diagnostics superposés
- **WHEN** 2 diagnostics sont sélectionnés pour comparaison
- **THEN** le radar chart affiche 2 polygones superposés avec des couleurs distinctes (primaire pour le diagnostic actuel, secondaire semi-transparent pour la comparaison) et une légende identifiant chaque diagnostic par sa date

#### Scenario: Légende du radar comparatif
- **WHEN** 2 diagnostics sont superposés
- **THEN** une légende sous le chart indique la date et le score global de chaque diagnostic (ex: "Mars 2026 — 3.00" et "Janvier 2026 — 2.50")

#### Scenario: Radar chart sans données
- **WHEN** l'équipe n'a aucun diagnostic
- **THEN** le radar chart n'est pas affiché et un message indique l'absence de données

### Requirement: Courbe d'évolution du score de l'équipe
Le système DOIT afficher un line chart montrant l'évolution du score global de l'équipe au fil du temps. L'axe X représente les diagnostics ordonnés chronologiquement (label = date ou nom de campagne). L'axe Y utilise une échelle fixe de 1 à 4. Le composant réutilise `components/charts/evolution-chart.tsx`.

#### Scenario: Évolution sur plusieurs diagnostics
- **WHEN** l'équipe a 4 diagnostics complétés
- **THEN** le line chart affiche 4 points reliés par une ligne, avec la date ou le nom de campagne en label X

#### Scenario: Évolution avec un seul diagnostic
- **WHEN** l'équipe n'a qu'un seul diagnostic
- **THEN** le line chart affiche un seul point sans ligne

#### Scenario: Aucun diagnostic
- **WHEN** l'équipe n'a aucun diagnostic
- **THEN** le graphique d'évolution n'est pas affiché et un message indique l'absence de données

### Requirement: Courbes par dimension sur le line chart
Le système DOIT permettre d'afficher l'évolution des scores par dimension en superposition sur le line chart. Chaque dimension est une ligne avec une couleur distincte, activable/désactivable via la légende interactive.

#### Scenario: Toutes les dimensions activées
- **WHEN** l'utilisateur active l'affichage de toutes les dimensions
- **THEN** 6 lignes de couleurs différentes sont superposées avec une légende identifiant chaque dimension

#### Scenario: Désactivation d'une dimension
- **WHEN** l'utilisateur clique sur "Outils" dans la légende
- **THEN** la ligne "Outils" disparaît du graphique et le label est grisé dans la légende

### Requirement: Tooltip interactif sur les charts
Les charts DOIVENT afficher un tooltip au survol d'un point de données.

#### Scenario: Tooltip sur le line chart
- **WHEN** l'utilisateur survole un point de données sur le line chart
- **THEN** un tooltip affiche la date du diagnostic, le nom de la campagne (si applicable), le score global, et les scores par dimension si les courbes par dimension sont activées

#### Scenario: Tooltip sur le radar chart
- **WHEN** l'utilisateur survole un axe du radar chart
- **THEN** un tooltip affiche le nom de la dimension et le score (et le score de comparaison si 2 diagnostics sont superposés)

### Requirement: Axes et échelle des charts
Les line charts DOIVENT utiliser une échelle Y fixe de 1 à 4. Des lignes de référence horizontales PEUVENT être affichées aux seuils de niveau (1.75, 2.5, 3.25).

#### Scenario: Échelle Y fixe
- **WHEN** le line chart s'affiche
- **THEN** l'axe Y va de 1 à 4 avec des graduations à chaque entier

### Requirement: Responsive des charts
Les charts DOIVENT s'adapter à la taille de l'écran via `ResponsiveContainer` de Recharts.

#### Scenario: Chart sur mobile
- **WHEN** le dashboard est affiché sur un écran < 768px
- **THEN** les charts s'adaptent à la largeur disponible avec une hauteur minimale de 250px

#### Scenario: Chart sur desktop
- **WHEN** le dashboard est affiché sur un écran >= 1024px
- **THEN** les charts occupent leur colonne avec une hauteur de 350px
