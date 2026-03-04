## ADDED Requirements

### Requirement: La page d'accueil affiche une landing page pour les visiteurs non connectés

Le système DOIT afficher une landing page publique lorsqu'un visiteur accède à `/` sans session authentifiée. La page DOIT contenir une section hero, une section bénéfices, une section "Comment ça marche", et un CTA d'inscription.

#### Scenario: Visiteur non connecté accède à la page d'accueil
- **WHEN** un utilisateur non authentifié accède à `/`
- **THEN** le système affiche la landing page publique avec le header public, la section hero, les sections de contenu, et le footer

#### Scenario: Visiteur connecté ne voit pas la landing page
- **WHEN** un utilisateur authentifié accède à `/`
- **THEN** le système affiche la homepage personnalisée au lieu de la landing page

### Requirement: La section hero communique la proposition de valeur en moins de 30 secondes

La section hero DOIT contenir un titre accrocheur, un sous-titre expliquant le bénéfice principal, et un CTA principal vers l'inscription. Le message DOIT être compréhensible en moins de 30 secondes de lecture.

#### Scenario: Affichage de la section hero
- **WHEN** la landing page est affichée
- **THEN** le système affiche un titre principal (h1), un sous-titre descriptif, et un bouton CTA "Commencer" qui redirige vers `/login`

#### Scenario: Le CTA hero redirige vers l'inscription
- **WHEN** le visiteur clique sur le bouton CTA principal
- **THEN** le système redirige vers `/login` pour démarrer le flow d'inscription/connexion

### Requirement: La section bénéfices présente les avantages clés de la plateforme

La landing page DOIT présenter les bénéfices principaux de maturIAté de manière visuelle et concise : diagnostics rapides, suivi dans le temps, benchmark anonymisé, vue multi-organisations.

#### Scenario: Affichage des bénéfices
- **WHEN** la landing page est affichée
- **THEN** le système affiche au minimum 4 cartes de bénéfices avec icône, titre et description courte

### Requirement: La section "Comment ça marche" explique le processus en 3 étapes

La landing page DOIT présenter le fonctionnement de la plateforme en 3 étapes claires : créer son organisation, inviter ses équipes, lancer une campagne de diagnostic.

#### Scenario: Affichage du processus en 3 étapes
- **WHEN** la landing page est affichée
- **THEN** le système affiche 3 étapes numérotées avec titre et description expliquant le processus d'onboarding

### Requirement: La landing page est responsive et optimisée SEO

La landing page DOIT s'adapter aux écrans mobile, tablette et desktop. Elle DOIT inclure des métadonnées Open Graph pour le partage social.

#### Scenario: Affichage mobile de la landing page
- **WHEN** la landing page est affichée sur un écran de largeur inférieure à 768px
- **THEN** les sections s'empilent verticalement et le contenu reste lisible sans scroll horizontal

#### Scenario: Métadonnées SEO de la page d'accueil
- **WHEN** un moteur de recherche ou un réseau social accède à `/`
- **THEN** la page expose un titre, une description et une image Open Graph pertinents

### Requirement: La landing page inclut un lien vers le State of IA

La landing page DOIT proposer un accès au rapport annuel State of IA comme preuve de valeur et contenu public attractif.

#### Scenario: Lien vers le State of IA
- **WHEN** la landing page est affichée et qu'un rapport State of IA existe
- **THEN** le système affiche une section ou un lien invitant à consulter le rapport annuel State of IA
