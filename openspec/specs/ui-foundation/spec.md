## ADDED Requirements

### Requirement: shadcn/ui initialized with base components
The system SHALL initialize shadcn/ui via its CLI and install a set of base components needed across the application.

#### Scenario: shadcn/ui configuration exists
- **WHEN** inspecting the project
- **THEN** `components.json` MUST exist with the correct configuration for path aliases, Tailwind v4, and `src/components/ui/` as the component directory

#### Scenario: Base components installed
- **WHEN** inspecting `src/components/ui/`
- **THEN** the following components MUST be present: `button.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `dialog.tsx`, `dropdown-menu.tsx`, `badge.tsx`, `separator.tsx`, `tabs.tsx`, `select.tsx`

### Requirement: cn utility function
The system SHALL provide a `cn()` utility function for merging Tailwind classes.

#### Scenario: cn utility available
- **WHEN** importing `cn` from `@/lib/utils`
- **THEN** it MUST be a function that merges class names using `clsx` and `tailwind-merge`

### Requirement: Root layout with font and providers
The system SHALL have a root layout (`src/app/layout.tsx`) that configures the font (DM Sans or Inter) and wraps the application with necessary providers.

#### Scenario: Root layout renders
- **WHEN** the application loads
- **THEN** the root layout MUST apply the configured font family and include the necessary HTML structure (html, body) with proper lang attribute set to "fr"

### Requirement: Global CSS with Tailwind v4
The system SHALL have a `global.css` file using the Tailwind v4 CSS-first approach.

#### Scenario: Tailwind directives present
- **WHEN** inspecting `src/app/global.css`
- **THEN** it MUST include `@import "tailwindcss"` and define theme tokens via `@theme` for the project's design system
