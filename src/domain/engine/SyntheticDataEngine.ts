import Decimal from 'break_infinity.js'
import type { SoftwareUpgrade } from '@/types/upgrades'
import {
  SYNTHETIC_COLLAPSE_THRESHOLD_RATIO,
  SYNTHETIC_COLLAPSE_ENTROPY_DRIFT_MULT,
  SYNTHETIC_COLLAPSE_TRAINING_EFFICIENCY_MULT,
} from '@/domain/constants/paradigms'

export interface SyntheticTickContext {
  effectiveCompute: Decimal
  syntheticSpeedBonus: number
  isSyntheticActive: boolean
  syntheticProducedSoFar: Decimal
  totalCharsReadSoFar: Decimal
  upgrades: Record<string, SoftwareUpgrade>
  dt: number
}

export interface SyntheticTickResult {
  charsProducedThisTick: Decimal
  syntheticRateCharsPerSec: Decimal
  updatedSyntheticProduced: Decimal
  updatedTotalChars: Decimal
  syntheticRatio: number
  collapseThreshold: number
  isModelCollapseActive: boolean
  syntheticDriftMultiplier: number
  syntheticTrainingEfficiencyMultiplier: number
}

export class SyntheticDataEngine {
  public static readonly BASE_COLLAPSE_THRESHOLD = SYNTHETIC_COLLAPSE_THRESHOLD_RATIO // 0.70
  public static readonly RLAIF_EXTENDED_THRESHOLD = 0.85 // 0.85
  public static readonly RLAIF_DRIFT_REDUCTION = 0.40 // -40% drift under synthetic

  /**
   * Calculates current synthetic data generation rate in chars/sec.
   * SyntheticRate = EffectiveCompute * syntheticSpeedBonus
   */
  public static calculateSyntheticRate(
    effectiveCompute: Decimal,
    syntheticSpeedBonus: number,
    isSyntheticActive: boolean
  ): Decimal {
    if (!isSyntheticActive || effectiveCompute.lte(0)) {
      return new Decimal(0)
    }
    const bonus = Math.max(0.1, syntheticSpeedBonus)
    return effectiveCompute.mul(bonus)
  }

  /**
   * Computes the proportion of synthetic text in the ingestion buffer.
   * R_synth = min(1.0, syntheticTextProduced / totalRawTextIngested)
   */
  public static calculateSyntheticRatio(
    syntheticCharsProduced: Decimal,
    totalCharsIngested: Decimal
  ): number {
    if (totalCharsIngested.lte(0) || syntheticCharsProduced.lte(0)) {
      return 0.0
    }
    const ratio = syntheticCharsProduced.div(totalCharsIngested).toNumber()
    return Math.min(1.0, Math.max(0.0, Math.round(ratio * 1000) / 1000))
  }

  /**
   * Evaluates the Model Collapse threshold based on RLAIF upgrade status.
   */
  public static calculateCollapseThreshold(upgrades: Record<string, SoftwareUpgrade>): number {
    if (upgrades.safety_rlaif?.purchased) {
      return this.RLAIF_EXTENDED_THRESHOLD
    }
    return this.BASE_COLLAPSE_THRESHOLD
  }

  /**
   * Checks if the model has full immunity to Model Collapse (Synthetic Density Filter).
   */
  public static isModelCollapseImmune(upgrades: Record<string, SoftwareUpgrade>): boolean {
    return Boolean(upgrades.safety_synthetic_density_filter?.purchased)
  }

  /**
   * Checks if the model has training penalty immunity during Model Collapse (Syntactic Diversity Evaluator).
   */
  public static hasTrainingPenaltyImmunity(upgrades: Record<string, SoftwareUpgrade>): boolean {
    return Boolean(upgrades.safety_syntactic_diversity?.purchased)
  }

  /**
   * Calculates synthetic drift reduction factor.
   */
  public static calculateSyntheticDriftReduction(upgrades: Record<string, SoftwareUpgrade>): number {
    if (upgrades.safety_rlaif?.purchased) {
      return this.RLAIF_DRIFT_REDUCTION
    }
    return 0.0
  }

  /**
   * Evaluates if Model Collapse is currently triggered.
   */
  public static isModelCollapseActive(
    syntheticRatio: number,
    threshold: number,
    isImmune = false
  ): boolean {
    if (isImmune) {
      return false
    }
    return syntheticRatio > threshold
  }

  /**
   * Computes the entropy drift multiplier caused by synthetic data / Model Collapse.
   */
  public static calculateSyntheticDriftMultiplier(
    isCollapseActive: boolean,
    driftReduction = 0.0
  ): number {
    if (!isCollapseActive) {
      return 1.0
    }
    const baseMult = SYNTHETIC_COLLAPSE_ENTROPY_DRIFT_MULT // 2.0
    return baseMult * Math.max(0.1, 1.0 - driftReduction)
  }

  /**
   * Computes training efficiency multiplier under Model Collapse.
   */
  public static calculateTrainingEfficiencyMultiplier(
    isCollapseActive: boolean,
    hasImmunity = false
  ): number {
    if (isCollapseActive && !hasImmunity) {
      return SYNTHETIC_COLLAPSE_TRAINING_EFFICIENCY_MULT // 0.50
    }
    return 1.0
  }

  /**
   * Processes a single tick for the synthetic data subsystem.
   */
  public static processTick(context: SyntheticTickContext): SyntheticTickResult {
    const {
      effectiveCompute,
      syntheticSpeedBonus,
      isSyntheticActive,
      syntheticProducedSoFar,
      totalCharsReadSoFar,
      upgrades,
      dt,
    } = context

    const rate = this.calculateSyntheticRate(effectiveCompute, syntheticSpeedBonus, isSyntheticActive)
    const charsProduced = rate.mul(dt)

    const updatedSynthetic = syntheticProducedSoFar.add(charsProduced)
    const updatedTotalChars = totalCharsReadSoFar.add(charsProduced)

    const ratio = this.calculateSyntheticRatio(updatedSynthetic, updatedTotalChars)
    const threshold = this.calculateCollapseThreshold(upgrades)
    const isImmune = this.isModelCollapseImmune(upgrades)
    const hasPenaltyImmunity = this.hasTrainingPenaltyImmunity(upgrades)
    const driftReduction = this.calculateSyntheticDriftReduction(upgrades)

    const isCollapseActive = this.isModelCollapseActive(ratio, threshold, isImmune)
    const syntheticDriftMultiplier = this.calculateSyntheticDriftMultiplier(isCollapseActive, driftReduction)
    const syntheticTrainingEfficiencyMultiplier = this.calculateTrainingEfficiencyMultiplier(
      isCollapseActive,
      hasPenaltyImmunity
    )

    return {
      charsProducedThisTick: charsProduced,
      syntheticRateCharsPerSec: rate,
      updatedSyntheticProduced: updatedSynthetic,
      updatedTotalChars: updatedTotalChars,
      syntheticRatio: ratio,
      collapseThreshold: threshold,
      isModelCollapseActive: isCollapseActive,
      syntheticDriftMultiplier,
      syntheticTrainingEfficiencyMultiplier,
    }
  }
}
