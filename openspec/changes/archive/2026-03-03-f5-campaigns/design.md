## Context

Le diagnostic IA (F4) est fonctionnel : un admin ou manager peut soumettre un diagnostic pour une équipe, le scoring est automatique, les résultats sont consultables. Cependant, les diagnostics sont lancés de manière ponctuelle et individuelle — il n'existe aucun mécanisme pour orchestrer une collecte à l'échelle de l'organisation.

La table `campaigns` et l'enum `campaign_status` existent déjà dans le schéma Drizzle (F1). La colonne `diagnostics.campaign_id` (nullable, FK vers campaigns) est également en place. Il manque les Server Actions, les queries, les pages UI, les emails et les cron jobs.

**Contraintes :**
- Multi-tenant strict : tout scopé par `orgId`
- Patterns existants : Server Actions avec Zod + `requireRole()`, queries Drizzle sans auth, emails via Resend + React Email
- Pas de nouvelle dépendance npm

## Goals / Non-Goals

**Goals :**
- Permettre aux admins de créer, lancer, suivre et clôturer des campagnes de collecte de diagnostics
- Fournir un suivi d'avancement en temps réel (taux de complétion, statut par équipe)
- Relancer les équipes non-répondantes par email
- Garantir l'unicité d'un diagnostic par équipe par campagne
- Clôturer automatiquement les campagnes expirées
- Préserver le support des diagnostics ad hoc (sans campagne)

**Non-Goals :**
- Personnalisation des questions par campagne (V2+)
- Templates de campagne réutilisables (V2+)
- Notifications in-app / push (V2+, uniquement email pour V1)
- Analytics avancés de campagne (vélocité de réponse, tendances) — cela relève de F6 Dashboard
- Campagnes inter-organisations

## Decisions

### D1 : Cycle de vie simplifié `draft → active → closed`

**Choix** : trois états linéaires, sans transitions complexes.

**Rationale** : un admin crée en `draft`, lance manuellement en `active`, et la campagne passe en `closed` soit manuellement soit par cron à expiration de `endDate`. Pas d'état `paused` ou `archived` pour V1 — la simplicité prime.

**Alternative rejetée** : machine à états complète (draft → scheduled → active → paused → closed → archived). Trop complexe pour le MVP, ajouterait de la logique de transition sans valeur immédiate.

### D2 : Contrainte d'unicité partielle `(team_id, campaign_id) WHERE campaign_id IS NOT NULL`

**Choix** : index unique partiel via migration SQL brute dans Drizzle.

**Rationale** : Drizzle ne supporte pas nativement les index partiels (`WHERE`). On utilisera `sql` dans le fichier de migration pour créer `CREATE UNIQUE INDEX ... WHERE campaign_id IS NOT NULL`. Cela garantit un seul diagnostic par équipe par campagne tout en permettant plusieurs diagnostics ad hoc (campaign_id NULL).

**Alternative rejetée** : contrainte unique classique `(team_id, campaign_id)` — cela bloquerait à un seul diagnostic ad hoc par équipe (car NULL = NULL en SQL pour les contraintes unique de certains moteurs, même si PostgreSQL les traite comme distincts). L'index partiel est plus explicite et garanti.

### D3 : Relance manuelle avec action serveur + cron pour rappels automatiques

**Choix** : deux mécanismes complémentaires.
1. **Relance manuelle** : bouton "Relancer" dans la page campagne → Server Action qui envoie les emails immédiatement aux équipes non-répondantes
2. **Cron automatique** : `/api/cron/campaign-reminder` exécuté quotidiennement via Vercel Cron, envoie un rappel aux campagnes actives dont `endDate` approche (J-3)

**Rationale** : la relance manuelle donne le contrôle à l'admin. Le cron couvre les oublis. Pas de tracking sophistiqué des relances envoyées pour V1.

**Alternative rejetée** : uniquement cron automatique — l'admin perdrait le contrôle du timing de relance.

### D4 : Pages campagne sous le layout dashboard existant

**Choix** : trois routes sous `/orgs/[orgId]/campaigns/` :
- `page.tsx` — liste des campagnes
- `new/page.tsx` — formulaire de création
- `[campaignId]/page.tsx` — détail et suivi

**Rationale** : suit le pattern de routing existant (`/orgs/[orgId]/teams/`, `/orgs/[orgId]/settings/`). Le layout dashboard fournit déjà la navigation latérale et le contexte org.

### D5 : Lien "Remplir le diagnostic" dans l'email pointe vers la page diagnostic existante

**Choix** : l'email d'invitation contient un lien vers `/orgs/[orgId]/diagnostic/[teamId]?campaignId=[id]`. La page quiz existante (F4) détecte le `campaignId` en query param et l'inclut dans la soumission.

**Rationale** : pas de duplication de la page quiz. Le `campaignId` est transmis naturellement via le query param, sans modifier le flow UI du quiz.

**Alternative rejetée** : page de diagnostic dédiée par campagne — duplication inutile.

### D6 : Emails en deux templates distincts

**Choix** :
- `campaign-invitation.tsx` : envoyé au lancement de la campagne, contient le lien diagnostic
- `campaign-reminder.tsx` : envoyé lors des relances, ton plus urgent, mentionne la deadline

**Rationale** : messages différents selon le contexte (première invitation vs rappel). Suit le pattern React Email existant.

## Risks / Trade-offs

- **[Relance sans tracking]** Les relances ne sont pas enregistrées en base pour V1. Un admin pourrait relancer la même équipe plusieurs fois sans le savoir. → *Mitigation* : acceptable pour V1, le nombre d'équipes par org est limité. On pourra ajouter une table `campaign_reminders` en V2.

- **[Cron Vercel limité]** Vercel Cron a une granularité d'une fois par jour sur le plan gratuit. → *Mitigation* : suffisant pour un rappel automatique quotidien. La relance manuelle compense si besoin de timing précis.

- **[Pas de notification en temps réel]** Quand une équipe soumet un diagnostic, l'admin ne voit le changement qu'au rechargement de la page. → *Mitigation* : `revalidatePath` assure que la prochaine navigation affiche les données à jour. Le polling ou WebSocket serait over-engineering pour V1.

- **[Migration SQL brute pour l'index partiel]** L'index unique partiel nécessite du SQL brut, ce qui est moins maintenable que du Drizzle pur. → *Mitigation* : bien documenté dans le fichier de migration, pattern courant avec Drizzle.
