import type Decimal from 'break_infinity.js'
import type { TalentNode } from '@/types/prestige'

export const PRESTIGE_TIER_1_PARAMS_THRESHOLD = 1_000_000
export const AP_CHECKPOINT_BONUS_PER_POINT = 0.05 // +5% TFLOPS per AP

export interface TalentMultipliers {
  tflopsMultiplier: number
  scrapePowerMultiplier: number
  rawTextPriceMultiplier: number
  hardwareDiscountMultiplier: number
  coolingEfficiencyMultiplier: number
  tokenGenerationMultiplier: number
}

export class PrestigeEngine {
  /**
   * Evaluates whether the current model has reached the Tier 1 checkpoint threshold (1M parameters).
   */
  public static canPrestige(parameters: Decimal): boolean {
    return parameters.gte(PRESTIGE_TIER_1_PARAMS_THRESHOLD)
  }

  /**
   * Computes expected Architecture Points (AP) from accumulated model parameters:
   * AP = floor( (parameters / 10^6) ^ 0.5 )
   */
  public static calculateArchitecturePoints(parameters: Decimal): number {
    if (parameters.lt(PRESTIGE_TIER_1_PARAMS_THRESHOLD)) {
      return 0
    }
    const scaled = parameters.div(PRESTIGE_TIER_1_PARAMS_THRESHOLD).toNumber()
    return Math.floor(Math.sqrt(scaled))
  }

  /**
   * Computes the universal checkpoint compute multiplier:
   * mu_checkpoint = 1.0 + (totalAP * 0.05)
   */
  public static calculateCheckpointMultiplier(totalArchitecturePoints: number): number {
    return 1.0 + Math.max(0, totalArchitecturePoints) * AP_CHECKPOINT_BONUS_PER_POINT
  }

  /**
   * Evaluates active talent multipliers based on unlocked nodes.
   */
  public static calculateTalentMultipliers(talents: Record<string, TalentNode>): TalentMultipliers {
    const mults: TalentMultipliers = {
      tflopsMultiplier: 1.0,
      scrapePowerMultiplier: 1.0,
      rawTextPriceMultiplier: 1.0,
      hardwareDiscountMultiplier: 1.0,
      coolingEfficiencyMultiplier: 1.0,
      tokenGenerationMultiplier: 1.0,
    }

    for (const node of Object.values(talents)) {
      if (!node.purchased) continue

      switch (node.effect.type) {
        case 'tflops_mult':
          mults.tflopsMultiplier += node.effect.value
          break
        case 'scrape_power_mult':
          mults.scrapePowerMultiplier += node.effect.value
          break
        case 'raw_text_price_mult':
          mults.rawTextPriceMultiplier += node.effect.value
          break
        case 'hardware_cost_discount':
          mults.hardwareDiscountMultiplier = Math.max(
            0.1,
            mults.hardwareDiscountMultiplier - node.effect.value
          )
          break
        case 'cooling_efficiency_mult':
          mults.coolingEfficiencyMultiplier += node.effect.value
          break
        case 'token_generation_mult':
          mults.tokenGenerationMultiplier += node.effect.value
          break
      }
    }

    return mults
  }

  /**
   * Checks if a talent node can be purchased.
   */
  public static canBuyTalent(
    nodeId: string,
    talents: Record<string, TalentNode>,
    availableAP: number
  ): { canBuy: boolean; reason?: 'already_purchased' | 'insufficient_ap' | 'missing_prerequisite' } {
    const node = talents[nodeId]
    if (!node) return { canBuy: false }

    if (node.purchased) {
      return { canBuy: false, reason: 'already_purchased' }
    }

    if (availableAP < node.cost) {
      return { canBuy: false, reason: 'insufficient_ap' }
    }

    if (node.requires && node.requires.length > 0) {
      const missing = node.requires.some((reqId) => !talents[reqId]?.purchased)
      if (missing) {
        return { canBuy: false, reason: 'missing_prerequisite' }
      }
    }

    return { canBuy: true }
  }
}
