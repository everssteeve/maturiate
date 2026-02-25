## 1. Project Scaffolding

- [x] 1.1 Scaffold Next.js 15 project with `pnpm create next-app@latest` (TypeScript, Tailwind, ESLint, App Router, src dir, `@/` alias)
- [x] 1.2 Configure Prettier (`.prettierrc` with project conventions: semi, double quotes, trailing comma, tabWidth 2, printWidth 100) and add `format` script to package.json
- [x] 1.3 Create `.env.example` with all required environment variables (DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, MICROSOFT_CLIENT_ID, MICROSOFT_CLIENT_SECRET, RESEND_API_KEY, STATE_OF_IA_HASH_SALT, CRON_SECRET)
- [x] 1.4 Configure security headers in `next.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [x] 1.5 Create complete directory structure per ARCHITECTURE.md: `src/app/(auth)/`, `src/app/(dashboard)/`, `src/app/(public)/`, `src/app/admin/`, `src/app/api/auth/[...all]/`, `src/app/api/cron/`, `src/components/{ui,charts,diagnostic,dashboard,layout}/`, `src/lib/{db,auth,email/templates,queries,actions}/`, `src/data/`, `src/types/`
- [x] 1.6 Update `.gitignore` for Next.js/Node.js project (node_modules, .next, .env.local, *.tsbuildinfo)

## 2. Dependencies Installation

- [x] 2.1 Install core dependencies: `drizzle-orm`, `@neondatabase/serverless`, `zod`, `recharts`, `resend`, `@react-email/components`, `better-auth`, `clsx`, `tailwind-merge`
- [x] 2.2 Install dev dependencies: `drizzle-kit`, `vitest`, `@vitejs/plugin-react`, `@playwright/test`, `prettier`, `@testing-library/react`, `@testing-library/jest-dom`
- [x] 2.3 Initialize shadcn/ui via `npx shadcn@latest init` and install base components: button, card, input, label, dialog, dropdown-menu, badge, separator, tabs, select

## 3. Database Schema & Configuration

- [x] 3.1 Create `src/lib/db/index.ts` — Drizzle client with Neon serverless connection
- [x] 3.2 Create `src/lib/db/schema.ts` — Complete Drizzle schema: all enums (member_role, campaign_status, question_type, org_sector, org_size), all tables (users, organizations, memberships, teams, team_members, campaigns, bonus_questions, diagnostics, share_links, invitations, state_of_ia_snapshots, state_of_ia_reports), and Better Auth tables (sessions, accounts, verifications)
- [x] 3.3 Define Drizzle relations (organizations → memberships/teams/campaigns, teams → diagnostics/members, diagnostics → team/campaign/user)
- [x] 3.4 Create `drizzle.config.ts` pointing to schema and migrations directory
- [x] 3.5 Generate initial migration with `pnpm drizzle-kit generate`

## 4. Authentication Setup

- [x] 4.1 Create `src/lib/auth/index.ts` — Better Auth configuration with Drizzle adapter, Magic Link and OAuth providers (Google, Microsoft)
- [x] 4.2 Create `src/app/api/auth/[...all]/route.ts` — Better Auth catch-all route handler
- [x] 4.3 Create `src/middleware.ts` — Next.js middleware protecting `/(dashboard)/` routes, redirecting to `/login` if unauthenticated

## 5. UI Foundation

- [x] 5.1 Create `src/lib/utils.ts` — Export `cn()` utility using clsx + tailwind-merge
- [x] 5.2 Configure root layout (`src/app/layout.tsx`) with font (DM Sans or Inter), `lang="fr"`, and base HTML structure
- [x] 5.3 Configure `src/app/global.css` with Tailwind v4 (`@import "tailwindcss"`) and `@theme` tokens for the design system

## 6. Business Constants

- [x] 6.1 Create `src/data/dimensions.ts` — 6 dimensions with id, label, short, description (IDs: tools, process, docs, quality, collab, vision)
- [x] 6.2 Create `src/data/questions.ts` — 14 core questions with id (q_0 to q_13), dimensionId, text, options (4 choices per question, in French)
- [x] 6.3 Create `src/data/levels.ts` — 4 maturity levels with level number, name, description, minScore, maxScore (covering 1.0 to 4.0)
- [x] 6.4 Create `src/data/recommendations.ts` — Recommendations mapped by dimension ID × level (1-4), in French
- [x] 6.5 Create `src/types/index.ts` — Export types: Dimension, Question, Level, DimensionId, DimensionScores, DiagnosticAnswers (inferred from constants and schema)

## 7. Permissions System

- [x] 7.1 Create `src/lib/permissions.ts` — `requireRole(orgId, ...roles)` function that checks session, verifies membership and role, returns `{ user, membership }` or throws/redirects
- [x] 7.2 Add `requireSuperAdmin()` function for back-office AIAD routes (checks `isSuperAdmin` flag)

## 8. Testing Infrastructure

- [x] 8.1 Create `vitest.config.ts` with path alias resolution (`@/` → `src/`), React plugin, and test patterns
- [x] 8.2 Create `playwright.config.ts` with base URL, test directory (`tests/e2e/`), and Chromium project
- [x] 8.3 Create test directory structure: `tests/unit/`, `tests/integration/`, `tests/e2e/`
- [x] 8.4 Add npm scripts: `test` (vitest), `test:e2e` (playwright), and drizzle-kit scripts (generate, migrate, studio)
- [x] 8.5 Create sample unit test in `tests/unit/example.test.ts` to verify Vitest setup works

## 9. Verification

- [x] 9.1 Verify `pnpm build` completes without errors
- [x] 9.2 Verify `pnpm dev` starts the development server
- [x] 9.3 Verify `pnpm lint` runs without configuration errors
- [x] 9.4 Verify `pnpm test` discovers and passes the sample test
