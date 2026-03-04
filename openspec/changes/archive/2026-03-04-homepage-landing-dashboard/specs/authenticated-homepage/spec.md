## ADDED Requirements

### Requirement: La homepage authentifiée affiche un résumé des organisations de l'utilisateur

Le système DOIT afficher une vue personnalisée lorsqu'un utilisateur connecté accède à `/`. Cette vue DOIT lister toutes les organisations auxquelles l'utilisateur appartient avec un résumé de leur état.

#### Scenario: Utilisateur connecté avec une organisation
- **WHEN** un utilisateur authentifié appartenant à une organisation accède à `/`
- **THEN** le système affiche une carte de résumé pour cette organisation incluant le nom, le rôle de l'utilisateur, et les métriques clés

#### Scenario: Utilisateur connecté avec plusieurs organisations
- **WHEN** un utilisateur authentifié appartenant à plusieurs organisations accède à `/`
- **THEN** le système affiche une carte de résumé pour chaque organisation

#### Scenario: Utilisateur connecté sans organisation
- **WHEN** un utilisateur authentifié n'appartenant à aucune organisation accède à `/`
- **THEN** le système affiche un message d'accueil et un CTA pour créer sa première organisation

### Requirement: Chaque carte d'organisation affiche la campagne active et son taux de complétion

Pour chaque organisation, le système DOIT afficher la campagne active en cours (s'il y en a une) avec son nom, son taux de complétion global, et le nombre d'équipes en attente.

#### Scenario: Organisation avec une campagne active
- **WHEN** une organisation a une campagne en cours
- **THEN** la carte affiche le nom de la campagne, le taux de complétion en pourcentage, et le nombre d'équipes n'ayant pas encore soumis leur diagnostic

#### Scenario: Organisation sans campagne active
- **WHEN** une organisation n'a aucune campagne en cours
- **THEN** la carte affiche un message indiquant qu'aucune campagne n'est active et propose un lien pour en créer une (si l'utilisateur est admin)

### Requirement: La homepage affiche les actions en attente de l'utilisateur

Le système DOIT identifier et afficher les actions que l'utilisateur doit entreprendre, regroupées par organisation.

#### Scenario: L'utilisateur a des diagnostics à remplir (rôle manager)
- **WHEN** un utilisateur avec le rôle manager a des équipes qui n'ont pas encore soumis leur diagnostic pour une campagne active
- **THEN** la homepage affiche une action "Remplir le diagnostic" avec un lien direct vers le quiz pour chaque équipe concernée

#### Scenario: L'utilisateur peut lancer une campagne (rôle admin)
- **WHEN** un utilisateur admin n'a pas de campagne active dans une organisation
- **THEN** la homepage affiche une action suggérant de lancer une nouvelle campagne avec un lien vers la création de campagne

#### Scenario: Aucune action en attente
- **WHEN** l'utilisateur n'a aucune action en attente
- **THEN** la homepage affiche un état "Tout est à jour" pour cette organisation

### Requirement: Les cartes d'organisation offrent des raccourcis vers les dashboards

Chaque carte d'organisation DOIT inclure des liens rapides vers les fonctionnalités pertinentes selon le rôle de l'utilisateur.

#### Scenario: Raccourcis pour un admin
- **WHEN** l'utilisateur est admin d'une organisation
- **THEN** la carte affiche des liens vers le dashboard organisation, la gestion des campagnes, et la gestion des équipes

#### Scenario: Raccourcis pour un manager
- **WHEN** l'utilisateur est manager d'une organisation
- **THEN** la carte affiche des liens vers les dashboards de ses équipes

#### Scenario: Raccourcis pour un consultant
- **WHEN** l'utilisateur est consultant d'une organisation
- **THEN** la carte affiche un lien vers le dashboard consultant

### Requirement: La query getHomepageSummary respecte l'isolation multi-tenant

La query de résumé DOIT être scopée par les memberships de l'utilisateur et ne DOIT jamais exposer de données d'organisations auxquelles l'utilisateur n'appartient pas.

#### Scenario: L'utilisateur ne voit que ses organisations
- **WHEN** la homepage charge le résumé
- **THEN** seules les organisations pour lesquelles l'utilisateur a un membership actif sont retournées

#### Scenario: Les métriques sont scopées par organisation
- **WHEN** le système calcule les métriques d'une organisation
- **THEN** les données sont filtrées par l'orgId de cette organisation uniquement
