## Context

La page d'accueil actuelle (`src/app/page.tsx`) est un placeholder minimal affichant uniquement le titre et une tagline. Elle ne remplit aucune fonction de conversion (visiteurs) ni d'engagement (utilisateurs connectés).

L'architecture existante utilise Next.js 15 App Router avec des groupes de routes `(dashboard)`, `(public)`, et `(auth)`. L'authentification est gérée par Better Auth avec `auth.api.getSession()` côté serveur. Les queries sont centralisées dans `lib/queries/` et retournent des objets typés.

La page racine `/` (hors groupe de routes) est le point d'entrée naturel pour les deux cas d'usage.

## Goals / Non-Goals

**Goals :**
- Permettre à un visiteur de comprendre la valeur de maturIAté en moins de 30 secondes
- Fournir un CTA clair vers l'inscription (`/login`)
- Afficher une vue personnalisée pour les utilisateurs connectés avec l'état de leurs organisations
- Guider l'utilisateur connecté vers ses prochaines actions (diagnostics à remplir, campagnes à lancer)

**Non-Goals :**
- Pas de refonte du système d'auth ou du flow d'inscription (on redirige vers `/login` existant)
- Pas de dashboard complet sur la homepage — juste un résumé actionnable avec liens vers les dashboards existants
- Pas de page marketing séparée (tout est sur `/`)
- Pas d'animations complexes ou de bibliothèques supplémentaires
- Pas de gestion du mode sombre pour le MVP (à moins qu'il soit déjà activé globalement)

## Decisions

### D1 : Page unique adaptative plutôt que deux routes séparées

**Choix** : Un seul `src/app/page.tsx` Server Component qui détecte la session et rend conditionnellement le contenu.

**Alternatives considérées** :
- Deux routes séparées (`/` public et `/home` authentifié) — rejeté car cela complexifie la navigation et le SEO
- Middleware redirect vers `/dashboard` si connecté — rejeté car l'utilisateur connecté perd l'accès à la landing page

**Rationale** : `auth.api.getSession()` est déjà disponible côté serveur sans coût supplémentaire. Le rendu conditionnel en Server Component est simple et performant. L'utilisateur connecté peut toujours voir la landing page via un lien "À propos" si nécessaire.

### D2 : Server Component pour la homepage authentifiée

**Choix** : La vue authentifiée est un Server Component qui fetch les données de résumé côté serveur.

**Alternatives considérées** :
- Client Component avec SWR/React Query — rejeté car ajoute de la complexité et un loading state inutile
- API route dédiée — rejeté car les Server Components accèdent directement aux queries

**Rationale** : Cohérent avec le pattern existant. Le Server Component appelle directement les queries dans `lib/queries/` et passe les données aux composants enfants.

### D3 : Nouvelle query `getHomepageSummary` agrégée

**Choix** : Créer une query dédiée `lib/queries/homepage.ts` qui retourne un résumé de toutes les organisations de l'utilisateur avec leurs métriques clés.

**Structure de données** :
```typescript
type HomepageSummary = {
  organizations: Array<{
    id: string;
    name: string;
    role: string;
    activeCampaign: { id: string; name: string; completionRate: number; pendingTeams: number } | null;
    latestScores: { overall: number; dimensions: Record<string, number> } | null;
    pendingActions: Array<{ type: 'fill_diagnostic' | 'launch_campaign' | 'pending_invitation'; label: string; link: string }>;
  }>;
};
```

**Rationale** : Une seule query agrégée évite le N+1 et permet un rendu rapide. Les données sont scopées par `userId` via les memberships.

### D4 : Composants landing dans `src/components/landing/`

**Choix** : Les composants de la landing page (Hero, Benefits, HowItWorks, CTASection) vivent dans `src/components/landing/`. Les composants de la homepage authentifiée dans `src/components/homepage/`.

**Rationale** : Séparation claire des responsabilités. Les composants landing sont purement statiques (Server Components). Les composants homepage peuvent contenir des interactions simples (Client Components si nécessaire).

### D5 : Header public réutilisable

**Choix** : Créer un composant `PublicHeader` utilisé sur la page d'accueil (non connecté) et potentiellement réutilisable pour les pages publiques futures.

**Alternatives considérées** :
- Intégrer le header directement dans la landing — rejeté car le header public sera utile pour d'autres pages (State of IA, about)
- Utiliser le header dashboard existant — rejeté car il contient l'org switcher et la navigation authentifiée

**Rationale** : Le header public est léger (logo, lien State of IA, boutons Connexion/Inscription) et distinct du header dashboard.

## Risks / Trade-offs

- **[Performances query agrégée]** → La query `getHomepageSummary` fait des jointures sur plusieurs tables (memberships, campaigns, diagnostics). Mitigation : Limiter aux campagnes actives uniquement, utiliser des subqueries count plutôt que de charger toutes les lignes. Surveiller les performances avec des index existants.

- **[Contenu landing statique]** → Le contenu de la landing page (textes, bénéfices, étapes) est codé en dur dans les composants. Mitigation : Acceptable pour le MVP, un CMS headless pourrait être ajouté en V2 si nécessaire.

- **[SEO et métadonnées]** → La page racine doit être optimisée pour le SEO avec des métadonnées Open Graph. Mitigation : Utiliser les metadata Next.js (`generateMetadata`) avec titre, description, et image OG.

- **[Session check sur chaque visite]** → Chaque visite à `/` déclenche un check de session. Mitigation : Better Auth gère le caching des sessions côté serveur, le coût est négligeable.
