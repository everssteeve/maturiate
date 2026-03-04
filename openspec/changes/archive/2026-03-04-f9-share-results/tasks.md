## 1. Server Actions et Queries pour les liens de partage

- [x] 1.1 Créer les schémas de validation Zod pour les actions de partage (`lib/validations/share-links.ts`) : createShareLink (type, targetId, orgId, expiresAt?), deleteShareLink (id)
- [x] 1.2 Créer les queries DB (`lib/queries/share-links.ts`) : getShareLinkByToken, listShareLinksByTarget, validateShareLink (vérifie existence + expiration + cible existante)
- [x] 1.3 Créer les Server Actions (`lib/actions/share-links.ts`) : createShareLink (avec vérification des permissions par rôle et type), deleteShareLink (créateur ou admin uniquement)
- [x] 1.4 Écrire les tests unitaires pour les Server Actions et les queries de share-links

## 2. Composant ShareButton et Dialog de partage

- [x] 2.1 Créer le composant `ShareDialog` (`components/share/share-dialog.tsx`) : formulaire de création de lien (sélection d'expiration optionnelle), copie du lien dans le presse-papier, liste des liens existants avec statut (actif/expiré) et suppression
- [x] 2.2 Créer le composant `ShareButton` (`components/share/share-button.tsx`) : bouton "Partager" qui ouvre le ShareDialog, avec props pour le type et le targetId

## 3. Intégration du ShareButton dans les dashboards existants

- [x] 3.1 Intégrer le ShareButton dans l'en-tête du dashboard organisation (`app/(app)/orgs/[orgId]/page.tsx`) avec contrôle de permission (admin, consultant uniquement)
- [x] 3.2 Intégrer le ShareButton dans l'en-tête du dashboard équipe (`app/(app)/orgs/[orgId]/teams/[teamId]/page.tsx`) avec contrôle de permission (admin, manager membre, consultant)

## 4. Pages publiques partagées

- [x] 4.1 Créer le layout public pour les pages partagées (`app/(public)/share/layout.tsx`) : en-tête minimaliste avec logo maturIAté et mention "Résultats partagés", pied de page avec lien vers la plateforme
- [x] 4.2 Créer la page dynamique `/share/[token]` (`app/(public)/share/[token]/page.tsx`) : lookup du token, validation (existence, expiration, cible), rendu conditionnel selon le type (team, campaign, org)
- [x] 4.3 Créer le composant de résultats partagés d'équipe (`components/share/shared-team-results.tsx`) : réutilise les composants de visualisation du dashboard équipe (radar chart, timeline, recommandations) en mode lecture seule
- [x] 4.4 Créer le composant de résultats partagés de campagne (`components/share/shared-campaign-results.tsx`) : affiche heatmap, radar chart agrégé, score moyen en lecture seule
- [x] 4.5 Créer le composant de dashboard organisation partagé (`components/share/shared-org-dashboard.tsx`) : réutilise les composants du dashboard organisation (heatmap, radar, courbe d'évolution) sans les actions d'administration
- [x] 4.6 Créer les pages d'erreur pour les liens invalides/expirés (`components/share/share-error.tsx`) : page 404 pour token inexistant/cible supprimée, page d'expiration pour lien expiré

## 5. Tests et vérification

- [x] 5.1 Écrire les tests E2E Playwright : création d'un lien de partage depuis le dashboard, accès à la page partagée, vérification du contenu affiché, test d'un lien expiré, test d'un token invalide
- [x] 5.2 Vérifier la sécurité : s'assurer qu'aucune donnée sensible (emails, paramètres) n'est exposée sur les pages partagées, vérifier que les API internes ne sont pas accessibles sans authentification
