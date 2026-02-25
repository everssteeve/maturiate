## ADDED Requirements

### Requirement: Page de connexion accessible à /login
Le système SHALL afficher une page de connexion à l'URL `/login`, accessible sans authentification, avec le branding maturIAté.

#### Scenario: Accès à la page de connexion
- **WHEN** un utilisateur non authentifié navigue vers `/login`
- **THEN** le système MUST afficher la page de connexion avec le logo maturIAté, un champ email pour Magic Link et les boutons SSO

#### Scenario: Utilisateur déjà connecté
- **WHEN** un utilisateur authentifié navigue vers `/login`
- **THEN** le système MUST rediriger vers `/orgs`

### Requirement: Formulaire Magic Link sur la page de connexion
Le système SHALL afficher un formulaire de saisie d'email permettant de demander un Magic Link.

#### Scenario: Saisie d'un email valide
- **WHEN** l'utilisateur saisit un email valide et soumet le formulaire Magic Link
- **THEN** le système MUST déclencher l'envoi du Magic Link et afficher un message de confirmation « Un lien de connexion a été envoyé à votre adresse email. »

#### Scenario: Saisie d'un email invalide
- **WHEN** l'utilisateur saisit un email au format invalide et soumet le formulaire
- **THEN** le système MUST afficher un message d'erreur de validation côté client sans envoyer de requête

#### Scenario: Message d'information vérifiez vos spams
- **WHEN** le Magic Link a été envoyé avec succès
- **THEN** le système MUST afficher un texte secondaire « Vérifiez votre dossier de spams si vous ne recevez rien. »

### Requirement: Boutons SSO Google et Microsoft
Le système SHALL afficher des boutons de connexion SSO pour Google et Microsoft.

#### Scenario: Clic sur le bouton Google
- **WHEN** l'utilisateur clique sur le bouton « Se connecter avec Google »
- **THEN** le système MUST rediriger vers le flux OAuth Google via Better Auth

#### Scenario: Clic sur le bouton Microsoft
- **WHEN** l'utilisateur clique sur le bouton « Se connecter avec Microsoft »
- **THEN** le système MUST rediriger vers le flux OAuth Microsoft via Better Auth

#### Scenario: Variables SSO non configurées
- **WHEN** les variables d'environnement `GOOGLE_CLIENT_ID` ou `MICROSOFT_CLIENT_ID` ne sont pas définies
- **THEN** le bouton SSO correspondant MUST être masqué (pas d'erreur visible)

### Requirement: Redirection post-connexion
Le système SHALL rediriger l'utilisateur vers la page demandée après connexion réussie.

#### Scenario: Callback URL présent
- **WHEN** l'URL `/login?callbackUrl=/orgs/123` contient un paramètre `callbackUrl`
- **AND** l'utilisateur se connecte avec succès
- **THEN** le système MUST rediriger vers `/orgs/123`

#### Scenario: Pas de callback URL
- **WHEN** l'URL `/login` ne contient pas de paramètre `callbackUrl`
- **AND** l'utilisateur se connecte avec succès
- **THEN** le système MUST rediriger vers `/orgs`

### Requirement: Interface responsive et en français
La page de connexion SHALL être responsive (mobile-first) et entièrement en français.

#### Scenario: Affichage mobile
- **WHEN** la page de connexion est affichée sur un écran de 375px de large
- **THEN** tous les éléments MUST être visibles et utilisables sans scroll horizontal

#### Scenario: Textes en français
- **WHEN** la page de connexion est affichée
- **THEN** tous les labels, boutons et messages MUST être en français
