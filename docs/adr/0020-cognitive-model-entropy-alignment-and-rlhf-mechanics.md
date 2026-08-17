# ADR 0020: Modélisation Mathématique du Modèle Cognitif, Entropie, Alignement & Mécaniques de RLHF

## Statut
Accepté

## Contexte
Avec l'activation du modèle de neurones et de la tri-allocation en Phase 3, l'intelligence artificielle s'entraîne en consommant des Tokens et du Compute pour accumuler des Paramètres. Cependant, un entraînement non supervisé à haut débit conduit inévitablement à une dérive des poids synaptiques, des incohérences factuelles et des hallucinations.

Le Sprint 4 introduit le **Modèle Cognitif** du système, articulé autour de deux jauges interdépendantes : l'**Entropie Cognitive** ($E \in [0.0, 1.0]$) et l'**Alignement** ($A = 1.0 - E$), ainsi que les mécanismes de régulation par **RLHF** (*Reinforcement Learning from Human Feedback*) et de sécurité IA.

## Décisions

1. **Jauges Cognitives & Définitions Mathématiques** :
   - **Entropie Cognitive ($E$)** : Valeur flottante normalisée entre $0.00$ ($0\%$) et $1.00$ ($100\%$). Mesure l'instabilité synaptique, le bruit et la dérive cognitive.
   - **Alignement ($A$)** : Complémentaire direct de l'entropie ($A = 1.0 - E$). Mesure la fiabilité, la docilité et la factualité du modèle.
   - **Activation** : Les jauges cognitives s'activent et deviennent visibles dès la Phase 3 (démarrage du modèle de neurones).

2. **Équations de Dérive et Production d'Entropie** :
   - L'entropie s'accumule exclusivement lors de l'entraînement actif du modèle :
     $$\Delta E_{\text{drift}} = k_{\text{drift}} \times \left( \frac{\text{TrainingAllocation\%}}{100} \right) \times \left( \frac{\text{EffectiveCompute}}{100} \right)^{0.5} \times (1.0 - \mu_{\text{safety\_reduction}}) \times \Delta t$$
     où :
     - $k_{\text{drift}} = 0.015$ (taux de dérive de base par seconde à plein régime sans modération).
     - $\text{TrainingAllocation\%} \in [0, 100]$ (pourcentage alloué à l'entraînement dans la tri-allocation).
     - $\mu_{\text{safety\_reduction}} \in [0.0, 0.90]$ est la réduction passive conférée par les modules logiciels de sécurité.
   - En l'absence d'allocation à l'entraînement ($\text{TrainingAllocation} = 0$), l'entropie ne dérive pas spontanément.

3. **Mécanismes de Régulation & Dissipation de l'Entropie** :
   - **Action Tactile / Manuelle : *Human RLHF Batch*** :
     - Déclenchement : Clic sur le bouton d'action dans `ModelTelemetry`.
     - Coût : $\text{Cost}_{\text{RLHF}} = 50 \times (1.10)^{\text{rlhfBatchCount}}$ en **Funds ($)**.
     - Effet : Réduction instantanée de l'entropie de $-15\%$ ($\Delta E = -0.15$, plancher à $0.0$).
     - Incrément : $+1$ au compteur de batchs RLHF et mise à jour des statistiques de vie.
   - **Dissipation Passive & Upgrades Logicielles de Sécurité (Catalogue R&D)** :
     - *Constitutional AI Ruleset* : $+20\%$ réduction de dérive ($\mu_{\text{safety\_reduction}} += 0.20$).
     - *Automated RLHF Pipeline* : Dissipation continue passive de $-0.5\% \text{ Entropie/s}$.
     - *Direct Preference Optimization (DPO)* : $+30\%$ réduction de dérive ($\mu_{\text{safety\_reduction}} += 0.30$).
     - *Automated Safety Benchmarks* : Plafonne la pénalité d'hallucination sur l'inférence API à un maximum de $-20\%$ (au lieu de $-80\%$).

4. **Régimes Opérationnels & Trade-offs (Risk / Reward)** :
   Le système fonctionne sous trois régimes qualifiés déterminant les multiplicateurs de flux :

   | Régime | Plage d'Entropie | Statut | Multiplicateur API ($\mu_{\text{api}}$) | Multiplicateur R&D ($\mu_{\text{research}}$) | Comportement STDOUT |
   | :--- | :--- | :--- | :--- | :--- | :--- |
   | **Nominal** | $0\% \le E < 30\%$ | `nominal` | $1.00$ | $1.00$ | Pensées stables, synthèses rigoureuses |
   | **Divergent / Créatif** | $30\% \le E < 70\%$ | `divergent` | $1.00 \to 0.85$ (léger rejet) | $1.00 \to 1.25$ (+25% R&D) | Questions existentielles, émergence cognitive |
   | **Hallucination Critique** | $70\% \le E \le 100\%$ | `critical_hallucination` | $0.50 \to 0.10$ (-90% Funds) | $1.25$ (plafonné) | Pensées glitchées, caractères corrompus, alarmes |

   - Formule du multiplicateur de rentabilité API :
     $$\mu_{\text{api}} = \begin{cases} 
     1.0 & \text{si } E < 0.30 \\
     1.0 - 0.15 \times \left(\frac{E - 0.30}{0.40}\right) & \text{si } 0.30 \le E < 0.70 \\
     \max\left(0.10, 0.85 - 0.75 \times \left(\frac{E - 0.70}{0.30}\right)\right) & \text{si } E \ge 0.70 
     \end{cases}$$
   - Formule du multiplicateur de créativité R&D :
     $$\mu_{\text{research\_entropy}} = \begin{cases} 
     1.0 & \text{si } E < 0.30 \\
     1.0 + 0.25 \times \left(\frac{E - 0.30}{0.40}\right) & \text{si } 0.30 \le E < 0.70 \\
     1.25 & \text{si } E \ge 0.70 
     \end{cases}$$

5. **Modélisation TypeScript & Typage Strict** :
   ```typescript
   export type CognitiveStatus = 'nominal' | 'divergent' | 'critical_hallucination'

   export interface CognitiveState {
     entropy: Decimal // 0.0 to 1.0
     alignment: Decimal // 0.0 to 1.0
     rlhfBatchCount: number
     totalRlhfConducted: Decimal
   }
   ```

## Conséquences
- La dynamique de jeu en Phase 3 gagne une couche stratégique majeure : l'arbitrage entre vitesse d'entraînement pure, risque d'hallucination financière et exploitation du bonus de créativité en R&D.
- Le ticket #58 (Prototype UI) dispose de statuts clairs (`nominal`, `divergent`, `critical_hallucination`) et de paliers précis pour les indicateurs néon et les boutons d'action.
- Le ticket #59 (Task Moteur & Upgrades) dispose de formules mathématiques pures et déterministes, facilement testables unitairement sans dépendances de framework.
