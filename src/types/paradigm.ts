import type Decimal from 'break_infinity.js'

export type ParadigmId =
  | 'dense_transformer'
  | 'mixture_of_experts'
  | 'neuromorphic_spiking'
  | 'quantum_annealed'

export interface ParadigmDefinition {
  readonly id: ParadigmId
  readonly name: string
  readonly subtitle: string
  readonly cost: number // in Fundamental Insights (Phi)
  readonly description: string
  readonly tflopsMultiplier: number
  readonly powerReduction: number // e.g. 0.75 for 75% reduction
  readonly vramEfficiency: number // multiplier on effective VRAM capacity
  readonly syntheticSpeedBonus: number
  readonly quote: string
  readonly requiredParametersForUnlock?: Decimal | number
}

export interface ParadigmState {
  insights: number
  totalInsightsEarned: number
  activeParadigm: ParadigmId
  unlockedParadigms: ParadigmId[]
  tier2PrestigeCount: number
  isSyntheticActive: boolean
  syntheticTextProduced: Decimal
  syntheticRatio: number
  modelCollapseActive: boolean
}

export interface SerializedParadigmState {
  insights: number
  totalInsightsEarned: number
  activeParadigm: ParadigmId
  unlockedParadigms: ParadigmId[]
  tier2PrestigeCount: number
  isSyntheticActive: boolean
  syntheticTextProduced: string
  syntheticRatio: number
  modelCollapseActive: boolean
}
