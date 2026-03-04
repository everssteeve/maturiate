## 1. Queries et données

- [x] 1.1 Créer `lib/queries/team-dashboard.ts` avec la fonction `getTeamDashboardData(teamId, orgId)` qui retourne : informations de l'équipe, liste des diagnostics (avec dimensionScores, globalScore, globalLevel, completedAt, filledByUser, campaignName), le dernier diagnostic, et les données d'évolution formatées pour les charts
- [x] 1.2 Implémenter le calcul de tendance globale : comparer le score global du dernier diagnostic avec l'avant-dernier (`"up"` si >+0.1, `"down"` si <-0.1, `"stable"` sinon, `null` si un seul diagnostic)
- [x] 1.3 Implémenter le calcul des tendances par dimension : même logique que la tendance globale mais pour chaque dimension individuellement (retourne un `Record<string, { trend, diff }>`)
- [x] 1.4 Écrire les tests unitaires pour `getTeamDashboardData` : équipe avec diagnostics, équipe sans diagnostic, équipe inexistante, isolation multi-tenant, calcul des tendances (up/down/stable/null)

## 2. Composant Timeline

- [x] 2.1 Créer `components/dashboard/team-timeline.tsx` — Client Component affichant la liste chronologique des diagnostics (plus récent en haut) avec : date, score global, badge niveau de maturité coloré, nom de la personne, nom de la campagne (ou "Diagnostic ad hoc")
- [x] 2.2 Implémenter la sélection de diagnostics pour comparaison radar : le diagnostic le plus récent est pré-sélectionné (label "Actuel"), clic sur un autre diagnostic le sélectionne comme comparaison (label "Comparaison"), maximum 2 sélections, clic sur le 3e remplace le 2nd

## 3. Composants Charts

- [x] 3.1 Créer `components/dashboard/team-radar-comparison.tsx` — Client Component affichant un radar chart avec support de 2 jeux de données superposés (couleur primaire pour le diagnostic actuel, secondaire semi-transparent pour la comparaison), légende avec date et score de chaque diagnostic, réutilisant le composant `RadarChart` existant
- [x] 3.2 Créer `components/dashboard/team-evolution-chart.tsx` — Client Component wrappant `evolution-chart.tsx` existant avec les données d'évolution de l'équipe, axe X = date/campagne, axe Y fixe 1-4, support courbes par dimension via légende interactive, tooltips
- [x] 3.3 Créer `components/dashboard/team-score-summary.tsx` — cartes de résumé : score global actuel (ex: "2.67 / 4"), niveau de maturité avec libellé, tendance avec flèche et delta (ex: "↑ +0.50"), nombre total de diagnostics

## 4. Recommandations

- [x] 4.1 Créer `components/dashboard/team-recommendations.tsx` — affichage des 6 cartes de recommandation triées par score croissant (axes faibles d'abord), chaque carte montre : nom de dimension, score, niveau, recommandation textuelle depuis `data/recommendations.ts`, et indicateur de tendance par dimension (↑/→/↓ avec delta)
- [x] 4.2 Gérer le cas sans tendance (premier diagnostic) : pas d'indicateur de tendance affiché sur les cartes, et le cas sans diagnostic : section non rendue

## 5. Page Dashboard Équipe

- [x] 5.1 Créer `app/(dashboard)/orgs/[orgId]/teams/[teamId]/page.tsx` — Server Component qui : vérifie les permissions (admin/consultant → toutes équipes, manager → ses équipes, member → son équipe), fetch `getTeamDashboardData`, gère la 404 si équipe inexistante, et passe les données aux composants enfants
- [x] 5.2 Créer le composant orchestrateur Client Component `components/dashboard/team-dashboard.tsx` qui gère le state de sélection des diagnostics pour comparaison, compose les sous-composants (timeline, radar, évolution, recommandations, résumé), et layout responsive (grille 2 colonnes radar+évolution sur desktop, stack sur mobile)
- [x] 5.3 Implémenter l'état vide : message quand aucun diagnostic n'est complété, avec CTA vers la page diagnostic si l'utilisateur a les droits (admin/manager)
- [x] 5.4 Ajouter le lien retour vers le dashboard organisation dans l'en-tête de la page

## 6. Tests et validation

- [x] 6.1 Écrire un test E2E Playwright vérifiant : chargement du dashboard équipe pour un admin (timeline visible, radar chart affiché, recommandations listées, cartes de résumé correctes)
- [x] 6.2 Tester la sélection de diagnostic dans la timeline et vérifier la mise à jour du radar chart comparatif
- [x] 6.3 Vérifier la responsivité : layout 2 colonnes sur desktop, empilement sur mobile, cartes de recommandation en grille responsive (1/2/3 colonnes)
