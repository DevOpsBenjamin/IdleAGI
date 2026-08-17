# ADR 0016: Découpage Modulaire de HardwareCluster et Orchestration de gameStore

## Contexte

Conformément aux standards de qualité du projet et au principe de responsabilité unique (SRP) édictés dans `AGENTS.md` (fichiers < 250-300 lignes), les modules `HardwareCluster.vue` (~800 lignes) et `gameStore.ts` (~630 lignes) avaient grossi à la suite des implémentations complètes des Sprints 1 et 2 (hôtes, barrettes RAM, refroidissement, réseau électrique, GPUs, déblocages de phases, sauvegarde et persistance).

## Décision

1. **Découpage de `HardwareCluster.vue`** en 5 sous-composants dédiés situés dans `src/components/hardware/` :
   - `HostStationTab.vue` : gestion de l'hôte actif, prochain palier et gating RAM.
   - `RamUpgradesTab.vue` : catalogue des barrettes de RAM par palier.
   - `CoolingTab.vue` : bilan thermodynamique et solutions de refroidissement actif.
   - `PowerGridTab.vue` : bilan électrique, charge réseau et améliorations d'infrastructure.
   - `GpuAcceleratorsTab.vue` : cartes graphiques et accélérateurs PCIe.
   - `HardwareCluster.vue` : réduit à ~175 lignes, assurant l'orchestration des onglets et l'émission des événements `buy-hardware` et `buy-upgrade`.

2. **Extraction Pure Domaine depuis `gameStore.ts`** :
   - `UpgradeEffectEngine.ts` (`src/domain/engine/`) : moteur pur appliquant les effets d'upgrades sur les buffers de données, de tokens, de refroidissement et de grille électrique.
   - `HardwareUnlockEngine.ts` (`src/domain/engine/`) : moteur pur gérant les transitions de phase (Phase 1, Phase 2, etc.), les jalons matériels et les alertes narratives.
   - `GameSaveManager.ts` (`src/stores/helpers/`) : helper dédié à la sérialisation, désérialisation et réinitialisation de l'état dans `localStorage`.

## Conséquences

- Zéro régression ou impact fonctionnel sur le gameplay (100% de rétrocompatibilité).
- Lisibilité, maintenabilité et clarté grandement accrues pour aborder le Sprint 3.
- Suite de tests enrichie à 51 tests unitaires et fonctionnels entièrement verts.
