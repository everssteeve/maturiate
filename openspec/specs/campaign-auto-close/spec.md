## ADDED Requirements

### Requirement: Clôture automatique des campagnes expirées via cron job
Le système DOIT fournir une route API `/api/cron/campaign-close` exécutée quotidiennement par Vercel Cron. Cette route ferme automatiquement toutes les campagnes actives dont la date de fin (`endDate`) est passée.

#### Scenario: Campagne avec date de fin dépassée
- **WHEN** le cron s'exécute et une campagne active a `endDate = 2026-03-01` alors que la date courante est le 2026-03-02
- **THEN** le statut de la campagne passe à `closed` et `updatedAt` est mis à jour

#### Scenario: Campagne active sans date de fin
- **WHEN** le cron s'exécute et une campagne active n'a pas de `endDate`
- **THEN** la campagne n'est pas affectée et reste en statut `active`

#### Scenario: Campagne déjà clôturée
- **WHEN** le cron s'exécute et une campagne est déjà en statut `closed`
- **THEN** aucune modification n'est effectuée

#### Scenario: Aucune campagne à clôturer
- **WHEN** le cron s'exécute et aucune campagne n'a de `endDate` dépassée
- **THEN** la route retourne un succès avec 0 campagnes clôturées

### Requirement: Rappel automatique des équipes via cron job
Le système DOIT fournir une route API `/api/cron/campaign-reminder` exécutée quotidiennement par Vercel Cron. Cette route envoie un email de rappel aux managers des équipes n'ayant pas répondu pour les campagnes actives dont la date de fin approche (J-3).

#### Scenario: Campagne avec deadline dans 3 jours et équipes non-répondantes
- **WHEN** le cron s'exécute, une campagne active a `endDate` dans 3 jours et 2 équipes sur 5 n'ont pas répondu
- **THEN** 2 emails de rappel sont envoyés aux managers des équipes en attente

#### Scenario: Campagne avec deadline lointaine
- **WHEN** le cron s'exécute et une campagne active a `endDate` dans 15 jours
- **THEN** aucun rappel n'est envoyé pour cette campagne

#### Scenario: Campagne sans date de fin
- **WHEN** le cron s'exécute et une campagne active n'a pas de `endDate`
- **THEN** aucun rappel automatique n'est envoyé (les rappels sont uniquement manuels dans ce cas)

### Requirement: Authentification des routes cron par secret
Les routes cron DOIVENT vérifier que l'en-tête `authorization` correspond à `Bearer ${CRON_SECRET}` (variable d'environnement). Toute requête sans ce header ou avec un secret incorrect DOIT être rejetée avec un statut 401.

#### Scenario: Requête authentifiée
- **WHEN** une requête GET arrive sur `/api/cron/campaign-close` avec le bon header `authorization: Bearer CRON_SECRET`
- **THEN** la route s'exécute normalement

#### Scenario: Requête sans header d'authentification
- **WHEN** une requête GET arrive sur `/api/cron/campaign-close` sans header `authorization`
- **THEN** la route retourne un statut 401 Unauthorized

#### Scenario: Secret incorrect
- **WHEN** une requête arrive avec un `authorization` header contenant un secret incorrect
- **THEN** la route retourne un statut 401 Unauthorized
