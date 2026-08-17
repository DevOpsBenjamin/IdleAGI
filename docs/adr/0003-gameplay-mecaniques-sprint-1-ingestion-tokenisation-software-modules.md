# ADR 0003: Mécaniques de Gameplay du Sprint 1 — Ingestion, Tokenisation, Hardware T1 & Modules Logiciels

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

Pour valider le Sprint 1 de *Project Singularity Loop (IdleAGI)*, le jeu nécessite une première boucle fermée jouable d'environ 15 minutes, comprenant :
1. Une génération initiale manuelle et réactive de données brutes (*Raw Text*) avec transition vers un crawler automatisé de fond.
2. Une conversion unitaire et par lot (*Batch*) vers des unités lexicales (*Tokens $T$*) selon un ratio constant de 4 caractères par token.
3. Un pipeline de monétisation d'inférence (génération de liquidités $ / Funds) et d'entraînement initial (accumulation de Paramètres).
4. Un catalogue de matériel Tier 1 (CPU d'occasion, GPU Grand Public GTX 1080, Lame Serveur A100) avec coûts exponentiels ($C_n = C_0 \times \text{mult}^n$).
5. Un catalogue d'optimisations logicielles (*Software Modules*) activables pour accélérer le scraping, étendre les buffers RAM, optimiser le BPE et débloquer des paliers de tarification API.
6. Une couverture de tests unitaires automatisée (`vitest`) garantissant la robustesse mathématique et la non-régression de la boucle.

---

## Décision

1. **Pipeline Ingestion & Tokenisation (`IngestionPanel`)** :
   - Scraping manuel : déclenché au clic ou via la touche `Espace`, produisant initialement +10 caractères, upgradable à +30 caractères par clic.
   - Tokenisation manuelle : boutons `1 BATCH` (`T`) et `MAX` (`M`) permettant de vider instantanément le Raw Text disponible jusqu'au plafond du buffer de tokens.
   - Auto-scraping : déblocable via le module logiciel *Daemon Crawler v1.0* (+20 chars/s) et amplifiable avec *Cluster Crawler Parallèle v2.0* (+60 chars/s).
   - Auto-tokenisation : assurée proportionnellement au Compute effectif du cluster (50 tokens/s par TFLOPS de base, doublé par le module *BPE Tokenizer Vectorisé*).

2. **Tri-Allocation et Modes Prédéfinis (`AllocationPanel`)** :
   - Distribution dynamique du Compute effectif entre Inférence ($), Entraînement (Paramètres) et R&D (Recherche).
   - Boutons de préréglages instantanés :
     - *Équilibré* : 50% Inférence / 30% Entraînement / 20% R&D
     - *Cash Rush* : 80% Inférence / 10% Entraînement / 10% R&D
     - *Training* : 10% Inférence / 70% Entraînement / 20% R&D

3. **Modules Logiciels & Upgrades Système (`SoftwareUpgrades`)** :
   - Intégration d'un magasin d'optimisations logicielles persistant dans le `GameState` (`upgrades: Record<string, SoftwareUpgrade>`).
   - Effets immédiats : expansion de buffer RAM (5 000 Raw / 2 500 Tokens), monétisation Pro ($0.10 / token), refroidissement passif cuivre (+200W).

4. **Télémétrie, STDOUT & Milestones** :
   - Émission d'événements et de pensées cognitives dans le terminal cyber STDOUT lors du franchissement de jalons clés (Premier GPU acheté, 1 000 et 10 000 paramètres atteints, $1 000 accumulés).

5. **Test Suite & Validation Automatisée** :
   - Intégration de Vitest dans l'environnement de build (`npm test` / `vitest run`).
   - 12 tests unitaires couvrant l'ensemble des conversions, achats, boucles temporelles et persistance locale.

---

## Conséquences & Avantages

### Positives
- **Boucle de gameplay active et captivante** : Le joueur dispose d'un feedback immédiat, de raccourcis clavier ergonomiques et d'une progression dynamique dès les premières secondes.
- **Équilibrage sain et modulable** : Les modules logiciels offrent des choix stratégiques clairs entre automatisation, capacité de stockage et rentabilité.
- **Fiabilité technique** : 100% des mécaniques du store sont testées unitairement avec Vitest et typées strictement en TypeScript.

### Négatives / Points d'attention
- Prévoir pour le Sprint 2 l'application stricte des contraintes thermiques et énergétiques lorsque le joueur achète plusieurs GPU / Lames serveurs sans refroidissement adéquat.
