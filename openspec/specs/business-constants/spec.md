## ADDED Requirements

### Requirement: Six dimensions defined as TypeScript constants
The system SHALL define the 6 maturity dimensions as a typed constant array in `src/data/dimensions.ts`.

#### Scenario: Dimensions array exported
- **WHEN** importing `DIMENSIONS` from `@/data/dimensions`
- **THEN** it MUST export an array of 6 dimension objects, each with: `id` (string, e.g. "tools"), `label` (string, French display name), `short` (string, short label), `description` (string, French explanation)

#### Scenario: Dimension IDs match JSONB keys
- **WHEN** checking dimension IDs
- **THEN** they MUST be exactly: `"tools"`, `"process"`, `"docs"`, `"quality"`, `"collab"`, `"vision"` — matching the keys used in `diagnostics.dimension_scores` JSONB column

### Requirement: Fourteen core questions defined as TypeScript constants
The system SHALL define the 14 core questions as a typed constant array in `src/data/questions.ts`.

#### Scenario: Questions array exported
- **WHEN** importing `QUESTIONS` from `@/data/questions`
- **THEN** it MUST export an array of 14 question objects, each with: `id` (string, "q_0" to "q_13"), `dimensionId` (string, referencing a dimension ID), `text` (string, question text in French), `options` (array of 4 strings, representing levels 1-4 in French)

#### Scenario: Each dimension has at least one question
- **WHEN** grouping questions by `dimensionId`
- **THEN** each of the 6 dimensions MUST have at least one question assigned

#### Scenario: Question IDs match JSONB keys
- **WHEN** checking question IDs
- **THEN** they MUST be exactly `"q_0"` through `"q_13"` — matching the keys used in `diagnostics.answers` JSONB column

### Requirement: Four maturity levels defined as TypeScript constants
The system SHALL define the 4 maturity levels in `src/data/levels.ts`.

#### Scenario: Levels array exported
- **WHEN** importing `LEVELS` from `@/data/levels`
- **THEN** it MUST export an array of 4 level objects, each with: `level` (number, 1-4), `name` (string, French name), `description` (string, French description), `minScore` (number, minimum score threshold), `maxScore` (number, maximum score threshold)

#### Scenario: Score thresholds cover full range
- **WHEN** checking level thresholds
- **THEN** level 1 MUST start at 1.0, level 4 MUST end at 4.0, and there MUST be no gaps between levels

### Requirement: Recommendations defined per dimension and level
The system SHALL define recommendations in `src/data/recommendations.ts`.

#### Scenario: Recommendations structure
- **WHEN** importing from `@/data/recommendations`
- **THEN** it MUST export a structure mapping each combination of dimension ID and level (1-4) to a recommendation text in French

### Requirement: Type exports for business constants
The system SHALL export TypeScript types inferred from the business constants in `src/types/index.ts`.

#### Scenario: Types available
- **WHEN** importing from `@/types`
- **THEN** it MUST export types: `Dimension`, `Question`, `Level`, `DimensionId`, `DimensionScores` (Record<DimensionId, number>), `DiagnosticAnswers` (Record<string, number>)
