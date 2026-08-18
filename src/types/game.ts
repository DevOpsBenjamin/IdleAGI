import type Decimal from 'break_infinity.js'
import type { LogEntry } from './logs'
import type { Resource, SerializedResource } from './resources'
import type { HardwareNode, SerializedHardwareNode } from './hardware'
import type { SoftwareUpgrade, SerializedSoftwareUpgrade } from './upgrades'
import type {
  AllocationState,
  UnlockedFeatures,
  OfflineProgressSummary,
} from './systems'
import type { PrestigeState, SerializedPrestigeState } from './prestige'
import type { CognitiveState, SerializedCognitiveState } from './cognitive'
import type { ParadigmState, SerializedParadigmState } from './paradigm'
import type { SingularityState, SerializedSingularityState } from './singularity'

export * from './logs'

export * from './resources'
export * from './hardware'
export * from './upgrades'
export * from './systems'
export * from './prestige'
export * from './cognitive'
export * from './paradigm'
export * from './singularity'
export * from './save'


export interface GameState {
  version: string
  lastTickTimestamp: number
  gameStartTime: number
  currentPhase: number
  totalCharsRead: Decimal

  // Primary currencies & resources
  rawText: Resource
  tokens: Resource
  funds: Resource
  parameters: Decimal
  researchPoints: Resource

  // Hardware & Upgrades & Allocations
  hardware: Record<string, HardwareNode>
  upgrades: Record<string, SoftwareUpgrade>
  allocations: AllocationState

  // Physical grid & cooling
  gridCapacityWatts: Decimal
  coolingCapacityWatts: Decimal

  // Terminal Logs
  terminalLogs: LogEntry[]

  // Unlocks & Flags
  unlockedFeatures: UnlockedFeatures

  // Offline progression report
  lastOfflineReport: OfflineProgressSummary | null

  // Prestige & Meta progression
  prestige?: PrestigeState

  // Cognitive Model (Entropy & Alignment)
  cognitive?: CognitiveState

  // Paradigm Shift & Synthetic Dataset (Tier 2)
  paradigm?: ParadigmState

  // Singularity & Temporal Loop (Tier 3)
  singularity?: SingularityState
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
  prestige?: SerializedPrestigeState
  cognitive?: SerializedCognitiveState
  paradigm?: SerializedParadigmState
  singularity?: SerializedSingularityState
}



