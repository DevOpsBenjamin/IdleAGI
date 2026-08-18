import Decimal from 'break_infinity.js'
import type { ParadigmDefinition, ParadigmId } from '@/types/paradigm'
import {
  PARADIGMS,
  TIER_2_MIN_PARAMETERS,
  INSIGHT_PARAMETER_DIVISOR,
  PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT,
} from '@/domain/constants/paradigms'

export interface ParadigmMultipliers {
  tflopsMultiplier: number
  powerReduction: number
  vramEfficiency: number
  syntheticSpeedBonus: number
  passiveTflopsMultiplier: number
  hasNoThrottling: boolean
}

export class ParadigmEngine {
  /**
   * Checks if the model parameters meet the threshold for Tier 2 Paradigm Shift (1B params).
   */
  public static canTriggerTier2(parameters: Decimal): boolean {
    return parameters.gte(TIER_2_MIN_PARAMETERS)
  }

  /**
   * Calculates pending Fundamental Insights (Phi) from current parameters:
   * Phi = floor( (parameters / 10^9) ^ 0.5 )
   */
  public static calculatePendingInsights(parameters: Decimal): number {
    if (parameters.lt(TIER_2_MIN_PARAMETERS)) {
      return 0
    }
    const scaled = parameters.div(INSIGHT_PARAMETER_DIVISOR).toNumber()
    return Math.floor(Math.sqrt(scaled))
  }

  /**
   * Calculates the universal passive compute multiplier from total insights:
   * mu_paradigm_passive = 1.0 + (totalInsights * 0.10)
   */
  public static calculatePassiveTflopsMultiplier(totalInsightsEarned: number): number {
    return 1.0 + Math.max(0, totalInsightsEarned) * PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT
  }

  /**
   * Retrieves definition for a paradigm ID.
   */
  public static getParadigmDefinition(id: ParadigmId): ParadigmDefinition {
    return PARADIGMS[id] || PARADIGMS.dense_transformer
  }

  /**
   * Checks if a locked paradigm can be unlocked.
   */
  public static canUnlockParadigm(
    id: ParadigmId,
    availableInsights: number,
    unlockedIds: ParadigmId[]
  ): boolean {
    if (unlockedIds.includes(id)) {
      return false
    }
    const def = this.getParadigmDefinition(id)
    return availableInsights >= def.cost
  }

  /**
   * Checks if a paradigm can be selected as active.
   */
  public static canSelectParadigm(id: ParadigmId, unlockedIds: ParadigmId[]): boolean {
    return unlockedIds.includes(id)
  }

  /**
   * Computes active multipliers for a given paradigm and total insights.
   */
  public static calculateMultipliers(
    activeParadigmId: ParadigmId,
    totalInsightsEarned: number
  ): ParadigmMultipliers {
    const def = this.getParadigmDefinition(activeParadigmId)
    const passiveMult = this.calculatePassiveTflopsMultiplier(totalInsightsEarned)

    return {
      tflopsMultiplier: def.tflopsMultiplier,
      powerReduction: def.powerReduction,
      vramEfficiency: def.vramEfficiency,
      syntheticSpeedBonus: def.syntheticSpeedBonus,
      passiveTflopsMultiplier: passiveMult,
      hasNoThrottling: activeParadigmId === 'neuromorphic_spiking',
    }
  }
}
