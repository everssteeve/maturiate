## MODIFIED Requirements

### Requirement: Organisation du layout du dashboard
Le système DOIT organiser le dashboard en sections clairement délimitées :
1. En-tête avec le nom de l'organisation, les boutons d'action (Campagnes, Paramètres pour admin), et un bouton de partage (pour les rôles autorisés)
2. Sélecteur de campagne
3. Cartes de scores agrégés (ligne horizontale)
4. Heatmap Équipes × Dimensions (largeur complète)
5. Radar chart organisation et courbe d'évolution (côte à côte sur desktop, empilés sur mobile)

#### Scenario: Layout desktop
- **WHEN** le dashboard est affiché sur un écran >= 1024px
- **THEN** le radar chart et la courbe d'évolution sont affichés côte à côte dans une grille 2 colonnes

#### Scenario: Layout mobile/tablette
- **WHEN** le dashboard est affiché sur un écran < 1024px
- **THEN** le radar chart et la courbe d'évolution sont empilés verticalement

## ADDED Requirements

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
