## ADDED Requirements

### Requirement: Récupérer la liste des organisations du consultant
Le système DOIT fournir une fonction `getConsultantOverview(userId: string)` dans `lib/queries/consultant.ts` qui retourne les données consolidées de toutes les organisations auxquelles l'utilisateur a un membership avec le rôle `consultant`.

#### Scenario: Consultant avec plusieurs organisations
- **WHEN** un utilisateur a le rôle `consultant` dans 3 organisations
- **THEN** la fonction retourne les données des 3 organisations avec pour chacune : id, nom, logo, secteur, taille

#### Scenario: Utilisateur sans rôle consultant
- **WHEN** un utilisateur n'a aucun membership avec le rôle `consultant`
- **THEN** la fonction retourne une liste vide d'organisations

#### Scenario: Consultant retiré d'une organisation
- **WHEN** le membership consultant d'un utilisateur est supprimé d'une organisation
- **THEN** cette organisation n'apparaît plus dans les résultats

### Requirement: Agréger les scores par organisation
Pour chaque organisation du consultant, le système DOIT calculer et retourner le score moyen, le niveau de maturité global et le nombre d'équipes évaluées. Les scores sont basés sur le dernier diagnostic de chaque équipe (tous les diagnostics confondus, campagne ou ad hoc).

#### Scenario: Organisation avec des diagnostics complétés
- **WHEN** une organisation a 5 équipes dont 3 ont un diagnostic
- **THEN** le score moyen est la moyenne des `globalScore` des 3 derniers diagnostics (un par équipe), le nombre d'équipes évaluées est 3, et le nombre total d'équipes est 5

#### Scenario: Organisation sans aucun diagnostic
- **WHEN** une organisation n'a aucun diagnostic complété
- **THEN** le score moyen est `null`, le niveau est `null`, et le nombre d'équipes évaluées est 0

#### Scenario: Équipe avec plusieurs diagnostics
- **WHEN** une équipe a 3 diagnostics (campagnes différentes)
- **THEN** seul le diagnostic le plus récent (`completedAt` le plus récent) est utilisé pour le calcul du score moyen organisation

### Requirement: Récupérer la dernière campagne par organisation
Pour chaque organisation, le système DOIT retourner les informations de la campagne la plus récente : nom, statut, date de début, et le taux de complétion (diagnostics complétés / équipes totales).

#### Scenario: Organisation avec des campagnes
- **WHEN** une organisation a 3 campagnes (Q1, Q2, Q3)
- **THEN** seule la campagne la plus récente (par `startDate`) est retournée avec son taux de complétion

#### Scenario: Organisation sans campagne
- **WHEN** une organisation n'a aucune campagne
- **THEN** la dernière campagne est `null`

### Requirement: Calculer les statistiques globales cross-organisations
Le système DOIT calculer des statistiques agrégées sur l'ensemble des organisations du consultant : nombre total d'organisations, score moyen global (moyenne des scores moyens des organisations ayant des diagnostics), nombre total d'équipes évaluées.

#### Scenario: Statistiques avec données complètes
- **WHEN** un consultant a 3 organisations avec des scores moyens de 2.5, 3.0 et 2.0
- **THEN** le score moyen global est 2.5, le nombre d'organisations est 3

#### Scenario: Statistiques avec organisations sans données
- **WHEN** un consultant a 3 organisations dont 1 sans diagnostic
- **THEN** le nombre d'organisations est 3 mais le score moyen global est calculé uniquement sur les 2 organisations avec données

### Requirement: Calculer la tendance par organisation
Pour chaque organisation ayant au moins 2 campagnes avec des diagnostics, le système DOIT calculer la tendance (delta du score moyen entre les deux dernières campagnes).

#### Scenario: Organisation avec tendance positive
- **WHEN** une organisation a un score moyen de 2.0 sur l'avant-dernière campagne et 2.5 sur la dernière
- **THEN** la tendance est `+0.5`

#### Scenario: Organisation avec une seule campagne
- **WHEN** une organisation n'a qu'une seule campagne avec des diagnostics
- **THEN** la tendance est `null` (pas assez de données)

### Requirement: Isolation des données multi-tenant
Toutes les requêtes DOIVENT être scopées par les memberships consultant de l'utilisateur. Le consultant ne DOIT JAMAIS accéder aux données d'une organisation dont il n'est pas membre.

#### Scenario: Consultant non membre d'une organisation
- **WHEN** un consultant tente d'accéder aux données d'une organisation dont il n'est pas membre
- **THEN** l'organisation n'apparaît pas dans les résultats (filtrée par la jointure memberships)
