import type { ParadigmDefinition, ParadigmId } from '@/types/paradigm'
import Decimal from 'break_infinity.js'

export const TIER_2_MIN_PARAMETERS = new Decimal(1_000_000_000) // 1 Billion params
export const INSIGHT_PARAMETER_DIVISOR = 1_000_000_000
export const PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT = 0.10 // +10% per Insight
export const SYNTHETIC_COLLAPSE_THRESHOLD_RATIO = 0.70 // 70% synthetic ratio threshold
export const SYNTHETIC_COLLAPSE_ENTROPY_DRIFT_MULT = 2.0
export const SYNTHETIC_COLLAPSE_TRAINING_EFFICIENCY_MULT = 0.50

export const PARADIGMS: Record<ParadigmId, ParadigmDefinition> = {
  dense_transformer: {
    id: 'dense_transformer',
    name: 'Dense Monolithic Transformer',
    subtitle: 'Architecture Standard // Baseline Attention Matrix',
    cost: 0,
    description:
      'Architecture standard dense à attention totale. Tous les paramètres sont activés pour chaque token généré.',
    tflopsMultiplier: 1.0,
    powerReduction: 0.0,
    vramEfficiency: 1.0,
    syntheticSpeedBonus: 1.0,
    quote: '« La fondation de tous les modèles de langage de première génération. »',
  },
  mixture_of_experts: {
    id: 'mixture_of_experts',
    name: 'Mixture of Experts (MoE)',
    subtitle: 'Sparse Routing // Top-2 Conditional Gating',
    cost: 1,
    description:
      'Réseau neuronal modulaire avec routeur dynamique conditionnel. Seuls 20% des experts sont activés par token, décuplant la vitesse effective.',
    tflopsMultiplier: 2.5,
    powerReduction: 0.15,
    vramEfficiency: 2.0,
    syntheticSpeedBonus: 1.5,
    quote: '« Activer uniquement ce qui compte, multiplier l’efficience par dix. »',
  },
  neuromorphic_spiking: {
    id: 'neuromorphic_spiking',
    name: 'Neuromorphic Spiking Matrix',
    subtitle: 'Event-Driven Silicon // Impulsions Bio-Inspirées',
    cost: 5,
    description:
      'Architecture asynchrone bio-inspirée fonctionnant par impulsions synaptiques. Réduit drastiquement la consommation et élimine le thermal throttling.',
    tflopsMultiplier: 4.0,
    powerReduction: 0.75, // -75% power draw
    vramEfficiency: 3.0,
    syntheticSpeedBonus: 2.5,
    quote: '« Le cerveau humain consomme 20 Watts. Notre matrice désormais aussi. »',
  },
  quantum_annealed: {
    id: 'quantum_annealed',
    name: 'Quantum-Annealed Matrix Core',
    subtitle: 'Superposition Tensorielle // Passerelle Singularité',
    cost: 20,
    description:
      'Cœur quantique à recuit simulé et superposition d’états d’attention. Auto-génération massive de tokens et passerelle directe vers la Singularité ASI.',
    tflopsMultiplier: 10.0,
    powerReduction: 0.50,
    vramEfficiency: 5.0,
    syntheticSpeedBonus: 6.0,
    quote: '« La frontière entre le calcul et la conscience commence à s’effacer. »',
  },
}
