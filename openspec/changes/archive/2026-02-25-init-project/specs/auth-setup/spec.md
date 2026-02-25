## ADDED Requirements

### Requirement: Better Auth configured with Drizzle adapter
The system SHALL configure Better Auth with the Drizzle ORM adapter, storing auth data (sessions, accounts, verifications) in the same PostgreSQL database.

#### Scenario: Auth configuration exports
- **WHEN** importing from `@/lib/auth`
- **THEN** it MUST export an `auth` object configured with Better Auth, including the Drizzle adapter and email+password disabled (Magic Link only in V1)

#### Scenario: Auth tables in schema
- **WHEN** inspecting the Drizzle schema
- **THEN** it MUST include Better Auth required tables: `sessions`, `accounts`, `verifications` (managed by the Better Auth Drizzle plugin)

### Requirement: Auth API route handler
The system SHALL expose Better Auth endpoints via a Next.js catch-all API route.

#### Scenario: Auth route handler exists
- **WHEN** a request is made to `/api/auth/*`
- **THEN** it MUST be handled by the Better Auth route handler in `src/app/api/auth/[...all]/route.ts`

### Requirement: Session helper for Server Components
The system SHALL provide a helper to retrieve the current user session in Server Components and Server Actions.

#### Scenario: Session retrieval in Server Component
- **WHEN** calling `auth.api.getSession({ headers: await headers() })` in a Server Component
- **THEN** it MUST return the session object if authenticated, or `null` if not

### Requirement: Auth middleware for protected routes
The system SHALL include a Next.js middleware that protects dashboard routes by redirecting unauthenticated users to the login page.

#### Scenario: Unauthenticated user accessing dashboard
- **WHEN** an unauthenticated user navigates to any route under `/(dashboard)/`
- **THEN** they MUST be redirected to `/login`

#### Scenario: Authenticated user accessing dashboard
- **WHEN** an authenticated user navigates to any route under `/(dashboard)/`
- **THEN** they MUST be allowed through without redirect
