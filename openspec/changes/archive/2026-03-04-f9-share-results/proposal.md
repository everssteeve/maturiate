## Why

Les utilisateurs (admins, managers, consultants) ont besoin de partager les résultats de diagnostics avec des parties prenantes qui n'ont pas de compte sur la plateforme (COMEX, équipes, clients). Actuellement, il n'existe aucun moyen de diffuser les résultats en dehors de l'application. Le lien partageable lecture seule est la solution retenue pour V1 (l'export PDF/CSV est reporté en V2).

## What Changes

- Génération de liens partageables avec token unique pour 3 types de cibles : résultats d'équipe, résultats de campagne, dashboard organisation
- Expiration optionnelle configurable lors de la création du lien
- Pages publiques accessibles sans authentification affichant les résultats en lecture seule
- Interface de gestion des liens (création, liste, suppression) dans les dashboards existants
- La table `share_links` existe déjà dans le schéma DB — elle sera utilisée telle quelle

## Capabilities

### New Capabilities
- `share-link-management`: CRUD des liens de partage — création, listage, suppression, validation des permissions par rôle (admin: tout, manager: ses équipes, consultant: ses organisations)
- `shared-results-pages`: Pages publiques (non authentifiées) qui affichent les résultats via token — team results, campaign results, organization dashboard en lecture seule

### Modified Capabilities
- `team-dashboard-page`: Ajout d'un bouton de partage dans le dashboard équipe
- `org-dashboard-page`: Ajout d'un bouton de partage dans le dashboard organisation

## Impact

- **Routes** : Nouvelles routes publiques `/share/[token]` pour les pages partagées
- **API** : Server Actions pour créer/lister/supprimer les liens de partage
- **DB** : Utilisation de la table `share_links` existante (pas de migration nécessaire)
- **Composants** : Nouveau composant `ShareButton` + dialog de configuration, intégré dans les dashboards existants
- **Sécurité** : Les pages publiques ne doivent exposer que les données de résultats, jamais les données sensibles (membres, emails, paramètres org)
