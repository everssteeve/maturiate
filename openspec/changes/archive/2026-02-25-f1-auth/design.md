## Context

L'infrastructure d'authentification Better Auth est déjà en place : configuration serveur avec Drizzle adapter, tables DB (sessions, accounts, verifications), API route catch-all `/api/auth/*`, middleware de protection des routes dashboard, et système de permissions (`requireRole`, `requireSuperAdmin`).

Il manque toute la couche utilisateur : aucune page de connexion, pas de flux Magic Link, pas de gestion de profil, pas de client auth côté navigateur. Le projet est en phase de scaffolding initial — aucune page applicative n'existe encore au-delà d'une landing page placeholder.

**Contraintes** :
- Better Auth est la bibliothèque d'auth choisie (cf. ARCHITECTURE.md), self-hosted avec données dans PostgreSQL
- L'UI est en français, le code en anglais
- Stack UI : Tailwind CSS v4 + shadcn/ui
- Emails transactionnels via Resend + React Email
- Le middleware protège déjà les routes `(dashboard)` — il faudra simplement s'assurer qu'il couvre les bons chemins

## Goals / Non-Goals

**Goals :**
- Permettre à un utilisateur de se connecter via Magic Link (email) ou SSO (Google, Microsoft)
- Créer automatiquement un compte si l'email n'existe pas (première connexion)
- Permettre l'acceptation d'une invitation avec connexion/création de compte intégrée
- Offrir une page de profil pour modifier nom et avatar
- Fournir un client auth côté navigateur (état de session, déconnexion)
- Mettre en place le layout authentifié avec header utilisateur

**Non-Goals :**
- Authentification par email/mot de passe (explicitement exclu dans le PRD)
- SAML / OIDC entreprise (V2)
- Gestion des organisations et des rôles (F2)
- Sidebar de navigation complète (sera enrichie dans F2+)
- Système de récupération de mot de passe (pas de mot de passe)

## Decisions

### D1 : Utiliser le plugin Magic Link natif de Better Auth

**Choix** : Utiliser le plugin `magicLink` intégré à Better Auth plutôt qu'une implémentation custom.

**Alternative écartée** : Implémenter manuellement la génération de token + envoi email + vérification. Trop de surface d'erreur pour un cas standard.

**Raison** : Better Auth fournit un plugin `magicLink` qui gère la génération du token, le stockage dans la table `verifications`, la vérification et la création de session. On lui fournit une fonction `sendMagicLink` qui utilise Resend pour envoyer l'email. Le flux est sécurisé par défaut (token usage unique, expiration 10 min).

### D2 : Client auth via `createAuthClient` de Better Auth

**Choix** : Créer un module `src/lib/auth/client.ts` exportant le client Better Auth initialisé, puis un hook React `useSession` et un `SessionProvider` context.

**Alternative écartée** : Appeler directement `fetch('/api/auth/...')` depuis les composants. Trop verbeux, pas de gestion d'état intégrée.

**Raison** : Better Auth fournit `createAuthClient()` qui expose `signIn`, `signOut`, `useSession` côté client. Cela garantit la cohérence avec la config serveur et simplifie les composants.

### D3 : Layout (auth) minimaliste, layout (dashboard) avec header

**Choix** : Deux layouts distincts :
- `(auth)/layout.tsx` : centré, pas de sidebar, fond clair, uniquement le logo
- `(dashboard)/layout.tsx` : header avec nom/avatar/déconnexion, zone de contenu principale. Pas de sidebar complète pour l'instant (ajoutée en F2).

**Alternative écartée** : Un seul layout avec affichage conditionnel. Plus complexe et moins clair pour le routing Next.js.

### D4 : L'invitation est un flux de connexion enrichi

**Choix** : La page `/invite/[token]` vérifie le token, affiche les informations de l'invitation (organisation, rôle), puis propose les mêmes méthodes de connexion que `/login`. Après connexion réussie, une Server Action accepte l'invitation (crée le membership).

**Alternative écartée** : Un flux séparé avec un formulaire d'inscription dédié. Trop de duplication avec le flux de login.

**Raison** : Si l'utilisateur a déjà un compte, il se connecte normalement. Sinon, Better Auth crée le compte automatiquement. Le seul ajout est la création du membership après auth.

### D5 : Template Magic Link avec React Email

**Choix** : Un template React Email simple, en français, avec le branding maturIAté (logo, couleurs). Le lien pointe vers le callback Better Auth.

**Raison** : Cohérence avec les futurs templates d'email (invitation, relance campagne). React Email permet le rendu serveur en JSX.

## Risks / Trade-offs

- **Magic Link en spam** → Mitigation : configurer le domaine d'envoi correctement dans Resend (SPF, DKIM, DMARC). Ajouter un message "Vérifiez vos spams" dans l'UI.
- **SSO Google/Microsoft non configuré en dev** → Mitigation : le Magic Link fonctionne seul. Les boutons SSO peuvent être masqués si les env vars ne sont pas définies.
- **Token d'invitation expiré** → Mitigation : afficher un message clair avec possibilité de demander un renvoi (via l'admin).
- **Pas de sidebar en F1** → Trade-off acceptable : le header suffit pour la navigation minimale. La sidebar sera ajoutée en F2 avec la gestion d'organisations.
