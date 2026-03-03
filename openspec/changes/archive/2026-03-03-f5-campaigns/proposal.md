## Why

Les diagnostics existent (F4) mais il n'y a aucun mécanisme pour orchestrer leur collecte à l'échelle d'une organisation. Sans campagne, un admin ne peut pas lancer une collecte structurée auprès de toutes les équipes, suivre l'avancement, ni relancer les retardataires. Les campagnes sont la brique d'orchestration nécessaire pour passer de diagnostics ponctuels à un suivi structuré de la maturité IA — et sont un prérequis pour les dashboards (F6/F7) et la vue consultant (F8).

## What Changes

- **CRUD Campagnes** : un admin peut créer, modifier et supprimer des campagnes avec nom, dates de début/fin, et un cycle de vie `draft → active → closed`
- **Lancement de campagne** : passage de `draft` à `active`, déclenchant l'envoi d'emails d'invitation aux managers de chaque équipe de l'organisation
- **Suivi d'avancement** : page détail campagne montrant quelles équipes ont répondu, le taux de complétion, et les scores obtenus
- **Relance des équipes** : envoi de rappels par email aux équipes n'ayant pas encore soumis leur diagnostic
- **Clôture automatique** : un cron job ferme les campagnes dont la date de fin est passée
- **Lien diagnostic ↔ campagne** : le `submitDiagnostic` existant est étendu pour accepter un `campaignId` optionnel, avec unicité `(team_id, campaign_id)` pour les diagnostics liés à une campagne
- **Diagnostics ad hoc** : les diagnostics sans campagne restent possibles (comportement actuel préservé)

## Capabilities

### New Capabilities
- `campaign-crud` : création, modification, suppression et listing des campagnes avec cycle de vie draft/active/closed
- `campaign-tracking` : suivi de l'avancement d'une campagne (taux de complétion, statut par équipe, scores)
- `campaign-notifications` : envoi d'invitations et de relances par email aux managers des équipes
- `campaign-auto-close` : clôture automatique des campagnes expirées via cron job

### Modified Capabilities
- `diagnostic-submit` : ajout du paramètre `campaignId` optionnel, validation que la campagne est active, contrainte d'unicité `(team_id, campaign_id)`

## Impact

- **Schéma DB** : ajout d'un index unique partiel sur `diagnostics(team_id, campaign_id) WHERE campaign_id IS NOT NULL`
- **Server Actions** : nouveau fichier `lib/actions/campaigns.ts` + modification de `submitDiagnostic`
- **Queries** : nouveau fichier `lib/queries/campaigns.ts`
- **Routes** : 3 nouvelles pages sous `/orgs/[orgId]/campaigns/`
- **Cron** : 2 nouvelles routes API (`/api/cron/campaign-reminder`, `/api/cron/campaign-close`)
- **Email** : nouveau template `campaign-invitation` et `campaign-reminder`
- **Dépendances** : aucune nouvelle dépendance npm (utilise Resend + React Email déjà en place)
