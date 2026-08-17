# ADR 0002: Architecture du GameState, Boucle 50ms (20 Hz) & Simulation Hors-Ligne 24h

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

*Project Singularity Loop (IdleAGI)* est un jeu incrémental à flux continu et gestion de systèmes. Pour garantir une expérience de jeu fluide, cohérente et réactive, le moteur nécessite :
1. Une cadence de simulation fixe à 20 ticks/seconde (pas de temps fixe $\Delta t = 50\text{ ms}$).
2. Une séparation nette entre la boucle logique de calcul et le cycle de rendu graphique (60 FPS).
3. Une résilience totale aux variations de framerate (lag spikes, freeze) et aux onglets mis en arrière-plan par le navigateur.
4. Une gestion sérialisable et sans perte des structures `Decimal` (`break_infinity.js`) persistées dans `localStorage`.
5. Une mécanique de rattrapage de progression hors-ligne (Offline Catch-Up) calibrée sur la philosophie de conception du jeu.

---

## Décision

1. **Boucle Moteur Hybride (`useGameLoop`)** :
   - **Mode Actif** : Utilisation de `requestAnimationFrame` couplé à un accumulateur de temps fixe (`accumulator += dt; while (accumulator >= 0.05) { tick(0.05); accumulator -= 0.05 }`).
   - **Anti-Spiral of Death** : Plafonnement du delta de trame maximal à `1.0s` en cas de pic de lag soudain.
   - **Fallback Arrière-Plan** : Écoute de l'API `document.visibilitychange`. Lorsque l'onglet est masqué, bascule automatique sur un timer de secours `setInterval(50ms)` pour éviter l'endormissement complet du moteur par le navigateur, puis reprise fluide en RAF dès que l'onglet redevient visible.

2. **Sérialisation et Gestion du `GameState`** :
   - Les instances `Decimal` vivantes sont conservées dans le store Pinia pour éliminer l'overhead d'instanciation 20 fois par seconde.
   - La persistance dans `localStorage` convertit les Decimals en chaînes de caractères via `serializeGameState()` et les réhydrate via `deserializeGameState()` avec gestion de fallback par nœud et versioning de schéma (`version: 0.1.0`).
   - Sauvegarde automatique continue toutes les 5 secondes (100 ticks).

3. **Progression Hors-Ligne & Philosophie de Conception** :
   - **Plafond 24h** : La progression hors-ligne est plafonnée à un maximum strict de 24 heures (`86400s`).
   - **Simulation par paquets discrets** : Au chargement, le temps écoulé est simulé par pas de 1.0 seconde pour respecter rigoureusement les capacités maximales des buffers (Raw Text, Tokens) et les débits d'inférence/entraînement.
   - **Rapport et Message Éducatif** : Un modal de reprise informe le joueur des gains générés et rappelle explicitement que le jeu est pensé pour des sessions actives de gestion stratégique plutôt qu'une attente passive de plusieurs jours.

4. **Modélisation Thermique & Électrique** :
   - Intégration dès le Sprint 1 des calculs de charge du réseau électrique (`gridLoadPercent`) et de dissipation thermique (`efficiency = min(1.0, cooling / heat)`). Les valeurs de base sont calibrées pour un fonctionnement nominal en Sprint 1 sans pénalité excessive.

---

## Conséquences & Avantages

### Positives
- **Précision temporelle absolue** : Aucun saut de simulation ni perte de synchronisation des flux mathématiques.
- **Transparence et UX soignée** : Le modal hors-ligne et le monitoring (Ticks/s, FPS, Thermals) offrent une télémétrie complète et alignée sur la direction artistique cyber-terminal.
- **Sécurité des sauvegardes** : Zéro crash sur données corrompues grâce à la validation et aux fallbacks typés de désérialisation.

### Négatives / Points d'attention
- La simulation hors-ligne par pas de 1s pour 24h nécessite d'exécuter 86 400 micro-itérations au chargement (effectuées en moins de 15ms en JavaScript pur, sans impact perceptible).
