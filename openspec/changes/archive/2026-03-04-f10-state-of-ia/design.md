## Context

F10 est la dernière fonctionnalité V1 de maturIAté. Les organisations opt-in (via F2/settings) contribuent leurs données agrégées et anonymisées à un benchmark annuel. Le schéma DB (`state_of_ia_snapshots`, `state_of_ia_reports`) existe déjà. Les tables `organizations` ont déjà le champ `opt_in_state_of_ia`. L'opt-in est déjà implémenté (spec `state-of-ia-opt-in`).

Le State of IA comprend 4 axes :
1. **Extraction** : processus back-office super-admin qui collecte et anonymise les données
2. **Benchmark** : page "Mon positionnement" pour les organisations participantes
3. **Gestion du rapport** : back-office super-admin pour éditer le contenu éditorialisé
4. **Page publique** : publication SSR du rapport annuel

## Goals / Non-Goals

**Goals :**
- Permettre à l'équipe AIAD (super-admin) d'extraire les snapshots annuels anonymisés
- Offrir aux organisations opt-in un benchmark par percentile (par dimension et score global)
- Permettre la gestion et publication d'un rapport annuel éditorialisé
- Rendre le rapport accessible publiquement sans authentification via SSR

**Non-Goals :**
- Benchmark temps réel (mise à jour uniquement lors de la publication annuelle)
- Génération automatique du contenu éditorialisé (l'équipe AIAD rédige l'analyse)
- Export PDF sophistiqué (utilisation de `window.print()` / CSS print pour le MVP)
- Multi-langue (français uniquement)
- Comparaison inter-organisations nominative (tout est anonyme)

## Decisions

### D1 : Anonymisation via SHA-256 côté serveur

**Choix** : Hash `SHA-256(org_id + STATE_OF_IA_HASH_SALT)` dans la Server Action d'extraction.

**Alternatives écartées** :
- Hash côté DB (fonction PostgreSQL) : moins testable, salt exposé dans les requêtes SQL
- Pseudonymisation réversible : ne respecte pas l'exigence d'irréversibilité

**Rationale** : Le salt est une variable d'environnement (`STATE_OF_IA_HASH_SALT`), jamais stocké en base. Le hash est calculé en Node.js via `crypto.createHash('sha256')`. L'organisation ne peut pas être ré-identifiée même en cas de fuite de la base.

### D2 : Back-office super-admin intégré dans l'app (pas d'outil externe)

**Choix** : Pages protégées sous `/app/(protected)/admin/state-of-ia/` avec vérification `isSuperAdmin`.

**Alternatives écartées** :
- Drizzle Studio pour l'extraction manuelle : trop risqué, pas d'interface métier
- Outil admin séparé (Retool, AdminJS) : ajout de complexité et de dépendance inutile pour le MVP

**Rationale** : Le back-office n'a que 2 fonctions (extraction + gestion rapport), c'est suffisamment simple pour être intégré directement.

### D3 : Seuil minimum de 5 organisations par segment pour le filtrage

**Choix** : Lorsqu'un segment (secteur/taille) a moins de 5 organisations, le filtre est désactivé pour ce segment et un message explique pourquoi.

**Rationale** : Évite la ré-identification indirecte. Si un secteur niche n'a que 2 organisations, afficher les percentiles de ce segment les rendrait identifiables.

### D4 : Contenu éditorialisé stocké en JSONB

**Choix** : La table `state_of_ia_reports.content` stocke un objet JSON structuré par sections :
```typescript
type ReportContent = {
  introduction: string;
  sections: Array<{
    title: string;
    body: string; // Markdown
    chartType?: 'distribution' | 'dimensions' | 'trends' | 'segments';
  }>;
  keyInsights: string[];
  methodology: string;
}
```

**Alternatives écartées** :
- Markdown unique : moins structuré, difficile d'associer les graphiques aux sections
- CMS externe : sur-ingénierie pour le MVP

**Rationale** : Le JSONB permet de structurer le rapport en sections avec des graphiques intercalés, tout en restant simple à éditer via un formulaire.

### D5 : PDF via CSS print pour le MVP

**Choix** : Bouton "Télécharger PDF" utilise `window.print()` avec une feuille CSS `@media print` dédiée.

**Alternatives écartées** :
- Puppeteer côté serveur : complexe à déployer sur Vercel (serverless)
- Librairie PDF (jsPDF, react-pdf) : rendu différent du HTML, duplication d'effort

**Rationale** : Suffisant pour le MVP. Le résultat est un "Save as PDF" natif du navigateur. Une solution serveur pourra être ajoutée en V2 si nécessaire.

### D6 : Requêtes analytiques avec Drizzle SQL raw

**Choix** : Les requêtes de percentiles et agrégation utilisent `db.execute(sql\`...\`)` avec du SQL raw typé, pas le query builder Drizzle.

**Rationale** : Les fonctions `PERCENT_RANK()`, `FILTER`, et les window functions ne sont pas bien supportées par le query builder Drizzle. Le SQL raw est plus lisible et performant pour ces cas analytiques.

### D7 : Route back-office sous un layout admin dédié

**Choix** : `/app/(protected)/admin/layout.tsx` vérifie `isSuperAdmin` et affiche un layout spécifique (sidebar admin). Les pages State of IA sont sous `/admin/state-of-ia/`.

**Rationale** : Sépare clairement le back-office du reste de l'application. Le middleware de layout garantit qu'aucune page admin n'est accessible sans le flag super-admin.

## Risks / Trade-offs

| Risque | Impact | Mitigation |
|--------|--------|------------|
| Ré-identification indirecte via segments trop fins | Haut | Seuil de 5 organisations minimum par segment. Pas de croisement secteur × taille si l'échantillon est trop petit. |
| Perte du salt `STATE_OF_IA_HASH_SALT` | Haut (impossibilité de recalculer les hash pour les années suivantes) | Documenter la rotation, sauvegarder le salt de manière sécurisée en dehors de Vercel. |
| Performance des requêtes analytiques sur gros volume | Moyen | Index sur `(year)` et `(year, sector)` dans `state_of_ia_snapshots`. Les volumes V1 seront faibles (< 1000 snapshots). |
| Qualité du PDF via `window.print()` | Faible | Acceptable pour le MVP, amélioration en V2. CSS print bien testé sur Chrome/Firefox. |
| Contenu éditorialisé mal structuré | Faible | Validation Zod du schéma `ReportContent` lors de la sauvegarde. |

## Open Questions

- Faut-il ajouter un index composé `(year, sector, size)` dès le départ ou attendre d'observer les requêtes lentes ?
- Le rapport doit-il supporter des images/logos custom de l'équipe AIAD ou uniquement du texte + graphiques auto-générés ?
