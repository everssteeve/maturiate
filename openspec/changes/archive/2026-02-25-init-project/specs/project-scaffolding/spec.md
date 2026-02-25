## ADDED Requirements

### Requirement: Next.js 15 project with App Router and TypeScript
The system SHALL be scaffolded as a Next.js 15 project using the App Router with TypeScript, pnpm as package manager, and `src/` directory structure.

#### Scenario: Project created with correct configuration
- **WHEN** the project is scaffolded via `pnpm create next-app@latest`
- **THEN** the project MUST use Next.js 15.x, React 19.x, TypeScript 5.7+, App Router, and `src/` directory with `@/` import alias

#### Scenario: Project builds successfully
- **WHEN** running `pnpm build`
- **THEN** the build MUST complete without errors

#### Scenario: Development server starts
- **WHEN** running `pnpm dev`
- **THEN** the development server MUST start and serve the application on localhost:3000

### Requirement: Directory structure matches ARCHITECTURE.md
The project SHALL follow the exact directory structure defined in ARCHITECTURE.md section 3, with all directories created and placeholder files where needed.

#### Scenario: All source directories exist
- **WHEN** inspecting the project structure
- **THEN** the following directories MUST exist: `src/app/(auth)/`, `src/app/(dashboard)/`, `src/app/(public)/`, `src/app/admin/`, `src/app/api/`, `src/components/ui/`, `src/components/charts/`, `src/components/diagnostic/`, `src/components/dashboard/`, `src/components/layout/`, `src/lib/db/`, `src/lib/auth/`, `src/lib/email/templates/`, `src/lib/queries/`, `src/lib/actions/`, `src/data/`, `src/types/`

### Requirement: ESLint 9 and Prettier configured
The system SHALL use ESLint 9 (flat config) with Next.js and TypeScript plugins, and Prettier with the project's formatting rules.

#### Scenario: Linting runs without configuration errors
- **WHEN** running `pnpm lint`
- **THEN** ESLint MUST execute and report any code issues (or pass cleanly)

#### Scenario: Prettier configuration matches conventions
- **WHEN** inspecting `.prettierrc`
- **THEN** the configuration MUST include: `semi: true`, `singleQuote: false`, `trailingComma: "all"`, `tabWidth: 2`, `printWidth: 100`

#### Scenario: Format command works
- **WHEN** running `pnpm format`
- **THEN** Prettier MUST format all project files according to the configuration

### Requirement: Tailwind CSS v4 configured
The system SHALL use Tailwind CSS v4 with the CSS-first configuration approach.

#### Scenario: Tailwind classes are processed
- **WHEN** using Tailwind utility classes in a component
- **THEN** the classes MUST be compiled and applied correctly in both dev and build modes

### Requirement: Environment variables template
The project SHALL include a `.env.example` file listing all required environment variables.

#### Scenario: All required variables documented
- **WHEN** inspecting `.env.example`
- **THEN** it MUST contain: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `RESEND_API_KEY`, `STATE_OF_IA_HASH_SALT`, `CRON_SECRET`

### Requirement: Git configuration
The project SHALL include a `.gitignore` file appropriate for Next.js/Node.js projects.

#### Scenario: Sensitive files excluded
- **WHEN** inspecting `.gitignore`
- **THEN** it MUST exclude: `node_modules/`, `.next/`, `.env.local`, `.env*.local`, `*.tsbuildinfo`

### Requirement: Security headers configured
The project SHALL configure security headers in `next.config.ts` as defined in ARCHITECTURE.md section 9.

#### Scenario: Headers are set
- **WHEN** inspecting `next.config.ts`
- **THEN** it MUST configure: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`
