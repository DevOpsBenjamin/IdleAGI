import Decimal from 'break_infinity.js'
import type { SoftwareUpgrade } from '@/types/upgrades'
import type {
  CognitiveState,
  CognitiveStatus,
  CognitiveImpactMultipliers,
} from '@/types/cognitive'

export interface CognitiveTickContext {
  entropy: Decimal
  alignment: Decimal
  trainingPercent: number
  effectiveCompute: Decimal
  upgrades: Record<string, SoftwareUpgrade>
  isTrainingUnlocked: boolean
  syntheticDriftMultiplier?: number
}

export interface CognitiveTickResult {
  entropy: Decimal
  alignment: Decimal
  driftAmount: Decimal
  passiveDissipationAmount: Decimal
  status: CognitiveStatus
  apiMultiplier: number
  researchMultiplier: number
}

export class CognitiveEngine {
  public static readonly BASE_DRIFT_RATE = 0.015
  public static readonly RLHF_BASE_COST = 50.0
  public static readonly RLHF_COST_GROWTH = 1.10
  public static readonly RLHF_ENTROPY_REDUCTION = 0.15
  public static readonly SAFETY_CONSTITUTIONAL_AI_REDUCTION = 0.20
  public static readonly SAFETY_DPO_REDUCTION = 0.30
  public static readonly SAFETY_AUTOMATED_RLHF_PASSIVE_RATE = 0.005 // -0.5%/s
  public static readonly SAFETY_BENCHMARKS_FLOOR_API = 0.80 // Max 20% penalty

  /**
   * Calculates the passive safety reduction on entropy drift from security upgrades.
   * Capped at 90% (0.90).
   */
  public static calculateSafetyReduction(upgrades: Record<string, SoftwareUpgrade>): number {
    let reduction = 0.0
    if (upgrades.safety_constitutional_ai?.purchased) {
      reduction += this.SAFETY_CONSTITUTIONAL_AI_REDUCTION
    }
    if (upgrades.safety_dpo_optimization?.purchased) {
      reduction += this.SAFETY_DPO_REDUCTION
    }
    return Math.min(0.90, reduction)
  }

  /**
   * Calculates the passive continuous dissipation rate per second from automated RLHF pipelines.
   */
  public static calculatePassiveDissipationRate(upgrades: Record<string, SoftwareUpgrade>): number {
    if (upgrades.safety_automated_rlhf?.purchased) {
      return this.SAFETY_AUTOMATED_RLHF_PASSIVE_RATE
    }
    return 0.0
  }

  /**
   * Checks if automated safety benchmarks upgrade is active.
   */
  public static hasSafetyBenchmarks(upgrades: Record<string, SoftwareUpgrade>): boolean {
    return Boolean(upgrades.safety_benchmarks?.purchased)
  }

  /**
   * Calculates the drift amount produced over a time delta `dt`.
   * DeltaE = k_drift * (training% / 100) * (EffectiveCompute / 100)^0.5 * (1 - safetyReduction) * dt
   */
  public static calculateDriftAmount(
    trainingPercent: number,
    effectiveCompute: Decimal,
    safetyReductionMultiplier: number,
    dt: number
  ): Decimal {
    if (trainingPercent <= 0 || effectiveCompute.lte(0) || dt <= 0) {
      return new Decimal(0)
    }

    const trainingRatio = Math.max(0, Math.min(1.0, trainingPercent / 100))
    const computeRatio = effectiveCompute.div(100).max(0)
    const computeFactor = computeRatio.sqrt()
    const safetyFactor = Math.max(0.10, 1.0 - safetyReductionMultiplier)

    return computeFactor
      .mul(this.BASE_DRIFT_RATE * trainingRatio * safetyFactor * dt)
  }

  /**
   * Determines the qualitative cognitive status regime from the current entropy level.
   */
  public static calculateStatus(entropy: Decimal | number): CognitiveStatus {
    const e = entropy instanceof Decimal ? entropy.toNumber() : entropy
    if (e < 0.30) return 'nominal'
    if (e < 0.70) return 'divergent'
    return 'critical_hallucination'
  }

  /**
   * Calculates the API token price multiplier factoring in cognitive entropy and safety benchmarks.
   */
  public static calculateApiMultiplier(
    entropy: Decimal | number,
    hasSafetyBenchmarks = false
  ): number {
    const e = Math.min(1.0, Math.max(0.0, entropy instanceof Decimal ? entropy.toNumber() : entropy))

    if (e < 0.30) {
      return 1.0
    }

    if (e < 0.70) {
      // Linear decrease from 1.0 to 0.85 (-15% max at 70% entropy)
      const ratio = (e - 0.30) / 0.40
      return 1.0 - 0.15 * ratio
    }

    // Severe hallucination drop from 0.85 down to 0.10
    const ratio = (e - 0.70) / 0.30
    const unmitigated = Math.max(0.10, 0.85 - 0.75 * ratio)

    if (hasSafetyBenchmarks) {
      return Math.max(this.SAFETY_BENCHMARKS_FLOOR_API, unmitigated)
    }

    return unmitigated
  }

  /**
   * Calculates the R&D creativity research multiplier based on cognitive divergence.
   */
  public static calculateResearchMultiplier(entropy: Decimal | number): number {
    const e = Math.min(1.0, Math.max(0.0, entropy instanceof Decimal ? entropy.toNumber() : entropy))

    if (e < 0.30) {
      return 1.0
    }

    if (e < 0.70) {
      // Divergence creativity bonus up to +25%
      const ratio = (e - 0.30) / 0.40
      return 1.0 + 0.25 * ratio
    }

    return 1.25
  }

  /**
   * Calculates impact multipliers for display and economic loops.
   */
  public static calculateImpactMultipliers(
    entropy: Decimal | number,
    hasSafetyBenchmarks = false
  ): CognitiveImpactMultipliers {
    const status = this.calculateStatus(entropy)
    const apiMultiplier = this.calculateApiMultiplier(entropy, hasSafetyBenchmarks)
    const researchMultiplier = this.calculateResearchMultiplier(entropy)

    return {
      status,
      apiMultiplier,
      researchMultiplier,
    }
  }

  /**
   * Calculates the Funds ($) cost for executing the next Human RLHF Batch action.
   */
  public static calculateRlhfCost(batchCount: number): Decimal {
    return new Decimal(this.RLHF_BASE_COST).mul(Math.pow(this.RLHF_COST_GROWTH, Math.max(0, batchCount)))
  }

  /**
   * Checks whether a Human RLHF Batch action can be performed.
   */
  public static canPerformRlhf(
    funds: Decimal,
    entropy: Decimal | number,
    batchCount: number
  ): boolean {
    const e = entropy instanceof Decimal ? entropy.toNumber() : entropy
    if (e <= 0.001) return false
    const cost = this.calculateRlhfCost(batchCount)
    return funds.gte(cost)
  }

  /**
   * Applies the Human RLHF Batch action: reduces entropy by 15% (floored at 0) and increments count.
   */
  public static applyRlhf(
    currentState: CognitiveState,
    funds: Decimal
  ): { success: boolean; newState: CognitiveState; cost: Decimal } {
    if (!this.canPerformRlhf(funds, currentState.entropy, currentState.rlhfBatchCount)) {
      return { success: false, newState: currentState, cost: new Decimal(0) }
    }

    const cost = this.calculateRlhfCost(currentState.rlhfBatchCount)
    const newEntropy = Decimal.max(0, currentState.entropy.sub(this.RLHF_ENTROPY_REDUCTION))
    const newAlignment = Decimal.max(0, Decimal.min(1, new Decimal(1).sub(newEntropy)))

    return {
      success: true,
      cost,
      newState: {
        entropy: newEntropy,
        alignment: newAlignment,
        rlhfBatchCount: currentState.rlhfBatchCount + 1,
        totalRlhfConducted: currentState.totalRlhfConducted.add(1),
      },
    }
  }

  /**
   * Processes a discrete time step `dt` for cognitive entropy drift and passive dissipation.
   */
  public static processTick(
    context: CognitiveTickContext,
    dt: number
  ): CognitiveTickResult {
    const {
      entropy,
      trainingPercent,
      effectiveCompute,
      upgrades,
      isTrainingUnlocked,
      syntheticDriftMultiplier = 1.0,
    } = context

    let driftAmount = new Decimal(0)
    let passiveDissipationAmount = new Decimal(0)

    if (isTrainingUnlocked) {
      const safetyReduction = this.calculateSafetyReduction(upgrades)
      driftAmount = this.calculateDriftAmount(
        trainingPercent,
        effectiveCompute,
        safetyReduction,
        dt
      ).mul(syntheticDriftMultiplier)

      const passiveRate = this.calculatePassiveDissipationRate(upgrades)
      if (passiveRate > 0) {
        passiveDissipationAmount = new Decimal(passiveRate * dt)
      }
    }

    const netEntropyChange = driftAmount.sub(passiveDissipationAmount)
    const updatedEntropy = Decimal.max(0, Decimal.min(1, entropy.add(netEntropyChange)))
    const updatedAlignment = Decimal.max(0, Decimal.min(1, new Decimal(1).sub(updatedEntropy)))

    const hasSafetyBench = this.hasSafetyBenchmarks(upgrades)
    const status = this.calculateStatus(updatedEntropy)
    const apiMultiplier = this.calculateApiMultiplier(updatedEntropy, hasSafetyBench)
    const researchMultiplier = this.calculateResearchMultiplier(updatedEntropy)

    return {
      entropy: updatedEntropy,
      alignment: updatedAlignment,
      driftAmount,
      passiveDissipationAmount,
      status,
      apiMultiplier,
      researchMultiplier,
    }
  }
}
