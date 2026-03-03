## ADDED Requirements

### Requirement: Envoi d'emails d'invitation au lancement de campagne
Le système DOIT envoyer un email d'invitation à chaque manager d'équipe de l'organisation lorsqu'une campagne est lancée (passage de `draft` à `active`). L'email contient le nom de la campagne, un lien vers le diagnostic de l'équipe, et la date de fin si définie.

#### Scenario: Lancement avec 3 équipes ayant chacune un manager
- **WHEN** un admin lance une campagne dans une organisation ayant 3 équipes avec des managers assignés
- **THEN** 3 emails d'invitation sont envoyés, un par manager, chacun contenant le lien `/orgs/[orgId]/diagnostic/[teamId]?campaignId=[campaignId]`

#### Scenario: Équipe sans manager
- **WHEN** une équipe n'a aucun membre avec le rôle `manager`
- **THEN** aucun email n'est envoyé pour cette équipe (pas d'erreur, l'envoi continue pour les autres équipes)

#### Scenario: Manager de plusieurs équipes
- **WHEN** un utilisateur est manager de 2 équipes dans la même organisation
- **THEN** il reçoit 2 emails distincts, un pour chaque équipe

### Requirement: Template d'email d'invitation à une campagne
Le système DOIT utiliser un template React Email `campaign-invitation.tsx` contenant : le nom de la campagne, le nom de l'équipe concernée, un bouton "Remplir le diagnostic" pointant vers la page de quiz avec le `campaignId`, et la date limite si `endDate` est définie.

#### Scenario: Email avec date de fin
- **WHEN** l'email est généré pour une campagne ayant une date de fin
- **THEN** l'email contient la mention "À compléter avant le [date de fin formatée]"

#### Scenario: Email sans date de fin
- **WHEN** l'email est généré pour une campagne sans date de fin
- **THEN** l'email ne contient pas de mention de deadline

### Requirement: Relance manuelle des équipes non-répondantes
Le système DOIT permettre à un admin de déclencher manuellement l'envoi de rappels par email aux équipes n'ayant pas encore soumis leur diagnostic pour une campagne active.

#### Scenario: Relance avec équipes en attente
- **WHEN** un admin clique sur "Relancer les équipes" pour une campagne ayant 5 équipes dont 2 n'ont pas répondu
- **THEN** 2 emails de rappel sont envoyés aux managers des 2 équipes en attente

#### Scenario: Relance sans équipe en attente
- **WHEN** un admin tente de relancer pour une campagne où toutes les équipes ont répondu
- **THEN** le système indique qu'il n'y a aucune équipe à relancer

#### Scenario: Relance refusée pour campagne non active
- **WHEN** un admin tente de relancer pour une campagne en statut `draft` ou `closed`
- **THEN** le système retourne une erreur indiquant que seules les campagnes actives peuvent faire l'objet de relances

### Requirement: Template d'email de rappel de campagne
Le système DOIT utiliser un template React Email `campaign-reminder.tsx` avec un ton plus urgent que l'invitation, contenant : le nom de la campagne, le nom de l'équipe, un bouton "Remplir le diagnostic", et la mention de deadline si applicable.

#### Scenario: Email de rappel avec deadline proche
- **WHEN** l'email de rappel est généré pour une campagne avec `endDate` dans 2 jours
- **THEN** l'email contient la mention "Plus que 2 jours pour remplir votre diagnostic"

#### Scenario: Email de rappel sans deadline
- **WHEN** l'email de rappel est généré pour une campagne sans date de fin
- **THEN** l'email contient un message de rappel générique sans mention de deadline
