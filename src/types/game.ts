import Decimal from 'break_infinity.js'

export interface Resource {
  current: Decimal
  max: Decimal
  ratePerSec: Decimal
}

export interface HardwareNode {
  id: string
  name: string
  count: number
  baseCost: Decimal
  costMult: number
  tflops: Decimal
  vram: Decimal
  powerWatts: Decimal
}

export interface AllocationState {
  inferencePercent: number // 0 à 100
  trainingPercent: number  // 0 à 100
  researchPercent: number  // 0 à 100
}

export interface UnlockedFeatures {
  dashboardView: boolean
  autoScraping: boolean
  syntheticData: boolean
  quantumLayer: boolean
  prestigeT1: boolean
  prestigeT2: boolean
  prestigeT3: boolean
}

export interface GameState {
  version: string
  lastTickTimestamp: number
  
  // Devises & Ressources
  rawText: Resource
  tokens: Resource
  funds: Resource
  parameters: Decimal
  
  // Matériel & Allocation
  hardware: Record<string, HardwareNode>
  allocations: AllocationState
  
  // Systèmes physiques
  gridCapacityWatts: Decimal
  coolingCapacityWatts: Decimal
  
  // Unlocks & Flags
  unlockedFeatures: UnlockedFeatures
}
