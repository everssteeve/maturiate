## Context

La plateforme maturIAté dispose de dashboards organisation (F6) et équipe (F7) fonctionnels, ainsi qu'une vue consultant (F8). Les utilisateurs ont besoin de partager les résultats avec des parties prenantes externes (COMEX, équipes, clients) sans leur créer de compte. La table `share_links` existe déjà dans le schéma DB avec les champs nécessaires (token, type, targetId, orgId, createdBy, expiresAt).

## Goals / Non-Goals

**Goals:**
- Permettre la création de liens partageables pour 3 types de cibles (team, campaign, org)
- Afficher des pages publiques en lecture seule accessibles sans authentification
- Gérer les permissions de création de lien selon les rôles (admin: tout, manager: ses équipes, consultant: ses organisations)
- Supporter l'expiration optionnelle des liens

**Non-Goals:**
- Export PDF/CSV (V2)
- Protection par mot de passe des liens
- Analytics de consultation des liens (nombre de vues, etc.)
- Personnalisation visuelle des pages partagées
- Partage de diagnostics individuels (hors périmètre — uniquement team, campaign, org)

## Decisions

### 1. Génération de token avec `crypto.randomUUID()`
**Choix** : Utiliser `crypto.randomUUID()` côté serveur pour générer des tokens uniques.
**Alternative considérée** : nanoid, tokens courts encodés en base62.
**Rationale** : UUID v4 est natif Node.js, suffisamment long pour éviter les collisions, et ne nécessite aucune dépendance supplémentaire. La colonne `token` a déjà une contrainte UNIQUE en DB.

### 2. Pages publiques sous `/share/[token]` avec route group `(public)`
**Choix** : Créer un route group `(public)` dans l'App Router qui bypass l'authentification, avec une route dynamique `/share/[token]`.
**Alternative considérée** : Middleware spécifique pour les routes `/share/*`, ou API route qui renvoie du JSON consommé par une SPA.
**Rationale** : Le route group `(public)` est le pattern Next.js idiomatique pour les pages sans auth. Le SSR permet un bon SEO et un affichage rapide sans JavaScript côté client. Le token dans l'URL est simple à partager.

### 3. Réutilisation des composants de dashboard existants en mode lecture seule
**Choix** : Les pages partagées réutilisent les composants de visualisation existants (heatmap, radar chart, timeline, etc.) avec un prop `readOnly` qui masque les actions interactives (boutons, liens de navigation interne).
**Alternative considérée** : Composants dédiés pour les pages partagées.
**Rationale** : Évite la duplication de code. Les composants de visualisation sont déjà découplés des actions — il suffit de ne pas rendre les boutons d'action.

### 4. Server Actions pour le CRUD des liens
**Choix** : Server Actions dans `lib/actions/share-links.ts` avec validation Zod, conformément au pattern de mutation du projet.
**Rationale** : Cohérent avec l'architecture existante. Les Server Actions permettent la validation des permissions côté serveur avant toute opération.

### 5. Composant ShareButton intégré dans les dashboards existants
**Choix** : Un composant `ShareButton` qui ouvre un Dialog avec la configuration du lien (expiration optionnelle), la copie du lien, et la liste des liens existants.
**Alternative considérée** : Page dédiée de gestion des liens, ou menu contextuel.
**Rationale** : Le dialog intégré dans le dashboard offre la meilleure UX — l'utilisateur reste dans son contexte et peut créer/gérer les liens sans navigation supplémentaire.

### 6. Rendu conditionnel selon le type de lien
**Choix** : La page `/share/[token]` effectue un lookup du token en DB, puis rend le composant approprié selon `share_links.type` :
- `team` → Affichage du dashboard équipe (dernier diagnostic + historique)
- `campaign` → Affichage des résultats de la campagne (toutes les équipes)
- `org` → Affichage du dashboard organisation complet
**Rationale** : Un seul point d'entrée simplifie le routage et le partage. Le type détermine le rendu côté serveur.

## Risks / Trade-offs

- **[Lien devinable]** → Les UUID v4 ont 122 bits d'entropie, rendant le bruteforce impraticable. L'expiration optionnelle ajoute une couche de protection temporelle.
- **[Données obsolètes via lien]** → Les pages partagées affichent les données en temps réel (pas un snapshot). Si les données changent, le lien montre les données actuelles. C'est le comportement attendu pour V1.
- **[Suppression accidentelle du lien source]** → Si l'équipe, la campagne ou l'org est supprimée, le lien renverra une page 404 propre grâce au `ON DELETE CASCADE` sur `orgId`. Le `targetId` sera vérifié à chaque accès.
- **[Performance des pages publiques]** → Les requêtes des pages partagées sont identiques à celles des dashboards existants (déjà optimisées). Pas de risque de dégradation supplémentaire.
