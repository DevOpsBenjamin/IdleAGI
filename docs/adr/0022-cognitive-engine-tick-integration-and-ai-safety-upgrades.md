# ADR 0022: Moteur Cognitif, Intégration dans la Boucle de Tick & Upgrades de Sécurité IA

## Statut
Accepté

## Contexte
Suite à la modélisation mathématique du Modèle Cognitif (ADR 0020) et à la conception de l'interface cyber-cognitive (ADR 0021), le ticket #59 requiert l'implémentation déterministe dans le domaine de la dérive d'entropie à 20 Hz, la dissipation passive continue, l'action tactile *Human RLHF Batch*, le catalogue de 4 upgrades logicielles de sécurité (Constitutional AI, Automated RLHF, DPO, Safety Benchmarks), et la gestion réactive dans les stores Pinia.

## Décisions

1. **Couche Domaine Métier Pure (`src/domain/engine/CognitiveEngine.ts`)** :
   - Classe déterministe pure sans dépendance au framework de rendu.
   - Encapsule l'équation de dérive entropique :
     $$\Delta E_{\text{drift}} = k_{\text{drift}} \times \left(\frac{\text{TrainingAllocation\%}}{100}\right) \times \left(\frac{\text{EffectiveCompute}}{100}\right)^{0.5} \times (1.0 - \mu_{\text{safety\_reduction}}) \times \Delta t$$
     ($k_{\text{drift}} = 0.015$).
   - Encapsule la dissipation passive continue (-0.5%/s via Automated RLHF).
   - Calcule les multiplicateurs de rentabilité API ($\mu_{\text{api}} \in [1.0 \to 0.10]$ ou plafonné à $0.80$ avec Safety Benchmarks) et de créativité R&D ($\mu_{\text{research}} \in [1.0 \to 1.25]$).
   - Gère l'action de régulation manuelle *Human RLHF Batch* ($\text{Cost} = 50 \times 1.10^n$, $\Delta E = -0.15$).

2. **Intégration dans la Boucle de Simulation (`TickEngine.ts`)** :
   - Câblage de `CognitiveEngine.processTick` lors de la tri-allocation de compute en Phase 3.
   - Application directe de $\mu_{\text{api}}$ sur la génération de Funds lors de l'inférence.
   - Application directe de $\mu_{\text{research}}$ sur la génération de points de recherche.
   - Journalisation STDOUT automatique lors des transitions d'états (`nominal` $\leftrightarrow$ `divergent` $\leftrightarrow$ `critical_hallucination`).

3. **Catalogue d'Upgrades Logicielles de Sécurité (`upgrades.ts`)** :
   - `safety_constitutional_ai` : $300.00, -20% de dérive.
   - `safety_automated_rlhf` : $750.00, -0.5% entropie/s en dissipation continue.
   - `safety_dpo_optimization` : $1 500.00, -30% de dérive additionnelle.
   - `safety_benchmarks` : $3 000.00, plafonne le malus d'hallucination à -20% max (plancher $\mu_{\text{api}} \ge 0.80$).

4. **Sous-Store Pinia Modulaire (`src/stores/cognitiveStore.ts`) & Façade `gameStore.ts`** :
   - `useCognitiveStore` isole l'état réactif (`entropy`, `alignment`, `rlhfBatchCount`, `totalRlhfConducted`).
   - Persistance continue sérialisée dans `localStorage` (`serializeCognitiveState`, `deserializeCognitiveState`).
   - Réinitialisation propre lors du soft reset Tier 1 (`GameStateHydrator.performSoftReset`).

5. **Validation & Qualité (`src/__tests__/`)** :
   - Suite unitaire dédiée `cognitiveEngine.spec.ts` (19 tests).
   - Couverture dans `modularStores.spec.ts`, `gameStore.spec.ts` et `scenarioFunctional.spec.ts` (96 tests au total).

## Conséquences
- Le modèle d'apprentissage neuronal en Phase 3 dispose d'une dynamique complète de risque et de récompense.
- L'ensemble des calculs mathématiques est déterministe et validé unitairement.
