## 1. Queries et logique métier State of IA

- [x] 1.1 Créer `lib/queries/state-of-ia.ts` avec les queries : `getBenchmarkPercentiles(year, orgHash, filters?)`, `getAggregatedStats(year)`, `getDistributionByLevel(year)`, `getTrendsByYear()`, `getStatsBySegment(year)`, `getLatestPublishedYear()`
- [x] 1.2 Créer la fonction d'anonymisation `lib/utils/anonymize.ts` : `hashOrganization(orgId)` utilisant `SHA-256(org_id + STATE_OF_IA_HASH_SALT)` via `crypto.createHash('sha256')`
- [x] 1.3 Créer le schéma Zod `ReportContent` dans `lib/validations/state-of-ia.ts` pour valider la structure JSON du contenu éditorialisé (introduction, sections avec chartType, keyInsights, methodology)

## 2. Server Actions

- [x] 2.1 Créer `lib/actions/state-of-ia.ts` avec la Server Action `extractStateOfIaSnapshots({ year })` : vérification super-admin, vérification `STATE_OF_IA_HASH_SALT`, collecte des organisations opt-in, agrégation des scores (moyenne par dimension sur la dernière campagne fermée), anonymisation, insertion dans `state_of_ia_snapshots`
- [x] 2.2 Ajouter la gestion de l'extraction déjà existante (confirmation de remplacement si snapshots existants pour l'année)
- [x] 2.3 Créer les Server Actions `createReport({ year })`, `updateReport({ reportId, content })`, `publishReport({ reportId })`, `unpublishReport({ reportId })` dans le même fichier avec vérification super-admin et validation Zod

## 3. Layout admin et middleware super-admin

- [x] 3.1 Créer le layout admin `/app/(protected)/admin/layout.tsx` vérifiant `isSuperAdmin` et affichant une sidebar d'administration
- [x] 3.2 Créer la page de redirection si l'utilisateur n'est pas super-admin

## 4. Page back-office d'extraction

- [x] 4.1 Créer la page `/app/(protected)/admin/state-of-ia/page.tsx` (Server Component) affichant : nombre d'organisations opt-in, sélecteur d'année, bouton "Lancer l'extraction", historique des extractions
- [x] 4.2 Créer le composant client `ExtractionPanel` gérant le déclenchement, le dialog de confirmation (si snapshots existants), et l'affichage du résumé post-extraction (organisations extraites, exclues)

## 5. Page back-office gestion du rapport

- [x] 5.1 Créer la page `/app/(protected)/admin/state-of-ia/reports/[year]/page.tsx` pour l'édition du rapport
- [x] 5.2 Créer le composant client `ReportEditor` avec : champ introduction (Markdown), gestion dynamique des sections (ajout, réordonnement, suppression), sélecteur de chartType par section, champ insights clés (liste éditable), champ méthodologie
- [x] 5.3 Implémenter la sauvegarde automatique (debounce 2s) avec indicateur visuel "Sauvegardé" / "Sauvegarde en cours..."
- [x] 5.4 Ajouter les boutons "Publier" / "Dépublier" et "Prévisualiser" (ouvre un nouvel onglet)

## 6. Page benchmark "Mon positionnement"

- [x] 6.1 Créer la page `/app/(protected)/org/[orgId]/benchmark/page.tsx` (Server Component) avec vérification des rôles (admin, consultant) et du statut opt-in
- [x] 6.2 Créer le composant `PercentileByDimension` affichant les 6 barres de progression avec percentile et score brut
- [x] 6.3 Créer le composant `GlobalPercentile` affichant le percentile global avec indicateur visuel (marqueur sur courbe de distribution)
- [x] 6.4 Créer le composant client `SegmentFilters` avec filtres secteur/taille, gestion du seuil minimum de 5 organisations (filtres grisés si insuffisant), et avertissement pour les croisements sous le seuil
- [x] 6.5 Gérer les états vides : organisation non opt-in (invitation à activer), opt-in sans snapshots (message d'attente)
- [x] 6.6 Ajouter un sélecteur d'année basé sur les rapports publiés

## 7. Intégration dans le dashboard organisation

- [x] 7.1 Modifier la page dashboard organisation pour ajouter une carte "Mon positionnement" en bas : afficher le percentile global et un bouton "Voir le détail" si l'organisation est opt-in et un rapport est publié. Masquer la section sinon.

## 8. Page publique State of IA

- [x] 8.1 Créer la page `/app/(public)/state-of-ia/[year]/page.tsx` (Server Component, SSR) avec metadata SEO (title, description, Open Graph)
- [x] 8.2 Créer le composant `ReportHeader` avec titre, statistiques résumées (nombre d'organisations, nombre d'équipes, score moyen, niveau moyen)
- [x] 8.3 Créer les composants de graphiques : `DistributionChart` (bar chart niveaux), `DimensionsChart` (radar/bar scores par dimension), `TrendsChart` (line chart évolution), `SegmentsChart` (grouped bar chart par secteur/taille)
- [x] 8.4 Créer le composant `ReportSection` rendant une section éditorialisée (titre + body Markdown + graphique intercalé si chartType défini)
- [x] 8.5 Créer le composant `KeyInsights` affichant les insights clés en mise en forme
- [x] 8.6 Ajouter le bouton "Télécharger PDF" déclenchant `window.print()` et la feuille CSS `@media print` (masque navigation, format A4, graphiques adaptés)
- [x] 8.7 Créer la route index `/app/(public)/state-of-ia/page.tsx` redirigeant vers le rapport le plus récent publié
- [x] 8.8 Gérer la navigation entre années (sélecteur d'année)

## 9. Tests

- [x] 9.1 Tests unitaires pour `hashOrganization` (anonymisation SHA-256, absence de salt → erreur)
- [x] 9.2 Tests unitaires pour le calcul des scores moyens par dimension (agrégation)
- [x] 9.3 Tests d'intégration pour `extractStateOfIaSnapshots` (extraction, anonymisation, insertion, gestion des exclusions)
- [x] 9.4 Tests d'intégration pour les Server Actions du rapport (`createReport`, `updateReport`, `publishReport`, `unpublishReport`)
- [x] 9.5 Tests d'intégration pour `getBenchmarkPercentiles` avec et sans filtres segment
- [x] 9.6 Tests E2E Playwright : parcours super-admin extraction + publication, parcours admin consultation benchmark, parcours visiteur page publique
