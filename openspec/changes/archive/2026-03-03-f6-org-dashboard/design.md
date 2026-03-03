## Context

La plateforme maturIAté dispose déjà de diagnostics individuels par équipe (F4) et de campagnes (F5) permettant de collecter ces diagnostics. La page organisation (`/orgs/[orgId]/page.tsx`) affiche actuellement un placeholder. Les données diagnostiques sont stockées dans la table `diagnostics` avec `dimensionScores` (JSONB), `globalScore` et `globalLevel` pré-calculés par équipe. Les campagnes fournissent le contexte temporel.

Le dashboard organisation doit agréger ces données individuelles pour fournir une vue consolidée aux admins, consultants et managers (restreint à leurs équipes).

Le composant `RadarChart` (`components/charts/radar-chart.tsx`) existe déjà et utilise Recharts. Les queries Drizzle existantes dans `lib/queries/diagnostics.ts` et `lib/queries/campaigns.ts` fournissent les patterns à suivre.

## Goals / Non-Goals

**Goals:**
- Fournir une vue heatmap Équipes × Dimensions pour identifier visuellement les forces et faiblesses
- Afficher un radar chart agrégé au niveau organisation
- Montrer l'évolution temporelle des scores au fil des campagnes
- Permettre le filtrage par campagne pour comparer les évaluations
- Respecter l'isolation multi-tenant et le filtrage par rôle (managers voient uniquement leurs équipes)
- Offrir une expérience performante avec des données pré-calculées (pas de calcul à la volée)

**Non-Goals:**
- Classement ou ranking explicite des équipes (éviter la compétition toxique)
- Alertes automatiques sur les régressions
- Export PDF/CSV des données du dashboard
- Filtrage avancé par métadonnées ou segmentation personnalisée
- Dashboard temps réel (les données sont rafraîchies au chargement de page)

## Decisions

### 1. Architecture Server Component + Client Components interactifs

**Choix** : Le Server Component (`page.tsx`) fetch toutes les données nécessaires via une query agrégée, puis passe les données à des Client Components pour les visualisations interactives.

**Alternatives considérées** :
- API Route + fetch côté client : Ajouterait de la complexité (route API, gestion d'état, loading states) sans bénéfice réel puisque les données ne changent pas dynamiquement
- Tout en Server Components : Impossible car les charts Recharts nécessitent l'interactivité client et les filtres nécessitent du state local

**Rationale** : Suit le pattern établi dans le projet (F4 diagnostic results). Le Server Component gère l'auth, les permissions et le data fetching. Les Client Components gèrent uniquement le rendu interactif.

### 2. Query unique `getOrgDashboardData` plutôt que multiples queries

**Choix** : Une fonction de query principale dans `lib/queries/org-dashboard.ts` qui retourne toutes les données nécessaires en un appel. Cette fonction fait 2-3 requêtes SQL optimisées (campagnes + diagnostics avec jointures) et fait l'agrégation côté serveur TypeScript.

**Alternatives considérées** :
- Agrégation SQL avec GROUP BY et fonctions d'agrégation : Plus performant pour de très gros volumes, mais complexifie considérablement les queries Drizzle et rend le code moins lisible
- Queries séparées par composant : Multiplierait les allers-retours DB

**Rationale** : Le volume de données est modéré (typiquement < 50 équipes, < 10 campagnes). L'agrégation TypeScript est plus lisible, testable et maintenable. Si des problèmes de performance apparaissent, on pourra optimiser vers SQL sans changer l'interface.

### 3. Filtrage par campagne comme axe principal

**Choix** : Le filtre de campagne est le filtre principal. Par défaut, la campagne la plus récente (active ou fermée) est sélectionnée. L'utilisateur peut changer de campagne via un sélecteur. Les courbes d'évolution montrent toutes les campagnes.

**Rationale** : Une campagne = une évaluation. Comparer les résultats entre campagnes est le cas d'usage principal. Le filtre par équipe est secondaire (appliqué en complément).

### 4. Réutilisation du RadarChart existant

**Choix** : Réutiliser le composant `RadarChart` de `components/charts/radar-chart.tsx` qui accepte déjà un `DimensionScores`. Pour le dashboard org, on passe les scores moyens agrégés.

**Rationale** : Évite la duplication de code. L'interface est identique (un `Record<string, number>` de dimension scores).

### 5. Heatmap en composant custom avec grille HTML/CSS

**Choix** : Construire la heatmap comme une grille CSS (`grid`) avec des cellules colorées, plutôt qu'utiliser un composant Recharts.

**Alternatives considérées** :
- Recharts Heatmap : Recharts n'a pas de composant heatmap natif. Il faudrait un scatter plot customisé, ce qui est plus complexe
- Bibliothèque tierce (nivo, visx) : Ajouterait une dépendance pour un seul composant

**Rationale** : Une grille HTML/CSS est plus légère, entièrement stylable avec Tailwind, responsive naturellement, et accessible. Les cellules affichent un score numérique + un badge de niveau coloré.

### 6. Restriction manager côté query

**Choix** : Pour les managers, filtrer les équipes au niveau de la query `getOrgDashboardData` en ne retournant que les équipes dont ils sont membres (via `teamMembers`). Les scores agrégés organisation ne sont visibles que par admin/consultant.

**Rationale** : Sécurité par défaut. Le filtrage côté query garantit que les données non autorisées ne sont jamais envoyées au client.

### 7. Structure des composants

```
components/dashboard/
  org-dashboard.tsx           # Client — orchestrateur avec filtres + state
  org-heatmap.tsx             # Client — grille Équipes × Dimensions
  org-evolution-chart.tsx     # Client — courbes d'évolution Recharts
  org-score-summary.tsx       # Server-compatible — cartes scores agrégés
```

Les composants de `components/charts/` (dont `radar-chart.tsx`) sont partagés.

## Risks / Trade-offs

**[Performance avec beaucoup d'équipes]** → Le calcul d'agrégation TypeScript peut ralentir au-delà de ~100 équipes. Mitigation : volume attendu faible (< 50 équipes typiquement). Si besoin, migrer vers agrégation SQL.

**[Absence de données]** → Si aucun diagnostic n'a été complété, le dashboard doit afficher un état vide clair. Mitigation : composant d'état vide avec call-to-action vers la création de campagne.

**[Manager sans équipe]** → Un manager non assigné à une équipe verrait un dashboard vide. Mitigation : message explicatif indiquant qu'il faut être assigné à une équipe.

**[Campagne sans réponses complètes]** → La heatmap peut avoir des cellules vides. Mitigation : afficher les cellules vides avec un style distinct (grisé + "—") plutôt que masquer les équipes sans diagnostic.
