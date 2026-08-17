import type Decimal from 'break_infinity.js'

export type AllocationPreset = 'balanced' | 'cash' | 'train'

export interface AllocationState {
  inferencePercent: number // 0 to 100
  trainingPercent: number  // 0 to 100
  researchPercent: number  // 0 to 100
}

export interface ThermalState {
  heatGeneratedWatts: Decimal
  coolingCapacityWatts: Decimal
  efficiency: number // 0.0 to 1.0
  isThrottling: boolean
}

export interface PowerState {
  totalDrawWatts: Decimal
  gridCapacityWatts: Decimal
  gridLoadPercent: number
  isOverloaded: boolean
}

export interface UnlockedFeatures {
  dashboardView: boolean
  humanReading: boolean
  dataBroker: boolean
  hardwareSection: boolean
  scriptsSection: boolean
  autoBroker: boolean
  autoScraping: boolean
  tokenizerUnlocked: boolean
  oscilloscope: boolean
  trainingAllocation: boolean
  researchAllocation: boolean
  syntheticData: boolean
  quantumLayer: boolean
  prestigeT1: boolean
  prestigeT2: boolean
  prestigeT3: boolean
}

export interface MilestoneState {
  readingSkill1: boolean
  readingSkill2: boolean
  dataBrokerUnlocked: boolean
  potatoPcUnlocked: boolean
  firstPotatoPc: boolean
  firstCpu: boolean
  firstGpu: boolean
  trainingUnlocked: boolean
  researchUnlocked: boolean
  first1000Params: boolean
  first10000Params: boolean
  first1000Funds: boolean
}

export interface OfflineProgressSummary {
  elapsedSeconds: number
  simulatedSeconds: number
  cappedAt24h: boolean
  rawTextGained: Decimal
  tokensGained: Decimal
  fundsGained: Decimal
  parametersGained: Decimal
  welcomeMessage: string
}
