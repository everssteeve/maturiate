## ADDED Requirements

### Requirement: Page dashboard organisation accessible par rôle
Le système DOIT afficher le dashboard organisation sur la route `/orgs/[orgId]`. Les rôles `admin` et `consultant` voient le dashboard complet (toutes les équipes). Le rôle `manager` voit un dashboard filtré uniquement sur ses équipes. Le rôle `member` voit un message indiquant qu'il n'a pas accès au dashboard organisation.

#### Scenario: Admin accède au dashboard
- **WHEN** un admin accède à `/orgs/[orgId]`
- **THEN** le dashboard complet s'affiche avec toutes les équipes de l'organisation

#### Scenario: Consultant accède au dashboard
- **WHEN** un consultant accède à `/orgs/[orgId]`
- **THEN** le dashboard complet s'affiche avec toutes les équipes (lecture seule)

#### Scenario: Manager accède au dashboard
- **WHEN** un manager accède à `/orgs/[orgId]`
- **THEN** le dashboard s'affiche avec uniquement les équipes dont il est membre

#### Scenario: Member accède à la page
- **WHEN** un member accède à `/orgs/[orgId]`
- **THEN** un message indique qu'il n'a pas accès au dashboard et propose de consulter les résultats de ses équipes

### Requirement: Sélecteur de campagne
Le système DOIT afficher un sélecteur de campagne permettant de choisir quelle campagne visualiser dans la heatmap et les scores agrégés. Par défaut, la campagne la plus récente (active, ou fermée si aucune active) est sélectionnée.

#### Scenario: Sélection par défaut
- **WHEN** le dashboard se charge et l'organisation a 2 campagnes actives et 1 fermée
- **THEN** la campagne active la plus récente est sélectionnée par défaut

#### Scenario: Changement de campagne
- **WHEN** l'utilisateur sélectionne une autre campagne dans le sélecteur
- **THEN** la heatmap et les scores agrégés se mettent à jour pour refléter les données de la nouvelle campagne

#### Scenario: Aucune campagne disponible
- **WHEN** l'organisation n'a aucune campagne (hors draft)
- **THEN** le sélecteur est masqué et un état vide invite à créer une première campagne

### Requirement: Cartes de scores agrégés
Le système DOIT afficher en haut du dashboard des cartes de résumé montrant : le score global moyen de l'organisation, le niveau de maturité (avec libellé), le nombre d'équipes évaluées sur le total, et le nombre de dimensions au-dessus du niveau 3.

#### Scenario: Affichage des métriques
- **WHEN** le dashboard affiche une campagne avec 8 équipes évaluées sur 10
- **THEN** les cartes montrent le score global (ex: "2.67 / 4"), le niveau ("Intégration"), le taux de complétion ("8/10 équipes"), et le nombre de dimensions fortes

### Requirement: Organisation du layout du dashboard
Le système DOIT organiser le dashboard en sections clairement délimitées :
1. En-tête avec le nom de l'organisation, les boutons d'action (Campagnes, Paramètres pour admin), et un bouton de partage (pour les rôles autorisés)
2. Sélecteur de campagne
3. Cartes de scores agrégés (ligne horizontale)
4. Heatmap Équipes × Dimensions (largeur complète)
5. Radar chart organisation et courbe d'évolution (côte à côte sur desktop, empilés sur mobile)
6. **Section "Mon positionnement"** : si l'organisation a `opt_in_state_of_ia: true` et qu'un rapport State of IA publié existe, afficher une carte résumée avec le percentile global et un lien vers `/orgs/[orgId]/benchmark`

#### Scenario: Layout desktop
- **WHEN** le dashboard est affiché sur un écran >= 1024px
- **THEN** le radar chart et la courbe d'évolution sont affichés côte à côte dans une grille 2 colonnes

#### Scenario: Layout mobile/tablette
- **WHEN** le dashboard est affiché sur un écran < 1024px
- **THEN** le radar chart et la courbe d'évolution sont empilés verticalement

#### Scenario: Section benchmark visible pour organisation opt-in
- **WHEN** le dashboard est affiché pour une organisation avec `opt_in_state_of_ia: true` et un rapport State of IA est publié
- **THEN** le système MUST afficher une carte "Mon positionnement" en bas du dashboard avec le percentile global (ex: "72e percentile"), une phrase résumée, et un bouton "Voir le détail" menant à `/orgs/[orgId]/benchmark`

#### Scenario: Section benchmark masquée pour organisation non opt-in
- **WHEN** le dashboard est affiché pour une organisation avec `opt_in_state_of_ia: false`
- **THEN** la section "Mon positionnement" MUST ne pas être affichée

#### Scenario: Section benchmark masquée sans rapport publié
- **WHEN** le dashboard est affiché pour une organisation opt-in mais aucun rapport State of IA n'est publié
- **THEN** la section "Mon positionnement" MUST ne pas être affichée

### Requirement: État vide du dashboard
Le système DOIT afficher un état vide clair et actionnable lorsqu'il n'y a pas de données à afficher.

#### Scenario: Aucune campagne
- **WHEN** l'organisation n'a aucune campagne créée
- **THEN** un message invite à créer une première campagne avec un lien vers `/orgs/[orgId]/campaigns`

#### Scenario: Campagne sans diagnostic complété
- **WHEN** la campagne sélectionnée n'a aucun diagnostic complété
- **THEN** un message indique qu'aucun diagnostic n'a été rempli pour cette campagne

### Requirement: Performance du chargement
Le dashboard DOIT se charger en moins de 3 secondes pour une organisation de 20 équipes et 5 campagnes.

#### Scenario: Chargement avec données volumineuses
- **WHEN** le dashboard est chargé pour une organisation avec 20 équipes et 5 campagnes
- **THEN** la page est rendue côté serveur en moins de 3 secondes

### Requirement: Bouton de partage dans le dashboard organisation
Le système DOIT afficher un bouton de partage dans l'en-tête du dashboard organisation pour les utilisateurs autorisés (admin, consultant). Le bouton ouvre un dialog permettant de créer un lien de partage pour le dashboard organisation, configurer l'expiration, copier le lien, et voir/supprimer les liens existants.

#### Scenario: Admin voit le bouton de partage
- **WHEN** un admin accède au dashboard organisation
- **THEN** un bouton "Partager" est visible dans l'en-tête du dashboard

#### Scenario: Consultant voit le bouton de partage
- **WHEN** un consultant accède au dashboard organisation
- **THEN** un bouton "Partager" est visible dans l'en-tête du dashboard

#### Scenario: Manager ne voit pas le bouton de partage pour l'org
- **WHEN** un manager accède au dashboard organisation
- **THEN** le bouton "Partager" pour le dashboard organisation n'est pas affiché

#### Scenario: Ouverture du dialog de partage
- **WHEN** un utilisateur autorisé clique sur le bouton "Partager"
- **THEN** un dialog s'ouvre avec l'option de créer un nouveau lien, configurer l'expiration, et la liste des liens existants pour cette organisation
