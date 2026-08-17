# ADR 0010: Progression Linéaire de Station Hôte, Gating Obligatoire de la RAM & GPU Contextuels

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

Les playtests ont mis en lumière trois défauts d'ergonomie et de game design :
1. **Accumulation illogique de machines de départ** : Le joueur pouvait acheter 10 fois le PC de départ poussiéreux (*Grille-Pain Pentium II*).
2. **Surcharge cognitive de l'interface** : Le catalogue affichait simultanément des machines de datacenter à 6 500$ et des GPU H100 à 32 000$ alors que le joueur débutait avec 10$.
3. **Absence de conditionnement fort de la RAM** : Les barrettes de RAM étaient optionnelles et le joueur pouvait sauter directement à la tour supérieure sans rentabiliser sa machine actuelle.

---

## Décision

1. **Station Hôte Unique Évolutive (`maxCount: 1`)** :
   - Le joueur ne gère qu'**une seule Station Hôte principale active** qui évolue de palier en palier.
   - Les machines hôtes possèdent `maxCount: 1`.
   - L'interface ne présente que la **machine active** et la **prochaine tour cible** ($N+1$). Les paliers lointains ($N+2, N+3$) restent masqués.

2. **Gating Obligatoire de la RAM (`requiredUpgrades`)** :
   - Pour pouvoir acquérir la tour supérieure, le joueur DOIT avoir installé l'ensemble des kits de RAM du palier actuel :
     - `potato_pc` $\to$ `core2_quad` : Requiert `ram_sdram_256mb` (4.50$).
     - `core2_quad` $\to$ `gaming_pc` : Requiert `ram_ddr2_8gb` (14$) et `ram_ddr3_16gb` (28$).
     - `gaming_pc` $\to$ `workstation_pro` : Requiert `ram_ddr4_32gb` (65$) et `ram_ddr4_64gb` (140$).
     - `workstation_pro` $\to$ `datacenter_chassis` : Requiert `ram_ddr5_128gb` (380$) et `ram_ddr5_256gb` (850$).

3. **Dévoilement Contextuel des GPU Dédiés** :
   - Les GPU ne s'affichent que s'ils sont compatibles avec la station hôte actuelle ou immédiatement accessible (`minHostTier <= currentHost.tier`).
   - Sur Core 2 Quad (1 slot) : *GTX 750 Ti* et *GTX 1060*.
   - Sur Tour Gaming (2 slots) : *RTX 3060* et *RTX 3090*.
   - Sur Threadripper & Datacenter : *NVIDIA A100* et *NVIDIA H100*.

4. **Séparation Stricte Matériel vs Logiciel** :
   - **Panneau 3 (Matériel & Nœuds)** : Regroupe 🖥️ *Station Hôte*, 💾 *Kits de RAM* et ⚡ *GPU Dédiés*.
   - **Panneau 4 (Compétences & Scripts)** : Dédié exclusivement aux *Compétences Humaines* et *Scripts Python*.

---

## Conséquences & Avantages

### Positives
- **Interface épurée et lisible** : Zéro encombrement, une seule étape directrice à la fois.
- **Boucle d'amélioration gratifiante** : Machine $\to$ Kits de RAM $\to$ GPU dédié $\to$ Tour suivante.
- **Cohérence physique totale** : Chaque composant a une raison d'être indispensable.
