## ADDED Requirements

### Requirement: Page de quiz accessible depuis la gestion d'équipe
Le système DOIT fournir une page de quiz à l'URL `/orgs/[orgId]/diagnostic/[teamId]` accessible aux utilisateurs ayant le rôle `admin` ou `manager` dans l'organisation.

#### Scenario: Accès autorisé
- **WHEN** un admin navigue vers `/orgs/[orgId]/diagnostic/[teamId]`
- **THEN** la page de quiz s'affiche avec le nom de l'équipe et la première question

#### Scenario: Accès refusé
- **WHEN** un utilisateur avec le rôle `member` navigue vers cette URL
- **THEN** il est redirigé ou reçoit une erreur "Forbidden"

#### Scenario: Équipe inexistante
- **WHEN** l'URL contient un `teamId` invalide
- **THEN** une page 404 est affichée

### Requirement: Affichage séquentiel des questions
Le système DOIT afficher une question à la fois avec 4 options de réponse. L'utilisateur sélectionne une option en cliquant dessus. L'option sélectionnée est visuellement mise en évidence.

#### Scenario: Affichage d'une question
- **WHEN** la page de quiz est chargée
- **THEN** la première question est affichée avec son texte et ses 4 options

#### Scenario: Sélection d'une réponse
- **WHEN** l'utilisateur clique sur une option
- **THEN** l'option est visuellement sélectionnée (bordure colorée, fond modifié)

### Requirement: Navigation entre questions
Le système DOIT permettre la navigation avant/arrière entre les questions. Le bouton "Suivant" passe à la question suivante. Le bouton "Précédent" revient à la question précédente. Les réponses sont conservées lors de la navigation.

#### Scenario: Navigation vers la question suivante
- **WHEN** l'utilisateur a sélectionné une réponse et clique sur "Suivant"
- **THEN** la question suivante s'affiche

#### Scenario: Navigation vers la question précédente
- **WHEN** l'utilisateur clique sur "Précédent"
- **THEN** la question précédente s'affiche avec la réponse précédemment sélectionnée

#### Scenario: Première question sans bouton précédent
- **WHEN** l'utilisateur est sur la première question
- **THEN** le bouton "Précédent" n'est pas affiché

### Requirement: Barre de progression
Le système DOIT afficher une barre de progression indiquant l'avancement dans le quiz (nombre de questions répondues / total). La barre progresse visuellement à chaque question répondue.

#### Scenario: Progression à mi-parcours
- **WHEN** l'utilisateur a répondu à 7 questions sur 14
- **THEN** la barre de progression indique 50% et affiche "7 / 14"

### Requirement: Section questions bonus après les questions core
Le système DOIT afficher les questions bonus de l'organisation (si elles existent) après les 14 questions core. Les questions bonus sont marquées comme optionnelles dans l'interface.

#### Scenario: Organisation avec questions bonus
- **WHEN** l'organisation a 3 questions bonus actives
- **THEN** après les 14 questions core, 3 questions bonus sont présentées avec une mention "Optionnel"

#### Scenario: Organisation sans questions bonus
- **WHEN** l'organisation n'a pas de questions bonus
- **THEN** le quiz passe directement de la dernière question core au récapitulatif

### Requirement: Écran de récapitulatif avant soumission
Le système DOIT afficher un écran de récapitulatif montrant toutes les réponses sélectionnées avant la soumission. L'utilisateur peut modifier une réponse en cliquant dessus (retour à la question concernée) ou confirmer la soumission.

#### Scenario: Récapitulatif complet
- **WHEN** toutes les questions core sont répondues et l'utilisateur arrive au récapitulatif
- **THEN** un résumé des réponses par dimension est affiché avec un bouton "Soumettre le diagnostic"

#### Scenario: Questions core incomplètes
- **WHEN** l'utilisateur tente d'accéder au récapitulatif sans avoir répondu à toutes les questions core
- **THEN** le bouton de soumission est désactivé et les questions manquantes sont signalées

### Requirement: Soumission du diagnostic
Le système DOIT soumettre le diagnostic via la Server Action `submitDiagnostic` et rediriger vers la page de résultats en cas de succès. Un état de chargement est affiché pendant la soumission.

#### Scenario: Soumission réussie
- **WHEN** l'utilisateur clique sur "Soumettre le diagnostic"
- **THEN** un indicateur de chargement s'affiche, puis l'utilisateur est redirigé vers `/orgs/[orgId]/diagnostic/[teamId]/results/[diagnosticId]`

#### Scenario: Erreur de soumission
- **WHEN** la soumission échoue (erreur serveur)
- **THEN** un message d'erreur est affiché et l'utilisateur peut réessayer

### Requirement: Enregistrement du timestamp de début
Le système DOIT enregistrer le moment où l'utilisateur commence le quiz (`startedAt`) pour permettre de mesurer la durée de complétion.

#### Scenario: Début du quiz
- **WHEN** l'utilisateur affiche la première question
- **THEN** le timestamp de début est enregistré et sera envoyé lors de la soumission
