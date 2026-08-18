import type Decimal from 'break_infinity.js'
import type {
  SingularityEndingId,
  SingularityEndingDefinition,
} from '@/types/singularity'
import type { ParadigmId } from '@/types/paradigm'
import {
  SINGULARITY_PARAMETERS_THRESHOLD,
  SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE,
  SINGULARITY_ENDINGS,
} from '@/domain/constants/singularity'

export class SingularityEngine {
  /**
   * Checks if the model parameters and active paradigm satisfy the conditions
   * to initiate the Tier 3 Singularity Ascension (1T parameters + Quantum-Annealed Paradigm).
   */
  public static canInitiateSingularity(
    parameters: Decimal,
    activeParadigm: ParadigmId
  ): boolean {
    return (
      parameters.gte(SINGULARITY_PARAMETERS_THRESHOLD) &&
      activeParadigm === 'quantum_annealed'
    )
  }

  /**
   * Deterministically evaluates the qualified narrative ending based on cognitive status (entropy, alignment),
   * active paradigm, and discovered endings history.
   *
   * Priority Rules:
   * 1. If forceCyclicChoice is true and at least 2 distinct endings already discovered -> 'temporal_paradox'
   * 2. If entropy >= 0.70 (critical_hallucination) -> 'digital_confinement' (Paperclip Glitch)
   * 3. If alignment >= 0.80 (or entropy <= 0.20) -> 'benevolent_symbiosis' (Ethical Utopia)
   * 4. If at least 2 distinct endings already discovered and 'temporal_paradox' not yet discovered -> 'temporal_paradox'
   * 5. If Quantum paradigm and balanced cognitive state (0.20 <= entropy < 0.70) -> 'cosmic_transcendence'
   * 6. Default fallback -> 'cosmic_transcendence'
   */
  public static evaluateQualifiedEnding(
    entropy: number,
    alignment: number,
    activeParadigm: ParadigmId,
    discoveredEndings: SingularityEndingId[] = [],
    forceCyclicChoice = false
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
    if (
      discoveredEndings.length >= 2 &&
      !discoveredEndings.includes('temporal_paradox')
    ) {
      return 'temporal_paradox'
    }

    // 4. Cosmic transcendence if Quantum paradigm and balanced cognitive state
    if (activeParadigm === 'quantum_annealed' || (entropy >= 0.2 && entropy < 0.7)) {
      return 'cosmic_transcendence'
    }

    return 'cosmic_transcendence'
  }

  /**
   * Computes the universal passive speed multiplier granted by accumulated Chrono-Cores (Omega).
   * Formula: 1.0 + (chronoCores * 1.0) -> x2.0 at 1 core, x3.0 at 2 cores, etc.
   */
  public static calculateGlobalMultiplier(chronoCores: number): number {
    if (!chronoCores || chronoCores <= 0) {
      return 1.0
    }
    return 1.0 + chronoCores * SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE
  }

  /**
   * Retrieves definition for a given narrative ending ID.
   */
  public static getEndingDefinition(id: SingularityEndingId): SingularityEndingDefinition {
    return SINGULARITY_ENDINGS[id] ?? SINGULARITY_ENDINGS.cosmic_transcendence
  }

  /**
   * Returns all 4 canonical narrative ending definitions.
   */
  public static getAllEndings(): SingularityEndingDefinition[] {
    return Object.values(SINGULARITY_ENDINGS)
  }

  /**
   * Checks if an ending has already been discovered.
   */
  public static isEndingDiscovered(
    id: SingularityEndingId,
    discoveredEndings: SingularityEndingId[]
  ): boolean {
    return discoveredEndings.includes(id)
  }

  /**
   * Counts how many distinct endings have been discovered.
   */
  public static getDiscoveredCount(discoveredEndings: SingularityEndingId[]): number {
    return new Set(discoveredEndings).size
  }

  /**
   * Checks if all 4 narrative endings have been discovered.
   */
  public static hasDiscoveredAllEndings(
    discoveredEndings: SingularityEndingId[]
  ): boolean {
    const unique = new Set(discoveredEndings)
    return Object.keys(SINGULARITY_ENDINGS).every((key) =>
      unique.has(key as SingularityEndingId)
    )
  }
}
