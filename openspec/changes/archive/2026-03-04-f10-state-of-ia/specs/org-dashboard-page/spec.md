## MODIFIED Requirements

### Requirement: Organisation du layout du dashboard
Le système DOIT organiser le dashboard en sections clairement délimitées :
1. En-tête avec le nom de l'organisation, les boutons d'action (Campagnes, Paramètres pour admin), et un bouton de partage (pour les rôles autorisés)
2. Sélecteur de campagne
3. Cartes de scores agrégés (ligne horizontale)
4. Heatmap Équipes × Dimensions (largeur complète)
5. Radar chart organisation et courbe d'évolution (côte à côte sur desktop, empilés sur mobile)
6. **Section "Mon positionnement"** : si l'organisation a `opt_in_state_of_ia: true` et qu'un rapport State of IA publié existe, afficher une carte résumée avec le percentile global et un lien vers `/orgs/[orgId]/benchmark`

#### Scenario: Layout desktop
- **WHEN** le dashboard est affiché sur un écran >= 1024px
- **THEN** le radar chart et la courbe d'évolution sont affichés côte à côte dans une grille 2 colonnes

#### Scenario: Layout mobile/tablette
- **WHEN** le dashboard est affiché sur un écran < 1024px
- **THEN** le radar chart et la courbe d'évolution sont empilés verticalement

#### Scenario: Section benchmark visible pour organisation opt-in
- **WHEN** le dashboard est affiché pour une organisation avec `opt_in_state_of_ia: true` et un rapport State of IA est publié
- **THEN** le système MUST afficher une carte "Mon positionnement" en bas du dashboard avec le percentile global (ex: "72e percentile"), une phrase résumée, et un bouton "Voir le détail" menant à `/orgs/[orgId]/benchmark`

#### Scenario: Section benchmark masquée pour organisation non opt-in
- **WHEN** le dashboard est affiché pour une organisation avec `opt_in_state_of_ia: false`
- **THEN** la section "Mon positionnement" MUST ne pas être affichée

#### Scenario: Section benchmark masquée sans rapport publié
- **WHEN** le dashboard est affiché pour une organisation opt-in mais aucun rapport State of IA n'est publié
- **THEN** la section "Mon positionnement" MUST ne pas être affichée
