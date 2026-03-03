## ADDED Requirements

### Requirement: Création d'une question bonus par l'admin
Le système DOIT permettre à un admin de créer une question bonus pour son organisation, avec un texte, 4 options de réponse et une dimension associée.

#### Scenario: Création réussie
- **WHEN** un admin crée une question bonus avec un texte, 4 options et la dimension "tools"
- **THEN** la question est persistée dans la table `bonus_questions` avec `active: true` et associée à l'organisation de l'admin

#### Scenario: Création refusée pour un non-admin
- **WHEN** un manager tente de créer une question bonus
- **THEN** le système retourne une erreur "Forbidden"

### Requirement: Validation des données de question bonus
Le système DOIT valider que le texte de la question n'est pas vide, que les 4 options sont fournies et non vides, et que le `dimensionId` est valide (parmi les 6 dimensions).

#### Scenario: Texte manquant
- **WHEN** une question bonus est soumise sans texte
- **THEN** le système retourne une erreur de validation

#### Scenario: Dimension invalide
- **WHEN** une question bonus est soumise avec `dimensionId: "invalid"`
- **THEN** le système retourne une erreur de validation

### Requirement: Modification d'une question bonus
Le système DOIT permettre à un admin de modifier le texte, les options ou la dimension d'une question bonus existante de son organisation.

#### Scenario: Modification réussie
- **WHEN** un admin modifie le texte d'une question bonus de son organisation
- **THEN** la question est mise à jour en base

#### Scenario: Modification d'une question d'une autre organisation
- **WHEN** un admin tente de modifier une question bonus qui n'appartient pas à son organisation
- **THEN** le système retourne une erreur "Forbidden"

### Requirement: Activation et désactivation d'une question bonus
Le système DOIT permettre à un admin d'activer ou désactiver une question bonus. Seules les questions actives sont présentées dans le quiz. Les questions désactivées ne sont pas supprimées.

#### Scenario: Désactivation d'une question
- **WHEN** un admin désactive une question bonus active
- **THEN** le champ `active` passe à `false` et la question n'apparaît plus dans le quiz

#### Scenario: Réactivation d'une question
- **WHEN** un admin réactive une question bonus désactivée
- **THEN** le champ `active` passe à `true` et la question réapparaît dans le quiz

### Requirement: Liste des questions bonus d'une organisation
Le système DOIT fournir une fonction pour lister toutes les questions bonus d'une organisation (actives et inactives), triées par date de création.

#### Scenario: Organisation avec questions bonus
- **WHEN** un admin consulte les questions bonus de son organisation
- **THEN** toutes les questions (actives et inactives) sont listées avec leur statut

#### Scenario: Organisation sans questions bonus
- **WHEN** un admin consulte les questions bonus d'une organisation qui n'en a pas
- **THEN** un tableau vide est retourné

### Requirement: Récupération des questions bonus actives pour le quiz
Le système DOIT fournir une fonction `listActiveBonusQuestions(orgId: string)` qui retourne uniquement les questions bonus actives d'une organisation, pour être utilisée par le quiz.

#### Scenario: Filtrage des questions actives
- **WHEN** une organisation a 5 questions bonus dont 3 actives et 2 inactives
- **THEN** `listActiveBonusQuestions` retourne uniquement les 3 questions actives
