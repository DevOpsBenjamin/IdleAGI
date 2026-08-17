# ADR 0008: Compatibilité de Palier Hôte (minHostTier) & Saveur Rétro du Matériel

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

L'introduction de la séparation modulaire entre Stations Hôtes et GPU (ADR 0007) permettait de brancher des cartes graphiques sur des slots PCIe.
Cependant, une incohérence physique subsistait :
- Un joueur pouvait théoriquement installer une **RTX 3090 (350W, PCIe 4.0, 24 Go GDDR6X)** ou un **NVIDIA H100** sur une vieille tour **Core 2 Quad de 2008** avec 4 Go de DDR2 et un BIOS hérité sans UEFI.
- Dans la réalité, les architectures GPU modernes nécessitent une carte mère UEFI, une génération PCIe minimale, une alimentation adaptée et un CPU suffisamment véloce pour éviter un blocage total du système.
- De plus, les noms des processeurs et stations hôtes manquaient d'humour et de références culturelles rétro/geek.

---

## Décision

1. **Règle de Compatibilité `minHostTier`** :
   - Chaque carte accélératrice (`gpu`) requiert désormais une station hôte d'un palier minimal (`minHostTier: 0, 1, 2, 3`) disposant d'au moins un slot PCIe libre.
   - **Tier 0+ (Brocante / Occasion)** : GTX 750 Ti 2 Go, GTX 1060 6 Go (compatibles PCIe 2.0 / Legacy BIOS).
   - **Tier 1+ (Gaming Moderne)** : RTX 3060 12 Go, RTX 3090 24 Go (requièrent UEFI, PCIe 3.0/4.0 et alimentation adaptée).
   - **Tier 2+ (Station Prosumer)** : NVIDIA A100 80 Go (requiert châssis à refroidissement renforcé et connecteurs haute intensité).
   - **Tier 3 (Datacenter Hyperscale)** : NVIDIA H100 80 Go (requiert châssis serveur rack 4U avec bus SXM5 / NVLink).

2. **Nomenclature & Descriptions Rétro & Immersives** :
   - `potato_pc` : *Grille-Pain du Grenier (Pentium II 450 MHz Deschutes & Lecteur 3.5")*
   - `core2_quad` : *Chauffage d'Appoint de Bureautique (Core 2 Quad Q6600 @ 2.4 GHz)*
   - `gaming_pc` : *Tour Tuning RGB du BonCoin (i7-6700K Skylake Décapsulé / 16 Go DDR4)*
   - `workstation_pro` : *Centrale Turbine d'Avion (Threadripper 3990X 64 Cœurs / 64 Go DDR5)*
   - `datacenter_chassis` : *Armoire Climatysée 4U (Double AMD EPYC 9654 Genoa 192 Cœurs / 256 Go ECC)*

3. **Moteur de Simulation & UI** :
   - Le moteur de calcul `ComputeEngine` alloue les GPU aux slots des hôtes compatibles de palier $\ge \text{minHostTier}$.
   - `HardwareCluster.vue` affiche un badge d'exigence de palier et informe le joueur si l'acquisition d'une station hôte supérieure est nécessaire.

---

## Conséquences & Avantages

### Positives
- **Réalisme technique irréprochable** : Impossibilité de brancher un supercalculateur IA sur une carte mère sans UEFI de 2008.
- **Plaisir de jeu et immersion** : Clins d'œil geek authentiques et humour rétro.
- **Profondeur stratégique** : Nécessité de faire évoluer ses machines hôtes pour accueillir les GPU de dernière génération.
