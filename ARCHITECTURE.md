# ARCHITECTURE — maturIAté

> Document de référence technique. Chaque choix est justifié.
> Dernière mise à jour : 2026-02-25

---

## 1. Vue d'ensemble

maturIAté est une application web multi-tenant permettant aux organisations de diagnostiquer et suivre la maturité IA de leurs équipes de développement. Elle est construite en monolithe Next.js full-stack déployé sur Vercel, avec PostgreSQL comme base de données.

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTS                                     │
│  Navigateur (responsive)                                             │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐ ┌────────────────────┐  │
│  │  Admin    │ │  Manager /   │ │ Membre   │ │ Consultant         │  │
│  │  Orga     │ │  Tech Lead   │ │ Équipe   │ │ (multi-orga)       │  │
│  └────┬─────┘ └──────┬───────┘ └────┬─────┘ └──────┬─────────────┘  │
└───────┼──────────────┼──────────────┼───────────────┼────────────────┘
        │              │              │               │
        ▼              ▼              ▼               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     VERCEL (Hébergement)                              │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                   NEXT.JS 15 (App Router)                       │ │
│  │                                                                   │ │
│  │  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │ │
│  │  │ Server           │  │ Client            │  │ API Routes    │  │ │
│  │  │ Components       │  │ Components        │  │               │  │ │
│  │  │                   │  │                    │  │ /api/auth/*   │  │ │
│  │  │ - Dashboards     │  │ - Quiz (interactif)│  │ /api/cron/*   │  │ │
│  │  │ - Listes          │  │ - Charts (Recharts)│  │ /api/share/*  │  │ │
│  │  │ - Pages publiques │  │ - Formulaires     │  │               │  │ │
│  │  └────────┬──────────┘  └──────────────────┘  └───────┬───────┘  │ │
│  │           │                                           │          │ │
│  │           ▼                                           ▼          │ │
│  │  ┌──────────────────────────────────────────────────────────┐   │ │
│  │  │              SERVER ACTIONS + QUERIES                     │   │ │
│  │  │  Drizzle ORM ──── Zod (validation) ──── Better Auth      │   │ │
│  │  └────────────────────────┬─────────────────────────────────┘   │ │
│  └───────────────────────────┼─────────────────────────────────────┘ │
│                              │                                        │
└──────────────────────────────┼────────────────────────────────────────┘
                               │
                  ┌────────────┼────────────┐
                  ▼            ▼            ▼
          ┌──────────┐  ┌──────────┐  ┌──────────┐
          │   NEON    │  │  RESEND  │  │ VERCEL   │
          │ PostgreSQL│  │  Email   │  │ Cron     │
          │ Frankfurt │  │  EU      │  │ Jobs     │
          └──────────┘  └──────────┘  └──────────┘
```

### Flux de données principaux

```
Diagnostic (écriture) :
  Manager → Quiz Client Component → Server Action → Drizzle → Neon PostgreSQL

Dashboard (lecture) :
  Neon PostgreSQL → Drizzle → Server Component → HTML streamed → Navigateur

Partage :
  Lien /share/{token} → Server Component (SSR) → HTML avec OG meta tags

Campagne (relance) :
  Vercel Cron → API Route → Drizzle (équipes sans réponse) → Resend (email)

State of IA (extraction) :
  Back-office AIAD → Server Action → Drizzle (agrégation + hash) → Table snapshots
```

---

## 2. Stack technique

| Couche | Technologie | Version | Justification |
|--------|-------------|---------|---------------|
| **Runtime** | Node.js | 20 LTS | Compatibilité Vercel, support long terme |
| **Langage** | TypeScript | 5.7+ | Typage end-to-end, sécurité refactoring, DX |
| **Framework** | Next.js (App Router) | 15.x | SSR pour pages publiques (State of IA, liens partageables), Server Components, Server Actions, monolithe full-stack |
| **UI Library** | React | 19.x | Écosystème, continuité avec le code existant |
| **Styling** | Tailwind CSS | 4.x | Déjà utilisé dans le code existant, prototypage rapide, purge automatique |
| **Composants UI** | shadcn/ui | latest | Composants copiés (pas de dépendance), accessibles (Radix UI), personnalisables, excellente compatibilité IA |
| **Charts** | Recharts | 2.x | Déjà utilisé (radar chart existant), API déclarative React |
| **ORM** | Drizzle ORM | 0.38+ | Requêtes SQL-like typées pour les agrégations analytiques (State of IA), compatible edge, léger |
| **Validation** | Zod | 3.x | Validation runtime + inférence TypeScript, intégré avec Server Actions et Drizzle |
| **Auth** | Better Auth | 1.x | Open source, self-hosted (données dans notre PostgreSQL), Magic Link + OAuth natifs, plugin organizations |
| **Base de données** | PostgreSQL via Neon | 16+ | Données relationnelles, requêtes analytiques (window functions, percentiles), scale-to-zero, EU Frankfurt |
| **Email** | Resend + React Email | latest | API TypeScript-first, templates JSX, région EU, 3K emails/mois gratuits |
| **Hébergement** | Vercel | — | Déploiement Next.js optimal, preview deployments, Cron Jobs, CDN global |
| **Tests** | Vitest + Playwright | latest | Vitest : rapide, compatible ESM. Playwright : E2E cross-browser |
| **Linting** | ESLint + Prettier | 9.x / 3.x | Cohérence code, formatage automatique |
| **Package manager** | pnpm | 9.x | Rapide, strict (pas de phantom deps), disk-efficient |

---

## 3. Structure du projet

```
maturiate/
├── src/
│   ├── app/                          # Next.js App Router (routes)
│   │   ├── (auth)/                   # Groupe : pages non-authentifiées
│   │   │   ├── login/
│   │   │   │   └── page.tsx          # Login (Magic Link + SSO)
│   │   │   ├── invite/[token]/
│   │   │   │   └── page.tsx          # Accepter une invitation
│   │   │   └── layout.tsx            # Layout minimal (pas de sidebar)
│   │   │
│   │   ├── (dashboard)/              # Groupe : pages authentifiées
│   │   │   ├── layout.tsx            # Layout avec sidebar + header
│   │   │   ├── page.tsx              # Redirection vers /orgs
│   │   │   ├── orgs/
│   │   │   │   ├── page.tsx          # Liste des organisations
│   │   │   │   └── [orgId]/
│   │   │   │       ├── page.tsx      # Dashboard organisation (heatmap + évolution)
│   │   │   │       ├── teams/
│   │   │   │       │   └── [teamId]/
│   │   │   │       │       └── page.tsx  # Dashboard équipe
│   │   │   │       ├── campaigns/
│   │   │   │       │   ├── page.tsx      # Liste campagnes
│   │   │   │       │   ├── new/
│   │   │   │       │   │   └── page.tsx  # Créer campagne
│   │   │   │       │   └── [campaignId]/
│   │   │   │       │       └── page.tsx  # Détail campagne
│   │   │   │       ├── diagnostic/
│   │   │   │       │   └── [teamId]/
│   │   │   │       │       └── page.tsx  # Remplir diagnostic
│   │   │   │       ├── settings/
│   │   │   │       │   └── page.tsx      # Paramètres orga (opt-in, membres)
│   │   │   │       └── benchmark/
│   │   │   │           └── page.tsx      # Mon positionnement (State of IA)
│   │   │   └── consultant/
│   │   │       └── page.tsx          # Vue consolidée multi-orga
│   │   │
│   │   ├── (public)/                 # Groupe : pages publiques (SSR, pas d'auth)
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── share/[token]/
│   │   │   │   └── page.tsx          # Résultats partagés (lien public)
│   │   │   └── state-of-ia/
│   │   │       └── [year]/
│   │   │           └── page.tsx      # Rapport annuel public
│   │   │
│   │   ├── admin/                    # Back-office AIAD (super-admin)
│   │   │   ├── layout.tsx
│   │   │   └── state-of-ia/
│   │   │       └── page.tsx          # Extraction + publication
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── auth/[...all]/
│   │   │   │   └── route.ts          # Better Auth handler
│   │   │   └── cron/
│   │   │       └── campaign-reminder/
│   │   │           └── route.ts      # Relance campagnes (Vercel Cron)
│   │   │
│   │   ├── layout.tsx                # Root layout (fonts, providers)
│   │   └── global.css                # Tailwind directives
│   │
│   ├── components/
│   │   ├── ui/                       # shadcn/ui (Button, Card, Dialog, etc.)
│   │   ├── charts/                   # Wrappers Recharts
│   │   │   ├── radar-chart.tsx       # Radar chart maturité
│   │   │   ├── heatmap.tsx           # Heatmap équipes × dimensions
│   │   │   ├── evolution-chart.tsx   # Courbes d'évolution
│   │   │   └── score-gauge.tsx       # Jauge score global
│   │   ├── diagnostic/               # Composants du quiz
│   │   │   ├── question-card.tsx
│   │   │   ├── progress-bar.tsx
│   │   │   └── results-panel.tsx
│   │   ├── dashboard/                # Composants dashboard
│   │   │   ├── org-dashboard.tsx
│   │   │   ├── team-timeline.tsx
│   │   │   └── benchmark-card.tsx
│   │   └── layout/                   # Composants layout
│   │       ├── sidebar.tsx
│   │       ├── header.tsx
│   │       └── org-switcher.tsx
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts              # Client Drizzle + connection Neon
│   │   │   ├── schema.ts             # Schéma Drizzle (toutes les tables)
│   │   │   └── migrations/           # Migrations SQL générées
│   │   ├── auth/
│   │   │   └── index.ts              # Configuration Better Auth
│   │   ├── email/
│   │   │   ├── index.ts              # Client Resend
│   │   │   └── templates/            # Templates React Email
│   │   │       ├── magic-link.tsx
│   │   │       ├── invitation.tsx
│   │   │       └── campaign-reminder.tsx
│   │   ├── queries/                  # Fonctions de lecture DB (réutilisables)
│   │   │   ├── organizations.ts
│   │   │   ├── teams.ts
│   │   │   ├── diagnostics.ts
│   │   │   ├── campaigns.ts
│   │   │   └── state-of-ia.ts
│   │   ├── actions/                  # Server Actions (mutations)
│   │   │   ├── organizations.ts
│   │   │   ├── teams.ts
│   │   │   ├── diagnostics.ts
│   │   │   ├── campaigns.ts
│   │   │   └── share.ts
│   │   ├── permissions.ts            # Logique d'autorisation par rôle
│   │   └── utils.ts                  # Fonctions utilitaires (cn, formatDate, etc.)
│   │
│   ├── data/
│   │   ├── dimensions.ts             # 6 dimensions (constantes)
│   │   ├── questions.ts              # 14 questions core (constantes)
│   │   ├── levels.ts                 # 4 niveaux de maturité
│   │   └── recommendations.ts        # Recommandations par niveau et dimension
│   │
│   └── types/
│       └── index.ts                  # Types partagés (inférés du schéma Drizzle)
│
├── public/                           # Assets statiques
├── drizzle.config.ts                 # Configuration Drizzle Kit
├── next.config.ts                    # Configuration Next.js
├── tailwind.config.ts                # Configuration Tailwind (si nécessaire avec v4)
├── tsconfig.json
├── .env.local                        # Variables d'environnement (non commité)
├── .env.example                      # Template des variables requises
└── package.json
```

### Principes d'organisation

- **Route Groups** `(auth)`, `(dashboard)`, `(public)` : séparent les layouts sans affecter les URLs. Chaque groupe a son propre layout (avec ou sans sidebar, avec ou sans auth).
- **`lib/queries/`** : fonctions de lecture pures, appelées depuis les Server Components. Jamais d'import React.
- **`lib/actions/`** : Server Actions (mutations), appelées depuis les Client Components via `useActionState` ou formulaires.
- **`data/`** : constantes métier (questions, dimensions, niveaux). Pas en base de données car invariantes en V1 (les questions core sont fixes).
- **`components/ui/`** : composants shadcn/ui uniquement, jamais modifiés directement — régénérés via `npx shadcn@latest add`.

---

## 4. Conventions de code

### Nommage

| Élément | Convention | Exemple |
|---------|-----------|---------|
| Fichiers/dossiers | kebab-case | `campaign-reminder.ts` |
| Composants React | PascalCase (export) | `export function QuestionCard()` |
| Fichiers composants | kebab-case | `question-card.tsx` |
| Variables, fonctions | camelCase | `const globalScore = ...` |
| Constantes métier | UPPER_SNAKE_CASE | `const DIMENSIONS = [...]` |
| Types/Interfaces | PascalCase | `type Organization = ...` |
| Tables DB (Drizzle) | snake_case pluriel | `organizations`, `diagnostics` |
| Colonnes DB | snake_case | `created_at`, `org_id` |
| Server Actions | verbe + nom | `createCampaign`, `submitDiagnostic` |
| Queries | get/list + nom | `getOrganization`, `listTeamDiagnostics` |
| Env variables | UPPER_SNAKE_CASE | `DATABASE_URL`, `RESEND_API_KEY` |

### Formatage

```json
// .prettierrc
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100
}
```

### Imports : ordre strict

```typescript
// 1. Imports React/Next.js
import { Suspense } from "react";
import { notFound } from "next/navigation";

// 2. Imports librairies tierces
import { eq, and, desc } from "drizzle-orm";

// 3. Imports internes — lib
import { db } from "@/lib/db";
import { organizations } from "@/lib/db/schema";
import { getOrganization } from "@/lib/queries/organizations";
import { requireRole } from "@/lib/permissions";

// 4. Imports internes — components
import { OrgDashboard } from "@/components/dashboard/org-dashboard";
import { Button } from "@/components/ui/button";

// 5. Imports internes — types
import type { Organization } from "@/types";
```

### Composants : structure

```tsx
// components/diagnostic/question-card.tsx
"use client"; // Uniquement si interactif (état, événements)

import { useState } from "react";
import { cn } from "@/lib/utils";

// Props typées inline pour les composants simples
export function QuestionCard({
  question,
  selected,
  onSelect,
}: {
  question: { text: string; options: string[]; dimension: number };
  selected: number | undefined;
  onSelect: (value: number) => void;
}) {
  return (
    <div className="w-full">
      <h3 className="text-lg font-bold mb-6">{question.text}</h3>
      <div className="flex flex-col gap-3">
        {question.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => onSelect(i + 1)}
            className={cn(
              "text-left rounded-xl px-5 py-4 border-2 transition-all",
              selected === i + 1
                ? "border-blue-500 bg-blue-50 font-semibold"
                : "border-slate-200 bg-white",
            )}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Server Components vs Client Components

```tsx
// SERVEUR (par défaut) — pas de "use client"
// Utilisé pour : data fetching, pages, layouts
// Peut : await, accéder à la DB, lire les cookies/headers
// Ne peut pas : useState, useEffect, onClick, window

// app/(dashboard)/orgs/[orgId]/page.tsx
import { getOrgDashboardData } from "@/lib/queries/organizations";
import { OrgDashboard } from "@/components/dashboard/org-dashboard";

export default async function OrgPage({ params }: { params: { orgId: string } }) {
  const data = await getOrgDashboardData(params.orgId);
  return <OrgDashboard data={data} />;
}

// CLIENT — "use client" en première ligne
// Utilisé pour : interactivité, état local, événements
// Peut : useState, useEffect, onClick, animations
// Ne peut pas : await au top level, accéder à la DB directement

// components/dashboard/org-dashboard.tsx
"use client";

import { useState } from "react";
import type { OrgDashboardData } from "@/types";

export function OrgDashboard({ data }: { data: OrgDashboardData }) {
  const [selectedCampaign, setSelectedCampaign] = useState(data.campaigns[0]?.id);
  // ...rendu interactif
}
```

---

## 5. Patterns

### Pattern 1 : Server Action avec validation Zod

Toutes les mutations passent par des Server Actions validées.

```typescript
// lib/actions/campaigns.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { requireRole } from "@/lib/permissions";

const CreateCampaignSchema = z.object({
  orgId: z.string().uuid(),
  name: z.string().min(1).max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
});

export async function createCampaign(formData: FormData) {
  const parsed = CreateCampaignSchema.safeParse({
    orgId: formData.get("orgId"),
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const session = await requireRole(parsed.data.orgId, "admin");

  const [campaign] = await db
    .insert(campaigns)
    .values({
      orgId: parsed.data.orgId,
      name: parsed.data.name,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      createdBy: session.user.id,
      status: "active",
    })
    .returning();

  revalidatePath(`/orgs/${parsed.data.orgId}/campaigns`);
  return { data: campaign };
}
```

### Pattern 2 : Autorisation multi-tenant

Chaque requête DB est scopée à l'organisation de l'utilisateur.

```typescript
// lib/permissions.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { memberships } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

type Role = "admin" | "manager" | "member" | "consultant";

export async function requireRole(orgId: string, ...allowedRoles: Role[]) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const [membership] = await db
    .select()
    .from(memberships)
    .where(and(eq(memberships.userId, session.user.id), eq(memberships.orgId, orgId)));

  if (!membership || !allowedRoles.includes(membership.role as Role)) {
    throw new Error("Forbidden");
  }

  return { user: session.user, membership };
}
```

### Pattern 3 : Requête analytique typée (State of IA)

Les requêtes analytiques complexes utilisent Drizzle SQL pour garder le typage.

```typescript
// lib/queries/state-of-ia.ts
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { stateOfIaSnapshots } from "@/lib/db/schema";

export async function getBenchmarkPercentiles(year: number, orgHash: string) {
  return db.execute(sql`
    WITH ranked AS (
      SELECT
        organisation_hash,
        score_global,
        PERCENT_RANK() OVER (ORDER BY score_global) AS percentile_global,
        ${sql.raw(
          ["tools", "process", "docs", "quality", "collab", "vision"]
            .map(
              (dim) =>
                `PERCENT_RANK() OVER (ORDER BY (scores_by_dimension->>'${dim}')::numeric) AS percentile_${dim}`,
            )
            .join(",\n"),
        )}
      FROM state_of_ia_snapshots
      WHERE year = ${year}
    )
    SELECT * FROM ranked
    WHERE organisation_hash = ${orgHash}
  `);
}

export async function getAggregatedStats(year: number) {
  return db.execute(sql`
    SELECT
      COUNT(*) AS total_orgs,
      ROUND(AVG(score_global), 2) AS avg_score,
      ROUND(STDDEV(score_global), 2) AS stddev_score,
      COUNT(*) FILTER (WHERE global_level = 1) AS level_1_count,
      COUNT(*) FILTER (WHERE global_level = 2) AS level_2_count,
      COUNT(*) FILTER (WHERE global_level = 3) AS level_3_count,
      COUNT(*) FILTER (WHERE global_level = 4) AS level_4_count,
      SUM(team_count) AS total_teams
    FROM state_of_ia_snapshots
    WHERE year = ${year}
  `);
}
```

### Pattern 4 : Lien partageable avec SSR

Les pages publiques utilisent le SSR pour les meta tags OpenGraph.

```typescript
// app/(public)/share/[token]/page.tsx
import { notFound } from "next/navigation";
import { getSharedResult } from "@/lib/queries/share";
import { RadarChart } from "@/components/charts/radar-chart";
import type { Metadata } from "next";

type Props = { params: { token: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const result = await getSharedResult(params.token);
  if (!result) return {};

  return {
    title: `Diagnostic IA — ${result.teamName}`,
    description: `Niveau ${result.globalLevel} : ${result.levelName} (${result.globalScore.toFixed(1)}/4)`,
    openGraph: {
      title: `Diagnostic Maturité IA — ${result.teamName}`,
      description: `Score ${result.globalScore.toFixed(1)}/4 — ${result.levelName}`,
    },
  };
}

export default async function SharedResultPage({ params }: Props) {
  const result = await getSharedResult(params.token);
  if (!result) notFound();

  // Vérifier expiration
  if (result.expiresAt && result.expiresAt < new Date()) notFound();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold">{result.teamName}</h1>
      <RadarChart dimensionScores={result.dimensionScores} />
      {/* ... résultats détaillés */}
    </main>
  );
}
```

### Pattern 5 : Email transactionnel avec React Email

```tsx
// lib/email/templates/campaign-reminder.tsx
import { Html, Head, Body, Container, Text, Button } from "@react-email/components";

export function CampaignReminderEmail({
  teamName,
  campaignName,
  diagnosticUrl,
}: {
  teamName: string;
  campaignName: string;
  diagnosticUrl: string;
}) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "DM Sans, sans-serif" }}>
        <Container>
          <Text>L'équipe {teamName} n'a pas encore rempli son diagnostic.</Text>
          <Text>Campagne : {campaignName}</Text>
          <Button href={diagnosticUrl}>Remplir le diagnostic</Button>
        </Container>
      </Body>
    </Html>
  );
}

// lib/email/index.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendCampaignReminder(to: string, props: Parameters<typeof CampaignReminderEmail>[0]) {
  const { CampaignReminderEmail } = await import("./templates/campaign-reminder");
  await resend.emails.send({
    from: "maturIAté <noreply@maturiate.com>",
    to,
    subject: `Rappel : diagnostic "${props.campaignName}" en attente`,
    react: CampaignReminderEmail(props),
  });
}
```

---

## 6. API et interfaces

### Routes API

L'essentiel de la logique passe par les Server Actions (pas d'API REST classique). Les API Routes sont réservées aux cas où un endpoint HTTP est nécessaire :

| Route | Méthode | Authentification | Usage |
|-------|---------|------------------|-------|
| `/api/auth/[...all]` | * | Publique | Handler Better Auth (magic link, OAuth, session) |
| `/api/cron/campaign-reminder` | GET | Vercel Cron (secret) | Relance des équipes n'ayant pas répondu |
| `/api/cron/campaign-close` | GET | Vercel Cron (secret) | Clôture automatique des campagnes expirées |

### Server Actions (mutations)

| Action | Module | Rôle requis | Description |
|--------|--------|-------------|-------------|
| `createOrganization` | `actions/organizations` | Authentifié | Créer une organisation |
| `updateOrganization` | `actions/organizations` | Admin | Modifier paramètres (nom, opt-in) |
| `inviteMember` | `actions/organizations` | Admin | Inviter par email avec rôle |
| `createTeam` | `actions/teams` | Admin | Créer une équipe |
| `createCampaign` | `actions/campaigns` | Admin | Lancer une campagne |
| `closeCampaign` | `actions/campaigns` | Admin | Clôturer une campagne |
| `submitDiagnostic` | `actions/diagnostics` | Admin, Manager | Soumettre les réponses d'un diagnostic |
| `createShareLink` | `actions/share` | Admin, Manager, Consultant | Générer un lien partageable |
| `extractStateOfIa` | `actions/state-of-ia` | Super-admin AIAD | Extraire les données anonymisées |
| `publishStateOfIa` | `actions/state-of-ia` | Super-admin AIAD | Publier le rapport |

### Queries (lecture)

| Fonction | Module | Description |
|----------|--------|-------------|
| `getOrganization(orgId)` | `queries/organizations` | Organisation avec nombre d'équipes et de membres |
| `getOrgDashboardData(orgId, campaignId?)` | `queries/organizations` | Heatmap + scores agrégés pour le dashboard |
| `listTeams(orgId)` | `queries/teams` | Équipes d'une organisation |
| `getTeamDashboardData(teamId)` | `queries/teams` | Historique diagnostics + évolution |
| `listCampaigns(orgId)` | `queries/campaigns` | Campagnes avec taux de complétion |
| `getCampaignDetail(campaignId)` | `queries/campaigns` | Détail campagne + statut par équipe |
| `getSharedResult(token)` | `queries/share` | Données pour la page de partage publique |
| `getBenchmarkPercentiles(year, orgHash)` | `queries/state-of-ia` | Positionnement d'une organisation |
| `getAggregatedStats(year)` | `queries/state-of-ia` | Statistiques globales State of IA |
| `getConsultantOverview(userId)` | `queries/consultant` | Vue consolidée multi-organisations |

### Format de données : conventions

```typescript
// Les réponses d'un diagnostic sont stockées en JSONB
type DiagnosticAnswers = Record<string, number>; // { "q_0": 3, "q_1": 2, ... }

// Les scores par dimension sont stockés en JSONB
type DimensionScores = {
  tools: number;    // 1.0 - 4.0
  process: number;
  docs: number;
  quality: number;
  collab: number;
  vision: number;
};

// Les timestamps sont des ISO 8601 strings en sortie
// Les dates sont des Date objects en entrée (coercion Zod)
```

---

## 7. Base de données

### Schéma Drizzle

```typescript
// lib/db/schema.ts
import { pgTable, uuid, text, timestamp, integer, jsonb, boolean, pgEnum, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────

export const memberRoleEnum = pgEnum("member_role", ["admin", "manager", "member", "consultant"]);
export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "active", "closed"]);
export const questionTypeEnum = pgEnum("question_type", ["core", "bonus"]);
export const orgSectorEnum = pgEnum("org_sector", ["esn", "editor", "dsi", "startup", "other"]);
export const orgSizeEnum = pgEnum("org_size", ["1-10", "11-50", "51-200", "201-1000", "1000+"]);

// ── Users ──────────────────────────────────────────

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  isSuperAdmin: boolean("is_super_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Organizations ──────────────────────────────────

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  logo: text("logo"),
  sector: orgSectorEnum("sector"),
  size: orgSizeEnum("size"),
  optInStateOfIa: boolean("opt_in_state_of_ia").notNull().default(false),
  optInDate: timestamp("opt_in_date"),
  optOutDate: timestamp("opt_out_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Memberships (users <-> organizations) ──────────

export const memberships = pgTable("memberships", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  role: memberRoleEnum("role").notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Teams ──────────────────────────────────────────

export const teams = pgTable("teams", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const teamMembers = pgTable("team_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

// ── Campaigns ──────────────────────────────────────

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  status: campaignStatusEnum("status").notNull().default("draft"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Questions (bonus uniquement — core en constantes) ──

export const bonusQuestions = pgTable("bonus_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  dimensionId: text("dimension_id").notNull(), // "tools", "process", etc.
  text: text("text").notNull(),
  options: jsonb("options").notNull().$type<string[]>(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Diagnostics ────────────────────────────────────

export const diagnostics = pgTable("diagnostics", {
  id: uuid("id").primaryKey().defaultRandom(),
  teamId: uuid("team_id").notNull().references(() => teams.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  filledBy: uuid("filled_by").notNull().references(() => users.id),
  answers: jsonb("answers").notNull().$type<Record<string, number>>(),
  bonusAnswers: jsonb("bonus_answers").$type<Record<string, number>>(),
  dimensionScores: jsonb("dimension_scores").notNull().$type<Record<string, number>>(),
  globalScore: real("global_score").notNull(),
  globalLevel: integer("global_level").notNull(), // 1-4
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Share Links ────────────────────────────────────

export const shareLinks = pgTable("share_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  type: text("type").notNull(), // "team" | "campaign" | "org"
  targetId: uuid("target_id").notNull(), // ID de l'équipe, campagne ou org
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── Invitations ────────────────────────────────────

export const invitations = pgTable("invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  role: memberRoleEnum("role").notNull(),
  token: text("token").notNull().unique(),
  invitedBy: uuid("invited_by").notNull().references(() => users.id),
  acceptedAt: timestamp("accepted_at"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ── State of IA Snapshots ──────────────────────────

export const stateOfIaSnapshots = pgTable("state_of_ia_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  year: integer("year").notNull(),
  organisationHash: text("organisation_hash").notNull(),
  sector: orgSectorEnum("sector"),
  size: orgSizeEnum("size"),
  scoresByDimension: jsonb("scores_by_dimension").notNull().$type<Record<string, number>>(),
  globalScore: real("global_score").notNull(),
  globalLevel: integer("global_level").notNull(),
  teamCount: integer("team_count").notNull(),
  extractedAt: timestamp("extracted_at").notNull().defaultNow(),
});

export const stateOfIaReports = pgTable("state_of_ia_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  year: integer("year").notNull().unique(),
  content: jsonb("content").notNull(), // Contenu éditorialisé (sections, insights)
  publishedAt: timestamp("published_at"),
  createdBy: uuid("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ── Relations ──────────────────────────────────────

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  teams: many(teams),
  campaigns: many(campaigns),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  organization: one(organizations, { fields: [teams.orgId], references: [organizations.id] }),
  diagnostics: many(diagnostics),
  members: many(teamMembers),
}));

export const diagnosticsRelations = relations(diagnostics, ({ one }) => ({
  team: one(teams, { fields: [diagnostics.teamId], references: [teams.id] }),
  campaign: one(campaigns, { fields: [diagnostics.campaignId], references: [campaigns.id] }),
  filledByUser: one(users, { fields: [diagnostics.filledBy], references: [users.id] }),
}));
```

### Diagramme relationnel

```
users ──────┐
            │ 1:N
            ▼
       memberships ←───── organizations
            │                   │ 1:N
            │                   ├──→ teams ──→ diagnostics
            │                   │       │ N:M       ↑
            │                   │       ▼           │
            │                   │  team_members     │
            │                   │                   │
            │                   ├──→ campaigns ─────┘
            │                   │
            │                   ├──→ bonus_questions
            │                   │
            │                   ├──→ share_links
            │                   │
            │                   └──→ invitations
            │
            └──→ state_of_ia_snapshots (dénormalisé, anonymisé)
                 state_of_ia_reports
```

### Stratégie de migration

- **Outil** : `drizzle-kit` (génère les migrations SQL à partir du diff du schéma)
- **Workflow** :
  1. Modifier `schema.ts`
  2. `pnpm drizzle-kit generate` → génère un fichier SQL dans `lib/db/migrations/`
  3. `pnpm drizzle-kit migrate` → applique en local/preview
  4. En production : migrations appliquées automatiquement au déploiement (script `postbuild`)
- **Règle** : jamais de modification manuelle des fichiers de migration générés. Si un ajustement est nécessaire, créer une nouvelle migration.
- **Neon branching** : chaque branche Git a sa propre branche de base de données pour les preview deployments. Les migrations sont testées en isolation.

### Seed data

```typescript
// lib/db/seed.ts — utilisé en développement uniquement
// Crée : 1 organisation, 3 équipes, 2 campagnes, 10 diagnostics
// Les 14 questions core + 6 dimensions sont des constantes (data/), pas des seed DB
```

---

## 8. Tests

### Frameworks

| Type | Outil | Cible |
|------|-------|-------|
| Unitaire | Vitest | Fonctions de scoring, permissions, utilitaires |
| Intégration | Vitest + `@testing-library/react` | Server Actions, queries DB |
| E2E | Playwright | Parcours utilisateur complets |

### Organisation

```
tests/
├── unit/
│   ├── scoring.test.ts           # Calcul des scores par dimension
│   ├── permissions.test.ts       # Logique d'autorisation
│   └── anonymization.test.ts     # Hash irréversible pour State of IA
├── integration/
│   ├── actions/
│   │   ├── diagnostics.test.ts   # Soumettre un diagnostic
│   │   └── campaigns.test.ts     # Créer/clôturer campagne
│   └── queries/
│       ├── dashboard.test.ts     # Requêtes dashboard
│       └── state-of-ia.test.ts   # Agrégations analytiques
└── e2e/
    ├── onboarding.spec.ts        # Créer orga → inviter → diagnostic
    ├── diagnostic-flow.spec.ts   # Parcours quiz complet
    ├── campaign-flow.spec.ts     # Lancer campagne → réponses → dashboard
    └── share.spec.ts             # Générer lien → page publique
```

### Couverture cible

| Couche | Cible | Justification |
|--------|-------|---------------|
| Scoring / permissions | > 90% | Logique métier critique, pas de tolérance aux bugs |
| Server Actions | > 80% | Mutations = points d'entrée, doivent être fiables |
| Queries | > 70% | Les requêtes analytiques complexes (State of IA) doivent être vérifiées |
| E2E | Parcours critiques | Onboarding, diagnostic, dashboard — pas de couverture % mais tous les happy paths |

### Conventions de test

```typescript
// tests/unit/scoring.test.ts
import { describe, it, expect } from "vitest";
import { computeScores } from "@/lib/scoring";

describe("computeScores", () => {
  it("calcule le score global comme moyenne des dimensions", () => {
    const answers = { q_0: 3, q_1: 2, q_2: 4, q_3: 1, q_4: 3, q_5: 2 /* ... */ };
    const result = computeScores(answers);

    expect(result.globalScore).toBeGreaterThanOrEqual(1);
    expect(result.globalScore).toBeLessThanOrEqual(4);
    expect(result.dimensionScores).toHaveProperty("tools");
  });

  it("attribue le niveau 1 pour un score < 1.75", () => {
    const answers = Object.fromEntries(
      Array.from({ length: 14 }, (_, i) => [`q_${i}`, 1]),
    );
    const result = computeScores(answers);
    expect(result.globalLevel).toBe(1);
  });
});
```

---

## 9. Sécurité

### Authentification

- **Better Auth** gère les sessions (JWT stocké en cookie HttpOnly, Secure, SameSite=Lax)
- Magic Links expirent après **10 minutes** et sont à usage unique
- Les tokens d'invitation expirent après **7 jours**
- Les tokens de partage ont une expiration optionnelle configurable par l'utilisateur

### Autorisation

- Chaque Server Action et chaque query vérifie le rôle via `requireRole()` avant tout accès aux données
- Toutes les requêtes DB sont scopées à l'organisation de l'utilisateur — jamais de requête sans filtre `orgId`
- Le super-admin AIAD est identifié par le flag `isSuperAdmin` sur la table `users`, vérifié côté serveur uniquement

### Données

- **Chiffrement at rest** : Neon PostgreSQL chiffre les données au repos (AES-256)
- **Chiffrement in transit** : TLS obligatoire entre l'application et la base de données
- **RGPD** :
  - Hébergement EU (Neon Frankfurt, Vercel EU edge, Resend EU)
  - Opt-in explicite pour le State of IA
  - Anonymisation irréversible via `SHA-256(org_id + secret_salt)` — le salt est une variable d'environnement non stockée en base
  - Droit de suppression : suppression en cascade de l'organisation et de toutes les données associées

### Secrets

- Variables d'environnement uniquement (`.env.local`, jamais commitées)
- `.env.example` contient les clés requises avec des valeurs placeholder
- Variables requises :

```bash
# .env.example
DATABASE_URL=             # Neon connection string
BETTER_AUTH_SECRET=       # Secret pour signer les sessions
BETTER_AUTH_URL=          # URL de l'application (http://localhost:3000 en dev)
GOOGLE_CLIENT_ID=         # OAuth Google
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=      # OAuth Microsoft
MICROSOFT_CLIENT_SECRET=
RESEND_API_KEY=           # Resend email
STATE_OF_IA_HASH_SALT=    # Salt pour l'anonymisation irréversible
CRON_SECRET=              # Secret pour authentifier les Vercel Cron Jobs
```

### Validation des entrées

- **Toutes** les entrées utilisateur sont validées via Zod avant traitement
- Les Server Actions retournent des erreurs typées, jamais d'exceptions non gérées
- Les paramètres d'URL (`orgId`, `teamId`, etc.) sont validés comme UUID avant toute requête DB

### Headers de sécurité

Configurés dans `next.config.ts` :

```typescript
// next.config.ts
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];
```

---

## 10. ADR (Architecture Decision Records)

Les décisions architecturales importantes sont documentées ici au fur et à mesure du projet. Chaque ADR suit le format :

```markdown
### ADR-XXXX : [Titre]

- **Date** : YYYY-MM-DD
- **Statut** : Proposé | Accepté | Remplacé par ADR-YYYY
- **Contexte** : [Situation et contraintes]
- **Décision** : [Ce qui a été décidé]
- **Conséquences** : [Impact positif et négatif]
```

_Aucun ADR enregistré pour le moment. Les décisions fondatrices sont documentées dans les sections précédentes et dans STACK_ANALYSIS.md._
