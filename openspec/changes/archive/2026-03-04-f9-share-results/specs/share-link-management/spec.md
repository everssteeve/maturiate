## ADDED Requirements

### Requirement: Création d'un lien de partage
Le système DOIT permettre de créer un lien de partage en spécifiant le type de cible (`team`, `campaign`, `org`), l'identifiant de la cible (`targetId`), et une date d'expiration optionnelle. Le système génère un token unique (UUID v4) et retourne l'URL complète du lien.

#### Scenario: Création d'un lien pour une équipe
- **WHEN** un admin crée un lien de partage de type `team` avec le `teamId` d'une équipe de son organisation
- **THEN** le système crée une entrée dans `share_links` avec un token unique, le type `team`, le `targetId` correspondant, et retourne l'URL `/share/[token]`

#### Scenario: Création d'un lien avec expiration
- **WHEN** un utilisateur crée un lien de partage avec une date d'expiration dans 7 jours
- **THEN** le système crée le lien avec `expiresAt` défini à la date spécifiée

#### Scenario: Création d'un lien sans expiration
- **WHEN** un utilisateur crée un lien de partage sans date d'expiration
- **THEN** le système crée le lien avec `expiresAt` à `null` (le lien n'expire jamais)

#### Scenario: Création d'un lien pour une campagne
- **WHEN** un admin crée un lien de partage de type `campaign` avec un `campaignId` valide
- **THEN** le système crée le lien et retourne l'URL `/share/[token]`

#### Scenario: Création d'un lien pour le dashboard organisation
- **WHEN** un admin crée un lien de partage de type `org` avec l'`orgId`
- **THEN** le système crée le lien et retourne l'URL `/share/[token]`

### Requirement: Permissions de création de lien par rôle
Le système DOIT vérifier les permissions avant de créer un lien de partage. L'admin peut créer des liens pour tout type de cible dans son organisation. Le manager peut créer des liens uniquement pour les équipes dont il est membre. Le consultant peut créer des liens pour les organisations auxquelles il a accès. Le member ne peut pas créer de lien.

#### Scenario: Admin crée un lien pour n'importe quelle cible
- **WHEN** un admin tente de créer un lien de partage pour n'importe quelle équipe, campagne ou organisation de son org
- **THEN** le lien est créé avec succès

#### Scenario: Manager crée un lien pour son équipe
- **WHEN** un manager membre de l'équipe tente de créer un lien de type `team` pour cette équipe
- **THEN** le lien est créé avec succès

#### Scenario: Manager tente de créer un lien pour une autre équipe
- **WHEN** un manager tente de créer un lien pour une équipe dont il n'est pas membre
- **THEN** le système refuse avec une erreur 403

#### Scenario: Manager tente de créer un lien pour une campagne
- **WHEN** un manager tente de créer un lien de type `campaign`
- **THEN** le système refuse avec une erreur 403

#### Scenario: Manager tente de créer un lien pour le dashboard organisation
- **WHEN** un manager tente de créer un lien de type `org`
- **THEN** le système refuse avec une erreur 403

#### Scenario: Consultant crée un lien
- **WHEN** un consultant tente de créer un lien pour une organisation à laquelle il a accès
- **THEN** le lien est créé avec succès

#### Scenario: Member tente de créer un lien
- **WHEN** un member tente de créer un lien de partage
- **THEN** le système refuse avec une erreur 403

### Requirement: Listage des liens de partage
Le système DOIT permettre de lister les liens de partage existants pour une cible donnée (équipe, campagne ou organisation). Les liens expirés sont inclus dans la liste avec une indication visuelle.

#### Scenario: Listage des liens d'une équipe
- **WHEN** un utilisateur autorisé demande la liste des liens de partage pour une équipe
- **THEN** le système retourne tous les liens de type `team` avec `targetId` correspondant, triés par date de création décroissante

#### Scenario: Lien expiré dans la liste
- **WHEN** la liste contient un lien dont `expiresAt` est dans le passé
- **THEN** le lien est affiché avec une indication visuelle qu'il est expiré

### Requirement: Suppression d'un lien de partage
Le système DOIT permettre de supprimer un lien de partage existant. Seul le créateur du lien ou un admin de l'organisation peut supprimer un lien.

#### Scenario: Créateur supprime son lien
- **WHEN** le créateur d'un lien clique sur supprimer
- **THEN** le lien est supprimé de la base de données et n'est plus accessible

#### Scenario: Admin supprime un lien d'un autre utilisateur
- **WHEN** un admin supprime un lien créé par un manager
- **THEN** le lien est supprimé avec succès

#### Scenario: Manager tente de supprimer un lien d'un autre utilisateur
- **WHEN** un manager tente de supprimer un lien créé par un autre utilisateur
- **THEN** le système refuse avec une erreur 403

### Requirement: Validation du token lors de l'accès
Le système DOIT valider le token lors de l'accès à une page partagée. Si le token est invalide, expiré, ou que la cible n'existe plus, une page d'erreur appropriée est affichée.

#### Scenario: Token valide et non expiré
- **WHEN** un visiteur accède à `/share/[token]` avec un token valide dont `expiresAt` est `null` ou dans le futur
- **THEN** la page de résultats correspondante s'affiche

#### Scenario: Token expiré
- **WHEN** un visiteur accède à `/share/[token]` avec un token dont `expiresAt` est dans le passé
- **THEN** une page d'erreur indique que le lien a expiré

#### Scenario: Token inexistant
- **WHEN** un visiteur accède à `/share/[token]` avec un token qui n'existe pas dans la base
- **THEN** une page 404 est affichée

#### Scenario: Cible supprimée
- **WHEN** un visiteur accède à `/share/[token]` mais l'équipe/campagne/org associée a été supprimée
- **THEN** une page 404 est affichée
