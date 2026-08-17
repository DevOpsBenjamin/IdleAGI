import type Decimal from 'break_infinity.js'

export type HardwareTier = 0 | 1 | 2 | 3
export type HardwareCategory = 'host' | 'gpu'

export interface HardwareNode {
  readonly id: string
  name: string
  category: HardwareCategory
  count: number
  baseCost: Decimal
  costMult: number
  tflops: Decimal
  vram: Decimal
  memoryBandwidthGBs: Decimal
  memoryType: string
  powerWatts: Decimal
  pcieSlotsProvided?: number
  pcieSlotsRequired?: number
  minHostTier?: number
  maxCount?: number
  requiredUpgrades?: string[]
  description?: string
  tier: number
}

export interface SerializedHardwareNode {
  id: string
  name: string
  category?: HardwareCategory
  count: number
  baseCost: string
  costMult: number
  tflops: string
  vram: string
  memoryBandwidthGBs?: string
  memoryType?: string
  powerWatts: string
  pcieSlotsProvided?: number
  pcieSlotsRequired?: number
  minHostTier?: number
  maxCount?: number
  requiredUpgrades?: string[]
  description?: string
  tier: number
}
