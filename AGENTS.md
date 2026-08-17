# IdleAGI Agents Guide

## Git & PR Workflow (Obligatoire)

- **Une branche par ticket / tâche** : Pour chaque ticket traité ou tâche, créer systématiquement une branche dédiée (ex: `feat/issue-<n>-<slug>`, `docs/issue-<n>-<slug>`, ou `chore/<slug>`). Ne jamais commiter directement sur `main`.
- **Commit & Push sur la branche** : Commiter tous les fichiers créés/modifiés (ADR dans `docs/adr/`, `CONTEXT.md`, code source, documentation) avec un message conventionnel clair et pusher la branche (`git push origin <branch>`).
- **Création de PR et Squash & Merge** :
  1. Ouvrir une Pull Request via la CLI `gh` : `gh pr create --title "<type>: resolve issue #<n> - <title>" --body "Closes #<n>\n\n<résumé>"`.
  2. Procéder au merge automatique en mode squash : `gh pr merge --squash --delete-branch` (les flags `--squash` et `--delete-branch` sont requis par la CLI `gh` en exécution non-interactive).
  3. Revenir sur `main` et mettre à jour l'arbre local : `git checkout main && git pull origin main`.
- **Zéro travail résiduel non-fusionné** : Vérifier systématiquement `git status` pour s'assurer que le workspace est propre, aligné sur `main` à jour et sans branche locale orpheline.

## Manipulation des fichiers (Obligatoire)

- **Outils natifs exclusifs** : Utiliser impérativement les outils natifs de l'agent (`write_to_file` pour créer/écraser un fichier du workspace et `replace_file_content` pour modifier des blocs de lignes ciblés).
- **Interdiction de `cat` / `echo` via shell** : Ne jamais utiliser de commandes terminales (`cat << 'EOF' > ...`, `echo > ...`, `sed`, `awk`) pour écrire ou éditer des fichiers dans le workspace afin de ne pas déclencher d'invites d'approbation interactives inutiles.

## Agent skills & Architecture

### TypeScript & Code Splitting Standards (Obligatoire)

- **TypeScript Stricte & Puissance du Typage** :
  - Exploiter pleinement la puissance du système de types TypeScript : interfaces explicites et découplées, types discriminés, génériques typés, unions strictes, `readonly` et garde de types.
  - Bannir l'utilisation de `any` (préférer `unknown`, génériques ou interfaces dédiées avec validation/narrowing).
  - Découpage granulaire des types dans `src/types/` par sous-domaine (`resources.ts`, `hardware.ts`, `upgrades.ts`, `systems.ts`, `logs.ts`, `game.ts`, `index.ts`).
- **Code Splitting & Granularité des Fichiers** :
  - Respect strict du principe de responsabilité unique (SRP). Bannir les fichiers monstres / monolithiques (> 250-300 lignes).
  - Décomposer le code en modules spécialisés et bien délimités.
  - Séparation stricte des couches :
    1. **Couche Domaine / Logique Métier Pure (`src/domain/`)** : calculateurs, formules mathématiques (Decimal / break_infinity.js), moteurs de simulation, classes pures et fonctions déterministes sans dépendance directe à Vue/Pinia (ex: `ComputeEngine`, `EconomyEngine`, `TickEngine`, `OfflineEngine`, `MilestoneTracker`).
    2. **Constantes Métier (`src/domain/constants/`)** : catalogues d'équipements, snippets, upgrades et paliers isolés de la logique d'état.
    3. **Couche État Réactif Modulaire (`src/stores/`)** : stores Pinia découpés par sous-domaine (`resourcesStore`, `hardwareStore`, `upgradesStore`, `allocationStore`, `terminalStore`, `featuresStore`) orchestrés par un root store / façade (`gameStore`).
    4. **Couche Composables (`src/composables/`)** : gestion du cycle de vie navigateur, boucles de tick, raccourcis et interactions réactives.
    5. **Couche Présentation (`src/components/`, `src/App.vue`)** : composants Vue épurés, fortement typés avec `defineProps<{ ... }>()` et `defineEmits<{ ... }>()`.
- **Classes & Modèles Orientés Domaine** :
  - Encapsuler la logique métier et les calculs complexes dans des classes de domaine ou des services modulaires purs testables unitairement sans mock de framework.
- **Tests Unitaires & Qualité** :
  - Chaque module de domaine, moteur de calcul et sous-store Pinia doit posséder ses propres tests unitaires ciblés (`src/__tests__/`).
  - Validation obligatoire via `npm run type-check` et `npm test`.

### Issue tracker

GitHub Issues & Pull Requests via `gh` CLI. Voir `docs/agents/issue-tracker.md`.

### Domain docs

Single-context (`CONTEXT.md` + `docs/adr/`). Voir `docs/agents/domain.md`.

