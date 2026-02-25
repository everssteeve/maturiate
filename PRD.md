# PRD — maturIAté : Plateforme de Suivi de Maturité IA

## Contexte et Problème

**Quel problème ?**
Les organisations qui adoptent l'IA dans leurs pratiques de développement logiciel n'ont aucun moyen structuré de mesurer, suivre et piloter la montée en maturité de leurs équipes. Aujourd'hui, un diagnostic ponctuel existe (quiz standalone), mais il ne permet pas de :
- Suivre l'évolution dans le temps
- Comparer les équipes entre elles
- Identifier les équipes en avance ou en retard
- Piloter une stratégie d'adoption IA à l'échelle de l'organisation
- Permettre à un consultant/coach d'accompagner ses clients avec des données tangibles

**Pour qui ?**
- **Organisations** (ESN, éditeurs, DSI) souhaitant piloter l'adoption de l'IA dans leurs pratiques de développement
- **Managers d'équipe / Tech Leads** voulant mesurer et améliorer la maturité IA de leur équipe
- **Consultants / Coaches AIAD** accompagnant plusieurs organisations dans leur transformation

**Pourquoi maintenant ?**
L'adoption de l'IA dans le développement logiciel s'accélère (Copilot, Cursor, Claude Code...), mais sans cadre de mesure, les organisations investissent à l'aveugle. Le framework AIAD propose un modèle de maturité à 4 niveaux reconnu — il manque l'outil de pilotage qui va avec. Les premières organisations sont en demande de suivi structuré. De plus, les données collectées de manière anonymisée constituent un actif unique pour publier un **"State of IA"** annuel — un rapport de référence sur la maturité IA des équipes de développement en France et au-delà.

## Outcome Criteria

| Métrique | Cible | Mesure |
|----------|-------|--------|
| Nombre d'organisations inscrites | 50 dans les 6 premiers mois | Compteur en base de données |
| Taux de complétion des diagnostics | > 85% | Diagnostics terminés / démarrés |
| Récurrence des diagnostics | > 60% des équipes refont un diagnostic dans les 3 mois | Ratio équipes avec 2+ diagnostics |
| Satisfaction utilisateur (NPS) | > 40 | Enquête post-diagnostic |
| Temps moyen de complétion du quiz | < 5 minutes | Mesure front-end (timestamp début/fin) |
| Taux d'opt-in anonymisation (State of IA) | > 70% des organisations | Organisations ayant accepté / total organisations |
| Publication du State of IA annuel | 1 rapport / an | Publication effective avec données suffisantes (> 30 organisations, > 100 équipes) |

## Personas et Use Cases

### Persona 1 : Sophie — Admin Organisation
- **Profil** : Directrice technique d'une ESN de 200 personnes, 15 équipes de développement. Pilote la stratégie d'adoption IA.
- **Besoin principal** : Avoir une vue d'ensemble de la maturité IA de toutes ses équipes, identifier les équipes à accompagner en priorité, mesurer les progrès trimestriels.
- **Scénarios d'usage** :
  1. Sophie crée son organisation sur maturIAté et invite ses 15 Tech Leads
  2. Elle lance une campagne trimestrielle "Q1 2026" — chaque Tech Lead reçoit un lien pour remplir le diagnostic de son équipe
  3. Une fois les réponses collectées, Sophie consulte le dashboard : heatmap des 15 équipes sur les 6 dimensions, score global moyen, identification des 3 équipes les plus en retard
  4. Elle compare avec la campagne précédente et constate que 4 équipes ont progressé d'un niveau
  5. Elle partage les résultats avec le COMEX via un lien partageable

### Persona 2 : Marc — Manager d'Équipe / Tech Lead
- **Profil** : Tech Lead d'une équipe de 6 développeurs. Convaincu par l'IA mais a besoin de mesurer les progrès concrets.
- **Besoin principal** : Remplir le diagnostic pour son équipe, voir l'évolution dans le temps, obtenir des recommandations actionnables.
- **Scénarios d'usage** :
  1. Marc reçoit une invitation de Sophie pour rejoindre l'organisation
  2. Il remplit le diagnostic de son équipe (14 questions + éventuelles questions bonus)
  3. Il consulte les résultats : radar chart, score par dimension, recommandations personnalisées
  4. 3 mois plus tard, il refait le diagnostic et voit l'évolution de chaque dimension
  5. Il partage les résultats avec son équipe pour discuter des axes d'amélioration

### Persona 3 : Karim — Consultant / Coach AIAD
- **Profil** : Consultant indépendant spécialisé en transformation IA. Accompagne 5 organisations dans leur adoption du framework AIAD.
- **Besoin principal** : Avoir une vue consolidée de tous ses clients, suivre les progrès de chaque organisation, produire des rapports d'avancement.
- **Scénarios d'usage** :
  1. Karim est invité en tant que consultant dans 5 organisations différentes
  2. Il accède à un tableau de bord consolidé montrant toutes ses organisations
  3. Pour chaque organisation, il voit la heatmap des équipes et les tendances
  4. Avant chaque comité de pilotage, il partage un lien avec les résultats de la dernière campagne
  5. Il identifie les patterns communs entre organisations et adapte ses recommandations

### Persona 4 : Lucas — Membre d'Équipe
- **Profil** : Développeur senior, membre de l'équipe de Marc. Curieux de voir comment son équipe se positionne.
- **Besoin principal** : Consulter les résultats de son équipe et comprendre les recommandations.
- **Scénarios d'usage** :
  1. Lucas se connecte et voit les résultats du dernier diagnostic de son équipe
  2. Il consulte les recommandations par dimension et propose des actions à son Tech Lead

### Persona 5 : Émilie — Équipe AIAD (éditrice du State of IA)
- **Profil** : Responsable contenu du framework AIAD. Pilote la publication annuelle du "State of IA" — le rapport de référence sur la maturité IA des équipes de développement.
- **Besoin principal** : Accéder aux données agrégées et anonymisées de toutes les organisations opt-in pour produire un rapport annuel riche en insights.
- **Scénarios d'usage** :
  1. Émilie accède au back-office AIAD et lance l'extraction des données anonymisées de l'année
  2. Elle consulte les statistiques agrégées : distribution des niveaux de maturité, scores moyens par dimension, par taille d'organisation, par secteur
  3. Elle analyse les tendances : évolution année sur année, dimensions qui progressent le plus/le moins, corrélations entre dimensions
  4. Elle identifie les insights clés (ex: "72% des équipes restent au niveau 1 sur la dimension Documentation")
  5. Elle publie le rapport "State of IA 2026" — accessible publiquement, avec lien de téléchargement depuis la plateforme
  6. Les organisations participantes reçoivent leur positionnement anonyme par rapport au benchmark (ex: "Votre organisation est au-dessus de la médiane sur 4/6 dimensions")

## Modèle de Données Clé

### Entités principales

```
Organisation
├── id, nom, logo, créée le
├── plan (gratuit par défaut)
├── secteur (optionnel : ESN, éditeur, DSI, startup, autre)
├── taille (optionnel : 1-10, 11-50, 51-200, 201-1000, 1000+)
├── opt_in_state_of_ia (boolean, défaut: false)
├── opt_in_date, opt_out_date
└── membres[] (avec rôles : admin, manager, member, consultant)

Équipe
├── id, nom, organisation_id
└── membres[] (référence vers utilisateurs)

Campagne
├── id, nom, organisation_id, créée par
├── date_début, date_fin (optionnelle)
├── statut (brouillon, active, clôturée)
└── diagnostics[]

Diagnostic
├── id, équipe_id, campagne_id (nullable si ad hoc)
├── rempli_par (user_id), date
├── réponses[] (question_id → valeur 1-4)
├── scores_par_dimension[] (calculé)
├── score_global (calculé)
└── niveau_global (1-4, calculé)

Question
├── id, dimension_id, texte, options[4]
├── type (core | bonus)
├── créée_par (system | organisation_id)
└── active (boolean)

Dimension
├── id, label, short, description
└── questions[]

StateOfIA_Snapshot (données anonymisées pour le rapport annuel)
├── id, année
├── organisation_hash (identifiant anonymisé, non réversible)
├── secteur, taille (métadonnées organisation)
├── scores_par_dimension[] (agrégé organisation)
├── score_global, niveau_global
├── nombre_équipes
└── date_extraction
```

## Fonctionnalités V1

### F1 — Authentification & Gestion des comptes
- Connexion par Magic Link (email) et SSO (Google, Microsoft)
- Création de compte à l'inscription ou via invitation
- Gestion du profil utilisateur (nom, email, avatar)

### F2 — Gestion des Organisations
- Création d'une organisation (nom, logo optionnel)
- Métadonnées optionnelles : secteur d'activité, taille de l'organisation (utilisées pour la segmentation du State of IA)
- Invitation de membres par email avec attribution de rôle (admin, manager, member, consultant)
- Gestion des rôles et permissions
- Un utilisateur peut appartenir à plusieurs organisations (notamment les consultants)
- **Opt-in State of IA** : lors de la création ou dans les paramètres, l'admin peut accepter que les données anonymisées de son organisation contribuent au rapport annuel "State of IA". Opt-in explicite, révocable à tout moment.

### F3 — Gestion des Équipes
- Création/modification/suppression d'équipes au sein d'une organisation
- Attribution de membres aux équipes
- Un manager peut gérer une ou plusieurs équipes

### F4 — Diagnostic (Quiz)
- Reprise du quiz existant (14 questions, 6 dimensions, 4 niveaux)
- Support des questions bonus (ajoutées par l'admin, optionnelles, non comptées dans le score comparatif)
- 1 réponse collective par équipe, remplie par le manager/tech lead
- Calcul automatique des scores par dimension et du score global
- Page de résultats avec radar chart, détail par dimension, recommandations

### F5 — Campagnes
- Création d'une campagne par l'admin (nom, date début, date fin optionnelle)
- Invitation automatique des équipes à participer
- Suivi de l'avancement : quelles équipes ont répondu, lesquelles manquent
- Possibilité de relancer les équipes n'ayant pas répondu
- Diagnostic ad hoc possible en dehors d'une campagne

### F6 — Dashboard Organisation
- **Heatmap** : grille Équipes × Dimensions, couleur = niveau (1 à 4), pour la campagne sélectionnée
- **Évolution temporelle** : courbes de score global et par dimension, comparaison entre campagnes
- **Score moyen organisation** : score agrégé de toutes les équipes, avec radar chart organisationnel
- Filtres : par campagne, par équipe, par période

### F7 — Dashboard Équipe
- Historique des diagnostics de l'équipe (timeline)
- Évolution du radar chart dans le temps (superposition ou animation)
- Recommandations personnalisées basées sur le dernier diagnostic et l'évolution

### F8 — Vue Consultant
- Tableau de bord multi-organisations
- Pour chaque organisation : accès au dashboard organisation (lecture seule)
- Vue consolidée : nombre d'organisations, scores moyens, tendances globales

### F9 — Partage de Résultats
- Génération d'un lien partageable (lecture seule, avec expiration optionnelle)
- Lien possible pour : résultats d'une équipe, résultats d'une campagne, dashboard organisation
- Page publique accessible sans authentification via le lien

### F10 — State of IA (Rapport annuel)

#### Collecte et anonymisation
- Les organisations opt-in voient leurs données agrégées au niveau organisation (jamais au niveau équipe individuelle) dans un snapshot annuel
- Anonymisation irréversible : hash de l'identifiant organisation, suppression du nom, du logo et de toute donnée identifiante
- Seuls sont conservés : scores par dimension (moyennés sur toutes les équipes), score global, secteur, taille, nombre d'équipes
- L'extraction est déclenchée manuellement par l'équipe AIAD une fois par an (back-office admin AIAD)

#### Benchmark pour les organisations participantes
- Chaque organisation opt-in accède à une vue "Mon positionnement" dans son dashboard
- Positionnement anonyme : percentile par dimension et score global (ex: "Vous êtes au 72e percentile sur la dimension Outils")
- Comparaison par segment : filtrable par secteur et/ou taille d'organisation (si l'échantillon est suffisant, seuil minimum de 5 organisations par segment)
- Cette vue se met à jour automatiquement après chaque publication du State of IA

#### Publication du rapport
- Page publique "/state-of-ia/{année}" accessible sans authentification
- Contenu : distribution des niveaux de maturité, scores moyens par dimension, tendances année sur année, segmentation par secteur/taille, insights clés
- Le rapport est éditorialisé par l'équipe AIAD (le contenu n'est pas généré automatiquement — la plateforme fournit les données et graphiques, l'équipe AIAD rédige l'analyse)
- Lien de téléchargement (PDF) du rapport complet

## Architecture Technique

### Stack

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Frontend | React + Vite + TailwindCSS | Cohérence avec l'existant, performance |
| Routing | React Router | Standard React SPA |
| Charts | Recharts | Déjà utilisé dans le diagnostic existant |
| Backend | Node.js + Next.js API Routes (ou Express) | Écosystème JS unifié, SSR possible |
| Base de données | PostgreSQL | Données relationnelles, requêtes analytiques |
| ORM | Prisma | DX, migrations, typage |
| Auth | NextAuth.js (Auth.js) | Magic link + SSO intégrés, session JWT |
| Hébergement | Vercel (front + API) + Supabase/Neon (PostgreSQL) | Déploiement simple, gratuit au démarrage |
| Email | Resend | Transactionnel (magic links, invitations, relances) |

### Permissions par rôle

| Action | Admin | Manager | Member | Consultant |
|--------|-------|---------|--------|------------|
| Gérer l'organisation | Oui | Non | Non | Non |
| Créer/modifier des équipes | Oui | Ses équipes | Non | Non |
| Lancer une campagne | Oui | Non | Non | Non |
| Remplir un diagnostic | Oui | Ses équipes | Non | Non |
| Voir dashboard organisation | Oui | Vue limitée | Non | Oui (lecture) |
| Voir dashboard équipe | Oui | Ses équipes | Son équipe | Oui (lecture) |
| Ajouter des questions bonus | Oui | Non | Non | Non |
| Générer un lien de partage | Oui | Ses équipes | Non | Oui |
| Vue multi-organisations | Non | Non | Non | Oui |
| Activer/désactiver opt-in State of IA | Oui | Non | Non | Non |
| Voir "Mon positionnement" (benchmark) | Oui | Vue limitée | Non | Oui (lecture) |
| Back-office State of IA (extraction, publication) | — | — | — | — |

> **Note** : le back-office State of IA est réservé à l'équipe AIAD (super-admin plateforme), hors du périmètre des rôles organisation.

## Hors Périmètre (V1)

- **Réponses individuelles agrégées** : en V1, c'est 1 réponse collective par équipe. Le mode individuel agrégé est une évolution V2.
- **Comparaison inter-équipes (classement)** : la heatmap permet la comparaison visuelle, mais pas de ranking explicite en V1 pour éviter la compétition toxique.
- **Alertes de régression automatiques** : pas de notifications push/email en cas de baisse de score. Prévu pour V2.
- **Export PDF/CSV** : en V1, seul le lien partageable est disponible. L'export PDF et CSV arrive en V2.
- **Personnalisation complète du questionnaire** : seules des questions bonus sont possibles. La modification des questions core ou l'ajout de dimensions custom est hors périmètre.
- **SAML / OIDC entreprise** : Magic Link + SSO Google/Microsoft en V1. SAML pour les grands comptes en V2.
- **Application mobile native** : responsive web uniquement.
- **Multi-langue** : français uniquement en V1.
- **Benchmark inter-organisations temps réel** : le positionnement est mis à jour uniquement lors de la publication annuelle du State of IA, pas en temps réel. Cela garantit la stabilité des données et évite les effets de bord liés à un échantillon trop petit en cours d'année.

## Trade-offs et Décisions

| Décision | Alternative écartée | Raison |
|----------|---------------------|--------|
| 1 réponse collective par équipe | Réponses individuelles agrégées | Plus simple en V1, évite les biais de perception individuelle, le manager a la vision la plus complète de l'équipe. Le mode individuel est prévu en V2. |
| Questionnaire core fixe + questions bonus | Questionnaire entièrement personnalisable | Garantit la comparabilité entre équipes et entre organisations. Les questions bonus apportent de la flexibilité sans compromettre le standard. |
| Next.js (App Router) full-stack | Frontend React séparé + API Express | Un seul projet, déploiement unifié sur Vercel, API Routes intégrées, SSR pour le SEO des pages publiques de partage. |
| PostgreSQL (Neon/Supabase) | MongoDB | Données hautement relationnelles (orga → équipes → campagnes → diagnostics). Les requêtes analytiques (agrégation, comparaison temporelle) sont plus naturelles en SQL. |
| Magic Link + SSO | Email/password classique | Meilleure UX (pas de mot de passe à retenir), plus sécurisé, plus simple à implémenter avec Auth.js. |
| Lien partageable uniquement (V1) | Export PDF dès la V1 | Réduit le scope V1. Le lien partageable couvre 80% du besoin de partage. L'export PDF nécessite de la génération serveur (Puppeteer, etc.) — reporté en V2. |
| Application mise à disposition par AIAD | SaaS avec pricing | Le but est l'adoption du framework AIAD, pas la monétisation directe. L'outil est un levier communautaire. Un modèle freemium pourrait émerger plus tard si le besoin se confirme. |
| Opt-in explicite pour le State of IA | Opt-out (inclus par défaut) | Conformité RGPD, confiance des organisations. Mieux vaut moins de données avec un consentement clair que beaucoup de données avec un consentement ambigu. |
| Anonymisation irréversible (hash) | Pseudonymisation réversible | Impossible de ré-identifier une organisation à partir des données du State of IA, même en cas de fuite. Renforce la confiance. |
| Benchmark mis à jour annuellement | Benchmark temps réel | Évite les biais d'échantillon (trop peu de données en début d'année), garantit la stabilité, et crée un événement annuel fédérateur autour de la publication. |
| Seuil minimum de 5 orgas par segment | Pas de seuil | Empêche la ré-identification indirecte (si une seule grande ESN dans un segment, ses données seraient identifiables). |

## Dépendances et Risques

| Risque/Dépendance | Impact | Mitigation |
|--------------------|--------|------------|
| Adoption faible si l'outil est trop complexe à setup | Haut | Onboarding en 3 clics : créer orga → inviter → lancer diagnostic. UX minimaliste. |
| Pertinence du questionnaire dans le temps (évolution rapide de l'IA) | Moyen | Questions core révisables par l'équipe AIAD. Versionning des questionnaires pour garder la comparabilité historique. |
| Données sensibles (maturité des équipes = donnée stratégique) | Haut | Chiffrement at rest, accès strictement contrôlé par rôles, liens de partage avec expiration, hébergement EU (RGPD). |
| Dépendance à Vercel / Neon pour l'hébergement | Moyen | Architecture portable (Next.js + PostgreSQL standard). Migration possible vers tout hébergeur Node.js + PostgreSQL. |
| Consultant avec accès multi-organisations = surface d'attaque | Moyen | Permissions granulaires (lecture seule), audit log des accès consultant, possibilité de révoquer l'accès à tout moment. |
| Scalabilité si succès rapide (beaucoup d'organisations) | Bas | Architecture stateless (Vercel serverless), PostgreSQL scalable (Neon). Pas de contrainte pour les premiers milliers d'utilisateurs. |
| Biais du répondant unique par équipe | Moyen | Accompagnement : recommander de remplir en équipe lors d'une rétrospective. V2 permettra les réponses individuelles pour croiser les perceptions. |
| Taux d'opt-in insuffisant pour un State of IA représentatif | Haut | Incitation : l'opt-in donne accès au benchmark "Mon positionnement". Communication claire sur l'anonymisation. Objectif minimum : 30 organisations / 100 équipes pour la première édition. |
| Ré-identification indirecte dans le State of IA | Moyen | Seuil minimum de 5 organisations par segment. Pas de croisement de dimensions permettant d'isoler une organisation. Revue manuelle par l'équipe AIAD avant publication. |
| Conformité RGPD sur les données agrégées | Haut | Opt-in explicite, anonymisation irréversible (hash), droit de retrait à tout moment (les snapshots déjà extraits restent anonymes mais l'organisation ne contribue plus aux suivants). Consultation juridique recommandée avant le lancement du State of IA. |

## Roadmap indicative

### V1 — MVP (périmètre de ce PRD)
- Auth (Magic Link + SSO Google/Microsoft)
- Organisations, équipes, rôles (avec métadonnées secteur/taille)
- Diagnostic (quiz existant adapté + questions bonus)
- Campagnes (création, suivi, relance)
- Dashboard organisation (heatmap + évolution)
- Dashboard équipe (historique + radar comparatif)
- Vue consultant multi-organisations
- Partage par lien
- **State of IA** : opt-in organisation, collecte anonymisée, back-office AIAD (extraction + publication), page publique du rapport, vue "Mon positionnement" pour les organisations opt-in

### V2 — Enrichissement
- Réponses individuelles agrégées (mode alternatif)
- Export PDF et CSV
- Alertes de régression (email/notification)
- Comparaison inter-équipes (classement, écart-type)
- SAML / OIDC entreprise
- State of IA : segmentation avancée (par région, par techno dominante), tendances inter-annuelles automatisées

### V3 — Intelligence
- Recommandations personnalisées par IA (basées sur l'historique et les patterns)
- Plan d'action généré automatiquement par équipe
- Intégration avec des outils de gestion de projet (Jira, Linear)
- API publique pour intégrations tierces
- State of IA : rapport interactif en ligne (pas seulement PDF), contribution communautaire (commentaires, case studies)
