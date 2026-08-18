import Decimal from 'break_infinity.js'
import type {
  ScenarioAction,
  ScenarioExecutionResult,
  ScenarioStateAccessor,
  SimulationMetrics,
  SimulationOptions,
} from '@/types/simulation'
import type { AllocationPreset, AllocationState } from '@/types/systems'
import type { HardwareNode } from '@/types/hardware'
import type { SoftwareUpgrade } from '@/types/upgrades'
import type { Resource } from '@/types/resources'
import type { CognitiveStatus } from '@/types/cognitive'

export interface ScenarioGameStore {
  currentPhase: number
  funds: Resource
  tokens: Resource
  rawText: Resource
  parameters: Decimal
  researchPoints: Resource
  totalCharsRead: Decimal
  totalTokensServed: Decimal
  effectiveCompute: Decimal
  totalPowerDrawWatts: Decimal
  gridCapacityWatts: Decimal
  coolingCapacityWatts: Decimal
  thermalState: { isThrottling: boolean }
  powerState: { isOverloaded: boolean }
  hardware: Record<string, HardwareNode>
  upgrades: Record<string, SoftwareUpgrade>
  unlockedFeatures: Record<string, boolean>
  checkpointMultiplier?: number
  prestige?: {
    architecturePoints: number
    totalArchitecturePoints: number
    prestigeCount: number
  }
  entropy?: Decimal
  alignment?: Decimal
  cognitiveStatus?: CognitiveStatus
  rlhfBatchCount?: number
  apiMultiplier?: number
  researchMultiplier?: number
  manualScrape(amount?: number): void
  sellRawText(chars?: number, silent?: boolean): boolean
  sellAllRawText(): boolean
  buyHardware(id: string): boolean
  buyUpgrade(id: string): boolean
  buyTalent?(id: string): boolean
  triggerPrestige?(): boolean
  performRlhf?(): boolean
  updateAllocations(alloc: AllocationState): void
  setAllocationPreset(preset: AllocationPreset): void
  processTick(dt: number): void
}

export class ScenarioRunner {
  private totalTicks = 0
  private totalVirtualSeconds = 0
  private actionsExecuted = 0

  constructor(private store: ScenarioGameStore) {}

  public getState(): ScenarioStateAccessor {
    return {
      currentPhase: this.store.currentPhase,
      funds: this.store.funds.current,
      tokens: this.store.tokens.current,
      rawText: this.store.rawText.current,
      parameters: this.store.parameters,
      researchPoints: this.store.researchPoints.current,
      totalCharsRead: this.store.totalCharsRead,
      totalTokensServed: this.store.totalTokensServed,
      effectiveCompute: this.store.effectiveCompute,
      totalPowerDrawWatts: this.store.totalPowerDrawWatts,
      gridCapacityWatts: this.store.gridCapacityWatts,
      coolingCapacityWatts: this.store.coolingCapacityWatts,
      isThrottling: this.store.thermalState.isThrottling,
      isOverloaded: this.store.powerState.isOverloaded,
      virtualTimeElapsedSeconds: this.totalVirtualSeconds,
      hardware: this.store.hardware,
      upgrades: this.store.upgrades,
      unlockedFeatures: this.store.unlockedFeatures,
      architecturePoints: this.store.prestige?.architecturePoints,
      totalArchitecturePoints: this.store.prestige?.totalArchitecturePoints,
      prestigeCount: this.store.prestige?.prestigeCount,
      checkpointMultiplier: this.store.checkpointMultiplier,
      entropy: this.store.entropy,
      alignment: this.store.alignment,
      cognitiveStatus: this.store.cognitiveStatus,
      rlhfBatchCount: this.store.rlhfBatchCount,
      apiMultiplier: this.store.apiMultiplier,
      researchMultiplier: this.store.researchMultiplier,
    }
  }

  public getMetrics(realStartTime: number): SimulationMetrics {
    const purchasedHw = Object.values(this.store.hardware).reduce(
      (acc, node) => acc + node.count,
      0
    )
    const purchasedUp = Object.values(this.store.upgrades).filter(
      (u) => u.purchased
    ).length

    return {
      totalVirtualSeconds: this.totalVirtualSeconds,
      totalTicksExecuted: this.totalTicks,
      realExecutionTimeMs: performance.now() - realStartTime,
      actionsExecuted: this.actionsExecuted,
      purchasedHardwareCount: purchasedHw,
      purchasedUpgradesCount: purchasedUp,
    }
  }

  /**
   * Fast-forwards simulation by `seconds` virtual seconds using discrete step ticks.
   * `speedMultiplier` allows scaling the effective time step per tick to accelerate simulation.
   */
  public advanceTime(seconds: number, tickDeltaSec = 0.05, speedMultiplier = 1): number {
    const effectiveStep = Math.max(0.001, tickDeltaSec * speedMultiplier)
    let remaining = seconds
    while (remaining > 0) {
      const step = Math.min(effectiveStep, remaining)
      this.store.processTick(step)
      remaining -= step
      this.totalTicks++
      this.totalVirtualSeconds += step
    }
    return this.totalVirtualSeconds
  }

  /**
   * Advances simulation until a condition is met or maxWaitSeconds is reached.
   */
  public advanceUntil(
    condition: (state: ScenarioStateAccessor) => boolean,
    maxWaitSeconds = 3600,
    tickDeltaSec = 0.05,
    speedMultiplier = 1
  ): boolean {
    const effectiveStep = Math.max(0.001, tickDeltaSec * speedMultiplier)
    let waitElapsed = 0
    while (waitElapsed < maxWaitSeconds) {
      if (condition(this.getState())) {
        return true
      }
      this.advanceTime(effectiveStep, effectiveStep, 1)
      waitElapsed += effectiveStep
    }
    return condition(this.getState())
  }

  /**
   * Simulates scraping manually `clicks` times.
   */
  public scrapeTimes(clicks = 1, amountPerClick?: number): void {
    for (let i = 0; i < clicks; i++) {
      this.store.manualScrape(amountPerClick)
    }
  }

  /**
   * Waits until funds >= targetFunds, advancing virtual time as needed.
   */
  public waitForFunds(targetFunds: number | Decimal, maxWaitSeconds = 600): boolean {
    const target = typeof targetFunds === 'number' ? new Decimal(targetFunds) : targetFunds
    return this.advanceUntil((s) => s.funds.gte(target), maxWaitSeconds)
  }

  /**
   * Waits until tokens served >= targetTokens, advancing virtual time as needed.
   */
  public waitForTokensServed(targetTokens: number | Decimal, maxWaitSeconds = 600): boolean {
    const target = typeof targetTokens === 'number' ? new Decimal(targetTokens) : targetTokens
    return this.advanceUntil((s) => s.totalTokensServed.gte(target), maxWaitSeconds)
  }

  /**
   * Waits until parameters >= targetParams, advancing virtual time as needed.
   */
  public waitForParameters(targetParams: number | Decimal, maxWaitSeconds = 600): boolean {
    const target = typeof targetParams === 'number' ? new Decimal(targetParams) : targetParams
    return this.advanceUntil((s) => s.parameters.gte(target), maxWaitSeconds)
  }

  /**
   * Attempts to purchase hardware when funds allow, waiting up to maxWaitSeconds.
   */
  public buyHardwareWhenAffordable(hardwareId: string, maxWaitSeconds = 600): boolean {
    const node = this.store.hardware[hardwareId]
    if (!node) return false

    // Wait until we have enough funds
    this.advanceUntil((s) => s.funds.gte(node.baseCost), maxWaitSeconds)
    const success = this.store.buyHardware(hardwareId)
    if (success) this.actionsExecuted++
    return success
  }

  /**
   * Attempts to purchase an upgrade when funds/research allow, waiting up to maxWaitSeconds.
   */
  public buyUpgradeWhenAffordable(upgradeId: string, maxWaitSeconds = 600): boolean {
    const up = this.store.upgrades[upgradeId]
    if (!up) return false

    if (up.currency === 'funds') {
      this.advanceUntil((s) => s.funds.gte(up.cost), maxWaitSeconds)
    } else {
      this.advanceUntil((s) => s.researchPoints.gte(up.cost), maxWaitSeconds)
    }
    const success = this.store.buyUpgrade(upgradeId)
    if (success) this.actionsExecuted++
    return success
  }

  /**
   * Execute an individual scenario action.
   */
  public executeAction(action: ScenarioAction, options?: SimulationOptions): boolean {
    const tickDelta = options?.tickDeltaSec ?? 0.05
    this.actionsExecuted++

    switch (action.type) {
      case 'manual_scrape':
        this.scrapeTimes(action.clicks ?? 1, action.amountPerClick)
        return true

      case 'sell_raw_text':
        return this.store.sellRawText(action.chars ?? 20, true)

      case 'sell_all_raw_text':
        return this.store.sellAllRawText()

      case 'buy_hardware':
        return this.store.buyHardware(action.hardwareId)

      case 'buy_upgrade':
        return this.store.buyUpgrade(action.upgradeId)

      case 'buy_talent':
        return this.store.buyTalent ? this.store.buyTalent(action.talentId) : false

      case 'trigger_prestige':
        return this.store.triggerPrestige ? this.store.triggerPrestige() : false

      case 'perform_rlhf':
        return this.store.performRlhf ? this.store.performRlhf() : false

      case 'set_allocations':
        this.store.updateAllocations(action.allocations)
        return true

      case 'set_preset':
        this.store.setAllocationPreset(action.preset)
        return true

      case 'wait_seconds':
        this.advanceTime(action.seconds, tickDelta)
        return true

      case 'wait_until':
        return this.advanceUntil(
          action.condition,
          action.maxWaitSeconds ?? 3600,
          tickDelta
        )

      case 'assert':
        action.assertion(this.getState())
        return true

      case 'custom':
        action.fn(this.getState())
        return true

      default:
        return false
    }
  }

  /**
   * Executes a complete scenario declaratively.
   */
  public executeScenario(
    actions: ScenarioAction[],
    options?: SimulationOptions
  ): ScenarioExecutionResult {
    const startTime = performance.now()
    const maxRealTimeMs = options?.maxExecutionTimeMs ?? 10000

    for (let index = 0; index < actions.length; index++) {
      if (performance.now() - startTime > maxRealTimeMs) {
        return {
          success: false,
          error: `Simulation aborted: exceeded maxExecutionTimeMs of ${maxRealTimeMs}ms at step #${index}`,
          stepIndex: index,
          lastAction: actions[index],
          metrics: this.getMetrics(startTime),
        }
      }

      const action = actions[index]
      try {
        const ok = this.executeAction(action, options)
        if (!ok) {
          return {
            success: false,
            error: `Action execution returned false at step #${index} (${action.type})`,
            stepIndex: index,
            lastAction: action,
            metrics: this.getMetrics(startTime),
          }
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        return {
          success: false,
          error: `Assertion / Execution failure at step #${index} (${action.type}): ${errorMsg}`,
          stepIndex: index,
          lastAction: action,
          metrics: this.getMetrics(startTime),
        }
      }
    }

    return {
      success: true,
      metrics: this.getMetrics(startTime),
    }
  }
}
