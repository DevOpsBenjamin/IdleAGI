# ADR 0030: Découpage du Layout Racine App.vue & Conteneur d'Orchestration des Modales

## Statut
Accepté

## Contexte
`App.vue` servait de conteneur racine pour la totalité de la Single Page Application (dashboard cyber temps réel sans routeur), concentrant à la fois :
1. La disposition responsive 3 colonnes desktop / 5 onglets mobiles.
2. L'instanciation de 5 modales interactives (`OfflineModal`, `ArchitectureTalentTree`, `ParadigmModal`, `SingularityModal`, `SaveManagerModal`) avec des dizaines de `props` et de liaisons d'événements.
3. Le câblage direct avec le store Pinia et les raccourcis globaux.

Cela maintenait `App.vue` à plus de 420 lignes.

## Décisions

1. **Extraction de `GameColumnsLayout.vue` (`src/components/layout/GameColumnsLayout.vue`)** :
   - Regroupe la grille responsive 12 colonnes desktop et le basculement mobile des 5 onglets (`ingestion`, `terminal`, `datacenter`, `upgrades`).
   - Isole les 3 colonnes de jeu (Left Ingestion/Telemetry Pipeline, Center Oscilloscope/Terminal, Right Datacenter/Upgrades).
   - Expose une référence typée sur `humanReaderRef` pour les déclenchements de raccourcis clavier globaux.

2. **Extraction de `GameModalsContainer.vue` (`src/components/layout/GameModalsContainer.vue`)** :
   - Centralise l'instanciation conditionnelle et les événements de fermeture/validation des 5 modales du jeu (`OfflineModal`, `ArchitectureTalentTree`, `ParadigmModal`, `SingularityModal`, `SaveManagerModal`).

3. **Épuration de `App.vue`** :
   - `App.vue` est réduit de 424 à 134 lignes, agissant comme un chef d'orchestre épuré reliant le store Pinia, le layout de colonnes, le header, le footer et le conteneur de modales.

## Conséquences
- `App.vue` est désormais lisible, concis et sous la barre des 150 lignes.
- La totalité des tests fonctionnels desktop et mobile (`desktopGameplayFunctional.spec.ts`, `mobileGameplayFunctional.spec.ts`, 167 tests au total) restent 100% passants.
- Typage TypeScript strict et build Vite PWA validés sans aucun avertissement.
