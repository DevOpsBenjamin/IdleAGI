# ADR 0023: Modélisation Mathématique du Changement de Paradigme (Tier 2) & Datasets Synthétiques

## Statut
Accepté

## Contexte
Après avoir optimisé les poids synaptiques via les soft resets du Tier 1 (Checkpoints & Talents d'Architecture ~15-30 min), le modèle de langage atteint une limite structurelle inhérente à l'architecture Transformer monolithique classique (saturation de mémoire, goulot d'étranglement de bande passante et consommation électrique élevée).

Le Sprint 5 introduit le **Prestige Tier 2 : Changement de Paradigme** (Hard reset local ~2-3h) et la **Génération de Datasets Synthétiques**. Le joueur franchit les frontières de l'architecture traditionnelle pour adopter des paradigmes révolutionnaires (*Mixture of Experts*, *Neuromorphique*, *Quantum AI*) financés par les **Insights Fondamentaux ($\Phi$)**, tout en débloquant la production de données synthétiques auto-générées assujettie au risque de **Model Collapse** (Effondrement de modèle).

## Décisions

1. **Seuil d'Activation & Calcul des Insights Fondamentaux ($\Phi$)** :
   - **Condition de déclenchement** : Accessible dès que le modèle accumule au moins $1.00 \times 10^9$ **Paramètres** ($1\text{ Milliard / 1B}$).
   - **Formule des Insights Fondamentaux ($\Phi$)** :
     $$\Phi = \left\lfloor \left( \frac{\text{Parameters}}{10^9} \right)^{0.5} \right\rfloor$$
     *(Ex: $1\text{B} \to 1\ \Phi$, $4\text{B} \to 2\ \Phi$, $9\text{B} \to 3\ \Phi$, $16\text{B} \to 4\ \Phi$, $100\text{B} \to 10\ \Phi$)*
   - **Bonus Passif Universel ($\mu_{\text{paradigm\_passive}}$)** : Chaque Insight accumulé confère un bonus permanent de $+10\%$ sur la puissance brute de calcul ($+10\% \text{ TFLOPS}$ par $\Phi$).
     $$\mu_{\text{paradigm\_passive}} = 1.0 + \Phi_{\text{total}} \times 0.10$$

2. **Périmètre du Hard Reset Local (Scope Tier 2)** :
   - **Éléments conservés (Permanents)** :
     - Points d'Architecture ($AP$) totaux et non dépensés du Tier 1.
     - Nœuds débloqués de l'Arbre de Talents d'Architecture.
     - Insights Fondamentaux ($\Phi$) totaux et disponibles.
     - Paradigmes architecturaux débloqués et achetés.
     - Statistiques de vie complètes (nombre de prestiges T1/T2, temps total, records).
   - **Éléments réinitialisés (Volatiles)** :
     - Devises : Raw Text ($0$), Tokens ($0$), Funds (\$0), Paramètres non-figés ($0$).
     - Hardware : Retour à la station hôte de départ (Phase 0 / Station initiale).
     - Upgrades logicielles courantes (scripts, modules de base) non rattachées à l'arbre permanent.
     - Jauges physiques et cognitives : Entropie ($0\%$), Refroidissement et Grille électrique restaurés aux valeurs initiales.

3. **Catalogue des 4 Paradigmes Architecturaux Fondamentaux** :
   Le joueur débloque et active un paradigme architectural actif qui modifie radicalement les lois de simulation :

   | Id | Nom du Paradigme | Coût | Multiplicateurs & Effets Métier |
   | :--- | :--- | :--- | :--- |
   | `dense_transformer` | **Dense Monolithic Transformer** | $0\ \Phi$ | **Baseline** : Ratio VRAM standard 1:1, consommation électrique et TFLOPS nominaux ($\mu_{\text{tflops}} = 1.0$, $\mu_{\text{power}} = 1.0$). |
   | `mixture_of_experts` | **Mixture of Experts (MoE)** | $1\ \Phi$ | **Sparse Gating (Top-2 Experts)** : Seuls 20% des paramètres sont actifs par token $\implies$ $+150\%$ de vitesse de calcul brute ($\mu_{\text{tflops}} = 2.5$), efficacité VRAM doublée. |
   | `neuromorphic_spiking` | **Neuromorphic Spiking Matrix** | $5\ \Phi$ | **Event-Driven Bio-Silicon** : Calcul asynchrone par impulsions $\implies$ Consommation électrique divisée par 4 ($-75\%$ Watts, $P_{\text{draw}} \times 0.25$), température opérationnelle plancher ($30^\circ\text{C}$) et suppression totale du thermal throttling. |
   | `quantum_annealed` | **Quantum-Annealed Matrix Core** | $20\ \Phi$ | **Quantum Superposition Core** : Puissance de calcul multipliée par 10 ($\mu_{\text{tflops}} = 10.0$), auto-génération quantique de tokens et déverrouillage de la passerelle vers la Singularité Tier 3. |

4. **Mécanique des Datasets Synthétiques (Synthetic Data Generation)** :
   - **Production Autonome de Données** : Débloqué dès le Tier 2, le générateur synthétique convertit une fraction du Compute et du modèle en flux continu de Raw Text et Tokens synthétiques sans intervention manuelle :
     $$\text{SyntheticRate} = \text{EffectiveCompute} \times \mu_{\text{synthetic\_speed}} \quad (\text{chars/s})$$
   - **Ratio Synthétique ($R_{\text{synth}}$)** :
     $$R_{\text{synth}} = \frac{\text{SyntheticRawTextProduced}}{\text{TotalRawTextIngested}} \in [0.0, 1.0]$$

5. **Modélisation du Model Collapse (Effondrement de Modèle)** :
   - Si le modèle s'entraîne sur un ratio synthétique trop élevé sans filtrage adéquat ($R_{\text{synth}} > 70\%$) :
     - **Taux de dérive d'entropie doublé** : $\Delta E_{\text{drift}} \times 2.0$.
     - **Pénalité d'efficacité d'entraînement** : $\mu_{\text{training}} \times 0.50$ (saturation de redondance).
   - **Modules Logiciels de Sécurité & Filtrage Synthétique (R&D Tier 2)** :
     - *RLAIF (AI Feedback Alignment)* : Coût 10 000 Funds — Réduit la dérive synthétique de $-40\%$ et repousse le seuil critique à $85\%$.
     - *Syntactic Diversity Evaluator* : Coût 50 000 Funds — Annule totalement le malus d'entraînement lié aux données synthétiques.
     - *Synthetic Density Filter* : Coût 250 000 Funds — Permet une ingestion $100\%$ synthétique sans aucune instabilité ni Model Collapse.

6. **Typage TypeScript Strict (`src/types/paradigm.ts`)** :
   ```typescript
   import type Decimal from 'break_infinity.js'

   export type ParadigmId = 
     | 'dense_transformer' 
     | 'mixture_of_experts' 
     | 'neuromorphic_spiking' 
     | 'quantum_annealed'

   export interface ParadigmDefinition {
     readonly id: ParadigmId
     readonly name: string
     readonly cost: number // in Fundamental Insights (Phi)
     readonly description: string
     readonly tflopsMultiplier: number
     readonly powerReduction: number // e.g. 0.75 for -75% power draw
     readonly vramEfficiency: number
     readonly syntheticSpeedBonus: number
     readonly quote: string
   }

   export interface ParadigmState {
     insights: Decimal
     totalInsightsEarned: Decimal
     activeParadigm: ParadigmId
     unlockedParadigms: ParadigmId[]
     syntheticTextProduced: Decimal
     syntheticRatio: number
     modelCollapseActive: boolean
   }
   ```

## Conséquences
- La progression gagne un palier de prestige stratégique profond (Tier 2) articulé autour de 4 architectures transformatrices.
- La mécanique de données synthétiques libère le joueur du goulot d'étranglement de l'ingestion manuelle tout en introduisant le danger réaliste de *Model Collapse*.
- Les spécifications pour les tickets #65 (Interface UI) et #66 (Moteur & Intégration Tick) sont parfaitement délimitées et typées.
