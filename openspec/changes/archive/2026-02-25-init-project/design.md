## Context

Le projet maturIAté est un greenfield — aucun code source n'existe. Trois documents fondateurs complets (PRD.md, ARCHITECTURE.md, STACK_ANALYSIS.md) définissent la vision produit, la stack technique, et l'architecture cible. L'objectif est d'initialiser un socle technique entièrement fonctionnel qui permettra d'implémenter les fonctionnalités métier (F1-F10) immédiatement après.

Contraintes :
- Stack figée : Next.js 15 App Router, TypeScript, Tailwind v4, shadcn/ui, Drizzle ORM, Neon PostgreSQL, Better Auth, Resend, Vitest, Playwright, pnpm
- Structure des dossiers définie dans ARCHITECTURE.md (section 3)
- Schéma DB complet fourni dans ARCHITECTURE.md (section 7)
- Conventions de code strictes (section 4 de ARCHITECTURE.md)
- Les 14 questions core et les 6 dimensions sont des constantes, pas des lignes DB

## Goals / Non-Goals

**Goals:**
- Projet Next.js 15 qui build et démarre sans erreur (`pnpm dev`, `pnpm build`)
- Toutes les dépendances installées et configurées (TypeScript, ESLint 9, Prettier, Tailwind v4, shadcn/ui, Drizzle, Zod, Better Auth, Recharts, Resend, React Email)
- Structure de dossiers complète conforme à ARCHITECTURE.md avec fichiers placeholder là où nécessaire
- Schéma Drizzle complet (toutes les tables, enums, relations) avec migration initiale générée
- Constantes métier TypeScript (dimensions, questions, niveaux, recommandations)
- Configuration DB Neon (connection pooling, drizzle.config.ts)
- Configuration Better Auth minimale fonctionnelle (route handler, session helpers)
- Module de permissions (`requireRole`) fonctionnel
- Setup Vitest + Playwright avec configuration et exemples
- `.env.example` avec toutes les variables requises
- Scripts npm complets : dev, build, lint, format, test, test:e2e, drizzle-kit generate/migrate/studio

**Non-Goals:**
- Implémenter les fonctionnalités métier (pages, composants, server actions) — seuls les fichiers vides ou les stubs sont créés
- Déployer sur Vercel ou configurer le CI/CD
- Créer le seed data complet (simple placeholder)
- Configurer les domaines email Resend ou les OAuth providers réels
- Styler l'application au-delà du thème de base shadcn/ui

## Decisions

### D1 : Scaffolding via `create-next-app` puis customisation

**Choix** : Utiliser `pnpm create next-app@latest` avec les flags `--typescript --tailwind --eslint --app --src-dir --import-alias "@/*"` puis personnaliser.

**Alternatives considérées** :
- Création manuelle fichier par fichier : plus de contrôle mais lent et risque d'erreurs de configuration
- Template custom pré-fait : n'existe pas pour cette stack spécifique

**Raison** : `create-next-app` génère la configuration de base correcte (tsconfig, next.config, eslint, tailwind) que l'on customise ensuite. Plus fiable que de créer manuellement.

### D2 : Tailwind CSS v4 avec le nouveau système CSS-first

**Choix** : Tailwind v4 utilise un fichier CSS (`@import "tailwindcss"`) au lieu d'un `tailwind.config.ts`. La configuration se fait dans `global.css` via `@theme`.

**Raison** : Next.js 15 + `create-next-app` latest génère déjà du Tailwind v4. shadcn/ui supporte v4 via son CLI.

### D3 : shadcn/ui initialisé via CLI avec thème par défaut

**Choix** : Exécuter `npx shadcn@latest init` après le scaffolding pour configurer le thème, puis ajouter les composants de base (button, card, input, dialog, dropdown-menu, badge, separator, tabs).

**Raison** : shadcn/ui copie les composants dans `src/components/ui/`. L'initialisation configure les CSS variables, le `cn()` utility et les paths aliases.

### D4 : Schéma Drizzle en un seul fichier `schema.ts`

**Choix** : Tout le schéma dans `src/lib/db/schema.ts` comme défini dans ARCHITECTURE.md.

**Alternatives considérées** :
- Split par domaine (users.ts, orgs.ts, diagnostics.ts) : ajoute de la complexité pour les références circulaires entre tables

**Raison** : Le schéma a ~12 tables, c'est gérable dans un seul fichier. Le split sera envisagé si le schéma dépasse 20+ tables.

### D5 : Better Auth tables intégrées dans le schéma Drizzle

**Choix** : Better Auth a besoin de tables pour sessions, accounts, et verifications. On utilise le plugin Drizzle de Better Auth pour que ces tables soient gérées dans notre schéma, pas séparément.

**Raison** : Un seul schéma, une seule source de vérité pour les migrations.

### D6 : Constantes métier avec typage strict et IDs stables

**Choix** : Les dimensions utilisent des IDs string stables (`"tools"`, `"process"`, etc.) correspondant aux clés des JSONB `dimension_scores`. Les questions ont des IDs `"q_0"` à `"q_13"` correspondant aux clés des JSONB `answers`.

**Raison** : IDs stables garantissent la rétrocompatibilité quand on itère sur le contenu des questions. Les IDs string sont lisibles dans les JSONB et les logs.

### D7 : Vitest avec `@vitejs/plugin-react` et path aliases

**Choix** : `vitest.config.ts` séparé de `next.config.ts`, avec résolution du path alias `@/` vers `src/`.

**Raison** : Vitest ne peut pas utiliser directement la config Next.js. Un fichier séparé est plus propre.

## Risks / Trade-offs

- **[Compatibilité Better Auth + Drizzle]** → Les plugins Better Auth évoluent rapidement. Mitigation : fixer les versions dans package.json, vérifier la doc au moment de l'implémentation.
- **[Tailwind v4 breaking changes]** → v4 est récent, certains plugins/composants peuvent avoir des incompatibilités. Mitigation : utiliser la dernière version de shadcn/ui qui supporte v4.
- **[Schéma DB volumineux d'emblée]** → Créer toutes les tables immédiatement alors que seules quelques-unes seront utilisées dans les premières fonctionnalités. Trade-off acceptable : les tables vides n'ont pas de coût, et avoir le schéma complet dès le départ évite les migrations à répétition.
- **[Pas de seed data fonctionnel]** → Le dev devra créer manuellement les données de test au début. Mitigation : le seed sera implémenté dans un change ultérieur, rapidement après l'init.
