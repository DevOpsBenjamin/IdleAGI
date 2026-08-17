import Decimal from 'break_infinity.js'

export type LogType = 'info' | 'warn' | 'error' | 'thought' | 'event' | 'success'

export interface LogEntry {
  id: string
  timestamp: number
  message: string
  type: LogType
}

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
  description?: string
  tier: number
}

export interface SoftwareUpgrade {
  id: string
  name: string
  description: string
  cost: Decimal
  currency: 'funds' | 'researchPoints'
  purchased: boolean
  category: 'human' | 'scraping' | 'tokenizer' | 'monetization' | 'hardware'
}

export interface AllocationState {
  inferencePercent: number // 0 à 100
  trainingPercent: number  // 0 à 100
  researchPercent: number  // 0 à 100
}

export interface ThermalState {
  heatGeneratedWatts: Decimal
  coolingCapacityWatts: Decimal
  efficiency: number // 0.0 à 1.0
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

export interface GameState {
  version: string
  lastTickTimestamp: number
  gameStartTime: number
  currentPhase: number
  totalCharsRead: Decimal
  
  // Devises & Ressources primaires
  rawText: Resource
  tokens: Resource
  funds: Resource
  parameters: Decimal
  researchPoints: Resource
  
  // Matériel & Allocation
  hardware: Record<string, HardwareNode>
  upgrades: Record<string, SoftwareUpgrade>
  allocations: AllocationState
  
  // Systèmes physiques
  gridCapacityWatts: Decimal
  coolingCapacityWatts: Decimal
  
  // Terminal Logs
  terminalLogs: LogEntry[]
  
  // Unlocks & Flags
  unlockedFeatures: UnlockedFeatures
  
  // Rapport de progression hors-ligne
  lastOfflineReport: OfflineProgressSummary | null
}

// Format sérialisé pour localStorage (remplace Decimal par string)
export interface SerializedResource {
  current: string
  max: string
  ratePerSec: string
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

export interface SerializedSoftwareUpgrade {
  id: string
  name: string
  description: string
  cost: string
  currency: 'funds' | 'researchPoints'
  purchased: boolean
  category: 'human' | 'scraping' | 'tokenizer' | 'monetization' | 'hardware'
}

export interface SerializedGameState {
  version: string
  lastTickTimestamp: number
  gameStartTime: number
  currentPhase?: number
  totalCharsRead?: string
  rawText: SerializedResource
  tokens: SerializedResource
  funds: SerializedResource
  parameters: string
  researchPoints: SerializedResource
  hardware: Record<string, SerializedHardwareNode>
  upgrades?: Record<string, SerializedSoftwareUpgrade>
  allocations: AllocationState
  gridCapacityWatts: string
  coolingCapacityWatts: string
  terminalLogs: LogEntry[]
  unlockedFeatures: UnlockedFeatures
}
