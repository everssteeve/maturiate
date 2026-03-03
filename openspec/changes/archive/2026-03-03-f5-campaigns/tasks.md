## 1. Schéma et migration

- [x] 1.1 Ajouter l'index unique partiel `unique_team_campaign` sur `diagnostics(team_id, campaign_id) WHERE campaign_id IS NOT NULL` via une migration SQL brute Drizzle
- [x] 1.2 Générer et appliquer la migration avec `drizzle-kit generate` puis `drizzle-kit migrate`

## 2. Validation et queries

- [x] 2.1 Créer `src/lib/validations/campaigns.ts` avec les schémas Zod : `CreateCampaignSchema` (name, startDate, endDate optionnel, validation endDate > startDate) et `UpdateCampaignSchema`
- [x] 2.2 Créer `src/lib/queries/campaigns.ts` avec `listCampaigns(orgId)` retournant les campagnes triées par createdAt desc, avec totalTeams, respondedTeams et completionPercent via sous-requêtes SQL
- [x] 2.3 Ajouter `getCampaignDetail(campaignId, orgId)` retournant la campagne + le statut de chaque équipe (nom, diagnosticId, filledBy, completedAt, globalScore, globalLevel)

## 3. Server Actions campagnes

- [x] 3.1 Créer `src/lib/actions/campaigns.ts` avec `createCampaign` : validation Zod, `requireRole(orgId, "admin")`, insertion en base avec status draft, `revalidatePath`, redirection vers la page détail
- [x] 3.2 Ajouter `updateCampaign` : validation Zod, vérification status === draft, `requireRole(orgId, "admin")`, mise à jour en base
- [x] 3.3 Ajouter `deleteCampaign` : vérification status === draft + pas de diagnostics associés, `requireRole(orgId, "admin")`, suppression en base
- [x] 3.4 Ajouter `launchCampaign` : vérification status === draft + au moins une équipe dans l'org, passage à `active`, envoi des emails d'invitation aux managers
- [x] 3.5 Ajouter `closeCampaign` : vérification status === active, passage à `closed`
- [x] 3.6 Ajouter `sendCampaignReminders` : vérification status === active, identification des équipes non-répondantes, envoi des emails de rappel

## 4. Modification de submitDiagnostic

- [x] 4.1 Modifier `src/lib/actions/diagnostics.ts` pour ajouter le champ optionnel `campaignId` au schéma de validation
- [x] 4.2 Ajouter la validation : si `campaignId` fourni, vérifier que la campagne existe, appartient à l'org et a le statut `active`
- [x] 4.3 Ajouter la vérification d'unicité : si `campaignId` fourni, vérifier qu'aucun diagnostic n'existe déjà pour ce couple `(teamId, campaignId)`
- [x] 4.4 Passer le `campaignId` à l'insertion du diagnostic en base

## 5. Templates email

- [x] 5.1 Créer `src/lib/email/templates/campaign-invitation.tsx` : template React Email avec nom de campagne, nom d'équipe, bouton "Remplir le diagnostic" (lien avec campaignId en query param), mention deadline si endDate
- [x] 5.2 Créer `src/lib/email/templates/campaign-reminder.tsx` : template React Email avec ton urgent, mention du nombre de jours restants si endDate, bouton "Remplir le diagnostic"
- [x] 5.3 Ajouter les fonctions d'envoi dans `src/lib/email/index.ts` ou dans les actions directement : `sendCampaignInvitation(to, props)` et `sendCampaignReminder(to, props)`

## 6. Routes cron

- [x] 6.1 Créer `src/app/api/cron/campaign-close/route.ts` : vérification du header `authorization: Bearer CRON_SECRET`, requête pour trouver les campagnes actives avec endDate passée, mise à jour du statut à `closed`
- [x] 6.2 Créer `src/app/api/cron/campaign-reminder/route.ts` : vérification du secret cron, requête pour trouver les campagnes actives avec endDate dans 3 jours, envoi des rappels aux équipes non-répondantes

## 7. Pages UI — Liste et création

- [x] 7.1 Créer `src/app/(dashboard)/orgs/[orgId]/campaigns/page.tsx` : Server Component, vérification `requireRole(orgId, "admin")`, appel `listCampaigns(orgId)`, affichage de la liste avec badges de statut, dates et barre de progression de complétion
- [x] 7.2 Créer `src/app/(dashboard)/orgs/[orgId]/campaigns/new/page.tsx` : Server Component avec formulaire (nom, date début, date fin optionnelle), action `createCampaign`
- [x] 7.3 Ajouter un composant client `CampaignForm` pour la gestion des date pickers et la validation côté client
- [x] 7.4 Ajouter le lien "Campagnes" dans la navigation latérale du dashboard pour les admins

## 8. Page UI — Détail campagne

- [x] 8.1 Créer `src/app/(dashboard)/orgs/[orgId]/campaigns/[campaignId]/page.tsx` : Server Component, appel `getCampaignDetail`, affichage des métadonnées, métriques de complétion et tableau des équipes
- [x] 8.2 Créer un composant client `CampaignTeamsTable` affichant le tableau des équipes avec statut (répondu/en attente), score, badge de niveau et date de soumission
- [x] 8.3 Ajouter les boutons d'action contextuels : "Lancer" (si draft), "Relancer les équipes" (si active), "Clôturer" (si active), avec dialogues de confirmation
- [x] 8.4 Ajouter le lien "Remplir le diagnostic" pour les équipes en attente, pointant vers `/orgs/[orgId]/diagnostic/[teamId]?campaignId=[campaignId]`

## 9. Adaptation page quiz

- [x] 9.1 Modifier la page `/orgs/[orgId]/diagnostic/[teamId]` pour lire le query param `campaignId` et l'afficher dans le header (nom de la campagne, deadline)
- [x] 9.2 Passer le `campaignId` au `submitDiagnostic` lors de la soumission du quiz

## 10. Tests

- [x] 10.1 Écrire les tests unitaires pour les schémas de validation Zod (campaigns)
- [x] 10.2 Écrire les tests d'intégration pour les Server Actions : createCampaign, launchCampaign, closeCampaign, sendCampaignReminders
- [x] 10.3 Écrire les tests d'intégration pour les queries : listCampaigns, getCampaignDetail
- [x] 10.4 Écrire les tests d'intégration pour submitDiagnostic avec campaignId (validation campagne active, unicité)
- [x] 10.5 Écrire les tests E2E Playwright : flow complet création → lancement → remplissage diagnostic → suivi avancement → clôture
