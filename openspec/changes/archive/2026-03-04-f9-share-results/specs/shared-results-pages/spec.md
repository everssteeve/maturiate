## ADDED Requirements

### Requirement: Page partagée de résultats d'équipe
Le système DOIT afficher une page publique en lecture seule avec les résultats d'une équipe lorsque le lien est de type `team`. La page affiche le nom de l'équipe, le nom de l'organisation, le dernier diagnostic (score global, niveau de maturité, scores par dimension via radar chart), la timeline historique des diagnostics, et les recommandations.

#### Scenario: Affichage des résultats d'équipe
- **WHEN** un visiteur accède à `/share/[token]` avec un lien de type `team`
- **THEN** la page affiche le nom de l'équipe, le score global, le radar chart des dimensions, la timeline historique, et les recommandations

#### Scenario: Équipe sans diagnostic
- **WHEN** un visiteur accède à un lien de type `team` mais l'équipe n'a aucun diagnostic
- **THEN** la page affiche un message indiquant qu'aucun résultat n'est disponible

### Requirement: Page partagée de résultats de campagne
Le système DOIT afficher une page publique en lecture seule avec les résultats d'une campagne lorsque le lien est de type `campaign`. La page affiche le nom de la campagne, les dates, le score moyen, la heatmap des équipes participantes avec leurs scores par dimension, et le radar chart agrégé.

#### Scenario: Affichage des résultats de campagne
- **WHEN** un visiteur accède à `/share/[token]` avec un lien de type `campaign`
- **THEN** la page affiche le nom de la campagne, le score moyen, la heatmap équipes × dimensions, et le radar chart agrégé

#### Scenario: Campagne sans diagnostic complété
- **WHEN** un visiteur accède à un lien de type `campaign` mais aucune équipe n'a complété de diagnostic
- **THEN** la page affiche un message indiquant que les résultats ne sont pas encore disponibles

### Requirement: Page partagée du dashboard organisation
Le système DOIT afficher une page publique en lecture seule avec le dashboard de l'organisation lorsque le lien est de type `org`. La page affiche le nom de l'organisation, les scores agrégés, la heatmap, le radar chart, et la courbe d'évolution — sans les actions d'administration (gestion campagnes, paramètres, invitations).

#### Scenario: Affichage du dashboard organisation partagé
- **WHEN** un visiteur accède à `/share/[token]` avec un lien de type `org`
- **THEN** la page affiche le dashboard organisation complet en lecture seule, sans boutons d'action ni liens d'administration

#### Scenario: Organisation sans données
- **WHEN** un visiteur accède à un lien de type `org` mais l'organisation n'a aucune campagne ou diagnostic
- **THEN** la page affiche un message indiquant qu'aucune donnée n'est disponible

### Requirement: Layout des pages partagées
Le système DOIT afficher les pages partagées avec un layout minimaliste : un en-tête avec le logo maturIAté et la mention "Résultats partagés", le contenu des résultats, et un pied de page avec un lien vers la plateforme. Les pages sont responsives.

#### Scenario: Layout desktop
- **WHEN** la page partagée est affichée sur un écran >= 1024px
- **THEN** les charts sont affichés côte à côte comme dans le dashboard original

#### Scenario: Layout mobile
- **WHEN** la page partagée est affichée sur un écran < 1024px
- **THEN** les charts sont empilés verticalement

#### Scenario: En-tête de la page partagée
- **WHEN** un visiteur accède à une page partagée
- **THEN** l'en-tête affiche le logo maturIAté et la mention "Résultats partagés" sans barre de navigation de l'application

### Requirement: Sécurité des pages partagées
Le système NE DOIT PAS exposer de données sensibles sur les pages partagées. Les emails des membres, les paramètres d'organisation, les informations de facturation, et les liens de navigation internes NE DOIVENT PAS être visibles.

#### Scenario: Données sensibles masquées
- **WHEN** un visiteur accède à une page partagée
- **THEN** aucune adresse email, aucun paramètre d'organisation, et aucun lien de navigation vers l'application n'est visible

#### Scenario: Accès direct aux API internes impossible
- **WHEN** un visiteur sans authentification tente d'accéder à des API internes de l'application
- **THEN** les API retournent une erreur 401
