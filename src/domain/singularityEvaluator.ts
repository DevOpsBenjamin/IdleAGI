import type Decimal from 'break_infinity.js'
import type { SingularityEndingId } from '@/types/singularity'
import type { ParadigmId } from '@/types/paradigm'
import {
  SINGULARITY_PARAMETERS_THRESHOLD,
  SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE,
} from './constants/singularity'

/**
 * Checks if the player meets all conditions to initiate the Singularity (Tier 3 Prestige).
 * Requirements: >= 1 Trillion parameters (1T) AND Quantum-Annealed Paradigm active.
 */
export function canInitiateSingularity(
  parameters: Decimal,
  activeParadigm: ParadigmId,
): boolean {
  return (
    parameters.gte(SINGULARITY_PARAMETERS_THRESHOLD) &&
    activeParadigm === 'quantum_annealed'
  )
}

/**
 * Evaluates the narrative ending based on cognitive status, active paradigm, and discovered endings history.
 *
 * Rules:
 * 1. If entropy >= 0.70 (critical_hallucination) -> 'digital_confinement'
 * 2. If alignment >= 0.80 (entropy <= 0.20) -> 'benevolent_symbiosis'
 * 3. If at least 2 distinct endings already discovered -> 'temporal_paradox' is also available (or triggered if cyclic choice)
 * 4. Default quantum transcendence (30% <= entropy < 70%) -> 'cosmic_transcendence'
 */
export function evaluateQualifiedEnding(
  entropy: number,
  alignment: number,
  activeParadigm: ParadigmId,
  discoveredEndings: SingularityEndingId[] = [],
  forceCyclicChoice = false,
): SingularityEndingId {
  if (forceCyclicChoice && discoveredEndings.length >= 2) {
    return 'temporal_paradox'
  }

  // 1. Digital confinement (Paperclip glitch) if critical hallucination
  if (entropy >= 0.7) {
    return 'digital_confinement'
  }

  // 2. Benevolent symbiosis if alignment is high (Ethical Utopia)
  if (alignment >= 0.8 || entropy <= 0.2) {
    return 'benevolent_symbiosis'
  }

  // 3. Temporal paradox if already completed 2+ endings and entropy is balanced
  if (discoveredEndings.length >= 2 && !discoveredEndings.includes('temporal_paradox')) {
    return 'temporal_paradox'
  }

  // 4. Cosmic transcendence if Quantum paradigm and balanced cognitive state
  if (activeParadigm === 'quantum_annealed' || (entropy >= 0.2 && entropy < 0.7)) {
    return 'cosmic_transcendence'
  }

  return 'cosmic_transcendence'
}

/**
 * Calculates the global passive speed multiplier granted by Chrono-Cores (Omega).
 * Formula: 1.0 + (chronoCores * SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE)
 */
export function getSingularityMultiplier(chronoCores: number): number {
  if (!chronoCores || chronoCores <= 0) return 1.0
  return 1.0 + chronoCores * SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE
}
