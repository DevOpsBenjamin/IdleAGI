# ADR 0021: Interface Cyber-Cognitive, Jauges d'Entropie/Alignement & Interactions Tactiles RLHF

## Statut
Accepté

## Contexte
Suite à la modélisation mathématique du Modèle Cognitif (ADR 0020), l'intelligence artificielle subit une dérive entropique lors de l'entraînement non supervisé en Phase 3. Cette dérive fait osciller le système entre trois régimes opérationnels (`nominal`, `divergent`, `critical_hallucination`), influençant la rentabilité des requêtes API et conférant un bonus d'émergence créative en R&D.

Pour donner au joueur un retour visuel immersif et un contrôle direct sur la santé mentale et synaptique de l'IA, le ticket #58 requiert la conception de l'interface cyber-cognitive au sein de `ModelTelemetry.vue` et du Dashboard.

## Décisions

1. **Découpage Modulaire & Principe de Responsabilité Unique (SRP)** :
   - Pour maintenir une granularité stricte et respecter le plafond de taille (< 250-300 lignes), les métriques cognitives sont isolées dans un composant dédié : `src/components/telemetry/CognitiveTelemetry.vue`.
   - `ModelTelemetry.vue` orchestre l'ensemble des panneaux de télémétrie du modèle (cartes de complexité et bande passante, section cognitive et bannière de prestige Tier 1).

2. **Conception Cyber-Visuelle des Jauges Cognitives** :
   - **Jauge d'Entropie ($E \in [0.0, 1.0]$)** :
     - Affiche la dérive synaptique en pourcentage ($0.0\% \to 100.0\%$).
     - Barre de progression dynamique avec codes couleur réactifs :
       - `nominal` ($E < 30\%$) : Vert néon `#00FF66`, lueur subtile, statut `[STABLE / NOMINAL]`.
       - `divergent` ($30\% \le E < 70\%$) : Ambre cyberpunk `#FFB800`, lueur d'émergence, statut `[ÉMERGENT / CRÉATIF]`.
       - `critical_hallucination` ($E \ge 70\%$) : Rouge écarlate glitch `#EF4444`, lueur d'alerte et animation de pulsation, statut `[HALLUCINATION CRITIQUE]`.
     - Indicateur d'activité : micro-pulse ambre lorsque l'entraînement est actif.
   - **Jauge d'Alignement ($A = 1.0 - E$)** :
     - Jauge complémentaire avec barre cyan `#38BDF8` mesurant la docilité et la factualité du modèle ($100.0\% \to 0.0\%$).
   - **Badges d'Impact en Temps Réel** :
     - Multiplicateur de prix API ($\mu_{\text{api}}$) : `x1.00` (vert) $\to$ `x0.85` (ambre) $\to$ `x0.10` (rouge critique).
     - Multiplicateur de créativité R&D ($\mu_{\text{research}}$) : `+0%` (neutre) $\to$ `+25%` (ambre/cyan créatif).

3. **Bouton d'Action Tactile : *Human RLHF Batch*** :
   - Cible tactile ergonomique conforme aux standards Mobile-First ($\ge 44-48\text{px}$, `touch-manipulation`, `active:scale-95`).
   - Coût dynamique affiché en temps réel : $\text{Cost} = 50 \times (1.10)^{\text{count}}$ en **Funds ($)**.
   - Effet immédiat explicite : `-15% Entropie` (plancher à 0%).
   - Compteur de batchs réalisés : badge discret `(#n)`.
   - Désactivation intelligente avec feedback visuel clair si les fonds sont insuffisants (`funds < cost`) ou si l'entropie est déjà nulle ($E \le 0\%$).

4. **Bannière d'Alerte & Alarme de Glitch ($E \ge 70\%$)** :
   - Bandeau d'alarme cyberpunk (`bg-[#EF4444]/15 border-[#EF4444]/50 animate-pulse`) affichant l'icône `AlertTriangle` et le message de rejet financier sévère sur l'API (jusqu'à -90%).

5. **Typage Strict TypeScript (`src/types/cognitive.ts`)** :
   - `CognitiveStatus` : `'nominal' | 'divergent' | 'critical_hallucination'`.
   - `CognitiveState`, `SerializedCognitiveState`, `CognitiveImpactMultipliers`.

## Conséquences
- L'interface utilisateur de Phase 3 s'enrichit d'une couche visuelle dynamique à fort impact ergonomique et narratif.
- Le joueur visualise instantanément le risque et la récompense de la dérive entropique (bonus R&D vs perte de rentabilité API).
- Les composants `ModelTelemetry.vue` et `CognitiveTelemetry.vue` sont entièrement couverts par des tests unitaires (`src/__tests__/modelTelemetry.spec.ts`) et prêts pour le câblage avec `CognitiveEngine` dans le ticket #59.
