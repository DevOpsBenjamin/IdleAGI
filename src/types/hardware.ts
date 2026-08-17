import type Decimal from 'break_infinity.js'

export type HardwareTier = 0 | 1 | 2 | 3

export interface HardwareNode {
  readonly id: string
  name: string
  count: number
  baseCost: Decimal
  costMult: number
  tflops: Decimal
  vram: Decimal
  powerWatts: Decimal
  description?: string
  tier: number
}

export interface SerializedHardwareNode {
  id: string
  name: string
  count: number
  baseCost: string
  costMult: number
  tflops: string
  vram: string
  powerWatts: string
  description?: string
  tier: number
}
