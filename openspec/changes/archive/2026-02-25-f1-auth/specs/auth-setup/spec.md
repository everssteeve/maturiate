## MODIFIED Requirements

### Requirement: Better Auth configured with Drizzle adapter
The system SHALL configure Better Auth with the Drizzle ORM adapter, storing auth data (sessions, accounts, verifications) in the same PostgreSQL database. The configuration SHALL include the Magic Link plugin with Resend email integration.

#### Scenario: Auth configuration exports
- **WHEN** importing from `@/lib/auth`
- **THEN** it MUST export an `auth` object configured with Better Auth, including the Drizzle adapter, email+password disabled, and the Magic Link plugin enabled

#### Scenario: Auth tables in schema
- **WHEN** inspecting the Drizzle schema
- **THEN** it MUST include Better Auth required tables: `sessions`, `accounts`, `verifications` (managed by the Better Auth Drizzle plugin)

#### Scenario: Magic Link plugin configured
- **WHEN** Better Auth is initialized
- **THEN** the Magic Link plugin MUST be configured with a `sendMagicLink` function that sends emails via Resend using the React Email template, with 10-minute token expiration

#### Scenario: Social providers configured conditionally
- **WHEN** Google OAuth environment variables are defined (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
- **THEN** Google social provider MUST be available for sign-in
- **WHEN** Microsoft OAuth environment variables are defined (`MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`)
- **THEN** Microsoft social provider MUST be available for sign-in
