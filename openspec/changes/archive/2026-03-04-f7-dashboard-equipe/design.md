## Context

Le dashboard organisation (F6) est implémenté et fournit une vue macro (heatmap, scores agrégés, évolution temporelle). Cependant, il manque une vue détaillée par équipe. La route `/orgs/[orgId]/teams/[teamId]` doit servir de dashboard équipe, offrant un historique des diagnostics, l'évolution des scores dans le temps, et des recommandations personnalisées.

Les composants de visualisation suivants existent déjà et sont réutilisables :
- `components/charts/radar-chart.tsx` — radar chart Recharts pour les 6 dimensions
- `components/charts/evolution-chart.tsx` — courbe d'évolution avec légende interactive par dimension
- `components/charts/score-gauge.tsx` — jauge de score global

Les queries existantes dans `diagnostic-queries` fournissent `listTeamDiagnostics(teamId, orgId)` et `getLatestDiagnostic(teamId)` qui retournent les données de base.

Le système de permissions (`lib/permissions.ts` avec `requireRole()`) et l'isolation multi-tenant par `orgId` sont en place.

## Goals / Non-Goals

**Goals :**
- Fournir une page dashboard pour chaque équipe montrant l'historique complet des diagnostics
- Afficher l'évolution temporelle des scores (global et par dimension) via des courbes
- Permettre la comparaison visuelle de radar charts entre diagnostics (superposition)
- Générer des recommandations personnalisées basées sur le dernier diagnostic et la tendance
- Respecter les permissions par rôle (admin : toutes équipes, manager : ses équipes, member : son équipe)

**Non-Goals :**
- Export PDF/CSV des données équipe (F9 — Partage de Résultats)
- Comparaison inter-équipes (c'est le rôle du dashboard organisation F6)
- Édition ou suppression de diagnostics passés
- Notifications ou alertes sur l'évolution des scores
- Questions bonus dans l'analyse d'évolution (hors scope V1)

## Decisions

### 1. Architecture de la page — Server Component avec Client Components enfants

**Choix** : La page `teams/[teamId]/page.tsx` est un Server Component qui fetch toutes les données, puis les passe en props à des Client Components interactifs.

**Rationale** : C'est le pattern établi dans le projet (cf. org-dashboard-page). Le Server Component gère l'auth, les permissions et le data fetching. Les Client Components gèrent les interactions (sélection de diagnostics à comparer, toggle des dimensions sur les courbes, etc.).

**Alternative rejetée** : API Routes + fetching côté client — ajouterait de la latence et de la complexité sans bénéfice pour un dashboard de cette taille.

### 2. Superposition de radar charts — Sélection de 2 diagnostics à comparer

**Choix** : Permettre à l'utilisateur de sélectionner jusqu'à 2 diagnostics dans la timeline pour les superposer sur un radar chart. Le dernier diagnostic est toujours pré-sélectionné. Le second est optionnel et permet une comparaison "avant/après".

**Rationale** : Superposer plus de 2 radars rend le chart illisible. 2 diagnostics suffisent pour visualiser la progression entre deux points dans le temps. L'utilisateur peut changer la sélection via la timeline.

**Alternative rejetée** : Animation temporelle (morphing du radar) — complexe à implémenter, moins utile car on ne peut pas comparer précisément deux états. Slider temporel — plus complexe qu'un simple clic sur la timeline.

### 3. Recommandations — Logique basée sur les constantes et la tendance

**Choix** : Les recommandations combinent deux sources :
1. Les recommandations statiques de `data/recommendations.ts` correspondant au niveau actuel de chaque dimension
2. Un indicateur de tendance (↑ amélioration, → stable, ↓ régression) calculé en comparant le dernier diagnostic avec l'avant-dernier

**Rationale** : Les recommandations statiques existent déjà (utilisées dans diagnostic-results). L'ajout de la tendance enrichit le feedback sans complexité excessive. Pas besoin de ML/IA pour V1.

**Alternative rejetée** : Recommandations dynamiques via LLM — over-engineered pour V1, coûteux, et non déterministe.

### 4. Query dédiée — `getTeamDashboardData(teamId, orgId)`

**Choix** : Créer une fonction agrégée `getTeamDashboardData` dans `lib/queries/team-dashboard.ts` qui retourne en un seul appel : la liste des diagnostics avec scores, les données d'évolution formatées pour les charts, et les informations de l'équipe.

**Rationale** : Suit le pattern de `getOrgDashboardData`. Évite des appels multiples depuis le Server Component et centralise la logique de transformation des données.

### 5. Courbe d'évolution — Réutilisation du composant existant

**Choix** : Réutiliser `components/charts/evolution-chart.tsx` tel quel. Les données d'entrée ont le même format : points temporels avec score global et scores par dimension. L'axe X utilise la date du diagnostic (ou le nom de la campagne si disponible).

**Rationale** : Le composant supporte déjà la légende interactive, le toggle par dimension, les tooltips, et l'échelle Y fixe 1-4.

### 6. Layout responsive

**Choix** : Le dashboard est structuré en sections empilées verticalement :
1. En-tête équipe (nom, score actuel, niveau, lien retour)
2. Cartes de résumé (score global, niveau, tendance, nombre de diagnostics)
3. Timeline historique (liste chronologique des diagnostics)
4. Radar chart comparatif + courbe d'évolution (côte à côte sur desktop, empilés sur mobile)
5. Recommandations personnalisées (cards par dimension)

**Rationale** : Cohérent avec le layout du dashboard organisation. Grid 2 colonnes au-dessus de 1024px pour les charts, stack vertical en dessous.

## Risks / Trade-offs

- **Performance avec beaucoup de diagnostics** → Une équipe avec 50+ diagnostics pourrait ralentir le chargement. Mitigation : les queries retournent les données nécessaires sans pagination (le volume attendu est faible, ~2-4 diagnostics par campagne par équipe). Si besoin futur, ajouter une pagination côté query.

- **Radar chart avec 2 overlays peu lisible sur mobile** → Sur petit écran, superposer 2 radars peut être confus. Mitigation : sur mobile, afficher les 2 radars l'un au-dessus de l'autre plutôt que superposés, ou afficher uniquement le dernier avec un toggle pour voir le précédent.

- **Recommandations statiques limitées** → Les recommandations de `data/recommendations.ts` sont les mêmes que celles affichées dans les résultats de diagnostic individuels. Mitigation acceptable pour V1 : l'ajout de la tendance (↑/→/↓) apporte une valeur ajoutée. Des recommandations plus riches pourront être ajoutées en V2.

- **Accès manager à l'équipe** → Le manager ne voit que ses équipes, mais il faut vérifier l'appartenance. Mitigation : la vérification se fait via `requireRole()` + une query qui filtre par les `teamIds` du membre courant.
