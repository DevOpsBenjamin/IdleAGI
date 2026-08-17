# ADR 0007: Architecture Matérielle Modulaire (Hôtes / Slots PCIe & GPU Dédiés)

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

Dans la version précédente, le matériel était présenté dans une liste unique linéaire mélangeant des stations complètes (avec CPU/RAM) et des cartes graphiques individuelles (GPU).
Cela créait deux incohérences majeures :
1. **Incohérence des FLOPS perçus** : Une tour gaming (i7 avec 150 GFLOPS) coûtait 220$ alors qu'une vieille carte graphique (GTX 750 Ti avec 1.3 TFLOPS) coûtait 35$. Dans la réalité, un CPU a moins de puissance de calcul parallèle qu'un GPU, mais fournit l'orchestration, la mémoire système et les connecteurs physiques (PCIe).
2. **Manque de modularité** : Le joueur ne pouvait pas upgrader son CPU/RAM d'un côté et ajouter plusieurs cartes graphiques de l'autre selon ses besoins en calcul.

---

## Décision

1. **Découpage en Deux Catégories Matérielles Distinctes (`HardwareCategory`)** :
   - **`host` (Stations & Systèmes Hôtes)** :
     - Fournissent des **Slots d'extension PCIe** (`pcieSlotsProvided`).
     - Fournissent la **RAM Système** (qui augmente la capacité du Buffer de Raw Text) et de la puissance CPU pour l'orchestration.
     - *Nœuds : Relique Pentium II (0 slot, 64 Mo), Tour Bureautique Core 2 Quad (1 slot, 4 Go), Tour Gaming i7 (2 slots, 16 Go), Station Workstation Threadripper (4 slots, 64 Go), Châssis Datacenter 4U (8 slots, 256 Go).*
   - **`gpu` (Accélérateurs Graphiques Dédiés)** :
     - Nécessitent un ou plusieurs slots PCIe libres (`pcieSlotsRequired`).
     - Fournissent les **TFLOPS massifs**, la **VRAM dédiée** et la **Bande Passante** pour la tokenisation et l'inférence.
     - *Nœuds : GTX 750 Ti 2 Go, GTX 1060 6 Go, RTX 3060 12 Go, RTX 3090 24 Go, NVIDIA A100 80 Go SXM4, NVIDIA H100 80 Go SXM5.*

2. **Règles de Calcul & Validation dans le Domaine (`ComputeEngine`)** :
   - Total des slots disponibles : $\sum (\text{count}_{\text{host}} \times \text{pcieSlotsProvided})$.
   - Total des slots occupés : $\sum (\text{count}_{\text{gpu}} \times \text{pcieSlotsRequired})$.
   - L'achat d'un GPU est strictement bloqué si $\text{SlotsLibres} < \text{SlotsRequis}$.

3. **Expérience Utilisateur & Interface (`HardwareCluster.vue`)** :
   - Ajout d'onglets de navigation modulaires : **"🖥️ Stations Hôtes (CPU / RAM)"** et **"⚡ Accélérateurs Dédiés (GPU / VRAM)"**.
   - Jauge visuelle de connectivité PCIe en en-tête montrant l'occupation des slots.

---

## Conséquences & Avantages

### Positives
- **Réalisme architectural total** : Respect de la structure réelle des ordinateurs et clusters d'IA.
- **Liberté stratégique pour le joueur** : Possibilité d'acheter une grosse station pour y empiler plusieurs GPU économiques, ou de faire évoluer la machine hôte.
- **Clarté totale des métriques** : Plus aucune confusion entre FLOPS CPU et FLOPS GPU.
