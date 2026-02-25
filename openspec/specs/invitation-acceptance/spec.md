## ADDED Requirements

### Requirement: Page d'acceptation d'invitation à /invite/[token]
Le système SHALL afficher une page dédiée à l'acceptation d'invitation, accessible via un token unique dans l'URL.

#### Scenario: Token d'invitation valide
- **WHEN** un utilisateur navigue vers `/invite/abc123` avec un token valide et non expiré
- **THEN** le système MUST afficher le nom de l'organisation, le rôle attribué, et les options de connexion (Magic Link + SSO)

#### Scenario: Token d'invitation expiré
- **WHEN** un utilisateur navigue vers `/invite/abc123` avec un token expiré (> 7 jours)
- **THEN** le système MUST afficher un message « Cette invitation a expiré. Contactez l'administrateur de l'organisation pour en recevoir une nouvelle. »

#### Scenario: Token d'invitation invalide
- **WHEN** un utilisateur navigue vers `/invite/xyz` avec un token inexistant
- **THEN** le système MUST afficher une page 404

#### Scenario: Invitation déjà acceptée
- **WHEN** un utilisateur navigue vers `/invite/abc123` avec un token déjà accepté (`acceptedAt` non null)
- **THEN** le système MUST afficher un message « Cette invitation a déjà été acceptée. » avec un lien vers `/login`

### Requirement: Connexion et création de membership à l'acceptation
Le système SHALL connecter l'utilisateur et créer le membership dans l'organisation après acceptation de l'invitation.

#### Scenario: Nouvel utilisateur accepte une invitation
- **WHEN** un nouvel utilisateur se connecte via la page d'invitation (Magic Link ou SSO)
- **THEN** le système MUST créer un compte utilisateur, créer un membership avec le rôle de l'invitation, marquer l'invitation comme acceptée (`acceptedAt`), et rediriger vers `/orgs/[orgId]`

#### Scenario: Utilisateur existant accepte une invitation
- **WHEN** un utilisateur existant se connecte via la page d'invitation
- **AND** il n'est pas encore membre de cette organisation
- **THEN** le système MUST créer le membership avec le rôle de l'invitation, marquer l'invitation comme acceptée, et rediriger vers `/orgs/[orgId]`

#### Scenario: Utilisateur déjà membre de l'organisation
- **WHEN** un utilisateur déjà membre de l'organisation accède à la page d'invitation
- **THEN** le système MUST afficher un message « Vous êtes déjà membre de cette organisation. » avec un lien vers le dashboard de l'organisation
