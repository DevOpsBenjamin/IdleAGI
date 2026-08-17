# ADR 0005: Architecture Domaine Découplée, Typage TypeScript Strict et Modularisation des Stores Pinia

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

Avec l'expansion continue des fonctionnalités du jeu (*Project Singularity Loop* / IdleAGI), le code source initial centralisait l'intégralité de l'état réactif, des formules mathématiques, des catalogues de données et de la logique de simulation au sein d'un unique fichier monolithique `gameStore.ts` de plus de 1 000 lignes et d'un fichier de types unique `game.ts`.

Cette centralisation présentait plusieurs limites :
1. Responsabilités mélangées (calculs mathématiques, état réactif, sérialisation, détection de paliers et logging dans le même fichier).
2. Difficulté de test unitaire isolé sur les formules mathématiques sans instancier l'état réactif complet de Pinia.
3. Risque de régression et lisibilité amoindrie lors des ajouts de nouvelles mécaniques (ex: thermodynamique active, grid capacity, prestige).

---

## Décision

1. **Séparation Stricte des Couches Architecturales** :
   - **Couche Domaine Métier Pur (`src/domain/`)** :
     - `src/domain/constants/` : Définition des catalogues statiques (`hardware.ts`, `upgrades.ts`, `snippets.ts`, `milestones.ts`).
     - `src/domain/engine/` : Classes et services purs sans dépendance à Pinia ou Vue :
       - `ComputeEngine` : Calculs de TFLOPS, VRAM, dissipation thermique, charge électrique et calcul de compute effectif.
       - `EconomyEngine` : Débits de scraping, tarification des données, multiplicateurs de qualité du modèle, tokenisation BPE.
       - `MilestoneTracker` : Détection déterministe des seuils d'early-game, hardware, training et research.
       - `TickEngine` : Simulation unitaire d'un pas de temps $\Delta t$.
       - `OfflineEngine` : Simulation hors-ligne et calcul de rapport (plafonné à 24h).
   - **Couche Typage Modulaire (`src/types/`)** :
     - Découpage par sous-domaine : `logs.ts`, `resources.ts`, `hardware.ts`, `upgrades.ts`, `systems.ts`, `game.ts` et `index.ts`.
     - Élimination complète des types `any`, utilisation de types discriminés et de structures d'interfaces précises.
   - **Couche État Réactif Modulaire (`src/stores/`)** :
     - Découpage en sous-stores spécialisés :
       - `useTerminalStore` : Gestion du buffer des logs du cyber-terminal.
       - `useResourcesStore` : Gestion des ressources primaires, des saisies manuelles et ventes au courtier.
       - `useHardwareStore` : Gestion de l'inventaire matériel et des métriques physiques.
       - `useUpgradesStore` : Gestion des modules logiciels et compétences humaines.
       - `useAllocationStore` : Gestion des pourcentages d'allocation et presets.
       - `useFeaturesStore` : Gestion de la progression de phase, des drapeaux de déblocage et des jalons.
     - `useGameStore` (Store Orchestrateur & Façade) : Composition des sous-stores, coordination du tick moteur et persistance `localStorage`, garantissant une compatibilité totale et transparente avec les composants UI existants.

2. **Tests Unitaires Dédiés** :
   - Ajout d'une suite de tests complète pour la couche domaine (`src/__tests__/domain.spec.ts`).
   - Ajout d'une suite de tests pour chaque sous-store Pinia (`src/__tests__/modularStores.spec.ts`).
   - Maintien de la suite de tests d'intégration globale (`src/__tests__/gameStore.spec.ts`).

---

## Conséquences & Avantages

### Positives
- **Maintenabilité & Lisibilité** : Aucun fichier ne dépasse désormais les 350 lignes de code ; chaque classe ou store possède une responsabilité unique et limpide.
- **Testabilité Optimale** : Les moteurs de calcul de domaine sont 100% testables unitairement de façon pure et ultra-rapide.
- **Évolutivité** : L'ajout de nouveaux paliers, nœuds matériels ou systèmes physiques (ex: refroidissement liquide, surtensions) se fait par extension modulaire ciblée.
- **Rétrocompatibilité Totale** : Tous les composants Vue consomment l'API sans friction.

### Négatives / Points d'attention
- Nécessite de maintenir la cohérence des interfaces entre les sous-stores et le store orchestrateur lors de l'ajout de nouvelles propriétés persistées.
