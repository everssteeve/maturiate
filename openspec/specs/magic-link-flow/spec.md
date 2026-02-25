## ADDED Requirements

### Requirement: Configuration Magic Link dans Better Auth
Le système SHALL configurer le plugin Magic Link de Better Auth pour générer et vérifier les tokens de connexion par email.

#### Scenario: Plugin Magic Link activé
- **WHEN** Better Auth est initialisé
- **THEN** le plugin magicLink MUST être activé avec une expiration de 10 minutes et un usage unique

#### Scenario: Fonction d'envoi d'email personnalisée
- **WHEN** un Magic Link est généré par Better Auth
- **THEN** le système MUST appeler une fonction `sendMagicLink` qui utilise Resend pour envoyer l'email avec le template React Email

### Requirement: Template email Magic Link
Le système SHALL envoyer un email de Magic Link avec un template React Email en français, brandé maturIAté.

#### Scenario: Contenu de l'email Magic Link
- **WHEN** un email de Magic Link est envoyé
- **THEN** l'email MUST contenir le logo maturIAté, un message d'accueil en français, un bouton « Se connecter » avec le lien de vérification, et une mention de l'expiration (10 minutes)

#### Scenario: Expéditeur de l'email
- **WHEN** un email de Magic Link est envoyé
- **THEN** l'expéditeur MUST être `maturIAté <noreply@maturiate.com>` (ou le domaine configuré dans Resend)

### Requirement: Création automatique de compte à la première connexion
Le système SHALL créer automatiquement un compte utilisateur si l'email du Magic Link n'existe pas en base.

#### Scenario: Nouvel utilisateur via Magic Link
- **WHEN** un utilisateur clique sur un Magic Link valide
- **AND** aucun compte n'existe pour cet email
- **THEN** le système MUST créer un utilisateur avec l'email comme nom par défaut, `emailVerified: true`, et créer une session

#### Scenario: Utilisateur existant via Magic Link
- **WHEN** un utilisateur clique sur un Magic Link valide
- **AND** un compte existe déjà pour cet email
- **THEN** le système MUST créer une session sans modifier le compte existant

### Requirement: Token Magic Link sécurisé
Le système SHALL garantir que les tokens de Magic Link sont sécurisés et à usage unique.

#### Scenario: Token expiré
- **WHEN** un utilisateur clique sur un Magic Link après 10 minutes
- **THEN** le système MUST afficher une erreur « Ce lien a expiré. Veuillez demander un nouveau lien de connexion. »

#### Scenario: Token déjà utilisé
- **WHEN** un utilisateur clique sur un Magic Link déjà utilisé
- **THEN** le système MUST afficher une erreur « Ce lien a déjà été utilisé. Veuillez demander un nouveau lien de connexion. »
