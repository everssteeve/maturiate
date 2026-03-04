## Why

maturIAté permet aux organisations d'évaluer la maturité IA de leurs équipes, mais chaque organisation travaille isolément sans point de comparaison. Le State of IA est le rapport annuel qui agrège les données anonymisées des organisations opt-in pour produire un benchmark sectoriel. Il permet à chaque organisation participante de se positionner (percentiles par dimension) et offre à l'écosystème une publication publique sur l'état de la maturité IA en France. C'est le dernier pilier fonctionnel de la V1 (F10), dépendant de F2 (organisations), F4 (diagnostics) et F6 (dashboard).

## What Changes

- **Extraction annuelle des snapshots** : back-office super-admin permettant de déclencher l'extraction des données anonymisées (hash SHA-256 de l'org_id + salt) des organisations opt-in vers la table `state_of_ia_snapshots`
- **Page benchmark "Mon positionnement"** : dans le dashboard de chaque organisation opt-in, affichage du percentile par dimension et score global, filtrable par secteur/taille (seuil minimum de 5 organisations par segment)
- **Gestion des rapports** : back-office super-admin pour créer/éditer le contenu éditorialisé du rapport annuel (stocké dans `state_of_ia_reports`)
- **Page publique `/state-of-ia/{année}`** : page SSR accessible sans authentification affichant la distribution des niveaux de maturité, les scores moyens par dimension, les tendances, la segmentation, et les insights clés rédigés par l'équipe AIAD
- **Téléchargement PDF** : lien de téléchargement du rapport complet depuis la page publique

## Capabilities

### New Capabilities
- `state-of-ia-extraction`: Extraction et anonymisation des données des organisations opt-in vers les snapshots annuels (back-office super-admin)
- `state-of-ia-benchmark`: Page "Mon positionnement" dans le dashboard organisation — percentiles par dimension, comparaison par segment
- `state-of-ia-report-management`: Gestion CRUD du rapport annuel dans le back-office super-admin (création, édition du contenu éditorialisé, publication)
- `state-of-ia-public-page`: Page publique `/state-of-ia/{année}` avec visualisations des données agrégées et contenu éditorialisé

### Modified Capabilities
- `org-dashboard-page`: Ajout d'un onglet/section "Mon positionnement" renvoyant vers la page benchmark pour les organisations opt-in

## Impact

- **Base de données** : utilisation des tables `state_of_ia_snapshots` et `state_of_ia_reports` déjà définies dans le schéma
- **Routes** : ajout de `/app/(protected)/org/[orgId]/benchmark/page.tsx`, `/app/(public)/state-of-ia/[year]/page.tsx`, `/app/(protected)/admin/state-of-ia/page.tsx`
- **Queries** : nouveau fichier `lib/queries/state-of-ia.ts` avec `getBenchmarkPercentiles`, `getAggregatedStats`, `getDistributionByLevel`, `getTrends`
- **Actions** : nouveau fichier `lib/actions/state-of-ia.ts` avec `extractSnapshots`, `createReport`, `updateReport`, `publishReport`
- **Permissions** : les routes back-office nécessitent le flag `isSuperAdmin`, la page benchmark nécessite un rôle admin/consultant + org opt-in
- **Dépendances** : potentiellement une librairie de génération PDF (ou génération côté client via `window.print()` pour le MVP)
- **Variable d'environnement** : `STATE_OF_IA_HASH_SALT` nécessaire pour l'anonymisation
