## Context

La plateforme maturIAté dispose déjà de dashboards organisation (F6) et équipe (F7) fonctionnels. Les consultants AIAD ont le rôle `consultant` dans les organisations qu'ils accompagnent, avec un accès lecture seule au dashboard organisation. Cependant, ils doivent naviguer entre organisations via l'org-switcher pour consulter chaque dashboard individuellement.

Le répertoire `src/app/(dashboard)/consultant/` existe mais ne contient pas de `page.tsx`. Le middleware protège déjà les routes `/consultant/:path*`. Les queries existantes dans `lib/queries/org-dashboard.ts` fournissent le pattern d'agrégation à suivre.

Les données nécessaires sont : organisations (via `memberships` filtrées par rôle `consultant`), scores diagnostiques agrégés par organisation, campagnes récentes, nombre d'équipes.

## Goals / Non-Goals

**Goals:**
- Fournir une vue consolidée de toutes les organisations du consultant en une seule page
- Afficher pour chaque organisation : nom, logo, score moyen, niveau de maturité, nombre d'équipes, dernière campagne et sa date
- Afficher des statistiques globales : nombre d'organisations, score moyen toutes organisations confondues, tendance globale
- Permettre la navigation rapide vers le dashboard organisation existant (F6) depuis chaque carte
- Respecter l'accès lecture seule du consultant

**Non-Goals:**
- Comparaison inter-organisations avec radar chart superposé (trop complexe pour la V1)
- Filtres avancés (par secteur, taille, période)
- Export des données consolidées
- Agrégation en temps réel (les données sont fraîches au chargement de page)
- Modification des données depuis la vue consultant

## Decisions

### 1. Architecture Server Component + Client Component léger

**Choix** : Le Server Component (`page.tsx`) vérifie que l'utilisateur est consultant dans au moins une organisation, fetch toutes les données via une query dédiée, puis passe les données à un Client Component pour l'interactivité (tri, éventuel filtre).

**Alternatives considérées** :
- Tout en Server Component : Possible car peu d'interactivité, mais le tri et les interactions futures nécessitent du state client
- API Route + fetch côté client : Complexité inutile pour une vue en lecture seule

**Rationale** : Suit le pattern établi par F6. La page consultant est principalement de la lecture avec peu d'interactivité.

### 2. Query dédiée `getConsultantOverview(userId)`

**Choix** : Créer `lib/queries/consultant.ts` avec une fonction `getConsultantOverview(userId)` qui :
1. Récupère toutes les memberships avec rôle `consultant` pour cet utilisateur
2. Pour chaque organisation, récupère les scores agrégés du dernier diagnostic de chaque équipe
3. Récupère la dernière campagne par organisation
4. Calcule les statistiques globales (score moyen cross-organisations, tendance)

**Alternatives considérées** :
- Réutiliser `getOrgDashboardData` en boucle : Multiplierait les requêtes DB (une par organisation)
- Vue SQL matérialisée : Trop complexe pour le volume attendu

**Rationale** : Une query optimisée avec 2-3 requêtes SQL (memberships + diagnostics agrégés + campagnes) est suffisante pour le volume attendu (< 10 organisations par consultant typiquement). L'agrégation se fait côté TypeScript.

### 3. Vérification d'accès par userId et non par orgId

**Choix** : La vérification d'accès ne passe pas par `requireRole(orgId)` (qui nécessite un orgId spécifique) mais par une vérification que l'utilisateur possède au moins un membership avec rôle `consultant`. La query elle-même filtre par les memberships consultant de l'utilisateur, garantissant qu'il ne voit que ses organisations.

**Rationale** : La page `/consultant` n'est pas scopée à une organisation mais à un utilisateur. Le filtrage par memberships dans la query assure l'isolation des données.

### 4. Structure des composants

```
components/dashboard/
  consultant-dashboard.tsx     # Client — liste des organisations avec stats
  consultant-org-card.tsx      # Server-compatible — carte résumé par organisation
```

Le `consultant-dashboard.tsx` reçoit les données en props et gère le rendu. Chaque `consultant-org-card.tsx` affiche le nom, logo, score moyen, niveau, nombre d'équipes, dernière campagne, et un lien vers `/orgs/[orgId]`.

### 5. Navigation et lien depuis le header

**Choix** : Ajouter un lien "Vue consultant" dans le header (ou à côté de l'org-switcher) visible uniquement pour les utilisateurs ayant au moins un membership consultant. Ce lien redirige vers `/consultant`.

**Rationale** : Le consultant doit pouvoir accéder facilement à sa vue consolidée depuis n'importe quelle page. Le header est le point d'entrée naturel.

## Risks / Trade-offs

**[Performance avec beaucoup d'organisations]** → Un consultant avec > 20 organisations pourrait voir un temps de chargement plus long. Mitigation : le volume attendu est faible (< 10 organisations typiquement). Si besoin, ajouter une pagination.

**[Absence de diagnostics dans une organisation]** → Certaines organisations pourraient n'avoir aucun diagnostic encore. Mitigation : afficher la carte avec un état "Aucun diagnostic" et un score "—".

**[Consultant retiré d'une organisation]** → Si un consultant est retiré d'une organisation, elle disparaît automatiquement de sa vue (la query filtre par memberships actives). Pas d'action spéciale nécessaire.

**[Calcul de tendance]** → La tendance (progression/régression) nécessite au moins 2 campagnes par organisation. Mitigation : n'afficher la tendance que lorsqu'il y a suffisamment de données, sinon afficher "—".
