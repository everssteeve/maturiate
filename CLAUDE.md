# CLAUDE.md

Ce fichier guide Claude Code (claude.ai/code) pour travailler sur ce dépôt.

## Présentation du projet

**maturIAté** est une plateforme web multi-tenant permettant aux organisations d'évaluer et suivre la maturité IA de leurs équipes de développement. Elle propose des diagnostics (14 questions core, 6 dimensions, 4 niveaux de maturité), la gestion de campagnes, des dashboards (heatmaps, radar charts, courbes d'évolution), une vue consultant multi-organisations, et un rapport annuel anonymisé "State of IA".

## État du projet

Le projet est en **phase de conception** (pré-implémentation). Aucun code source n'existe encore. Trois documents fondateurs définissent tout le nécessaire pour démarrer :

- `PRD.md` — Exigences produit : personas, fonctionnalités F1-F10, modèle de données, matrice de permissions, roadmap V1-V3
- `STACK_ANALYSIS.md` — Analyse comparative des options technologiques avec justifications
- `ARCHITECTURE.md` — Référence technique : schéma Drizzle, structure projet, patterns, conventions, contrats API

**Toujours consulter ces documents avant de prendre une décision architecturale.**

## Stack cible (cf. ARCHITECTURE.md)

- **Framework** : Next.js 15 (App Router) avec TypeScript
- **Styling** : Tailwind CSS v4 + shadcn/ui
- **Charts** : Recharts
- **ORM** : Drizzle ORM (choisi plutôt que Prisma pour les requêtes analytiques)
- **Base de données** : PostgreSQL via Neon (serverless, EU-Frankfurt)
- **Auth** : Better Auth (self-hosted, données dans PostgreSQL)
- **Email** : Resend + React Email
- **Hébergement** : Vercel
- **Tests** : Vitest (unitaire/intégration) + Playwright (E2E)
- **Package manager** : pnpm

## Commandes (une fois le projet initialisé)

```bash
pnpm dev                    # Lancer le serveur de développement
pnpm build                  # Build de production
pnpm lint                   # ESLint
pnpm format                 # Prettier
pnpm drizzle-kit generate   # Générer une migration DB depuis les changements du schéma
pnpm drizzle-kit migrate    # Appliquer les migrations
pnpm drizzle-kit studio     # Ouvrir Drizzle Studio (interface DB)
pnpm test                   # Lancer tous les tests Vitest
pnpm test <chemin>          # Lancer un fichier de test spécifique
pnpm test:e2e               # Lancer les tests E2E Playwright
```

## Essentiels d'architecture

### Isolation multi-tenant
Chaque requête DB DOIT être scopée par `orgId`. Utiliser `requireRole(orgId, ...roles)` depuis `lib/permissions.ts` dans chaque Server Action et query. Ne jamais exposer de données inter-organisations.

### Server Components vs Client Components
- **Server Components** (par défaut) : data fetching, pages, layouts. Peuvent `await`, accéder à la DB directement.
- **Client Components** (`"use client"`) : interactivité uniquement — navigation du quiz, interactions charts, filtres.
- Les données descendent : le Server Component fetch → passe les props au Client Component.

### Pattern de mutation
Toutes les écritures passent par des Server Actions dans `lib/actions/` avec validation Zod. Ne jamais muter les données directement depuis un Client Component.

### Les questions sont des constantes, pas des lignes en DB
Les 14 questions core et les 6 dimensions sont définies dans `data/` comme constantes TypeScript. Seules les questions bonus (spécifiques à l'organisation) vivent en base de données. Cela garantit la comparabilité inter-organisations pour le benchmark State of IA.

### Anonymisation State of IA
L'identité de l'organisation est hashée avec `SHA-256(org_id + STATE_OF_IA_HASH_SALT)`. Le salt est une variable d'environnement, jamais stocké en base. Les snapshots dans `state_of_ia_snapshots` sont anonymisés de manière irréversible.

## Conventions de code

- **Fichiers** : kebab-case (`question-card.tsx`)
- **Composants** : PascalCase à l'export (`export function QuestionCard()`)
- **Tables DB** : snake_case pluriel (`organizations`, `diagnostics`)
- **Colonnes DB** : snake_case (`created_at`, `org_id`)
- **Server Actions** : verbe + nom (`createCampaign`, `submitDiagnostic`)
- **Queries** : get/list + nom (`getOrganization`, `listTeamDiagnostics`)
- **Langue** : l'UI et le contenu sont en français. Le code (variables, fonctions, commentaires) est en anglais.

## Rôles et permissions

| Rôle | Périmètre |
|------|-----------|
| `admin` | Gestion complète de l'organisation, campagnes, diagnostics, paramètres, opt-in |
| `manager` | Remplit les diagnostics et consulte les dashboards de ses équipes uniquement |
| `member` | Consulte les résultats de son équipe uniquement |
| `consultant` | Accès lecture seule à plusieurs organisations |
| `super-admin` | Back-office AIAD uniquement (flag `users.isSuperAdmin`) |

### Style visuel
- Interface claire et minimaliste
- [Mode sombre : oui/non pour le MVP]

### Contraintes et politiques
- NE JAMAIS exposer les clés API au client
- [Autres contraintes spécifiques]

### Dépendances
- Préférer les composants existants plutôt que d'ajouter de nouvelles bibliothèques UI

### Workflow de développement
- À la fin de chaque développement impliquant l'interface graphique, tester avec playwright-skill
- L'interface doit être responsive, fonctionnelle et répondre au besoin développé

### Context7
Utilise toujours context7 lorsque tu as besoin de :
- Génération de code
- Étapes de configuration ou d'installation
- Documentation de bibliothèque/API

Cela signifie que tu dois automatiquement utiliser les outils MCP Context7 pour résoudre l'identifiant de bibliothèque et obtenir la documentation sans que je le demande explicitement.

### Langue
Toutes les spécifications doivent être rédigées en français.