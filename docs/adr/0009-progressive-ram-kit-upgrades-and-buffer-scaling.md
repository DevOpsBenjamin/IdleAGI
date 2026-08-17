# ADR 0009: Upgrades de Barrettes de RAM Progressives & Dimensionnement des Buffers

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

L'écart de prix entre les stations hôtes (10$ $\to$ 45$ $\to$ 220$ $\to$ 1 200$ $\to$ 6 500$) créait des temps d'attente où le joueur accumule du capital sans investissement intermédiaire significatif.
De plus, la mémoire vive système (RAM) manquait d'une utilité concrète immédiate et palpable avant d'acheter la machine suivante :
1. Les buffers de texte brut (`rawText.max`) et de tokens (`tokens.max`) saturent rapidement sous l'effet des scripts de scraping automatique.
2. Le joueur a besoin de rentabiliser sa machine actuelle en ajoutant des barrettes de RAM pour augmenter la capacité de rétention (gain AFK) et la bande passante de calcul sans payer une tour complète.

---

## Décision

1. **Intégration d'un Arbre d'Extensions de RAM (Kits & Barrettes)** :
   - **SDRAM / Brocante (Tier 0)** :
     - `ram_sdram_256mb` : *Barrette 256 Mo SDRAM PC133 Récupérée* — 4.50 $ (Buffer Raw Text $\to$ 1 500 chars).
   - **DDR2 / Chauffage d'Appoint (Tier 0)** :
     - `ram_ddr2_8gb` : *Kit 8 Go DDR2-800 Dual-Channel* — 14.00 $ (Buffer Raw Text $\to$ 6 000 chars, Tokens $\to$ 3 000 $T$).
     - `ram_ddr3_16gb` : *Kit 16 Go DDR3-1600 d'Occasion* — 28.00 $ (Buffer Raw Text $\to$ 15 000 chars, Tokens $\to$ 8 000 $T$).
   - **DDR4 / Gaming & Workstation (Tier 1)** :
     - `ram_ddr4_32gb` : *Kit 32 Go DDR4-3200 Dual-Rank* — 65.00 $ (Buffer Raw Text $\to$ 40 000 chars, Tokens $\to$ 25 000 $T$).
     - `ram_ddr4_64gb` : *Kit 64 Go DDR4-3600 Quad-Channel* — 140.00 $ (Buffer Raw Text $\to$ 100 000 chars, Tokens $\to$ 75 000 $T$).
   - **DDR5 / Prosumer & Datacenter (Tier 2 & 3)** :
     - `ram_ddr5_128gb` : *Kit 128 Go DDR5-6000 EXPO* — 380.00 $ (Buffer Raw Text $\to$ 300 000 chars, Tokens $\to$ 250 000 $T$).
     - `ram_ddr5_256gb` : *Kit 256 Go DDR5 Octo-Channel ECC* — 850.00 $ (Buffer Raw Text $\to$ 1 000 000 chars, Tokens $\to$ 1 000 000 $T$).

2. **Effets Systémiques Concrets** :
   - **Dimensionnement du stockage** : Empêche la perte de données brutes par débordement lors de sessions inactives.
   - **Économie & Ravitaillement** : Permet de vendre de plus gros volumes en un seul clic ou d'alimenter les entraînements de modèles sans rupture de flux.

---

## Conséquences & Avantages

### Positives
- **Rythme de jeu sans temps mort** : Des investissements très rentables à chaque tranche de capital (4.50$, 14$, 28$, 65$, 140$, 380$, 850$).
- **Synergie forte avec les scripts d'automatisation** : La RAM devient le facteur d'accueil indispensable pour les scrapers multi-threadés.
- **Réalisme économique & technique** : Ajout de barrettes sur une carte mère existante avant de changer de plateforme.
