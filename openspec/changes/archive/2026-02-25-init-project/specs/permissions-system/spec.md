## ADDED Requirements

### Requirement: requireRole function for multi-tenant authorization
The system SHALL provide a `requireRole` function in `src/lib/permissions.ts` that verifies a user's role within an organization before allowing access.

#### Scenario: Authenticated user with allowed role
- **WHEN** calling `requireRole(orgId, "admin", "manager")` and the current user has "admin" or "manager" role in that organization
- **THEN** it MUST return an object containing `{ user, membership }` without throwing

#### Scenario: Authenticated user without allowed role
- **WHEN** calling `requireRole(orgId, "admin")` and the current user has "member" role in that organization
- **THEN** it MUST throw an error with message "Forbidden"

#### Scenario: Unauthenticated user
- **WHEN** calling `requireRole(orgId, ...roles)` and there is no active session
- **THEN** it MUST redirect to `/login`

#### Scenario: User not member of organization
- **WHEN** calling `requireRole(orgId, ...roles)` and the current user has no membership in that organization
- **THEN** it MUST throw an error with message "Forbidden"

### Requirement: Role type definition
The system SHALL define a `Role` type covering all organization-level roles.

#### Scenario: Role type
- **WHEN** importing `Role` from `@/lib/permissions`
- **THEN** it MUST be a union type of `"admin" | "manager" | "member" | "consultant"`

### Requirement: requireSuperAdmin function
The system SHALL provide a `requireSuperAdmin` function for back-office AIAD routes.

#### Scenario: Super admin access
- **WHEN** calling `requireSuperAdmin()` and the current user has `isSuperAdmin: true`
- **THEN** it MUST return the user object without throwing

#### Scenario: Non super admin access
- **WHEN** calling `requireSuperAdmin()` and the current user has `isSuperAdmin: false`
- **THEN** it MUST throw an error with message "Forbidden"
