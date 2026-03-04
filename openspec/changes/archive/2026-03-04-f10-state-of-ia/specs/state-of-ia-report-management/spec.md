## ADDED Requirements

### Requirement: Gestion CRUD du rapport annuel
Le système SHALL permettre aux super-admins de créer, éditer et publier le rapport annuel State of IA via le back-office.

#### Scenario: Création d'un nouveau rapport
- **WHEN** un super-admin clique sur "Créer le rapport" pour l'année 2026 sur la page `/admin/state-of-ia`
- **THEN** le système MUST créer un enregistrement dans `state_of_ia_reports` avec `year: 2026`, `content` initialisé avec la structure par défaut (introduction vide, sections vides, keyInsights vide, methodology vide), `published_at: null`, et `created_by` avec l'ID de l'utilisateur

#### Scenario: Rapport déjà existant pour l'année
- **WHEN** un super-admin tente de créer un rapport pour une année qui en a déjà un
- **THEN** le système MUST afficher une erreur "Un rapport existe déjà pour l'année {année}" et proposer de l'éditer

### Requirement: Éditeur de contenu du rapport
Le système SHALL fournir un formulaire d'édition structuré pour le contenu du rapport, organisé en sections.

#### Scenario: Édition de l'introduction
- **WHEN** un super-admin accède à l'éditeur du rapport 2026
- **THEN** le système MUST afficher un champ texte riche (textarea avec support Markdown) pour l'introduction

#### Scenario: Gestion des sections
- **WHEN** un super-admin édite le rapport
- **THEN** le système MUST permettre d'ajouter, réordonner et supprimer des sections. Chaque section comporte : un titre (texte), un corps (Markdown), et un type de graphique optionnel (`distribution`, `dimensions`, `trends`, `segments`)

#### Scenario: Édition des insights clés
- **WHEN** un super-admin édite les insights
- **THEN** le système MUST afficher une liste éditable de textes courts (les key insights), avec possibilité d'ajouter, modifier et supprimer des entrées

#### Scenario: Édition de la méthodologie
- **WHEN** un super-admin édite la section méthodologie
- **THEN** le système MUST afficher un champ Markdown pour expliquer la méthodologie de collecte et d'anonymisation

#### Scenario: Sauvegarde automatique
- **WHEN** un super-admin modifie une section du rapport
- **THEN** le système MUST sauvegarder automatiquement après 2 secondes d'inactivité (debounce) et afficher un indicateur "Sauvegardé" ou "Sauvegarde en cours..."

### Requirement: Publication du rapport
Le système SHALL permettre à un super-admin de publier un rapport, le rendant accessible sur la page publique.

#### Scenario: Publication
- **WHEN** un super-admin clique sur "Publier" pour un rapport non publié
- **THEN** le système MUST mettre à jour `published_at` avec la date courante
- **AND** le rapport MUST devenir accessible sur `/state-of-ia/{année}`
- **AND** les benchmarks "Mon positionnement" MUST se mettre à jour pour refléter les données de cette année

#### Scenario: Dépublication
- **WHEN** un super-admin clique sur "Dépublier" pour un rapport publié
- **THEN** le système MUST remettre `published_at` à `null`
- **AND** la page publique MUST retourner une 404 pour cette année

#### Scenario: Publication sans snapshots
- **WHEN** un super-admin tente de publier un rapport pour une année sans snapshots extraits
- **THEN** le système MUST afficher un avertissement "Aucune donnée extraite pour {année}. Le rapport sera publié sans graphiques de données."

### Requirement: Prévisualisation du rapport
Le système SHALL permettre au super-admin de prévisualiser le rapport tel qu'il apparaîtra sur la page publique.

#### Scenario: Prévisualisation
- **WHEN** un super-admin clique sur "Prévisualiser"
- **THEN** le système MUST ouvrir un nouvel onglet affichant le rapport avec le même rendu que la page publique, mais avec une bannière "Prévisualisation — Non publié" si le rapport n'est pas encore publié

### Requirement: Server Actions pour la gestion du rapport
Le système SHALL fournir les Server Actions suivantes : `createReport`, `updateReport`, `publishReport`, `unpublishReport`.

#### Scenario: createReport
- **WHEN** un super-admin appelle `createReport({ year: 2026 })`
- **THEN** le système MUST vérifier `isSuperAdmin`, vérifier qu'aucun rapport n'existe pour cette année, créer l'enregistrement avec le contenu par défaut, et retourner l'ID du rapport

#### Scenario: updateReport
- **WHEN** un super-admin appelle `updateReport({ reportId, content })`
- **THEN** le système MUST valider le contenu avec le schéma Zod `ReportContent`, mettre à jour le champ `content` et `updated_at`

#### Scenario: publishReport
- **WHEN** un super-admin appelle `publishReport({ reportId })`
- **THEN** le système MUST mettre à jour `published_at` avec la date courante

#### Scenario: unpublishReport
- **WHEN** un super-admin appelle `unpublishReport({ reportId })`
- **THEN** le système MUST remettre `published_at` à `null`
