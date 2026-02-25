## Why

Le projet maturIAté est entièrement conçu (PRD, ARCHITECTURE, STACK_ANALYSIS) mais aucun code source n'existe. Pour commencer l'implémentation des fonctionnalités métier, il faut d'abord initialiser le socle technique : scaffolding Next.js 15, configuration de toutes les dépendances, structure des dossiers, schéma DB Drizzle, constantes métier, et infrastructure de test.

## What Changes

- Scaffolding du projet Next.js 15 (App Router) avec TypeScript et pnpm
- Configuration complète : ESLint 9, Prettier, Tailwind CSS v4, path aliases (`@/`)
- Installation et configuration de toutes les dépendances : shadcn/ui, Drizzle ORM, Zod, Better Auth, Recharts, Resend, React Email
- Création de la structure de dossiers conforme à ARCHITECTURE.md (`src/app/`, `src/components/`, `src/lib/`, `src/data/`, `src/types/`)
- Schéma Drizzle complet (toutes les tables : organizations, users, teams, diagnostics, campaigns, etc.) + configuration Neon
- Constantes métier TypeScript : 6 dimensions, 14 questions core, 4 niveaux de maturité, recommandations
- Système de permissions (`lib/permissions.ts`) avec les 5 rôles
- Setup Vitest (unitaire) + Playwright (E2E)
- Fichiers d'environnement (`.env.example`), `.gitignore`, configuration Vercel

## Capabilities

### New Capabilities

- `project-scaffolding`: Initialisation Next.js 15, configuration TypeScript, ESLint, Prettier, Tailwind v4, pnpm, path aliases
- `database-schema`: Schéma Drizzle ORM complet avec toutes les tables du modèle de données, configuration Neon PostgreSQL, migration initiale
- `auth-setup`: Configuration Better Auth (Magic Link + OAuth), middleware d'authentification, route handler
- `ui-foundation`: Installation shadcn/ui, composants de base, thème, layout tokens, global CSS
- `business-constants`: Constantes TypeScript des 6 dimensions, 14 questions, 4 niveaux de maturité, recommandations
- `permissions-system`: Module de vérification des rôles et permissions multi-tenant (admin, manager, member, consultant, super-admin)
- `testing-infrastructure`: Configuration Vitest + Playwright, helpers de test, scripts npm

### Modified Capabilities

_(Aucune — projet greenfield, pas de capabilities existantes)_

## Impact

- **Code** : Création de l'intégralité du socle technique (~40+ fichiers)
- **Dépendances** : next, react, tailwindcss, drizzle-orm, better-auth, recharts, resend, react-email, zod, vitest, playwright, et leurs peer dependencies
- **Base de données** : Création du schéma complet (10+ tables) sur Neon PostgreSQL EU-Frankfurt
- **Infrastructure** : Configuration Vercel (next.config.ts, vercel.json si nécessaire), variables d'environnement requises
- **DX** : Tous les scripts npm fonctionnels (`dev`, `build`, `lint`, `format`, `test`, `test:e2e`, `drizzle-kit generate/migrate/studio`)
