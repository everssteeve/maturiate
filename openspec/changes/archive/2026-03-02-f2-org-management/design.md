## Context

F1 a livré l'authentification (Better Auth, magic link, SSO), le schéma DB complet (toutes les tables dont `organizations`, `memberships`, `invitations`), le système de permissions (`requireRole`), le layout dashboard avec header, et la page d'acceptation d'invitation. L'utilisateur peut se connecter et accepter une invitation, mais ne peut ni créer d'organisation, ni gérer des membres, ni accéder aux paramètres.

F2 construit sur ces fondations pour rendre la plateforme utilisable : CRUD organisation, gestion des membres, envoi d'invitations, navigation inter-organisations, et opt-in State of IA.

**Contraintes :**
- Multi-tenant strict : tout accès DB scopé par `orgId`
- Les tables DB existent déjà (schéma F1) — pas de migration nécessaire
- Emails transactionnels via Resend + React Email (déjà configuré en F1 pour magic link)
- Interface en français, code en anglais

## Goals / Non-Goals

**Goals :**
- Permettre la création d'organisation et l'attribution automatique du rôle admin au créateur
- Fournir une page paramètres complète (infos org, membres, invitations, opt-in)
- Implémenter l'envoi d'invitations par email avec token sécurisé
- Ajouter un sélecteur d'organisation dans le header pour la navigation multi-org
- Gérer l'opt-in/opt-out State of IA avec traçabilité des dates

**Non-Goals :**
- Upload de logo (V2) — pour le MVP, le logo est une URL texte
- Suppression d'organisation (fonctionnalité dangereuse, hors scope V1)
- Gestion avancée des rôles (RBAC granulaire) — le système de rôles actuel suffit
- SAML/OIDC par organisation — authentification centralisée via Better Auth
- Gestion des équipes (F3) — traité dans la fonctionnalité suivante
- Pagination des membres — non nécessaire pour le MVP (organisations < 200 membres)

## Decisions

### 1. Server Actions pour toutes les mutations

**Choix** : Utiliser des Server Actions Next.js (dans `lib/actions/`) pour toutes les écritures.

**Alternatives considérées** :
- API Routes (`/api/...`) : plus de boilerplate, pas nécessaire puisque tout est en SSR
- tRPC : overhead supplémentaire, le projet n'utilise pas tRPC

**Rationale** : Cohérent avec l'architecture définie, validation Zod intégrée, typage end-to-end natif.

### 2. Formulaire de création d'organisation séparé sur `/orgs/new`

**Choix** : Page dédiée `/orgs/new` plutôt qu'un dialog sur `/orgs`.

**Alternatives considérées** :
- Dialog/modal sur la page `/orgs` : moins d'espace pour le formulaire
- Inline form : confusion avec la liste

**Rationale** : La création d'organisation est une action peu fréquente. Une page dédiée permet un formulaire clair avec validation visible et une meilleure accessibilité.

### 3. Page paramètres unifiée avec sections

**Choix** : Une seule page `/orgs/[orgId]/settings` avec sections (infos, membres, invitations, opt-in) plutôt que des sous-pages.

**Alternatives considérées** :
- Sous-pages séparées (`/settings/members`, `/settings/invitations`) : navigation inutilement complexe
- Tabs : possible mais les sections sont peu nombreuses, un scroll suffit

**Rationale** : Le nombre de paramètres est limité pour le MVP. Des sections avec ancres permettent un accès direct tout en gardant une vue d'ensemble. Si la page devient trop longue en V2+, on migrera vers des tabs.

### 4. Invitation : réutilisation du flow F1

**Choix** : L'envoi d'invitation crée une entrée en DB (`invitations`) et envoie un email avec le lien `/invite/[token]`. L'acceptation est déjà gérée par F1.

**Alternatives considérées** :
- Nouveau flow d'invitation indépendant : duplication inutile

**Rationale** : F1 a déjà implémenté la page `/invite/[token]` avec authentification et création de membership. F2 n'a qu'à implémenter le côté "envoi" (création du token + email).

### 5. Template email d'invitation avec React Email

**Choix** : Créer un template `InvitationEmail` avec React Email, envoyé via Resend.

**Rationale** : Cohérent avec l'infrastructure email existante (magic link). React Email permet un rendu HTML professionnel et maintenable.

### 6. Org switcher dans le header existant

**Choix** : Ajouter un composant `OrgSwitcher` dans le header du layout dashboard, à côté du titre "maturIAté".

**Alternatives considérées** :
- Sidebar avec liste d'organisations : trop lourd pour le MVP
- Page `/orgs` comme seul point de navigation : frictions pour les consultants multi-org

**Rationale** : Un dropdown dans le header permet de naviguer rapidement entre organisations sans quitter le contexte. La page `/orgs` reste le hub principal.

### 7. Redirection post-création vers les paramètres

**Choix** : Après création d'une organisation, rediriger vers `/orgs/[orgId]/settings` pour encourager l'admin à compléter les infos et inviter des membres.

**Rationale** : L'organisation vient d'être créée, l'étape logique suivante est la configuration. Le dashboard sera vide tant qu'aucun diagnostic n'est rempli.

## Risks / Trade-offs

**[Rate limiting emails]** → Pour le MVP, pas de rate limiting sur l'envoi d'invitations. Mitigation : le nombre d'invitations par organisation sera naturellement limité. À implémenter en V2 si abus constaté.

**[Pas de suppression d'organisation]** → Un admin ne peut pas supprimer son organisation dans le MVP. Mitigation : un super-admin pourra le faire via le back-office (F10). Acceptable car la suppression est rare et dangereuse (cascade sur toutes les données).

**[Logo en URL texte]** → Pas d'upload de fichier, l'admin fournit une URL. Risque : URLs invalides ou cassées. Mitigation : validation de format URL + prévisualisation dans le formulaire. Upload natif prévu en V2.

**[Pas de confirmation par email pour changement de rôle]** → Le changement de rôle est immédiat. Mitigation : seul l'admin peut changer les rôles, et une confirmation UI (dialog) est demandée.

**[Consultant read-only non strictement enforced côté UI]** → Le consultant voit les mêmes pages mais les boutons d'action sont masqués. La protection réelle est côté serveur via `requireRole`. Trade-off acceptable.
