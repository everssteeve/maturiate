# Analyse Stack Technique — maturIAté

> Basée sur PRD.md | Contraintes : budget minimal, petite équipe, web app, pas de contrainte spécifique

## Exigences techniques déduites du PRD

| Exigence | Source PRD | Impact technique |
|----------|-----------|-----------------|
| Multi-tenant (orga → équipes → rôles) | F2, F3, permissions | ORM relationnel solide, row-level security |
| Magic Link + SSO Google/Microsoft | F1 | Lib auth avec providers OAuth + email |
| Dashboards riches (heatmap, radar, courbes) | F6, F7 | Lib de charts performante côté client |
| Pages publiques partageables | F9, F10 | SSR ou SSG pour SEO et previews sociales |
| Campagnes avec emails (invitations, relances) | F5 | Service email transactionnel |
| State of IA : agrégation analytique | F10 | SQL avancé (GROUP BY, percentiles, window functions) |
| Back-office AIAD (super-admin) | F10 | Route admin protégée, rôle plateforme |
| RGPD, hébergement EU | Risques | Provider avec régions EU |
| Existant : React + Recharts + Tailwind | Code fourni | Continuité techno React |

---

## 1. Frontend

### Option A : Next.js 15 (App Router)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | SSR natif (pages publiques State of IA + liens partageables), Server Components (moins de JS client), API Routes intégrées (pas de backend séparé), écosystème React intact (Recharts réutilisable tel quel), déploiement Vercel zero-config |
| **Inconvénients** | App Router encore jeune (quelques rough edges), complexité Server vs Client Components, vendor lock-in partiel Vercel pour les features avancées (ISR, middleware) |
| **Coût** | 0 € (framework open source) |
| **Compatibilité IA** | Excellente — le plus gros corpus de code dans les modèles, Claude/Copilot génèrent du Next.js App Router de très bonne qualité |
| **Courbe d'apprentissage** | Moyenne — si familier avec React, le delta est le modèle Server/Client Components |

### Option B : Remix (React Router v7 framework mode)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Modèle mental loaders/actions très clair, gestion formulaires native, progressif (fonctionne sans JS), nested routing puissant |
| **Inconvénients** | Écosystème plus petit, moins de ressources/tutoriels, migration du code existant nécessaire, pas d'équivalent simple aux Server Components |
| **Coût** | 0 € |
| **Compatibilité IA** | Bonne mais nettement inférieure à Next.js — moins de données d'entraînement, les agents font plus d'erreurs |
| **Courbe d'apprentissage** | Moyenne — modèle différent de Next.js, loaders/actions à apprendre |

### Option C : Vite + React SPA (pas de framework)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Simplicité maximale, pas d'opinion sur le routing/data fetching, réutilisation directe du code existant sans adaptation |
| **Inconvénients** | Pas de SSR → pages publiques (State of IA, liens partageables) sans SEO ni preview sociale, nécessite un backend séparé, pas de Server Components, tout le JS est chargé côté client |
| **Coût** | 0 € |
| **Compatibilité IA** | Excellente — React pur, très bien couvert |
| **Courbe d'apprentissage** | Faible |

**Recommandation : Next.js 15 (App Router)**

Raison décisive : les pages publiques. Le State of IA (`/state-of-ia/2026`), les liens partageables et la landing page ont besoin de SSR pour le SEO et les previews sociales (OpenGraph). Avec une SPA pure, ces pages seraient invisibles aux moteurs de recherche et afficheraient un lien vide sur LinkedIn/Slack. Next.js résout ce problème nativement tout en gardant la compatibilité React/Recharts.

### Styling : Tailwind CSS v4

Pas de débat — déjà utilisé dans le code existant, parfait pour du prototypage rapide, excellente compatibilité IA (les modèles génèrent du Tailwind de qualité). Coût : 0 €.

Ajouter **shadcn/ui** comme bibliothèque de composants : composants copiés dans le projet (pas de dépendance npm), personnalisables, basés sur Radix UI (accessibilité), et extrêmement bien supportés par les agents IA.

### State Management : Aucune lib dédiée

Le PRD ne décrit aucun besoin temps réel ni de state client complexe. Les données viennent du serveur (diagnostics, scores, campagnes).

- **Server Components + Server Actions** pour les mutations (créer campagne, soumettre diagnostic)
- **React Query (TanStack Query)** uniquement si besoin de cache client et revalidation (dashboards)
- **`useState`/`useContext`** pour l'UI locale (navigation quiz, filtres)

Pas besoin de Redux, Zustand ou Jotai. Over-engineering pour ce use case.

---

## 2. Backend

### Option A : Next.js API Routes + Server Actions (monolithe)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Un seul projet, un seul déploiement, typage end-to-end naturel, Server Actions pour les mutations simples, API Routes pour les endpoints complexes (webhooks, cron), pas de CORS |
| **Inconvénients** | Couplage front/back dans le même repo, limites des serverless functions (cold starts, timeout 10-60s selon le plan Vercel), moins de contrôle sur le runtime |
| **Coût** | 0 € (inclus dans Next.js) |
| **Compatibilité IA** | Excellente |
| **Courbe d'apprentissage** | Faible si déjà sur Next.js |

### Option B : Express / Fastify séparé

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Contrôle total, pas de limites serverless, plus facile à tester indépendamment, séparation claire des responsabilités |
| **Inconvénients** | Deux projets à maintenir, CORS à gérer, déploiement séparé, perte du typage end-to-end natif, plus d'infra à opérer |
| **Coût** | ~5-10 €/mois (hébergement backend séparé) |
| **Compatibilité IA** | Excellente (Express très bien couvert) |
| **Courbe d'apprentissage** | Faible |

### Option C : tRPC (par-dessus Next.js)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Typage end-to-end automatique (le client connaît les types du serveur), excellent DX avec autocomplétion, validation Zod intégrée |
| **Inconvénients** | Couche d'abstraction supplémentaire, moins pertinent avec les Server Components (qui ont déjà le typage end-to-end), overhead conceptuel pour une petite équipe |
| **Coût** | 0 € |
| **Compatibilité IA** | Bonne mais inférieure — les agents font parfois des erreurs sur les patterns tRPC v11 |
| **Courbe d'apprentissage** | Moyenne |

**Recommandation : Next.js API Routes + Server Actions (monolithe)**

Pour une petite équipe pré-product-market-fit, la vélocité prime. Un monolithe Next.js permet de shipping vite : pas de CORS, pas de déploiement séparé, typage naturel via les imports TypeScript. Les limites serverless ne sont pas un problème pour maturIAté (pas de long polling, pas de WebSockets, pas de jobs de 30 minutes). L'extraction State of IA (le seul job potentiellement long) peut être un script lancé manuellement ou une Vercel Cron Function.

Si l'application grandit au point où le monolithe devient contraignant, extraire un backend est toujours possible — le modèle de données et la logique métier seront les mêmes.

### ORM : Prisma vs Drizzle

| Critère | Prisma | Drizzle |
|---------|--------|---------|
| **DX** | Schema déclaratif (`schema.prisma`), migrations auto, studio GUI | Schema-as-code TypeScript, plus proche du SQL |
| **Performance** | Couche de requêtes intermédiaire, plus lent sur les requêtes complexes | Plus léger, requêtes SQL quasi-directes |
| **Requêtes analytiques** | Limité — `groupBy` basique, pas de window functions, fallback `$queryRaw` | SQL-like, agrégations naturelles, raw SQL facile |
| **Compatibilité IA** | Excellente — très populaire, bien documenté dans les LLMs | Bonne — en croissance rapide mais moins de training data |
| **Edge Runtime** | Prisma Accelerate nécessaire (payant) | Compatible nativement |
| **Coût** | 0 € (open source), Accelerate ~2-10 $/mois si edge | 0 € |

**Recommandation : Drizzle ORM**

Raison décisive : les requêtes analytiques du State of IA. Le PRD requiert des agrégations complexes (percentiles par segment, moyennes par dimension, comparaisons temporelles). Prisma force à utiliser `$queryRaw` pour ce type de requêtes, annulant son intérêt. Drizzle reste proche du SQL tout en offrant le typage TypeScript, et fonctionne nativement en edge sans surcoût.

---

## 3. Base de données

### Option A : Neon (PostgreSQL serverless)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | PostgreSQL complet, branching (preview par PR), auto-scaling, scale-to-zero (pas de coût au repos), région EU disponible (Frankfurt), intégration Vercel native |
| **Inconvénients** | Cold starts sur le free tier (~300ms), vendor-specific (mais c'est du PG standard), limites du free tier (512 MB storage, 100h compute/mois) |
| **Coût free tier** | 0 € (0.5 GB, 100h compute) |
| **Coût pro** | ~19 $/mois (10 GB, compute à la demande) |
| **Compatibilité IA** | Excellente — c'est du PostgreSQL standard |

### Option B : Supabase (PostgreSQL + BaaS)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | PostgreSQL + Auth + Storage + Realtime inclus, row-level security (RLS), dashboard SQL, bonne documentation, région EU (Frankfurt) |
| **Inconvénients** | Tentation d'utiliser le SDK Supabase plutôt qu'un ORM (couplage), RLS complexe à debugger, le "tout-en-un" peut devenir une contrainte, pause automatique après 1 semaine d'inactivité (free tier) |
| **Coût free tier** | 0 € (500 MB DB, 1 GB storage, 50K auth users) |
| **Coût pro** | 25 $/mois (8 GB DB, 100 GB storage) |
| **Compatibilité IA** | Bonne pour le SDK Supabase, excellente pour le PostgreSQL sous-jacent |

### Option C : Railway (PostgreSQL managé)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | PostgreSQL standard, pas de cold start, déploiement simple, dashboard clair, pas de pause automatique |
| **Inconvénients** | Pas de free tier persistant (5 $ de crédit/mois gratuit mais limité), pas de features BaaS (juste la DB), régions EU limitées |
| **Coût** | ~5 $/mois (hobby) → 20 $/mois (pro) |
| **Compatibilité IA** | Excellente — PostgreSQL standard |

### Option D : Turso (SQLite distribué / libSQL)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Latence ultra-basse (embedded replicas), free tier généreux (9 GB), parfait pour edge, coût quasi-nul |
| **Inconvénients** | SQLite = pas de `PERCENTILE_CONT`, pas de window functions avancées natives, écosystème ORM moins mature, pas standard pour les requêtes analytiques du State of IA |
| **Coût** | 0 € (9 GB, 500M row reads/mois) |
| **Compatibilité IA** | Moyenne — moins de code d'entraînement que PostgreSQL |

**Recommandation : Neon (PostgreSQL serverless)**

Raisons :
1. **PostgreSQL est non-négociable** pour le State of IA — les requêtes analytiques (percentiles, window functions, groupes conditionnels) sont du SQL avancé, et PostgreSQL excelle ici
2. **Scale-to-zero** = 0 € quand personne n'utilise l'app (parfait pré-PMF)
3. **Branching** = chaque PR peut avoir sa propre DB de preview (DX excellent)
4. **EU (Frankfurt)** = RGPD
5. **Intégration Vercel** native = connection pooling automatique via `@neondatabase/serverless`

Le free tier (0.5 GB, 100h compute) est largement suffisant pour les 50 premières organisations. Le passage au plan pro (19 $/mois) ne sera nécessaire qu'avec une vraie traction.

---

## 4. Hébergement

### Option A : Vercel

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Déploiement Next.js optimal (c'est leur produit), preview deployments par PR, analytics inclus, CDN global, Edge Functions, Cron Jobs (pour les relances campagnes), domaine custom gratuit |
| **Inconvénients** | Coûteux à l'échelle (serverless pricing par invocation), limites serverless (timeout, body size), vendor lock-in partiel, certaines features Next.js mieux supportées sur Vercel que sur d'autres providers |
| **Coût free tier** | 0 € (100 GB bandwidth, 100h serverless) |
| **Coût pro** | 20 $/mois/membre (pas par projet) |
| **Compatibilité IA** | Excellente — déploiement le plus documenté pour Next.js |

### Option B : Coolify (self-hosted PaaS)

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Open source, pas de vendor lock-in, hébergement sur n'importe quel VPS (Hetzner = pas cher + EU), contrôle total, pas de limites serverless, PostgreSQL inclus |
| **Inconvénients** | Maintenance serveur (mises à jour, sécurité, backups), pas de preview deployments aussi fluides que Vercel, nécessite un VPS (toujours allumé = coût fixe même sans trafic), setup initial plus complexe |
| **Coût** | ~4-7 €/mois (Hetzner CX22 : 2 vCPU, 4 GB RAM) pour tout (app + DB + Coolify) |
| **Compatibilité IA** | Bonne — Docker standard, mais la config Coolify est moins documentée |

### Option C : Fly.io

| Critère | Évaluation |
|---------|-----------|
| **Avantages** | Edge computing, machines qui s'éteignent au repos (scale-to-zero), régions EU, pricing à l'usage, PostgreSQL managé disponible |
| **Inconvénients** | DX moins fluide que Vercel pour Next.js, configuration plus manuelle (Dockerfile), pas de preview deployments natifs, documentation parfois lacunaire |
| **Coût** | ~3-5 $/mois (machines micro, scale-to-zero) |
| **Compatibilité IA** | Moyenne — moins de code d'entraînement que Vercel/Docker standard |

**Recommandation : Vercel (free tier) → réévaluer au-delà du free tier**

Stratégie en deux phases :

1. **Pré-PMF (maintenant)** : Vercel free tier. 0 €/mois. Le meilleur DX possible pour shipper vite. Preview deployments, déploiement git push, Cron Jobs, Analytics. Le free tier couvre facilement 50 organisations.

2. **Post-PMF (quand le free tier ne suffit plus)** : réévaluer. Si le coût Vercel pro (20 $/mois/membre) devient un problème, migrer vers **Coolify + Hetzner** (~7 €/mois tout inclus). L'architecture Next.js est portable — un `Dockerfile` et c'est déployé ailleurs.

---

## 5. Services tiers

### Auth : Auth.js (NextAuth v5) vs Clerk vs Better Auth

| Critère | Auth.js v5 | Clerk | Better Auth |
|---------|-----------|-------|-------------|
| **Magic Link** | Oui (email provider) | Oui | Oui |
| **SSO Google/Microsoft** | Oui | Oui | Oui |
| **Multi-tenant (rôles par orga)** | À construire soi-même | Organizations natif (rôles, invitations) | À construire soi-même |
| **Coût** | 0 € (open source) | 0 € (10K MAU) → 25$/mois (pro) | 0 € (open source) |
| **Complexité** | Haute — beaucoup de config manuelle, callbacks, sessions | Basse — composants UI inclus, dashboard | Moyenne — API claire mais setup manuel |
| **Vendor lock-in** | Non | Oui (fort) | Non |
| **Compatibilité IA** | Bonne (beaucoup de code, mais config piégeuse) | Excellente (API simple, moins d'erreurs) | Moyenne (récent, moins de training data) |
| **SAML (V2)** | Plugin communautaire | Inclus (plan Enterprise) | Possible via plugin |

**Recommandation : Better Auth**

Raison : Auth.js v5 est notoirement complexe à configurer correctement (callbacks, session strategies, edge compatibility). Clerk est excellent en DX mais crée un vendor lock-in fort et devient payant à l'échelle. **Better Auth** est le meilleur compromis : open source, self-hosted (les données restent dans votre PostgreSQL), API moderne et claire, support natif de Magic Link + OAuth + organisations/rôles (plugin `organizations`), et compatible edge. La communauté grandit vite.

Si la vélocité absolue prime et que le vendor lock-in est acceptable : Clerk. Mais pour un outil communautaire AIAD, garder le contrôle des données d'auth est cohérent avec la philosophie du projet.

### Email : Resend vs Postmark vs Brevo

| Critère | Resend | Postmark | Brevo (ex-Sendinblue) |
|---------|--------|----------|-----------------------|
| **Free tier** | 3 000 emails/mois | 100 emails/mois | 300 emails/jour (~9 000/mois) |
| **DX** | Excellente — API moderne, React Email, SDK TypeScript | Bonne — API propre, templates serveur | Correcte — API plus ancienne |
| **Délivrabilité** | Très bonne | Excellente (meilleure du marché) | Bonne |
| **Coût payant** | 20 $/mois (50K emails) | 15 $/mois (10K emails) | 9 €/mois (20K emails) |
| **EU** | Oui (région EU) | Non (US) | Oui (France) |
| **Compatibilité IA** | Excellente — API minimaliste, peu d'erreurs | Bonne | Moyenne |

**Recommandation : Resend**

3 000 emails/mois gratuits suffisent pour le MVP (magic links + invitations + relances). API TypeScript-first, intégration React Email pour templater les emails en JSX (cohérent avec la stack), région EU disponible. Si le volume explose, 20 $/mois pour 50K emails est raisonnable.

---

## Stack recommandée — Résumé

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  Next.js 15 (App Router) + TypeScript            │
│  Tailwind CSS v4 + shadcn/ui                     │
│  Recharts (charts) + TanStack Query (cache)      │
│                                                   │
│  Coût : 0 €                                      │
├─────────────────────────────────────────────────┤
│                   BACKEND                         │
│  Next.js API Routes + Server Actions              │
│  Drizzle ORM + Zod (validation)                   │
│                                                   │
│  Coût : 0 €                                      │
├─────────────────────────────────────────────────┤
│                 BASE DE DONNÉES                   │
│  PostgreSQL via Neon (serverless, EU-Frankfurt)   │
│                                                   │
│  Coût : 0 € → 19 $/mois                         │
├─────────────────────────────────────────────────┤
│                 HÉBERGEMENT                       │
│  Vercel (free tier → réévaluer post-PMF)         │
│                                                   │
│  Coût : 0 € → 20 $/mois/membre                  │
├─────────────────────────────────────────────────┤
│              SERVICES TIERS                       │
│  Auth : Better Auth (self-hosted, PostgreSQL)     │
│  Email : Resend (3K/mois gratuit, EU)            │
│                                                   │
│  Coût : 0 € → ~20 $/mois                        │
└─────────────────────────────────────────────────┘

COÛT TOTAL PRÉ-PMF :  0 €/mois
COÛT TOTAL POST-PMF : ~60-80 €/mois (estimation)
```

## Pourquoi cette stack est optimale pour maturIAté

| Critère PRD | Comment la stack y répond |
|-------------|-------------------------|
| Pages publiques SEO (State of IA, liens partageables) | Next.js SSR/SSG natif |
| Dashboards riches (heatmap, radar, courbes) | Recharts (déjà dans le code existant) + Server Components pour le data fetching |
| Multi-tenant avec rôles | Better Auth plugin `organizations` + Drizzle row-level queries |
| Requêtes analytiques (State of IA : percentiles, agrégations) | PostgreSQL (Neon) + Drizzle SQL-like queries |
| RGPD / EU | Neon Frankfurt + Resend EU + Better Auth self-hosted (données dans votre DB) |
| Budget minimal | Tout en free tier au démarrage |
| Code existant React + Recharts + Tailwind | Réutilisable tel quel dans Next.js |
| Compatibilité agents IA | Next.js + Tailwind + shadcn/ui + Drizzle = le combo le mieux supporté par Claude/Copilot en 2025-2026 |
| Migration future si besoin | Next.js portable (Dockerfile), PostgreSQL standard, pas de vendor lock-in critique |
