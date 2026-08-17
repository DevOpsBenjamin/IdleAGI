# ADR 0018: Conception Cyber-Visuelle de l'Arbre de Talents d'Architecture

## Statut
Accepté

## Contexte
Avec l'introduction de la mécanique de Prestige Tier 1 (*Checkpoint & Fine-Tuning*, ADR 0017), le joueur convertit ses paramètres synaptiques entraînés en Points d'Architecture permanents ($AP$). 

Pour rendre cette progression stratégique, stimulante et visuellement immersive, il est nécessaire de concevoir un **Arbre de Talents d'Architecture** (Ticket #44). Cet arbre doit structurer la réallocation permanente des points d'architecture à travers des branches de spécialisation claires, tout en offrant une interface cyber-visuelle haut de gamme adaptée au desktop et au mobile.

## Décisions

1. **Branches Thématiques & Spécialisations Métier** :
   L'Arbre de Talents s'articule autour de 3 branches interconnectées organisées en 3 Tiers de puissance croissante :
   - **Branche 1 : Tokenisation & Ingestion (Data Pipeline)**
     - *Tier 1 (1 AP)* : `opt_bpe_fast_track` (BPE Byte-Pair Fast-Track) $\to$ Vitesse de transcription manuelle & puissance de scrape $+50\%$.
     - *Tier 2 (2 AP)* : `opt_syntactic_indexing` (Syntactic Vector Indexing) $\to$ Débit de conversion et génération de tokens $+100\%$.
     - *Tier 2 (2 AP)* : `opt_market_pricing` (High-Frequency Ingestion) $\to$ Prix de vente des données brutes au courtier $+50\%$.
     - *Tier 3 (4 AP)* : `opt_semantic_compression` (Deep Context Compression) $\to$ Capacité maximale des buffers de texte et de tokens $+100\%$.
   - **Branche 2 : Électro-Thermique & Hardware (Infrastructure)**
     - *Tier 1 (1 AP)* : `opt_hardware_rebate` (OEM Direct Sourcing) $\to$ Remise permanente de $-15\%$ sur le prix de tout le matériel (hôtes et GPU).
     - *Tier 2 (2 AP)* : `opt_cryo_conduction` (Direct-Die Heat Pipes) $\to$ Multiplicateur d'efficacité et dissipation thermique $+25\%$.
     - *Tier 2 (2 AP)* : `opt_smart_grid` (Smart Grid Load-Balancing) $\to$ Capacité du réseau électrique $+25\%$ sans coût additionnel.
     - *Tier 3 (4 AP)* : `opt_liquid_nitrogen` (Cryo-Superconducteurs) $\to$ Efficacité de refroidissement $+50\%$ et élimination du thermal throttling critique.
   - **Branche 3 : Calcul & Matrice (Inférence & Entraînement)**
     - *Tier 1 (1 AP)* : `opt_matrix_acceleration` (GEMM Matrix Acceleration) $\to$ Vitesse de calcul brute $+20\%\text{ TFLOPS}$.
     - *Tier 2 (2 AP)* : `opt_flash_attention` (FlashAttention-2 Kernel) $\to$ Vitesse de calcul brute $+35\%\text{ TFLOPS}$.
     - *Tier 2 (2 AP)* : `opt_speculative_decoding` (Speculative Decoding) $\to$ Valeur des requêtes API et multiplicateur de qualité cognitive $+50\%$.
     - *Tier 3 (5 AP)* : `opt_moe_sparse_gating` (Mixture of Experts Sparse Gating) $\to$ Multiplicateur de puissance brute $+100\%\text{ TFLOPS}$.

2. **États des Nœuds & Graphe de Dépendances** :
   Chaque nœud de talent possède un état calculé dynamiquement par le moteur de domaine `PrestigeEngine` :
   - `purchased` : Nœud débloqué de manière permanente. Affiche un badge cyan rétro-éclairé `✓ ACTIF`.
   - `available` : Prérequis validés et solde d'$AP$ suffisant. Affiche une bordure verte pulsante cyber et un bouton d'activation immédiat.
   - `insufficient_ap` : Prérequis validés mais solde d'$AP$ insuffisant. Affiche une bordure dorée/ambre et le nombre d'$AP$ manquant.
   - `locked` : Prérequis non satisfaits. Affiche une bordure assombrie `#21262D`, une icône estompée et la liste des prérequis à débloquer.

3. **Interface Cyber-Visuelle & Ergonomie (`ArchitectureTalentTree.vue`)** :
   - **En-tête HUD de Télémétrie AP** :
     - Compteur d'$AP$ disponibles en réserve.
     - Total cumulé des $AP$ acquis au cours de la vie de l'IA.
     - Multiplicateur de calcul universel passif ($+5\%/\text{AP}$ permanent $\implies \mu_{\text{checkpoint}}$) calculé en direct.
   - **Navigation & Filtrage par Onglet / Vue Panoramique** :
     - Onglets thématiques (Toutes les branches, Ingestion, Infrastructure, Calcul) pour une exploration fluide sur smartphone et bureau.
     - Grille nodale réactive avec connecteurs visuels de hiérarchie (Tier 1 $\to$ Tier 2 $\to$ Tier 3).
   - **Panneau Inspecteur de Nœud Interactif** :
     - Nom, icône, catégorie, description technique et lore informatique.
     - Liste des prérequis avec statut en temps réel.
     - Effet chiffré permanent.
     - Bouton d'achat tactile respectant la norme ergonomique mobile ($\ge 48\text{px}$) avec feedback visuel cyber et journalisation dans le terminal STDOUT.
   - **Modal Plein Écran & Accessibilité** :
     - Overlay sombre avec effet scanlines et backdrop-blur.
     - Fermeture via touche `Escape`, bouton croix ou clic sur l'arrière-plan.
     - Bouton d'accès permanent dans `AppHeader.vue` (badge doré `⚡ AP: X [Arbre d'Architecture]`) et dans `ModelTelemetry.vue`.

## Conséquences
- L'Arbre de Talents d'Architecture offre une profondeur stratégique majeure au jeu : le joueur peut choisir de spécialiser son IA vers le scraping ultra-rapide (bootstrapping fulgurant), la dissipation thermique (datacenter surchargé) ou la puissance brute d'entraînement (ruée vers les paramètres).
- Le composant `ArchitectureTalentTree.vue` est découplé de la couche de stockage et s'appuie sur `PrestigeEngine` et `usePrestigeStore`.
- L'intégration garantit une expérience utilisateur immersive et conforme aux standards Mobile-First du projet.
