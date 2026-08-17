# ADR 0006: Progression Matérielle Réaliste & Mécanique de Bande Passante Mémoire

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

Le catalogue de matériel initial de *Project Singularity Loop* comportait seulement 4 nœuds aux prix très resserrés (10$, 25$, 120$, 2 000$), ce qui créait :
1. Un manque de réalisme économique par rapport au vrai marché du hardware (brocante, occasion, composants prosumer, rigs multi-GPU, serveurs datacenter).
2. L'absence d'une mécanique physique clé dans le Machine Learning : la **bande passante mémoire (Memory Bandwidth en Go/s)**. Dans la génération auto-régressive de tokens par des LLMs, l'inférence est structurellement *Memory-Bound* (la vitesse de lecture des poids en VRAM plafonne le débit de tokens).
3. Des écarts de progression trop abrupts entre la phase de bidouillage local et les serveurs d'entreprise.

---

## Décision

1. **Élargissement et Échelonnement Réaliste du Catalogue Hardware** :
   - **Tier 0 (Brocante & Récupération)** :
     - `potato_pc` : *Relique du Grenier (Pentium II 450 MHz, 64 Mo SDRAM)* — 10 $ (1 GFLOPS, 0.064 Go RAM, 0.8 Go/s, 35W)
     - `core2_quad` : *Tour Bureautique Déclassée (Core 2 Quad Q6600, 4 Go DDR2)* — 45 $ (40 GFLOPS, 4 Go RAM, 6.4 Go/s, 65W)
   - **Tier 1 (Composants Gaming & ML d'Occasion)** :
     - `gtx_750ti` : *GPU Récupéré (GTX 750 Ti 2 Go GDDR5)* — 35 $ (1.3 TFLOPS, 2 Go VRAM, 86.4 Go/s, 60W)
     - `gaming_pc` : *Tour Gaming Reconditionnée (Core i7 6700K, 16 Go DDR4)* — 220 $ (150 GFLOPS, 16 Go RAM, 25.6 Go/s, 120W)
     - `rtx_3060` : *GPU Moyen de Gamme (RTX 3060 12 Go GDDR6)* — 260 $ (12.7 TFLOPS, 12 Go VRAM, 360 Go/s, 170W)
   - **Tier 2 (Station Prosumer & Rigs Multi-GPU)** :
     - `rtx_3090` : *GPU Flagship Prosumer (RTX 3090 24 Go GDDR6X)* — 850 $ (35.6 TFLOPS, 24 Go VRAM, 936 Go/s, 350W)
     - `rig_4x3090` : *Rig Multi-GPU Reconverti (4x RTX 3090 96 Go)* — 3 800 $ (142 TFLOPS, 96 Go VRAM, 3 744 Go/s, 1 400W)
   - **Tier 3 (Datacenter & Supercalculateurs Hyperscale)** :
     - `a100_blade` : *Lame Datacenter Enterprise (NVIDIA A100 80 Go SXM4 HBM2e)* — 12 000 $ (312 TFLOPS Tensor, 80 Go VRAM, 2 039 Go/s, 400W)
     - `h100_server` : *Serveur Rack Hyperscale (8x H100 NVLink 640 Go HBM3)* — 250 000 $ (32 PFLOPS, 640 Go VRAM, 26 800 Go/s, 5 600W)

2. **Physique & Simulation de la Bande Passante Mémoire** :
   - **Capacité Mémoire (VRAM/RAM)** : Plafonne la taille maximale du modèle en paramètres ($1\text{ paramètre FP16} \approx 2\text{ octets}$).
   - **Bande Passante (Go/s)** : Intégrée au moteur de calcul `ComputeEngine` et `EconomyEngine`. La vitesse de génération de tokens d'inférence bénéficie d'un multiplicateur d'efficacité lié à la bande passante globale.

3. **Indicateurs & Télémétrie UI** :
   - Ajout d'une jauge et d'un badge de bande passante (`formatBandwidth`) dans le cluster matériel et le panneau de télémétrie du modèle.

---

## Conséquences & Avantages

### Positives
- **Immersion et réalisme décuplés** : Les joueurs reconnaissent le vrai matériel et l'évolution historique des technologies IA.
- **Pacing progressif et gratifiant** : Élimination des temps morts grâce à des paliers intermédiaires d'investissement réguliers (35$, 45$, 220$, 260$, 850$, 3 800$, 12 000$, 250 000$).
- **Alignement avec la physique des LLMs** : Respect de la double contrainte Compute (FLOPS) vs Memory Bandwidth (Go/s).
