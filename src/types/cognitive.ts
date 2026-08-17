import type Decimal from 'break_infinity.js'

export type CognitiveStatus = 'nominal' | 'divergent' | 'critical_hallucination'

export interface CognitiveState {
  entropy: Decimal // 0.0 to 1.0 (0% to 100%)
  alignment: Decimal // 0.0 to 1.0 (100% to 0%)
  rlhfBatchCount: number
  totalRlhfConducted: Decimal
}

export interface SerializedCognitiveState {
  entropy: string
  alignment: string
  rlhfBatchCount: number
  totalRlhfConducted: string
}

export interface CognitiveImpactMultipliers {
  apiMultiplier: number // 1.0 down to 0.10
  researchMultiplier: number // 1.0 up to 1.25
  status: CognitiveStatus
}
