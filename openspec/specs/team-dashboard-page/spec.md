## ADDED Requirements

### Requirement: Page dashboard équipe accessible par rôle
Le système DOIT afficher le dashboard équipe sur la route `/orgs/[orgId]/teams/[teamId]`. Les rôles `admin` et `consultant` accèdent au dashboard de n'importe quelle équipe de l'organisation. Le rôle `manager` accède au dashboard uniquement des équipes dont il est membre. Le rôle `member` accède au dashboard uniquement de son équipe.

#### Scenario: Admin accède au dashboard d'une équipe
- **WHEN** un admin accède à `/orgs/[orgId]/teams/[teamId]`
- **THEN** le dashboard équipe s'affiche avec toutes les données de l'équipe

#### Scenario: Manager accède au dashboard de son équipe
- **WHEN** un manager membre de l'équipe accède à `/orgs/[orgId]/teams/[teamId]`
- **THEN** le dashboard équipe s'affiche avec toutes les données de l'équipe

#### Scenario: Manager accède au dashboard d'une équipe dont il n'est pas membre
- **WHEN** un manager qui n'est pas membre de l'équipe accède à `/orgs/[orgId]/teams/[teamId]`
- **THEN** le système affiche une page 403 ou redirige vers le dashboard organisation

#### Scenario: Member accède au dashboard de son équipe
- **WHEN** un member de l'équipe accède à `/orgs/[orgId]/teams/[teamId]`
- **THEN** le dashboard équipe s'affiche avec toutes les données de l'équipe

#### Scenario: Member accède au dashboard d'une autre équipe
- **WHEN** un member qui n'est pas dans l'équipe accède à `/orgs/[orgId]/teams/[teamId]`
- **THEN** le système affiche une page 403 ou redirige

#### Scenario: Consultant accède au dashboard d'une équipe
- **WHEN** un consultant accède à `/orgs/[orgId]/teams/[teamId]`
- **THEN** le dashboard équipe s'affiche en lecture seule

#### Scenario: Équipe inexistante
- **WHEN** l'URL contient un `teamId` invalide ou appartenant à une autre organisation
- **THEN** une page 404 est affichée

### Requirement: Layout du dashboard équipe
Le système DOIT organiser le dashboard équipe en sections :
1. En-tête avec le nom de l'équipe, un lien retour vers le dashboard organisation, le score actuel, le niveau de maturité, et un bouton de partage (pour les rôles autorisés)
2. Cartes de résumé (score global actuel, niveau de maturité, tendance, nombre de diagnostics)
3. Timeline historique des diagnostics
4. Radar chart comparatif et courbe d'évolution (côte à côte sur desktop, empilés sur mobile)
5. Recommandations personnalisées par dimension

#### Scenario: Layout desktop
- **WHEN** le dashboard est affiché sur un écran >= 1024px
- **THEN** le radar chart comparatif et la courbe d'évolution sont affichés côte à côte dans une grille 2 colonnes

#### Scenario: Layout mobile/tablette
- **WHEN** le dashboard est affiché sur un écran < 1024px
- **THEN** le radar chart et la courbe d'évolution sont empilés verticalement

### Requirement: Cartes de résumé de l'équipe
Le système DOIT afficher en haut du dashboard des cartes montrant : le score global du dernier diagnostic (ex: "2.67 / 4"), le niveau de maturité avec libellé, la tendance par rapport au diagnostic précédent (↑ amélioration, → stable, ↓ régression), et le nombre total de diagnostics complétés.

#### Scenario: Équipe avec plusieurs diagnostics
- **WHEN** le dashboard affiche une équipe ayant 5 diagnostics, le dernier avec un score de 3.0 (Intégration) et le précédent 2.5
- **THEN** les cartes montrent "3.00 / 4", "Intégration", "↑ +0.50", "5 diagnostics"

#### Scenario: Équipe avec un seul diagnostic
- **WHEN** le dashboard affiche une équipe ayant 1 seul diagnostic avec un score de 2.0
- **THEN** les cartes montrent "2.00 / 4", "Exploration", "— Premier diagnostic", "1 diagnostic"

#### Scenario: Équipe sans diagnostic
- **WHEN** le dashboard affiche une équipe sans aucun diagnostic
- **THEN** les cartes montrent des états vides avec des placeholders

### Requirement: État vide du dashboard équipe
Le système DOIT afficher un état vide clair lorsque l'équipe n'a aucun diagnostic complété.

#### Scenario: Aucun diagnostic complété
- **WHEN** l'équipe n'a aucun diagnostic complété
- **THEN** un message indique qu'aucun diagnostic n'a été rempli et propose de lancer un diagnostic si l'utilisateur a les droits

### Requirement: Lien retour vers le dashboard organisation
Le système DOIT afficher un lien de retour vers le dashboard organisation dans l'en-tête du dashboard équipe.

#### Scenario: Clic sur le lien retour
- **WHEN** l'utilisateur clique sur le lien retour
- **THEN** il est redirigé vers `/orgs/[orgId]`

### Requirement: Performance du chargement
Le dashboard équipe DOIT se charger en moins de 2 secondes pour une équipe ayant 20 diagnostics historiques.

#### Scenario: Chargement avec historique conséquent
- **WHEN** le dashboard est chargé pour une équipe avec 20 diagnostics
- **THEN** la page est rendue côté serveur en moins de 2 secondes

### Requirement: Bouton de partage dans le dashboard équipe
Le système DOIT afficher un bouton de partage dans l'en-tête du dashboard équipe pour les utilisateurs autorisés (admin, manager membre de l'équipe, consultant). Le bouton ouvre un dialog permettant de créer un lien de partage, configurer l'expiration, copier le lien, et voir/supprimer les liens existants.

#### Scenario: Admin voit le bouton de partage
- **WHEN** un admin accède au dashboard équipe
- **THEN** un bouton "Partager" est visible dans l'en-tête du dashboard

#### Scenario: Manager membre voit le bouton de partage
- **WHEN** un manager membre de l'équipe accède au dashboard équipe
- **THEN** un bouton "Partager" est visible dans l'en-tête du dashboard

#### Scenario: Member ne voit pas le bouton de partage
- **WHEN** un member accède au dashboard équipe
- **THEN** le bouton "Partager" n'est pas affiché

#### Scenario: Ouverture du dialog de partage
- **WHEN** un utilisateur autorisé clique sur le bouton "Partager"
- **THEN** un dialog s'ouvre avec l'option de créer un nouveau lien, configurer l'expiration, et la liste des liens existants pour cette équipe
