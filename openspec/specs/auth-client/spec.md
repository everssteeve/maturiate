## ADDED Requirements

### Requirement: Client Better Auth côté navigateur
Le système SHALL fournir un client Better Auth initialisé dans `src/lib/auth/client.ts` pour les composants React.

#### Scenario: Export du client auth
- **WHEN** un composant importe depuis `@/lib/auth/client`
- **THEN** il MUST avoir accès aux méthodes `signIn`, `signOut`, et `useSession`

### Requirement: Hook useSession pour l'état de session
Le système SHALL fournir un hook `useSession` qui retourne l'état de session courant dans les Client Components.

#### Scenario: Utilisateur connecté
- **WHEN** `useSession()` est appelé dans un Client Component
- **AND** l'utilisateur est authentifié
- **THEN** le hook MUST retourner un objet contenant `user` (id, name, email, image) et `session`

#### Scenario: Utilisateur non connecté
- **WHEN** `useSession()` est appelé dans un Client Component
- **AND** l'utilisateur n'est pas authentifié
- **THEN** le hook MUST retourner `null` pour `user` et `session`

### Requirement: Fonction de déconnexion
Le système SHALL permettre la déconnexion via le client auth.

#### Scenario: Déconnexion réussie
- **WHEN** `signOut()` est appelé depuis un Client Component
- **THEN** le système MUST invalider la session, supprimer le cookie de session, et rediriger vers `/login`

### Requirement: Fonctions de connexion
Le système SHALL exposer les méthodes de connexion via le client auth.

#### Scenario: Connexion Magic Link côté client
- **WHEN** `signIn.magicLink({ email })` est appelé
- **THEN** le système MUST déclencher l'envoi du Magic Link via l'API `/api/auth/magic-link`

#### Scenario: Connexion SSO côté client
- **WHEN** `signIn.social({ provider: "google" })` est appelé
- **THEN** le système MUST rediriger vers le flux OAuth du provider correspondant
