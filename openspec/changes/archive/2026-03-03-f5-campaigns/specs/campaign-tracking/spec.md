## ADDED Requirements

### Requirement: Page de détail d'une campagne avec suivi d'avancement
Le système DOIT fournir une page à l'URL `/orgs/[orgId]/campaigns/[campaignId]` affichant les métadonnées de la campagne et le statut de réponse de chaque équipe.

#### Scenario: Affichage d'une campagne active avec des réponses partielles
- **WHEN** un admin consulte le détail d'une campagne active pour une organisation ayant 5 équipes dont 3 ont soumis leur diagnostic
- **THEN** la page affiche le nom de la campagne, son statut "Active", les dates, un taux de complétion de 60% (3/5), et la liste des 5 équipes avec leur statut (répondu/en attente)

#### Scenario: Affichage d'une campagne avec toutes les réponses
- **WHEN** toutes les équipes d'une organisation ont soumis leur diagnostic pour une campagne
- **THEN** le taux de complétion affiche 100% et toutes les équipes sont marquées comme "Répondu"

#### Scenario: Affichage d'une campagne draft
- **WHEN** un admin consulte le détail d'une campagne en statut `draft`
- **THEN** la page affiche les métadonnées et un bouton "Lancer la campagne" sans tableau de suivi (aucune réponse possible en draft)

#### Scenario: Accès refusé pour une campagne d'une autre organisation
- **WHEN** un admin tente d'accéder à une campagne appartenant à une autre organisation
- **THEN** une erreur 404 est affichée

### Requirement: Tableau de suivi des équipes par campagne
Le système DOIT afficher un tableau listant chaque équipe de l'organisation avec son statut de réponse pour la campagne sélectionnée.

#### Scenario: Équipe ayant répondu
- **WHEN** une équipe a soumis un diagnostic lié à la campagne
- **THEN** la ligne de l'équipe affiche : nom de l'équipe, badge "Répondu", nom de la personne ayant rempli, date de soumission, score global et niveau de maturité

#### Scenario: Équipe n'ayant pas répondu
- **WHEN** une équipe n'a pas soumis de diagnostic pour la campagne
- **THEN** la ligne de l'équipe affiche : nom de l'équipe, badge "En attente", et un lien "Remplir le diagnostic"

### Requirement: Métriques de complétion de campagne
Le système DOIT calculer et afficher les métriques suivantes pour chaque campagne active ou clôturée : nombre total d'équipes, nombre d'équipes ayant répondu, taux de complétion en pourcentage.

#### Scenario: Calcul du taux de complétion
- **WHEN** une organisation a 10 équipes et 7 ont soumis leur diagnostic pour la campagne
- **THEN** le taux de complétion est de 70% (7/10)

#### Scenario: Aucune équipe n'a répondu
- **WHEN** une campagne vient d'être lancée et aucune équipe n'a répondu
- **THEN** le taux de complétion est de 0% (0/N)

#### Scenario: Organisation sans équipe
- **WHEN** la campagne est dans une organisation qui n'a plus d'équipes (toutes supprimées après lancement)
- **THEN** le taux de complétion affiche 0/0 sans erreur de division

### Requirement: Query de détail campagne avec statut par équipe
Le système DOIT fournir une fonction `getCampaignDetail(campaignId: string, orgId: string)` retournant les métadonnées de la campagne et le statut de réponse de chaque équipe, en joignant les tables `campaigns`, `teams` et `diagnostics`.

#### Scenario: Campagne avec réponses mixtes
- **WHEN** `getCampaignDetail` est appelée pour une campagne avec 3 équipes dont 1 a répondu
- **THEN** elle retourne la campagne, les 3 équipes avec `diagnosticId` renseigné pour celle ayant répondu et `null` pour les deux autres

#### Scenario: Campagne inexistante
- **WHEN** `getCampaignDetail` est appelée avec un `campaignId` invalide
- **THEN** elle retourne `null`

### Requirement: Query de listing des campagnes avec taux de complétion
Le système DOIT fournir une fonction `listCampaigns(orgId: string)` retournant toutes les campagnes de l'organisation avec pour chacune le nombre total d'équipes, le nombre de répondants et le taux de complétion.

#### Scenario: Listing avec campagnes mixtes
- **WHEN** `listCampaigns` est appelée pour une organisation ayant 2 campagnes (1 active, 1 closed)
- **THEN** elle retourne les 2 campagnes triées par `createdAt` décroissant, avec les métriques de complétion pour chacune

#### Scenario: Organisation sans campagne
- **WHEN** `listCampaigns` est appelée pour une organisation sans campagne
- **THEN** elle retourne un tableau vide
