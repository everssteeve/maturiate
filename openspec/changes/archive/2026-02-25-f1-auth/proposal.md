## Why

L'infrastructure d'authentification (Better Auth, tables DB, middleware, route API) est en place mais aucune interface utilisateur n'existe. Un utilisateur ne peut ni se connecter, ni créer un compte, ni gérer son profil. Sans F1, aucune fonctionnalité métier (F2-F10) n'est accessible. C'est le prérequis fondamental pour toute la plateforme maturIAté.

## What Changes

- **Page de connexion** (`/login`) avec deux méthodes : Magic Link (email) et SSO (Google, Microsoft)
- **Flux Magic Link** : saisie email → envoi du lien via Resend → callback de vérification → création de session
- **Flux SSO** : boutons Google et Microsoft → redirection OAuth → callback → création de session
- **Création de compte automatique** : si l'email n'existe pas en base, un compte utilisateur est créé à la première connexion (Magic Link ou SSO)
- **Acceptation d'invitation** (`/invite/[token]`) : un utilisateur invité par email arrive sur une page dédiée, se connecte/crée son compte, et est automatiquement ajouté à l'organisation avec le rôle assigné
- **Page de profil utilisateur** : consultation et modification du nom, email, avatar
- **Client auth côté navigateur** : initialisation du client Better Auth pour les composants React (état de session, déconnexion)
- **Redirection post-connexion** : après authentification, l'utilisateur est redirigé vers la page d'où il venait (ou `/orgs` par défaut)
- **Layout authentifié** (`(dashboard)/layout.tsx`) : affiche le header avec l'utilisateur connecté et un bouton de déconnexion

## Capabilities

### New Capabilities
- `login-page`: Page de connexion avec Magic Link et SSO (Google, Microsoft), responsive et en français
- `magic-link-flow`: Configuration Better Auth pour l'envoi de Magic Links via Resend, avec template email React Email
- `invitation-acceptance`: Page `/invite/[token]` permettant d'accepter une invitation, se connecter, et rejoindre l'organisation
- `user-profile`: Page de profil utilisateur avec modification du nom et de l'avatar
- `auth-client`: Client Better Auth côté navigateur, hook `useSession`, provider de session pour les composants React
- `dashboard-layout`: Layout des pages authentifiées avec header (nom utilisateur, avatar, déconnexion) et structure de base

### Modified Capabilities
- `auth-setup`: Ajout de la configuration Magic Link (plugin emailOtp ou magicLink de Better Auth) et intégration Resend pour l'envoi des emails

## Impact

- **Fichiers créés** : `src/app/(auth)/login/page.tsx`, `src/app/(auth)/invite/[token]/page.tsx`, `src/app/(auth)/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/(dashboard)/profile/page.tsx`, `src/lib/auth/client.ts`, `src/lib/email/templates/magic-link.tsx`
- **Fichiers modifiés** : `src/lib/auth/index.ts` (ajout Magic Link + Resend), `src/middleware.ts` (ajustement matchers si nécessaire)
- **Dépendances** : `@better-auth/magic-link` (ou plugin intégré), `resend`, `@react-email/components` (déjà prévus dans la stack)
- **API** : endpoint `/api/auth/*` existant gère tout via Better Auth
- **Base de données** : la table `verifications` existante stocke les tokens Magic Link ; aucune migration supplémentaire nécessaire
