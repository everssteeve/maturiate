## 1. Header public

- [x] 1.1 Créer le composant `PublicHeader` dans `src/components/public-header.tsx` avec logo, lien State of IA, boutons Connexion/Commencer
- [x] 1.2 Ajouter le mode responsive (menu hamburger sur mobile) au `PublicHeader`
- [x] 1.3 Adapter le `PublicHeader` pour les utilisateurs connectés (afficher lien vers tableau de bord au lieu des boutons auth)

## 2. Landing page (visiteurs non connectés)

- [x] 2.1 Créer le composant `HeroSection` dans `src/components/landing/hero-section.tsx` avec titre, sous-titre, et CTA vers `/login`
- [x] 2.2 Créer le composant `BenefitsSection` dans `src/components/landing/benefits-section.tsx` avec 4+ cartes de bénéfices (diagnostics rapides, suivi temporel, benchmark, multi-organisations)
- [x] 2.3 Créer le composant `HowItWorksSection` dans `src/components/landing/how-it-works-section.tsx` avec les 3 étapes (créer orga, inviter équipes, lancer campagne)
- [x] 2.4 Créer le composant `StateOfIATeaser` dans `src/components/landing/state-of-ia-teaser.tsx` avec lien vers le rapport annuel
- [x] 2.5 Créer le composant `CTASection` dans `src/components/landing/cta-section.tsx` avec CTA final d'inscription
- [x] 2.6 Créer le composant `Footer` dans `src/components/landing/footer.tsx`
- [x] 2.7 Assembler la landing page complète dans un composant `LandingPage` dans `src/components/landing/landing-page.tsx`

## 3. Homepage authentifiée — Query

- [x] 3.1 Créer la query `getHomepageSummary(userId)` dans `src/lib/queries/homepage.ts` qui retourne les organisations de l'utilisateur avec campagne active, taux de complétion, et équipes en attente
- [x] 3.2 Ajouter le calcul des actions en attente par organisation (diagnostics à remplir, campagnes à lancer) dans la query

## 4. Homepage authentifiée — Composants

- [x] 4.1 Créer le composant `OrgSummaryCard` dans `src/components/homepage/org-summary-card.tsx` affichant nom, rôle, campagne active, et taux de complétion
- [x] 4.2 Créer le composant `PendingActions` dans `src/components/homepage/pending-actions.tsx` affichant la liste des actions à entreprendre avec liens directs
- [x] 4.3 Créer le composant `QuickLinks` dans `src/components/homepage/quick-links.tsx` affichant les raccourcis contextuels selon le rôle
- [x] 4.4 Créer le composant `EmptyState` dans `src/components/homepage/empty-state.tsx` pour les utilisateurs sans organisation
- [x] 4.5 Assembler la homepage authentifiée dans un composant `AuthenticatedHomepage` dans `src/components/homepage/authenticated-homepage.tsx`

## 5. Page racine et intégration

- [x] 5.1 Modifier `src/app/page.tsx` pour détecter la session via `auth.api.getSession()` et rendre `LandingPage` ou `AuthenticatedHomepage` conditionnellement
- [x] 5.2 Ajouter les métadonnées SEO et Open Graph dans `src/app/page.tsx` via `generateMetadata`

## 6. Tests

- [x] 6.1 Tester la landing page avec Playwright : vérifier l'affichage des sections (hero, bénéfices, étapes, CTA) et la navigation
- [x] 6.2 Tester la homepage authentifiée avec Playwright : vérifier l'affichage des cartes organisation, actions en attente, et raccourcis
- [x] 6.3 Tester le comportement responsive (mobile et desktop) avec Playwright
