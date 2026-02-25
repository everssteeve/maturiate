## ADDED Requirements

### Requirement: Drizzle ORM configured with Neon PostgreSQL
The system SHALL use Drizzle ORM connected to Neon PostgreSQL (EU-Frankfurt) with a properly configured `drizzle.config.ts`.

#### Scenario: Drizzle client initializes
- **WHEN** importing `db` from `@/lib/db`
- **THEN** it MUST return a configured Drizzle client connected to the Neon database via the `DATABASE_URL` environment variable

#### Scenario: Drizzle config is valid
- **WHEN** running `pnpm drizzle-kit generate`
- **THEN** Drizzle Kit MUST read the schema from `src/lib/db/schema.ts` and generate SQL migration files in `src/lib/db/migrations/`

### Requirement: Complete database schema
The schema SHALL define all tables, enums, and relations as specified in ARCHITECTURE.md section 7.

#### Scenario: All enums defined
- **WHEN** inspecting the schema
- **THEN** it MUST define the following pgEnums: `member_role` (admin, manager, member, consultant), `campaign_status` (draft, active, closed), `question_type` (core, bonus), `org_sector` (esn, editor, dsi, startup, other), `org_size` (1-10, 11-50, 51-200, 201-1000, 1000+)

#### Scenario: All tables defined
- **WHEN** inspecting the schema
- **THEN** it MUST define the following tables: `users`, `organizations`, `memberships`, `teams`, `team_members`, `campaigns`, `bonus_questions`, `diagnostics`, `share_links`, `invitations`, `state_of_ia_snapshots`, `state_of_ia_reports`

#### Scenario: Users table structure
- **WHEN** inspecting the `users` table
- **THEN** it MUST have columns: `id` (uuid, PK), `name` (text, not null), `email` (text, unique, not null), `email_verified` (boolean, default false), `image` (text, nullable), `is_super_admin` (boolean, default false), `created_at` (timestamp), `updated_at` (timestamp)

#### Scenario: Multi-tenant foreign keys
- **WHEN** inspecting tables that belong to an organization (teams, campaigns, diagnostics, etc.)
- **THEN** each MUST have an `org_id` foreign key referencing `organizations.id` with `onDelete: cascade`

#### Scenario: JSONB columns typed correctly
- **WHEN** inspecting JSONB columns
- **THEN** `diagnostics.answers` MUST be typed as `Record<string, number>`, `diagnostics.dimension_scores` MUST be typed as `Record<string, number>`, `bonus_questions.options` MUST be typed as `string[]`

### Requirement: Drizzle relations defined
The schema SHALL define Drizzle relations for type-safe query building.

#### Scenario: Organization relations
- **WHEN** inspecting organization relations
- **THEN** organizations MUST have `many` relations to: memberships, teams, campaigns

#### Scenario: Team relations
- **WHEN** inspecting team relations
- **THEN** teams MUST have: `one` relation to organization, `many` relations to diagnostics and team_members

#### Scenario: Diagnostic relations
- **WHEN** inspecting diagnostic relations
- **THEN** diagnostics MUST have: `one` relation to team, `one` nullable relation to campaign, `one` relation to filledByUser

### Requirement: Initial migration generated
The project SHALL include a generated initial migration SQL file.

#### Scenario: Migration file exists
- **WHEN** inspecting `src/lib/db/migrations/`
- **THEN** there MUST be at least one migration SQL file creating all tables and enums
