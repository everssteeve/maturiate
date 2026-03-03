## 1. Queries et données

- [x] 1.1 Ajouter `dimensionScores` au retour de `listTeamDiagnostics` dans `lib/queries/diagnostics.ts`
- [x] 1.2 Créer `listCampaignDiagnostics(campaignId, orgId)` dans `lib/queries/diagnostics.ts` — retourne les diagnostics d'une campagne avec teamId, teamName, dimensionScores, globalScore, globalLevel
- [x] 1.3 Créer `listOrgDiagnosticsByCampaign(orgId, teamIds?)` dans `lib/queries/diagnostics.ts` — retourne les diagnostics groupés par campagne pour l'évolution temporelle
- [x] 1.4 Créer `lib/queries/org-dashboard.ts` avec la fonction `getOrgDashboardData(orgId, options?)` qui orchestre les queries et calcule les scores agrégés (moyennes par dimension, score global, niveau de maturité, données heatmap, données évolution)
- [x] 1.5 Écrire les tests unitaires pour les fonctions d'agrégation de scores (moyenne par dimension, score global, niveau) dans `tests/unit/org-dashboard.test.ts`

## 2. Composant Heatmap

- [x] 2.1 Créer `components/dashboard/org-heatmap.tsx` — grille CSS avec colonnes dimensions + colonne Global, lignes par équipe, code couleur par niveau (4 couleurs), cellules vides grisées, tri alphabétique, sticky colonne noms
- [x] 2.2 Créer la fonction utilitaire `getLevelColor(score)` pour mapper un score au code couleur CSS du niveau de maturité (réutilisable par d'autres composants)

## 3. Composants Charts

- [x] 3.1 Créer `components/dashboard/org-evolution-chart.tsx` — LineChart Recharts avec axe X campagnes (chronologique), axe Y fixe 1-4, courbe score global, lignes de référence aux seuils de niveau, tooltip interactif
- [x] 3.2 Ajouter le support multi-dimensions au chart d'évolution — toggle par dimension via légende interactive, 6 lignes de couleurs distinctes
- [x] 3.3 Créer `components/dashboard/org-score-summary.tsx` — cartes de résumé : score global moyen, niveau de maturité, nombre d'équipes évaluées/total, nombre de dimensions fortes (>= niveau 3)

## 4. Page Dashboard Organisation

- [x] 4.1 Créer `components/dashboard/org-dashboard.tsx` — Client Component orchestrateur avec state pour le filtre de campagne, composition des sous-composants (heatmap, radar, évolution, résumé)
- [x] 4.2 Créer le composant sélecteur de campagne (Select/Combobox) dans `org-dashboard.tsx` avec la liste des campagnes non-draft, sélection par défaut de la plus récente
- [x] 4.3 Gérer l'état vide : aucune campagne → CTA vers création de campagne ; campagne sans diagnostic → message explicatif
- [x] 4.4 Modifier `app/(dashboard)/orgs/[orgId]/page.tsx` — remplacer le placeholder par le Server Component qui fetch `getOrgDashboardData`, vérifie le rôle, filtre les équipes pour les managers (via `teamMembers`), et passe les données à `OrgDashboard`
- [x] 4.5 Gérer la vue member : afficher un message d'accès restreint avec un lien vers les équipes pour le rôle `member`

## 5. Tests et validation

- [x] 5.1 Écrire un test E2E Playwright vérifiant le chargement du dashboard organisation pour un admin (heatmap visible, scores agrégés affichés, sélecteur de campagne fonctionnel)
- [x] 5.2 Vérifier la responsivité : layout 2 colonnes (radar + évolution) sur desktop, empilement sur mobile, scroll horizontal heatmap
