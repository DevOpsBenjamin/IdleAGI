# ADR 0014: Moteur de Simulation Fast-Forward Déterministe & Tests Fonctionnels E2E

## Statut
Accepté

## Contexte
La validation de l'équilibrage économique, des déblocages progressifs (Phases 0 à 3), des contraintes matérielles (RAM gating, slots PCIe, paliers d'hôtes) et des comportements thermodynamiques et électriques nécessite des tests d'intégration complets simulant des heures entières de session de jeu.

Exécuter ces scénarios en temps réel ou via des timers asynchrones est inenvisageable en intégration continue ou en tests unitaires (vitest).

## Décision

1. **Création du module `ScenarioRunner` (`src/domain/engine/ScenarioRunner.ts`)** :
   - Moteur de simulation rapide sans dépendance d'affichage permettant d'avancer le temps virtuel du jeu par pas discrets (`advanceTime`, `advanceUntil`).
   - Prise en charge d'un multiplicateur de vitesse (`speedMultiplier`) et d'un pas d'échantillonnage temporel configurable (`tickDeltaSec`).
   - Exécution procédurale et déclarative (`executeScenario(actions, options)`) avec gestion d'assertions, de conditions d'arrêt et de métriques d'exécution (durée réelle CPU vs temps virtuel simulé).

2. **Typage Strict Dédié (`src/types/simulation.ts`)** :
   - Modélisation discriminée des actions de scénario (`ScenarioAction`) : `manual_scrape`, `sell_raw_text`, `sell_all_raw_text`, `buy_hardware`, `buy_upgrade`, `set_allocations`, `set_preset`, `wait_seconds`, `wait_until`, `assert`, `custom`.
   - Fourniture d'un accesseur d'état en lecture seule (`ScenarioStateAccessor`) et de métriques de simulation (`SimulationMetrics`).

3. **Suite de Tests Fonctionnels E2E (`src/__tests__/scenarioFunctional.spec.ts`)** :
   - Parcours complet et déterministe validant l'ensemble de l'arbre de progression du jeu :
     - **Phase 0** : Scribe humain, transcription manuelle, déblocage et négociation avec le courtier de données.
     - **Phase 1** : Acquisition du premier PC (Pentium II), scripts Python d'auto-scraping et auto-broker passif.
     - **Phase 2** : Évolution vers Core 2 Quad, premier GPU (GTX 750 Ti), activation du Tokenizer BPE et serveur d'inférence.
     - **Phase 3** : Tri-Allocation de compute, entraînement de neurones, R&D, et passage à l'échelle Datacenter (Gaming PC, Workstation Pro, Châssis Rack 4U, RTX 3060, RTX 3090, NVIDIA A100, NVIDIA H100, DDR5, Watercooling, Climatisation In-Row, Immersion Cryo, Postes Triphasés & Transformateurs).

## Conséquences

- **Positives** :
  - Simulation de plusieurs heures de temps de jeu virtuel exécutée en moins de 2,5 secondes réelles de temps CPU.
  - Détection immédiate des régressions économiques, des blocages de gating ou des incohérences de calculs.
  - Validation exhaustive de toute la chaîne d'achat et de déblocage des fonctionnalités.
