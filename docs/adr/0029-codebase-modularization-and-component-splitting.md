# ADR 0029: Découpage Modulaire des Composants & Granularité SRP

## Statut
Accepté

## Contexte
À la suite du déploiement des Sprints 1 à 6 couvrant les 3 tiers de prestige (Checkpoints, Paradigmes et Singularité), plusieurs composants Vue principaux (`SingularityModal`, `SaveManagerModal`, `ParadigmModal`, `DatacenterTelemetry`, `ModelTelemetry`, `ArchitectureTalentTree`, `App.vue`) ont accumulé de multiples responsabilités visuelles et logiques, dépassant le seuil recommandé de 250-300 lignes défini dans `AGENTS.md`.

Une passe globale de refactoring architectural s'est imposée pour découper ces fichiers volumineux en sous-composants modulaires spécialisés (SRP), extraire la logique d'orchestration dans des composables dédiés et garantir une maintenabilité optimale sans aucune régression fonctionnelle.

## Décisions

1. **Découpage Modulaire de la Singularité (`src/components/singularity/`)** :
   - Extraction de `AscensionCinematic.vue` (flux STDOUT terminal live d'éveil ASI).
   - Extraction de `AscensionOutcomeCard.vue` (carte de la fin qualifiée, modificateurs cosmiques $\Omega$ et déclenchement).
   - Extraction de `AscensionGallery.vue` (galerie des 4 fins narratives).
   - Extraction de `AscensionConfirmDialog.vue` (modal overlay de confirmation New Game+).
   - Réduction de `SingularityModal.vue` de 471 à 200 lignes.

2. **Découpage Modulaire des Sauvegardes (`src/components/save/`)** :
   - Extraction de `SaveExportPanel.vue` (génération Base64, checksum FNV-1a, copie presse-papier, téléchargement `.save`).
   - Extraction de `SaveImportPanel.vue` (validation temps réel de la clé, détection d'erreurs, prévisualisation des métadonnées).
   - Extraction de `SaveImportConfirmDialog.vue` (confirmation d'écrasement de session).
   - Réduction de `SaveManagerModal.vue` de 382 à 138 lignes.

3. **Découpage Modulaire des Paradigmes (`src/components/paradigm/`)** :
   - Extraction de `ParadigmCard.vue` (carte individuelle d'architecture avec multiplicateurs TFLOPS, Watts, Synthèse et action contextuelle).
   - Extraction de `ParadigmResetConfirmDialog.vue` (confirmation du Hard Reset Tier 2 pour $\Phi$).
   - Réduction de `ParadigmModal.vue` de 344 à 189 lignes.

4. **Découpage Modulaire de l'Arbre de Talents (`src/components/talent/`)** :
   - Extraction de `TalentNodeCard.vue` (carte interactive de talent avec statuts réactifs : actif, disponible, AP insuffisants, verrouillé).
   - Extraction de `TalentInspector.vue` (panneau latéral d'inspection, prérequis structurels et bouton d'achat tactile).
   - Réduction de `ArchitectureTalentTree.vue` de 572 à 305 lignes.

5. **Découpage Modulaire de la Télémétrie Datacenter & Modèle (`src/components/telemetry/`)** :
   - Extraction de `PowerGridTelemetry.vue` (jauge segmentée de charge électrique, disjoncteur et puissance Watts).
   - Extraction de `DatacenterRackVisualizer.vue` (visualiseur de baie serveur, slots PCIe x16 et GPU installés).
   - Extraction de `Tier1PrestigeBanner.vue`, `Tier2ParadigmBanner.vue`, `Tier3SingularityBanner.vue`.
   - Réduction de `DatacenterTelemetry.vue` (395 $\to$ 254 lignes) et `ModelTelemetry.vue` (336 $\to$ 211 lignes).

6. **Composables d'Orchestration Globale (`src/composables/`)** :
   - Création de `useGlobalShortcuts.ts` (gestion ergonomique des raccourcis clavier globaux `Space` et `V`).
   - Création de `useAppLayout.ts` (computeds et indicateurs d'état pour la disposition desktop/mobile d'`App.vue`).

## Conséquences
- Respect strict du principe de responsabilité unique (SRP) et des règles d'`AGENTS.md`.
- Clarté et modularité accrue des composants Vue.
- Préservation intégrale des comportements réactifs et validation à 100% de la suite de tests (19 fichiers de test, 167 tests passants, compilation TypeScript `vue-tsc` sans avertissement).
