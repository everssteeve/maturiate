## Context

Le projet maturIAté dispose des fondations : authentification (F1), gestion des organisations et membres (F2), gestion des équipes (F3). Les constantes métier (14 questions core, 6 dimensions, 4 niveaux, recommandations) existent déjà dans `src/data/`. Le schéma DB inclut déjà les tables `diagnostics` et `bonus_questions`. Il manque la logique de scoring, les actions/queries, et l'ensemble de l'interface quiz + résultats.

Le diagnostic est une réponse collective par équipe, remplie par un admin ou un manager. Il peut être lié à une campagne (F5, future) ou être ad hoc (`campaignId: null`).

## Goals / Non-Goals

**Goals :**
- Permettre à un admin ou manager de remplir un diagnostic pour une équipe
- Calculer automatiquement les scores par dimension et le score global
- Afficher les résultats avec un radar chart, le niveau de maturité et des recommandations
- Permettre à l'admin de gérer les questions bonus spécifiques à l'organisation
- Supporter les diagnostics ad hoc (sans campagne) dès maintenant

**Non-Goals :**
- Gestion des campagnes (F5 — fonctionnalité séparée, le champ `campaignId` accepte `null`)
- Dashboards organisation et équipe (F6/F7 — consommeront les données créées ici)
- Comparaison temporelle ou évolution des scores (F6/F7)
- Export ou partage des résultats (F9)
- Questions bonus avec formats multiples (V2 — pour le MVP, les bonus ont le même format 4 options que les core)

## Decisions

### D1 : Scoring côté serveur dans une fonction pure

Le calcul des scores se fait dans `src/lib/scoring.ts`, une fonction pure sans dépendance à la DB. Elle prend les réponses (`Record<string, number>`) et retourne les scores par dimension + score global + niveau.

**Pourquoi** : Testabilité unitaire maximale, réutilisable pour le recalcul ou le benchmark. Alternative considérée : calcul en SQL avec trigger — rejeté car moins testable et couple le calcul au stockage.

### D2 : Quiz comme Client Component avec état local

Le quiz est un Client Component (`"use client"`) qui gère l'état local des réponses et la navigation entre questions. À la soumission, il appelle la Server Action `submitDiagnostic`.

**Pourquoi** : Le quiz est intrinsèquement interactif (navigation, sélection, animation). Le Server Component parent (`page.tsx`) fetch les données nécessaires (équipe, questions bonus) et les passe en props. Alternative considérée : formulaire multi-step natif HTML — rejeté car UX inférieure (rechargement à chaque étape).

### D3 : Stockage des réponses en JSONB

Les réponses sont stockées en `jsonb` dans la table `diagnostics` : `answers` pour les core (`{ "q_0": 3, "q_1": 2, ... }`), `bonusAnswers` pour les bonus. Les scores par dimension sont aussi en `jsonb`.

**Pourquoi** : Flexible, pas besoin d'une table de jonction question-réponse. Les 14 questions core sont fixes (constantes), donc le format JSONB est stable. Alternative considérée : table `diagnostic_answers` normalisée — rejeté car sur-ingénierie pour 14 réponses fixes.

### D4 : Navigation séquentielle avec barre de progression

Le quiz présente une question à la fois avec navigation avant/arrière et une barre de progression. L'utilisateur peut revenir en arrière pour modifier une réponse. La soumission n'est possible que quand toutes les questions core sont répondues.

**Pourquoi** : UX claire et focus sur chaque question, évite la surcharge cognitive d'un long formulaire. Patterns UI : écran de bienvenue → questions core → questions bonus (si présentes) → récapitulatif → soumission.

### D5 : Page de résultats accessible via redirection post-soumission

Après soumission, l'utilisateur est redirigé vers une page de résultats (`/orgs/[orgId]/diagnostic/[teamId]/results/[diagnosticId]`). Cette page est un Server Component qui fetch le diagnostic et affiche radar chart + détails.

**Pourquoi** : URL partageable, bookmarkable. Le Server Component évite le chargement client des données. Alternative : modal de résultats — rejeté car non bookmarkable et moins adapté à un contenu riche.

### D6 : Radar chart avec Recharts

Le radar chart des scores par dimension utilise Recharts (`RadarChart` component). Les 6 axes correspondent aux 6 dimensions.

**Pourquoi** : Recharts est déjà dans le projet (cf. ARCHITECTURE.md), API déclarative React, bon support du radar chart.

### D7 : Bonus questions CRUD via dialog dans les paramètres

La gestion des questions bonus (création, modification, activation/désactivation) se fait depuis la page de paramètres de l'organisation, via un dialog modal. Pas de page dédiée.

**Pourquoi** : Fonctionnalité secondaire, ne justifie pas une route dédiée. Le dialog est cohérent avec le pattern existant (cf. invitation de membres). Admin uniquement.

## Risks / Trade-offs

- **Concurrence de soumission** : Deux utilisateurs pourraient soumettre un diagnostic pour la même équipe simultanément → Pas de contrainte unique dans le schéma actuel, ce qui est voulu (historique). Quand les campagnes (F5) seront ajoutées, une contrainte unique `(teamId, campaignId)` sera ajoutée.
- **Calcul de scores incorrect** : Bug dans la logique de scoring → Mitigation : tests unitaires exhaustifs couvrant tous les cas limites (scores min/max, questions manquantes).
- **Questions bonus orphelines** : Si une question bonus est désactivée après qu'un diagnostic y a répondu → Les `bonusAnswers` restent en base mais ne sont plus affichées. Pas de recalcul nécessaire car les bonus ne comptent pas dans le score.
- **Performance radar chart** : Recharts peut être lourd → Mitigation : lazy loading du composant chart, les données sont légères (6 valeurs).
