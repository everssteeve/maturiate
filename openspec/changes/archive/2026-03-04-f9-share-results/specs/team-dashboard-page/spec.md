## MODIFIED Requirements

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

## ADDED Requirements

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
