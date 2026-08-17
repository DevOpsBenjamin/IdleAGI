import type Decimal from 'break_infinity.js'
import type { AllocationPreset, AllocationState } from './systems'
import type { LogType } from './logs'

export type ScenarioAction =
  | { type: 'manual_scrape'; clicks?: number; amountPerClick?: number }
  | { type: 'sell_raw_text'; chars?: number }
  | { type: 'sell_all_raw_text' }
  | { type: 'buy_hardware'; hardwareId: string }
  | { type: 'buy_upgrade'; upgradeId: string }
  | { type: 'set_allocations'; allocations: AllocationState }
  | { type: 'set_preset'; preset: AllocationPreset }
  | { type: 'wait_seconds'; seconds: number }
  | {
      type: 'wait_until'
      condition: (state: ScenarioStateAccessor) => boolean
      maxWaitSeconds?: number
      label?: string
    }
  | {
      type: 'assert'
      assertion: (state: ScenarioStateAccessor) => void
      label?: string
    }
  | {
      type: 'custom'
      fn: (state: ScenarioStateAccessor) => void
      label?: string
    }

export interface ScenarioStateAccessor {
  readonly currentPhase: number
  readonly funds: Decimal
  readonly tokens: Decimal
  readonly rawText: Decimal
  readonly parameters: Decimal
  readonly researchPoints: Decimal
  readonly totalCharsRead: Decimal
  readonly totalTokensServed: Decimal
  readonly effectiveCompute: Decimal
  readonly totalPowerDrawWatts: Decimal
  readonly gridCapacityWatts: Decimal
  readonly coolingCapacityWatts: Decimal
  readonly isThrottling: boolean
  readonly isOverloaded: boolean
  readonly virtualTimeElapsedSeconds: number
  readonly hardware: Record<string, { count: number; maxCount?: number }>
  readonly upgrades: Record<string, { purchased: boolean }>
  readonly unlockedFeatures: Record<string, boolean>
}

export interface SimulationOptions {
  /** Delta time per discrete tick in seconds (default: 0.05s = 20 Hz) */
  tickDeltaSec?: number
  /** Maximum real execution time limit in milliseconds before aborting (default: 10,000ms) */
  maxExecutionTimeMs?: number
  /** Callback for logging / diagnostics output */
  onLog?: (message: string, type?: LogType) => void
}

export interface SimulationMetrics {
  totalVirtualSeconds: number
  totalTicksExecuted: number
  realExecutionTimeMs: number
  actionsExecuted: number
  purchasedHardwareCount: number
  purchasedUpgradesCount: number
}

export interface ScenarioExecutionResult {
  success: boolean
  metrics: SimulationMetrics
  error?: string
  stepIndex?: number
  lastAction?: ScenarioAction
}
