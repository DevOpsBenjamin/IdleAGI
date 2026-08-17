import type Decimal from 'break_infinity.js'

export type TalentCategory =
  | 'transcription'
  | 'hardware'
  | 'compute'
  | 'thermodynamics'
  | 'economics'

export type TalentEffectType =
  | 'tflops_mult'
  | 'scrape_power_mult'
  | 'raw_text_price_mult'
  | 'hardware_cost_discount'
  | 'cooling_efficiency_mult'
  | 'token_generation_mult'

export interface TalentEffect {
  type: TalentEffectType
  value: number
}

export interface TalentNode {
  id: string
  name: string
  description: string
  category: TalentCategory
  tier: number
  cost: number // in Architecture Points (AP)
  purchased: boolean
  requires?: string[]
  effect: TalentEffect
  icon?: string
}

export interface PrestigeState {
  totalArchitecturePoints: number
  architecturePoints: number
  prestigeCount: number
  maxParametersReached: Decimal
  talents: Record<string, TalentNode>
}

export interface SerializedPrestigeState {
  totalArchitecturePoints: number
  architecturePoints: number
  prestigeCount: number
  maxParametersReached: string
  unlockedTalentIds: string[]
}
