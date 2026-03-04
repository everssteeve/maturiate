## ADDED Requirements

### Requirement: Page publique du rapport annuel
Le système SHALL afficher le rapport State of IA sur la route `/state-of-ia/[year]`, accessible sans authentification, rendue côté serveur (SSR) pour le SEO.

#### Scenario: Rapport publié accessible
- **WHEN** un visiteur accède à `/state-of-ia/2026` et un rapport publié existe pour 2026
- **THEN** le système MUST afficher la page avec : le titre "State of IA 2026", l'introduction, les sections avec contenu éditorialisé et graphiques correspondants, les insights clés, la méthodologie, et un bouton "Télécharger PDF"

#### Scenario: Rapport non publié
- **WHEN** un visiteur accède à `/state-of-ia/2026` et aucun rapport publié n'existe pour 2026
- **THEN** le système MUST retourner une page 404 avec un message "Le rapport State of IA pour cette année n'est pas encore disponible"

#### Scenario: Route index /state-of-ia
- **WHEN** un visiteur accède à `/state-of-ia` sans année
- **THEN** le système MUST rediriger vers le rapport de l'année la plus récente publiée, ou afficher un message "Aucun rapport publié" si aucun rapport n'existe

### Requirement: Graphiques auto-générés à partir des snapshots
Le système SHALL générer automatiquement les graphiques à partir des données des snapshots, intercalés dans les sections du rapport selon le `chartType` spécifié.

#### Scenario: Graphique distribution des niveaux de maturité
- **WHEN** une section a `chartType: 'distribution'`
- **THEN** le système MUST afficher un bar chart montrant la répartition des organisations par niveau de maturité (1: Découverte, 2: Exploration, 3: Intégration, 4: Transformation) avec le nombre et le pourcentage pour chaque niveau

#### Scenario: Graphique scores par dimension
- **WHEN** une section a `chartType: 'dimensions'`
- **THEN** le système MUST afficher un radar chart ou bar chart montrant le score moyen par dimension sur l'ensemble des organisations participantes

#### Scenario: Graphique tendances année sur année
- **WHEN** une section a `chartType: 'trends'` et des snapshots existent pour plusieurs années
- **THEN** le système MUST afficher un line chart montrant l'évolution du score global moyen année par année

#### Scenario: Graphique tendances première année
- **WHEN** une section a `chartType: 'trends'` et seuls des snapshots pour une seule année existent
- **THEN** le système MUST afficher un message "Les tendances seront disponibles à partir de la deuxième année de publication"

#### Scenario: Graphique segmentation
- **WHEN** une section a `chartType: 'segments'`
- **THEN** le système MUST afficher un grouped bar chart montrant le score global moyen par secteur et/ou taille d'organisation

### Requirement: Méta-données SEO
Le système SHALL générer les balises Open Graph et meta pour la page publique.

#### Scenario: Balises méta
- **WHEN** la page `/state-of-ia/2026` est rendue
- **THEN** le système MUST inclure : `<title>State of IA 2026 — maturIAté</title>`, une meta description résumant le rapport, les balises Open Graph (og:title, og:description, og:type=article), et un lien canonical

### Requirement: Téléchargement PDF
Le système SHALL permettre de télécharger le rapport en PDF via le navigateur.

#### Scenario: Clic sur télécharger PDF
- **WHEN** un visiteur clique sur "Télécharger PDF"
- **THEN** le système MUST déclencher `window.print()` avec une feuille CSS `@media print` optimisée qui masque la navigation, ajuste les graphiques pour l'impression, et force un format A4

### Requirement: Statistiques résumées en en-tête
Le système SHALL afficher des statistiques résumées en haut de la page publique.

#### Scenario: Affichage des statistiques
- **WHEN** le rapport 2026 a des snapshots avec 45 organisations et 312 équipes
- **THEN** le système MUST afficher en évidence : le nombre d'organisations participantes (45), le nombre total d'équipes (somme des `team_count`), le score global moyen, et le niveau de maturité moyen

### Requirement: Query getAggregatedStats
Le système SHALL fournir une query `getAggregatedStats(year)` retournant les statistiques globales pour la page publique.

#### Scenario: Statistiques globales
- **WHEN** `getAggregatedStats(2026)` est appelé
- **THEN** le système MUST retourner : le nombre total d'organisations, le nombre total d'équipes, le score global moyen, la distribution par niveau (count et pourcentage pour chaque niveau 1-4), les scores moyens par dimension, et les scores moyens par segment (secteur, taille)

### Requirement: Navigation entre années
Le système SHALL afficher un sélecteur d'année permettant de consulter les rapports des années précédentes.

#### Scenario: Plusieurs rapports publiés
- **WHEN** des rapports sont publiés pour 2025 et 2026
- **THEN** le système MUST afficher un sélecteur d'année permettant de naviguer entre les deux rapports
