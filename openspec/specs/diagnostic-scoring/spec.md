## ADDED Requirements

### Requirement: Calcul des scores par dimension
Le système DOIT calculer un score par dimension en faisant la moyenne des réponses (1-4) de toutes les questions core appartenant à cette dimension. Le score par dimension est un nombre décimal entre 1.0 et 4.0.

#### Scenario: Calcul du score d'une dimension avec toutes les réponses au maximum
- **WHEN** toutes les questions d'une dimension ont la réponse 4
- **THEN** le score de cette dimension est 4.0

#### Scenario: Calcul du score d'une dimension avec des réponses mixtes
- **WHEN** une dimension a 3 questions avec les réponses [1, 3, 2]
- **THEN** le score de cette dimension est 2.0

#### Scenario: Calcul du score d'une dimension avec toutes les réponses au minimum
- **WHEN** toutes les questions d'une dimension ont la réponse 1
- **THEN** le score de cette dimension est 1.0

### Requirement: Calcul du score global
Le système DOIT calculer le score global comme la moyenne des 6 scores de dimension. Le score global est un nombre décimal entre 1.0 et 4.0, arrondi à 2 décimales.

#### Scenario: Score global avec des scores de dimensions uniformes
- **WHEN** les 6 dimensions ont toutes un score de 3.0
- **THEN** le score global est 3.0

#### Scenario: Score global avec des scores de dimensions variés
- **WHEN** les scores par dimension sont [1.0, 2.0, 3.0, 4.0, 2.5, 3.5]
- **THEN** le score global est 2.67

### Requirement: Détermination du niveau de maturité
Le système DOIT déterminer le niveau de maturité (1-4) à partir du score global selon les seuils définis dans `data/levels.ts` :
- Niveau 1 "Découverte" : score >= 1.0 et < 1.75
- Niveau 2 "Exploration" : score >= 1.75 et < 2.5
- Niveau 3 "Intégration" : score >= 2.5 et < 3.25
- Niveau 4 "Transformation" : score >= 3.25 et <= 4.0

#### Scenario: Score en zone Découverte
- **WHEN** le score global est 1.5
- **THEN** le niveau de maturité est 1 ("Découverte")

#### Scenario: Score en zone Exploration
- **WHEN** le score global est 2.0
- **THEN** le niveau de maturité est 2 ("Exploration")

#### Scenario: Score en zone Intégration
- **WHEN** le score global est 3.0
- **THEN** le niveau de maturité est 3 ("Intégration")

#### Scenario: Score en zone Transformation
- **WHEN** le score global est 3.5
- **THEN** le niveau de maturité est 4 ("Transformation")

#### Scenario: Score exactement à la frontière
- **WHEN** le score global est exactement 2.5
- **THEN** le niveau de maturité est 3 ("Intégration")

### Requirement: Les questions bonus ne comptent pas dans le score
Le système NE DOIT PAS inclure les réponses aux questions bonus dans le calcul des scores par dimension ni du score global. Les réponses bonus sont stockées séparément (`bonusAnswers`) pour consultation uniquement.

#### Scenario: Diagnostic avec questions bonus
- **WHEN** un diagnostic contient des réponses core et des réponses bonus
- **THEN** le score global et les scores par dimension sont calculés uniquement à partir des réponses core

### Requirement: Fonction de scoring pure et testable
La fonction `computeScores` dans `lib/scoring.ts` DOIT être une fonction pure qui prend un `Record<string, number>` (réponses) et retourne un objet `{ dimensionScores: DimensionScores, globalScore: number, globalLevel: number }`. Elle ne DOIT avoir aucune dépendance à la base de données.

#### Scenario: Appel de computeScores avec des réponses valides
- **WHEN** `computeScores` est appelée avec 14 réponses core valides (valeurs 1-4)
- **THEN** elle retourne un objet avec `dimensionScores` (6 dimensions), `globalScore` (1.0-4.0) et `globalLevel` (1-4)
