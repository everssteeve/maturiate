## Why

La page d'accueil actuelle est un simple placeholder (titre + tagline). Un visiteur qui découvre maturIAté ne comprend pas la valeur de la plateforme et n'a aucun moyen de s'inscrire directement. De plus, un utilisateur déjà connecté atterrit sur la même page vide au lieu d'avoir un aperçu actionnable de ses organisations. Cette double lacune freine l'acquisition (pas de conversion visiteur → inscription) et l'engagement (pas de point d'entrée contextuel pour les utilisateurs existants).

## What Changes

- **Remplacement de la page d'accueil actuelle** (`src/app/page.tsx`) par une page intelligente qui adapte son contenu selon l'état d'authentification
- **Landing page publique** : hero section avec proposition de valeur claire, sections bénéfices (6 dimensions, diagnostics rapides, benchmark anonymisé), témoignages de personas, section "Comment ça marche" en 3 étapes, et CTA principal vers l'inscription
- **Homepage authentifiée** : vue personnalisée affichant un résumé de chaque organisation de l'utilisateur (campagnes en cours, taux de complétion, équipes en attente, derniers scores), des actions à entreprendre (diagnostics à remplir, campagnes à lancer, invitations en attente), et des raccourcis vers les dashboards
- **Header public** : navigation minimale (logo, lien State of IA, boutons Connexion/Inscription) distincte du header dashboard existant

## Capabilities

### New Capabilities
- `landing-page`: Page d'accueil publique avec hero, proposition de valeur, bénéfices, fonctionnement en 3 étapes, et CTA d'inscription — conçue pour convertir un visiteur en moins de 30 secondes
- `authenticated-homepage`: Page d'accueil personnalisée pour les utilisateurs connectés, affichant le résumé de leurs organisations, les actions en attente, et les raccourcis vers les fonctionnalités clés
- `public-header`: Header de navigation pour les pages publiques (landing, State of IA) avec logo, liens et boutons auth

### Modified Capabilities
_(aucune modification de spécifications existantes)_

## Impact

- **Code** : Remplacement de `src/app/page.tsx`, nouveaux composants dans `src/components/landing/` et `src/components/homepage/`, nouveau composant `public-header`
- **Queries** : Nouvelles queries pour récupérer le résumé des organisations d'un utilisateur connecté (campagnes actives, taux de complétion, actions en attente)
- **Auth** : Utilisation de la session Better Auth existante pour détecter l'état de connexion côté serveur et adapter le rendu
- **Dépendances** : Aucune nouvelle dépendance — utilisation de shadcn/ui, Tailwind CSS v4, et Recharts existants
- **Routes** : La route racine `/` reste inchangée, le contenu s'adapte dynamiquement
