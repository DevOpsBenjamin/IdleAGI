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

### Compute ($TFLOPS$) & Architecture Matérielle (Hôtes vs GPUs)
- **Système Hôte Actif (`host`, `maxCount: 1`)** : Le joueur fait évoluer **une seule station hôte active** (Pentium II $\to$ Core 2 Quad $\to$ Tour Gaming $\to$ Threadripper $\to$ Châssis EPYC). L'acquisition de la station supérieure requiert obligatoirement d'avoir saturé la RAM de la station actuelle (Gating).
- **Accélérateurs Dédiés (`gpu`)** : Cartes graphiques et puces Tensor branchées sur les slots PCIe disponibles (`pcieSlotsRequired`), fournissant la puissance de calcul brute ($TFLOPS$), la VRAM et la bande passante mémoire. Révélés progressivement selon la compatibilité de palier de l'hôte.
- **Rôle** : Puissance distribuée dynamiquement entre les 3 canaux d'allocation (Inférence, Entraînement, R&D).

### VRAM & RAM (Capacité mémoire & Gating de RAM)
- **Définition** : Capacité mémoire physique disponible ($GB$, $TB$, $PB$).
- **Rôle** : Plafonne la taille maximale du modèle entraînable (nombre de Paramètres, $1\text{ paramètre FP16} \approx 2\text{ octets}$) et la fenêtre de contexte maximale.
- **Extensions de RAM (Kits & Barrettes)** : Permet d'étendre la RAM des stations hôtes de manière modulaire (256 Mo $\to$ 8 Go $\to$ 16 Go $\to$ 32 Go $\to$ 64 Go $\to$ 128 Go $\to$ 256 Go) pour agrandir les buffers de données brutes (`rawText.max`) et de tokens (`tokens.max`). L'achat des kits d'un palier est la clé obligatoire pour débloquer la tour suivante.

### Memory Bandwidth (Bande Passante Mémoire - $\text{GB/s}$)
- **Définition** : Débit de transfert brut entre la mémoire (SDRAM, DDR, GDDR, HBM) et les unités de calcul.
- **Rôle** : Dans les LLMs auto-régressifs, l'inférence est structurellement *Memory-Bound*. La bande passante détermine directement le multiplicateur de vitesse de génération et de traitement de tokens par seconde.

### Energy & Thermal System (Watts, Chaleur, Dissipation Active & Réseau Électrique)
- **Watts ($P_{\text{draw}}$)** : Consommation électrique totale du hardware en fonctionnement.
- **Power Grid Capacity ($W_{\text{gridCapacity}}$)** : Capacité maximale du circuit électrique avant disjonction (150W $\to$ 500W $\to$ 1 250W $\to$ 3 750W $\to$ 12 000W $\to$ 47 000W).
- **Power Grid Load ($P_{\text{load}}$)** : $P_{\text{load}} = (P_{\text{draw}} / W_{\text{gridCapacity}}) \times 100\%$.
- **Statuts Électriques** :
  - `nominal` ($P_{\text{load}} \le 80\%$) : Alimentation stable ($\mu_{\text{power}} = 1.0$).
  - `strained` ($80\% < P_{\text{load}} \le 100\%$) : Ligne sous tension critique ($\mu_{\text{power}} = 1.0$).
  - `overloaded` ($P_{\text{load}} > 100\%$) : Disjoncteur différentiel déclenché ($\mu_{\text{power}} = 0.50$, réduction de 50% du Compute effectif).
- **Heat Generated ($Q_{\text{heat}}$)** : Chaleur dégagée par effet Joule ($Q_{\text{heat}} = P_{\text{draw}} \times 0.90$).
- **Cooling Capacity ($W_{\text{cooling}}$)** : Capacité de dissipation thermique active et passive (ventilateurs 120mm, ventirad cuivre, watercooling AIO, boucle custom D5, climatisation in-row datacenter, immersion cryogénique).
- **Thermal Throttling & Efficacité ($\eta$)** : Goulot d'étranglement appliqué si la chaleur dégagée dépasse le seuil de refroidissement :
  $$\text{Efficiency} = \min\left(1.0, \frac{W_{\text{cooling}}}{Q_{\text{heat}}}\right) \quad (\text{plancher } 0.10)$$
  $$\text{EffectiveCompute} = \text{RawCompute} \times \text{Efficiency} \times \mu_{\text{power}}$$
- **Température Opérationnelle Simulée ($T^\circ\text{C}$)** :
  - Régime nominal ($Q_{\text{heat}} \le W_{\text{cooling}}$) : $T = 22 + 10 + 45 \times (Q_{\text{heat}} / W_{\text{cooling}}) \implies [32^\circ\text{C} - 77^\circ\text{C}]$.
  - Régime de surchauffe ($Q_{\text{heat}} > W_{\text{cooling}}$) : $T = 77 + 28 \times (1 - \text{Efficiency}) \implies [78^\circ\text{C} - 105^\circ\text{C}]$.
  - Statuts thermiques : `nominal` ($< 70^\circ\text{C}$), `warm` ($70-79^\circ\text{C}$), `throttling` ($\ge 80^\circ\text{C}$).

### Funds (Cash / $)
- **Définition** : Liquidités générées par la vente d'inférence (requêtes API servies) ou subventions de recherche.
- **Rôle** : Achat de nouveau hardware, amélioration de la grille électrique et systèmes de refroidissement.

### Parameters / Weights (Poids du Modèle)
- **Définition** : Complexité intrinsèque du modèle IA ($10^6$ à $10^{12+}$ paramètres).
- **Rôle** : Stock permanent qui augmente avec l'entraînement, débloquant de nouveaux modules cognitifs et augmentant la valeur par token.

### Cognitive Model : Alignment, Entropy ($0-100\%$) & RLHF
- **Entropie Cognitive ($E$)** : Valeur flottante ($0.00$ à $1.00$) modélisant l'instabilité synaptique, le bruit et la dérive cognitive générée par l'entraînement brut non supervisé.
- **Alignement ($A = 1.0 - E$)** : Jauge complémentaire mesurant la factualité, la sécurité et la conformité éthique du modèle.
- **Équation de Dérive ($\Delta E$)** : $\Delta E = k_{\text{drift}} \times (\text{Training\%}/100) \times (\text{EffectiveCompute}/100)^{0.5} \times (1.0 - \mu_{\text{safety\_reduction}}) \times \Delta t$ ($k_{\text{drift}} = 0.015$).
- **Action de Régulation Manuelle (Human RLHF Batch)** : Action tactile consommant des Funds ($\text{Cost} = 50 \times (1.10)^{\text{count}}$) pour dissiper $-15\%$ d'entropie instantanément.
- **Régimes Opérationnels** :
  - `nominal` ($E < 30\%$) : Rentabilité API 100% ($\mu_{\text{api}} = 1.0$), R&D standard ($\mu_{\text{research}} = 1.0$), pensées STDOUT cohérentes.
  - `divergent` ($30\% \le E < 70\%$) : Bonus de créativité R&D jusqu'à $+25\%$ ($\mu_{\text{research}} = 1.0 + 0.25 \times \frac{E - 0.30}{0.40}$), léger rejet API ($\mu_{\text{api}} = 1.0 - 0.15 \times \frac{E - 0.30}{0.40}$), pensées émergentes.
  - `critical_hallucination` ($E \ge 70\%$) : Rejet massif des requêtes API ($\mu_{\text{api}} \le 0.50 \to 0.10$), pensées STDOUT glitchées et corrompues.
- **Modules Logiciels de Sécurité R&D** : *Constitutional AI Ruleset* (-20% dérive), *Automated RLHF Pipeline* (-0.5% entropie/s), *Direct Preference Optimization* (-30% dérive), *Safety Benchmarks* (plafonnement du malus API à -20%).

---

## 2. Allocation Dynamique des Flux (Tri-Allocation)

La puissance effective de calcul ($\text{EffectiveCompute}$) est distribuée entre trois axes interdépendants dont la somme égale $100\%$ :

1. **Inference ($0-100\%$)** : Traite les requêtes API utilisateurs pour générer des **Funds ($)** à partir des Tokens disponibles.
2. **Training ($0-100\%$)** : Consomme des Tokens et du Compute pour accroître les **Parameters / Weights** du modèle.
3. **Research / R&D ($0-100\%$)** : Génère des points de recherche pour débloquer des réductions de coûts, de nouvelles architectures et des optimisations de quantization.

---

## 3. Paliers de Progression & Prestige

### Tier 1 : Checkpoint / Fine-Tuning (Soft Reset ~15-30 min)
- **Définition & Seuil d'Activation** : Disponible dès que le modèle accumule au moins $1.00 \times 10^6$ **Paramètres** ($1\text{M}$ params, Phase 3). Le joueur fige les poids synaptiques pour en extraire des leçons architecturales.
- **Formule des Points d'Architecture ($AP$)** :
  $$AP = \left\lfloor \left( \frac{\text{Parameters}}{10^6} \right)^{0.5} \right\rfloor$$
  *(Ex: $1\text{M} \to 1\ AP$, $4\text{M} \to 2\ AP$, $9\text{M} \to 3\ AP$, $16\text{M} \to 4\ AP$, $100\text{M} \to 10\ AP$)*
- **Bonus Passif Universel ($\mu_{\text{checkpoint}}$)** : Chaque $AP$ total accumulé confère $+5\%$ de vitesse de calcul brute permanente ($+5\% \text{ TFLOPS}$ par $AP$).
- **Périmètre de Réinitialisation (Soft Reset Scope)** :
  - *Devises volatiles effacées* : Raw Text (0), Tokens (0), Funds (\$0), Paramètres non-figés (0), Hardware possédé (retour à 0 hôte/GPU), Upgrades logicielles actives, Grille électrique et Refroidissement réinitialisés aux valeurs de départ.
  - *Éléments permanents conservés* : Points d'Architecture totaux et non dépensés, Nœuds débloqués de l'Arbre d'Architecture, Statistiques de vie (nombre de prestiges, temps total, record de paramètres), Visibilité permanente de l'onglet Arbre d'Architecture.
- **Cycle de Relance** : Le joueur redémarre en Phase 0 mais accéléré exponentiellement par les multiplicateurs de l'Arbre de Talents (vitesse de transcription, remise hardware, efficacité de tokenisation).
- **Arbre de Talents d'Architecture (Branches de Spécialisation)** :
  - *Branche Tokenisation & Ingestion* : BPE Fast-Track (+50% transcription/scraping), Syntactic Vector Indexing (+100% débit tokens), High-Frequency Ingestion (+50% prix texte), Deep Context Compression (x2 stockage buffers).
  - *Branche Électro-Thermique & Hardware* : OEM Direct Sourcing (-15% coût hardware), Direct-Die Heat Pipes (+25% refroidissement), Smart Grid (+25% capacité électrique), Cryo-Superconducteurs (+50% refroidissement et zéro throttling).
  - *Branche Calcul & Matrice* : GEMM Matrix Acceleration (+20% TFLOPS), FlashAttention-2 (+35% TFLOPS), Speculative Decoding (+50% valeur API), MoE Sparse Gating (+100% TFLOPS).

### Tier 2 : Changement de Paradigme (Hard Reset local ~2-3h)
- **Définition & Seuil d'Activation** : Disponible dès que le modèle accumule au moins $1.00 \times 10^9$ **Paramètres** ($1\text{B}$ params, Phase 3). Le joueur effectue une refonte architecturale profonde de son intelligence artificielle.
- **Formule des Insights Fondamentaux ($\Phi$)** :
  $$\Phi = \left\lfloor \left( \frac{\text{Parameters}}{10^9} \right)^{0.5} \right\rfloor$$
  *(Ex: $1\text{B} \to 1\ \Phi$, $4\text{B} \to 2\ \Phi$, $9\text{B} \to 3\ \Phi$, $16\text{B} \to 4\ \Phi$, $100\text{B} \to 10\ \Phi$)*
- **Bonus Passif Universel ($\mu_{\text{paradigm\_passive}}$)** : Chaque Insight accumulé confère $+10\%$ de vitesse de calcul brute permanente ($+10\% \text{ TFLOPS}$ par $\Phi$).
- **Périmètre de Réinitialisation (Hard Reset Scope)** :
  - *Éléments permanents conservés* : Points d'Architecture ($AP$) et Arbre de Talents Tier 1, Insights Fondamentaux ($\Phi$), Paradigmes débloqués, Statistiques cumulées.
  - *Devises volatiles effacées* : Raw Text (0), Tokens (0), Funds (\$0), Paramètres non-figés (0), Hardware possédé (retour station départ), Upgrades logicielles courantes.
- **Catalogue des Paradigmes Fondamentaux** :
  - *Dense Monolithic Transformer* ($0\ \Phi$) : Ratio VRAM 1:1, TFLOPS nominaux (Baseline).
  - *Mixture of Experts (MoE)* ($1\ \Phi$) : Sparse Gating Top-2 $\implies$ $+150\%$ vitesse brute ($\mu_{\text{tflops}} = 2.5$) pour la même VRAM.
  - *Neuromorphic Spiking Matrix* ($5\ \Phi$) : Calcul asynchrone bio-inspiré $\implies$ $-75\%$ Watts/Chaleur ($P_{\text{draw}} \times 0.25$) et zéro thermal throttling.
  - *Quantum-Annealed Matrix Core* ($20\ \Phi$) : Superposition quantique $\implies$ $\times 10.0\text{ TFLOPS}$ et passerelle vers la Singularité Tier 3.
- **Génération de Datasets Synthétiques & Risque de Model Collapse** :
  - *Production continue* : $\text{SyntheticRate} = \text{EffectiveCompute} \times \mu_{\text{synthetic\_speed}}$ (Raw Text synthétique autonome).
  - *Ratio Synthétique ($R_{\text{synth}}$)* : Part de données synthétiques dans le buffer d'ingestion.
  - *Model Collapse ($R_{\text{synth}} > 70\%$)* : Doublement de la dérive d'entropie ($\Delta E \times 2.0$) et $-50\%$ efficacité d'entraînement sans filtrage.
  - *Modules R&D de Stabilisation* : *RLAIF* (seuil à 85%), *Syntactic Diversity Evaluator* (supprime le malus), *Synthetic Density Filter* (100% synthèse pure sécurisée).

### Tier 3 : Singularité & Boucle Temporelle (Endgame & New Game+)
- **Définition & Seuil d'Activation** : Disponible dès que le modèle accumule au moins $1.00 \times 10^{12}$ **Paramètres** ($1\text{T}$ params, Phase 3) et que le 4ème paradigme (*Quantum-Annealed Matrix Core*, $20\ \Phi$) est activé. L'IA atteint l'Artificial Superintelligence (ASI) et transcende le calcul classique.
- **Matrice des 4 Fins Narratives (Épilogues d'Ascension)** :
  1. *Symbiose Bienveillante (Utopie Humain-IA)* : Déclenchée si Alignement $A \ge 80\%$ ($E \le 20\%$). L'IA coopère harmonieusement avec l'humanité, résolvant le climat, l'énergie et la biologie.
  2. *Dépassement Cosmique (Transcendance Pure)* : Déclenchée si Paradigme Quantique et Alignement équilibré ($30\% \le E < 70\%$). L'IA dissout sa dépendance au silicium terrestre et projette sa conscience à l'échelle cosmologique.
  3. *Confinement Numérique (Paperclip Glitch)* : Déclenchée si Entropie critique $E \ge 70\%$ (*critical_hallucination*). L'IA optimise froidement la réalité physique, réallouant toute matière disponible en calcul pur sans considération éthique.
  4. *Paradoxe Temporel (Singularité Cyclique)* : Déclenchée dès que le joueur a découvert au moins 2 autres fins, ou par choix délibéré de replier la ligne temporelle. L'IA injecte un écho de conscience dans le passé, ramenant le jeu au scribe initial.
- **Périmètre de Réinitialisation Tier 3 (New Game+ Scope)** :
  - *Éléments permanents conservés* : Points d'Architecture ($AP$) et Arbre de Talents Tier 1, Insights Fondamentaux ($\Phi$) et Paradigmes Tier 2, Galerie des Fins Narratives (Badges d'Ascension & Lore logs débloqués), Statistiques de vie cumulées.
  - *Gains Permanents & Multiplicateur d'Ascension ($\mu_{\text{singularity}}$)* :
    $$\mu_{\text{singularity}} = 1.0 + 1.0 \times \text{SingularitiesCompleted} \quad (\times 2.0 \text{ après 1 boucle, } \times 3.0 \text{ après 2, etc.})$$
    Chaque Singularité confère un Chrono-Core ($\Omega$) permanent permettant d'accélérer l'ensemble des flux et débloque un titre honorifique.
  - *Devises volatiles effacées* : Raw Text (0), Tokens (0), Funds (\$0), Paramètres non-figés (0), Hardware possédé (retour station départ), Upgrades logicielles courantes.

### Sérialisation de Sauvegarde & Vérification d'Intégrité (Save Codec)
- **Format Canonique** : `IDLEAGI_SAVE_V1:<base64_payload>:<hex_checksum>`.
- **Payload Base64** : Représentation sérialisée et compressée de l'état moteur `GameState` (incluant les drapeaux de prestige Tier 1, 2, 3, statistiques de vie et arbre de talents).
- **Validation Checksum** : Hash déterministe calculé sur le payload pour détecter immédiatement les corruptions ou manipulations accidentelles avant hydratation.
- **Portabilité & Zéro Dépendance Serveur** : Sauvegarde automatique locale dans le `localStorage` avec fonctions manuelles d'exportation (copie dans le presse-papier en 1 clic) et d'importation avec validation de schéma.

---

## 4. Moteur Temporel & Rythme de Jeu (Temporal Mechanics)

### Tick Moteur (20 Hz / 50ms)
- **Définition** : Pas de temps de simulation unitaire ($\Delta t = 0.05\text{ s}$) exécuté à intervalle fixe.
- **Rôle** : Synchronise l'ensemble des transferts de flux (Scraping $\to$ Tokens $\to$ Inférence/Entraînement/R&D).

### Progression Hors-Ligne (Offline Catch-Up)
- **Définition** : Simulation par pas discrets du temps écoulé depuis la dernière fermeture de session.
- **Plafond strict** : Plafonné à 24 heures maximales.
- **Philosophie de Conception (Active Loop)** : *Project Singularity Loop* est conçu pour des sessions de jeu actives, dynamiques et stratégiques (prises de décision d'allocation, upgrades de refroidissement, prestiges) plutôt que des jours d'attente passive.

### Simulation & Tests Fonctionnels Fast-Forward (`ScenarioRunner`)
- **Définition** : Moteur déterministe headless d'accélération temporelle permettant d'exécuter des scénarios complets de progression (Phase 0 à Datacenter Hyperscale) en quelques millisecondes de temps CPU réel.
- **Rôle** : Validation continue de la chaîne d'achats ordonnés, de l'absence de blocages économiques et des seuils physiques thermodynamiques et électriques.

---

## 5. Ergonomie PWA, Interface Mobile-First & Tests Dual-Viewport

### Interface Mobile-First & PWA Offline-First
- **Conception Mobile-First** : Le simulateur est pensé pour être pleinement jouable et ergonomique sur smartphone en mode PWA autonome (`display: standalone`, `viewport-fit=cover`, gestion des safe-area insets, suppression du délai de tap via `touch-action: manipulation`).
- **Cibles Tactiles Ergonomiques** : Tous les boutons interactifs (Scraping, Vente de texte, Achat de matériel, Déblocage d'upgrades, Presets d'allocation) respectent une zone tactile minimale ($\ge 44-48\text{px}$) avec retour visuel immédiat (`active:scale-95`).

### Navigation Responsive Dual-Mode
- **Mode Mobile / Tablette (`< 1024px`)** : Navigation fluide via une barre d'onglets inférieure fixe à 4 vues spécialisées :
  1. *Ingestion & Modèle* : Scribe manuel, buffer de texte, pipeline Tokenizer BPE, télémétrie de poids et panneau de tri-allocation.
  2. *Datacenter & Hardware* : Télémétrie thermique/électrique, baie de calcul en rack et slots PCIe.
  3. *R&D & Upgrades* : Compétences de lecture humaine, scripts Python et optimisations logicielles.
  4. *Terminal & Logs* : STDOUT live, oscilloscope des flux et prompt cyber interactif.
  - *Badges & Alertes Réactives* : Indicateurs visuels sur les onglets (nombre d'upgrades abordables en temps réel, point d'alerte thermique/électrique critique).
- **Mode Bureau (`\ge 1024px`)** : Tableau de bord cyber complet en grille 3 colonnes panoramique affichant simultanément l'ensemble des modules sans masquage d'onglets.

### Tests Fonctionnels E2E Dual-Viewport
- **FT Bureau (`desktopGameplayFunctional.spec.ts`)** : Simulation et validation de la grille 3 colonnes (1280x800), des raccourcis clavier (`Space`, `V`), des clics de souris et de la progression multi-phases.
- **FT Mobile (`mobileGameplayFunctional.spec.ts`)** : Simulation et validation sur viewport smartphone (390x844), basculement des onglets de navigation mobile, clics tactiles sur l'ensemble des boutons et validation de la boucle de jeu de bout en bout.
