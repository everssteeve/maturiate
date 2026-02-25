## 1. Configuration Better Auth (Magic Link + Resend)

- [x] 1.1 Installer les dépendances : `resend`, `@react-email/components` (si pas déjà installés), et vérifier que le plugin Magic Link est disponible dans Better Auth
- [x] 1.2 Créer le template email Magic Link dans `src/lib/email/templates/magic-link.tsx` (React Email, en français, branding maturIAté, bouton « Se connecter », mention expiration 10 min)
- [x] 1.3 Créer le client Resend dans `src/lib/email/index.ts` (initialisation avec `RESEND_API_KEY`)
- [x] 1.4 Modifier `src/lib/auth/index.ts` pour ajouter le plugin Magic Link avec la fonction `sendMagicLink` qui utilise Resend et le template React Email

## 2. Client Auth côté navigateur

- [x] 2.1 Créer `src/lib/auth/client.ts` avec `createAuthClient()` de Better Auth, exportant `signIn`, `signOut`, `useSession`
- [x] 2.2 Vérifier que le client fonctionne avec les méthodes `signIn.magicLink({ email })` et `signIn.social({ provider })` et `signOut()`

## 3. Layouts (auth) et (dashboard)

- [x] 3.1 Créer `src/app/(auth)/layout.tsx` — layout centré, minimaliste, logo maturIAté en haut, sans sidebar
- [x] 3.2 Créer `src/app/(dashboard)/layout.tsx` — layout avec header (logo maturIAté cliquable vers `/orgs`, zone droite pour l'utilisateur)
- [x] 3.3 Créer le composant header dans `src/components/layout/header.tsx` — affiche nom, avatar (ou initiales), menu déroulant avec « Mon profil » et « Se déconnecter »
- [x] 3.4 Mettre à jour le middleware `src/middleware.ts` si nécessaire pour couvrir les routes `(dashboard)` et `/profile`

## 4. Page de connexion

- [x] 4.1 Créer `src/app/(auth)/login/page.tsx` — Server Component qui vérifie si l'utilisateur est déjà connecté (redirection vers `/orgs`), lit le `callbackUrl` des query params
- [x] 4.2 Créer le Client Component `src/components/auth/login-form.tsx` — formulaire Magic Link (champ email + bouton), boutons SSO Google et Microsoft, messages de confirmation/erreur
- [x] 4.3 Implémenter la logique de connexion : appel `signIn.magicLink()` pour Magic Link, `signIn.social()` pour SSO, gestion du `callbackUrl` pour la redirection post-connexion
- [x] 4.4 Masquer conditionnellement les boutons SSO si les variables d'environnement ne sont pas définies (passer un flag depuis le Server Component)

## 5. Page d'acceptation d'invitation

- [x] 5.1 Créer `src/app/(auth)/invite/[token]/page.tsx` — Server Component qui valide le token (existence, expiration, déjà accepté), affiche les informations de l'invitation (nom organisation, rôle)
- [x] 5.2 Réutiliser le composant `login-form.tsx` sur la page d'invitation avec le contexte d'invitation (afficher le message d'accueil personnalisé)
- [x] 5.3 Créer la Server Action `acceptInvitation` dans `src/lib/actions/invitations.ts` — vérifie le token, crée le membership, marque l'invitation comme acceptée, redirige vers `/orgs/[orgId]`
- [x] 5.4 Intégrer l'acceptation d'invitation dans le flux post-connexion (après login, si un token d'invitation est en contexte, déclencher `acceptInvitation`)

## 6. Page de profil utilisateur

- [x] 6.1 Créer `src/app/(dashboard)/profile/page.tsx` — Server Component qui récupère les données de l'utilisateur connecté
- [x] 6.2 Créer le Client Component `src/components/auth/profile-form.tsx` — formulaire avec nom (éditable), email (lecture seule), avatar URL (éditable)
- [x] 6.3 Créer la Server Action `updateProfile` dans `src/lib/actions/users.ts` — validation Zod (nom requis, 1-100 chars, avatar URL optionnelle), mise à jour en base

## 7. Tests et vérification

- [x] 7.1 Écrire les tests unitaires pour la validation du profil (Zod schemas) dans `tests/unit/`
- [x] 7.2 Écrire un test E2E Playwright pour le parcours connexion Magic Link : accès `/login` → saisie email → vérification du message de confirmation
- [x] 7.3 Écrire un test E2E Playwright pour le parcours invitation : accès `/invite/[token]` → vérification de l'affichage → connexion
- [x] 7.4 Vérifier le responsive de la page de connexion sur mobile (375px)
