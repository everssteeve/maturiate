## ADDED Requirements

### Requirement: Création d'une campagne par un admin
Le système DOIT permettre à un utilisateur ayant le rôle `admin` dans l'organisation de créer une campagne avec un nom, une date de début et une date de fin optionnelle. La campagne est créée avec le statut `draft`.

#### Scenario: Création réussie avec date de fin
- **WHEN** un admin soumet le formulaire de création avec le nom "Campagne Q1 2026", la date de début "2026-04-01" et la date de fin "2026-04-30"
- **THEN** une campagne est créée en base avec `status = "draft"`, `createdBy` = l'id de l'admin, et les dates fournies

#### Scenario: Création réussie sans date de fin
- **WHEN** un admin soumet le formulaire avec un nom et une date de début mais sans date de fin
- **THEN** la campagne est créée avec `endDate = null`

#### Scenario: Création refusée pour un manager
- **WHEN** un utilisateur avec le rôle `manager` tente de créer une campagne
- **THEN** le système retourne une erreur "Forbidden"

#### Scenario: Création refusée pour un member
- **WHEN** un utilisateur avec le rôle `member` tente de créer une campagne
- **THEN** le système retourne une erreur "Forbidden"

#### Scenario: Validation du nom obligatoire
- **WHEN** un admin soumet le formulaire sans nom de campagne
- **THEN** le système retourne une erreur de validation indiquant que le nom est requis

#### Scenario: Validation de la date de début obligatoire
- **WHEN** un admin soumet le formulaire sans date de début
- **THEN** le système retourne une erreur de validation indiquant que la date de début est requise

#### Scenario: Validation de la cohérence des dates
- **WHEN** un admin soumet une date de fin antérieure à la date de début
- **THEN** le système retourne une erreur de validation indiquant que la date de fin doit être postérieure à la date de début

### Requirement: Modification d'une campagne en draft par un admin
Le système DOIT permettre à un admin de modifier le nom, la date de début et la date de fin d'une campagne tant que celle-ci est en statut `draft`.

#### Scenario: Modification réussie d'une campagne draft
- **WHEN** un admin modifie le nom d'une campagne en statut `draft`
- **THEN** le nom de la campagne est mis à jour en base

#### Scenario: Modification refusée d'une campagne active
- **WHEN** un admin tente de modifier une campagne en statut `active`
- **THEN** le système retourne une erreur indiquant que seules les campagnes en draft peuvent être modifiées

#### Scenario: Modification refusée d'une campagne closed
- **WHEN** un admin tente de modifier une campagne en statut `closed`
- **THEN** le système retourne une erreur indiquant que seules les campagnes en draft peuvent être modifiées

### Requirement: Suppression d'une campagne en draft par un admin
Le système DOIT permettre à un admin de supprimer une campagne uniquement si elle est en statut `draft`. Les campagnes actives ou clôturées ne peuvent pas être supprimées.

#### Scenario: Suppression réussie d'une campagne draft
- **WHEN** un admin supprime une campagne en statut `draft`
- **THEN** la campagne est supprimée de la base de données

#### Scenario: Suppression refusée d'une campagne active
- **WHEN** un admin tente de supprimer une campagne en statut `active`
- **THEN** le système retourne une erreur indiquant que seules les campagnes en draft peuvent être supprimées

#### Scenario: Suppression refusée d'une campagne avec diagnostics
- **WHEN** un admin tente de supprimer une campagne en statut `draft` qui a déjà des diagnostics associés
- **THEN** le système retourne une erreur indiquant que la campagne ne peut pas être supprimée car elle contient des diagnostics

### Requirement: Lancement d'une campagne par un admin
Le système DOIT permettre à un admin de lancer une campagne (passage de `draft` à `active`). Le lancement déclenche l'envoi d'emails d'invitation aux managers des équipes.

#### Scenario: Lancement réussi
- **WHEN** un admin lance une campagne en statut `draft`
- **THEN** le statut passe à `active` et des emails d'invitation sont envoyés aux managers de chaque équipe de l'organisation

#### Scenario: Lancement refusé si déjà active
- **WHEN** un admin tente de lancer une campagne déjà en statut `active`
- **THEN** le système retourne une erreur indiquant que la campagne est déjà active

#### Scenario: Lancement refusé si pas d'équipes
- **WHEN** un admin tente de lancer une campagne dans une organisation sans aucune équipe
- **THEN** le système retourne une erreur indiquant qu'il faut au moins une équipe pour lancer une campagne

### Requirement: Clôture manuelle d'une campagne par un admin
Le système DOIT permettre à un admin de clôturer manuellement une campagne active (passage de `active` à `closed`).

#### Scenario: Clôture manuelle réussie
- **WHEN** un admin clôture une campagne en statut `active`
- **THEN** le statut passe à `closed` et `updatedAt` est mis à jour

#### Scenario: Clôture refusée si déjà closed
- **WHEN** un admin tente de clôturer une campagne déjà en statut `closed`
- **THEN** le système retourne une erreur indiquant que la campagne est déjà clôturée

### Requirement: Listing des campagnes d'une organisation
Le système DOIT fournir un listing de toutes les campagnes d'une organisation, trié par date de création décroissante, avec pour chaque campagne le nombre d'équipes ayant répondu sur le total.

#### Scenario: Organisation avec plusieurs campagnes
- **WHEN** un admin consulte la liste des campagnes d'une organisation ayant 3 campagnes
- **THEN** les 3 campagnes sont affichées triées de la plus récente à la plus ancienne, avec pour chacune : nom, statut, dates, taux de complétion

#### Scenario: Organisation sans campagne
- **WHEN** un admin consulte la liste des campagnes d'une organisation sans aucune campagne
- **THEN** un état vide est affiché avec un bouton pour créer la première campagne

### Requirement: Page de liste des campagnes accessible aux admins
Le système DOIT fournir une page à l'URL `/orgs/[orgId]/campaigns` accessible uniquement aux admins, affichant la liste des campagnes avec leur statut, dates et progression.

#### Scenario: Accès autorisé pour un admin
- **WHEN** un admin navigue vers `/orgs/[orgId]/campaigns`
- **THEN** la page affiche la liste des campagnes avec un bouton "Nouvelle campagne"

#### Scenario: Accès refusé pour un manager
- **WHEN** un manager navigue vers `/orgs/[orgId]/campaigns`
- **THEN** il est redirigé ou reçoit une erreur "Forbidden"

### Requirement: Page de création de campagne
Le système DOIT fournir une page à l'URL `/orgs/[orgId]/campaigns/new` avec un formulaire contenant : nom de la campagne, date de début, date de fin (optionnelle).

#### Scenario: Affichage du formulaire
- **WHEN** un admin navigue vers `/orgs/[orgId]/campaigns/new`
- **THEN** le formulaire est affiché avec les champs nom, date de début et date de fin

#### Scenario: Soumission réussie et redirection
- **WHEN** un admin soumet le formulaire avec des données valides
- **THEN** la campagne est créée et l'admin est redirigé vers la page de détail de la campagne
