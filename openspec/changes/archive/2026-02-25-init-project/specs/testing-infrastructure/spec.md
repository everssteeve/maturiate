## ADDED Requirements

### Requirement: Vitest configured for unit and integration tests
The system SHALL configure Vitest with TypeScript support, path aliases (`@/` → `src/`), and React testing support.

#### Scenario: Vitest config exists
- **WHEN** inspecting `vitest.config.ts`
- **THEN** it MUST configure: path alias resolution for `@/`, TypeScript support, and test file patterns (`tests/**/*.test.ts`, `tests/**/*.test.tsx`)

#### Scenario: Test command runs
- **WHEN** running `pnpm test`
- **THEN** Vitest MUST execute and discover test files in the `tests/` directory

### Requirement: Test directory structure
The system SHALL create the test directory structure as defined in ARCHITECTURE.md section 8.

#### Scenario: Test directories exist
- **WHEN** inspecting the project
- **THEN** the following directories MUST exist: `tests/unit/`, `tests/integration/`, `tests/e2e/`

### Requirement: Playwright configured for E2E tests
The system SHALL configure Playwright for end-to-end testing.

#### Scenario: Playwright config exists
- **WHEN** inspecting `playwright.config.ts`
- **THEN** it MUST configure: base URL as `http://localhost:3000`, test directory as `tests/e2e/`, and at least Chromium as a browser project

#### Scenario: E2E test command runs
- **WHEN** running `pnpm test:e2e`
- **THEN** Playwright MUST execute and discover test files in `tests/e2e/`

### Requirement: Sample unit test
The project SHALL include at least one example unit test to verify the testing setup works.

#### Scenario: Example test passes
- **WHEN** running `pnpm test`
- **THEN** at least one test in `tests/unit/` MUST discover and pass successfully
