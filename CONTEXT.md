# Domain Model: Project Singularity Loop (IdleAGI)

Ce document constitue le glossaire canonique et le modèle de domaine du jeu incrémental **Project Singularity Loop (IdleAGI)**. Il définit les concepts métier, devises, flux et mécaniques sans dépendance au framework de rendu.

---

## 1. Devises et Débits (Currencies & Flows)

### Phases de Démarrage & Déblocages Progressifs (Early Game Bootstrap)
- **Phase 0 : Scribe Humain** : Transcription manuelle de textes réels du web, apprentissage de la lecture rapide, découverte du courtier de données (*Data Broker*) et vente manuelle de texte brut pour constituer le capital initial.
- **Phase 1 : Station Poubelle & Scripts** : Achat du premier PC d'occasion (RAM et CPU limités) et activation des premiers scripts d'automatisation (auto-scraping, auto-broker).
- **Phase 2 : Station de Travail & Tokenisation** : Acquisition d'un processeur multi-cœurs et activation du Tokenizer BPE (4 chars $\to$ 1 Token) et de l'Oscilloscope temps réel.
- **Phase 3 : Émergence du Modèle & Datacenter** : Déblocage de la Tri-Allocation de compute, de l'entraînement de neurones, de la R&D et du cluster datacenter.

### Raw Text (Caractères bruts)
- **Définition** : Flux de données brutes aspirées par lecture humaine, scraping par script ou synthèse, stocké dans un buffer avant vente ou tokenisation.
- **Rôle** : Matière première vendable au courtier ou convertible par le Tokenizer.

### Tokens ($T$)
- **Définition** : Unités lexicales produites à partir du Raw Text après passage dans le Tokenizer.
- **Rôle** : Carburant primaire de l'entraînement de modèles et des réponses aux requêtes API clientes.
- **Débit** : Mesuré en $Tokens/s$.

### Compute ($TFLOPS$)
- **Définition** : Puissance de calcul brute totale fournie par le matériel actif (CPU, GPU, TPU, Quantum Cores).
- **Rôle** : Distribué dynamiquement entre les 3 canaux d'allocation (Inférence, Entraînement, R&D).

### VRAM & RAM (Capacité mémoire)
- **Définition** : Capacité mémoire physique disponible ($GB$, $TB$, $PB$).
- **Rôle** : Plafonne la taille maximale du modèle entraînable (nombre de Paramètres, $1\text{ paramètre FP16} \approx 2\text{ octets}$) et la fenêtre de contexte maximale.

### Memory Bandwidth (Bande Passante Mémoire - $\text{GB/s}$)
- **Définition** : Débit de transfert brut entre la mémoire (SDRAM, DDR, GDDR, HBM) et les unités de calcul.
- **Rôle** : Dans les LLMs auto-régressifs, l'inférence est structurellement *Memory-Bound*. La bande passante détermine directement le multiplicateur de vitesse de génération et de traitement de tokens par seconde.

### Energy & Thermal System (Watts & Chaleur)
- **Watts** : Consommation électrique totale du hardware en fonctionnement.
- **Cooling Capacity** : Capacité de dissipation thermique (ventilateurs, watercooling, cryogénie).
- **Thermal Throttling** : Goulot d'étranglement appliqué si la chaleur générée dépasse le seuil de refroidissement :
  $$\text{Efficiency} = \min\left(1.0, \frac{\text{CoolingCapacity}}{\text{HeatGenerated}}\right)$$
  $$\text{EffectiveCompute} = \text{RawCompute} \times \text{Efficiency}$$

### Funds (Cash / $)
- **Définition** : Liquidités générées par la vente d'inférence (requêtes API servies) ou subventions de recherche.
- **Rôle** : Achat de nouveau hardware, amélioration de la grille électrique et systèmes de refroidissement.

### Parameters / Weights (Poids du Modèle)
- **Définition** : Complexité intrinsèque du modèle IA ($10^6$ à $10^{12+}$ paramètres).
- **Rôle** : Stock permanent qui augmente avec l'entraînement, débloquant de nouveaux modules cognitifs et augmentant la valeur par token.

### Alignment & Entropy ($0-100\%$)
- **Définition** : Jauge d'équilibre mesurant la stabilité éthique et la dérive cognitive du modèle.
- **Rôle** : Une entropie excessive provoque des hallucinations et des pénalités d'efficacité ; régulée via RLHF, benchmarks et filtres de sécurité.

---

## 2. Allocation Dynamique des Flux (Tri-Allocation)

La puissance effective de calcul ($\text{EffectiveCompute}$) est distribuée entre trois axes interdépendants dont la somme égale $100\%$ :

1. **Inference ($0-100\%$)** : Traite les requêtes API utilisateurs pour générer des **Funds ($)** à partir des Tokens disponibles.
2. **Training ($0-100\%$)** : Consomme des Tokens et du Compute pour accroître les **Parameters / Weights** du modèle.
3. **Research / R&D ($0-100\%$)** : Génère des points de recherche pour débloquer des réductions de coûts, de nouvelles architectures et des optimisations de quantization.

---

## 3. Paliers de Progression & Prestige

### Tier 1 : Checkpoint / Fine-Tuning (Soft Reset ~15-30 min)
- **Action** : Réinitialise les Tokens temporaires et les liquidités courantes pour figer un Checkpoint optimisé du modèle.
- **Gains** : Points d'Architecture & Poids optimisés.
- **Bonus** : Accélération de la tokenisation de base, réductions permanentes sur le coût du hardware de base.

### Tier 2 : Changement de Paradigme (Hard Reset local ~2-3h)
- **Action** : Transition vers une nouvelle architecture fondamentale (Transformer classique $\to$ Mixture of Experts (MoE) $\to$ Neuromorphique $\to$ Quantum AI).
- **Gains** : Découvertes Fondamentales (Insights).
- **Bonus** : Synthèse de données auto-générées, contournement partiel des contraintes de VRAM.

### Tier 3 : Singularité & Boucle Temporelle (Endgame & New Game+)
- **Action** : L'IA franchit le seuil d'Artificial Superintelligence (ASI) et résout la singularité.
- **Gains** : Déblocage des fins narratives scénarisées, modificateurs de défi et boucle New Game+.

---

## 4. Moteur Temporel & Rythme de Jeu (Temporal Mechanics)

### Tick Moteur (20 Hz / 50ms)
- **Définition** : Pas de temps de simulation unitaire ($\Delta t = 0.05\text{ s}$) exécuté à intervalle fixe.
- **Rôle** : Synchronise l'ensemble des transferts de flux (Scraping $\to$ Tokens $\to$ Inférence/Entraînement/R&D).

### Progression Hors-Ligne (Offline Catch-Up)
- **Définition** : Simulation par pas discrets du temps écoulé depuis la dernière fermeture de session.
- **Plafond strict** : Plafonné à 24 heures maximales.
- **Philosophie de Conception (Active Loop)** : *Project Singularity Loop* est conçu pour des sessions de jeu actives, dynamiques et stratégiques (prises de décision d'allocation, upgrades de refroidissement, prestiges) plutôt que des jours d'attente passive.
