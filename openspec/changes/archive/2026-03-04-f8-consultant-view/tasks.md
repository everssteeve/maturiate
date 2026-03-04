## 1. Queries consultant

- [x] 1.1 Créer `src/lib/queries/consultant.ts` avec les types `ConsultantOrgSummary` et `ConsultantOverviewData`
- [x] 1.2 Implémenter `getConsultantOverview(userId)` : récupérer les memberships consultant, les organisations associées, le dernier diagnostic par équipe, la dernière campagne, et calculer les scores agrégés par organisation
- [x] 1.3 Implémenter le calcul de tendance par organisation (delta entre les 2 dernières campagnes)
- [x] 1.4 Implémenter le calcul des statistiques globales cross-organisations (score moyen, nombre d'organisations, nombre d'équipes)

## 2. Vérification d'accès consultant

- [x] 2.1 Créer une fonction utilitaire `isConsultant(userId)` dans `src/lib/queries/consultant.ts` qui vérifie si l'utilisateur a au moins un membership avec rôle `consultant`
- [x] 2.2 Utiliser cette vérification dans la page `/consultant` pour rediriger les non-consultants vers `/orgs`

## 3. Composants UI

- [x] 3.1 Créer `src/components/dashboard/consultant-org-card.tsx` : carte résumé par organisation (nom, logo/initiale, score, niveau, équipes, dernière campagne, tendance)
- [x] 3.2 Créer `src/components/dashboard/consultant-dashboard.tsx` : composant client orchestrant la liste des cartes avec les statistiques globales en bandeau

## 4. Page consultant

- [x] 4.1 Créer `src/app/(dashboard)/consultant/page.tsx` : Server Component qui fetch les données via `getConsultantOverview`, vérifie l'accès consultant, et passe les données au composant client
- [x] 4.2 Implémenter l'état vide (aucune organisation) avec message explicatif
- [x] 4.3 Implémenter le tri par défaut (score décroissant, organisations sans diagnostic en dernier)

## 5. Navigation

- [x] 5.1 Modifier le header (`src/components/layout/header.tsx`) pour ajouter un lien "Vue consultant" visible uniquement pour les utilisateurs ayant au moins un membership consultant
- [x] 5.2 Ajouter la query nécessaire pour déterminer si l'utilisateur connecté est consultant (appel dans le layout ou le header)

## 6. Responsive et style

- [x] 6.1 Implémenter la grille responsive des cartes (3 colonnes desktop, 2 tablette, 1 mobile)
- [x] 6.2 Styler les badges de niveau de maturité avec les codes couleur cohérents avec le dashboard organisation (F6)

## 7. Tests

- [x] 7.1 Écrire les tests unitaires pour `getConsultantOverview` dans `tests/unit/consultant-queries.test.ts` (cas nominal, aucune organisation, organisations sans diagnostic, calcul de tendance)
- [x] 7.2 Écrire un test E2E Playwright pour le parcours consultant : accès à la page, affichage des organisations, navigation vers un dashboard organisation
