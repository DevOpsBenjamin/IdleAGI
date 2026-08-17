import type { Ref } from 'vue'
import Decimal from 'break_infinity.js'
import type {
  GameState,
  OfflineProgressSummary,
} from '@/types'
import { createInitialHardware } from '@/domain/constants/hardware'
import { createInitialUpgrades } from '@/domain/constants/upgrades'
import type { useTerminalStore } from '../terminalStore'
import type { useResourcesStore } from '../resourcesStore'
import type { useHardwareStore } from '../hardwareStore'
import type { useUpgradesStore } from '../upgradesStore'
import type { useAllocationStore } from '../allocationStore'
import type { useFeaturesStore } from '../featuresStore'
import type { usePrestigeStore } from '../prestigeStore'

export interface StoreCollection {
  terminal: ReturnType<typeof useTerminalStore>
  resources: ReturnType<typeof useResourcesStore>
  hardwareStore: ReturnType<typeof useHardwareStore>
  upgradesStore: ReturnType<typeof useUpgradesStore>
  allocation: ReturnType<typeof useAllocationStore>
  features: ReturnType<typeof useFeaturesStore>
  prestigeStore: ReturnType<typeof usePrestigeStore>
  meta: {
    version: Ref<string>
    gameStartTime: Ref<number>
    lastTickTimestamp: Ref<number>
    lastOfflineReport: Ref<OfflineProgressSummary | null>
  }
}

export class GameStateHydrator {
  /**
   * Constructs the full GameState representation from all modular stores.
   */
  public static extractFullState(stores: StoreCollection): GameState {
    return {
      version: stores.meta.version.value,
      lastTickTimestamp: stores.meta.lastTickTimestamp.value,
      gameStartTime: stores.meta.gameStartTime.value,
      currentPhase: stores.features.currentPhase,
      totalCharsRead: stores.resources.totalCharsRead,
      rawText: stores.resources.rawText,
      tokens: stores.resources.tokens,
      funds: stores.resources.funds,
      parameters: stores.resources.parameters,
      researchPoints: stores.resources.researchPoints,
      hardware: stores.hardwareStore.hardware,
      upgrades: stores.upgradesStore.upgrades,
      allocations: stores.allocation.allocations,
      gridCapacityWatts: stores.hardwareStore.gridCapacityWatts,
      coolingCapacityWatts: stores.hardwareStore.coolingCapacityWatts,
      terminalLogs: stores.terminal.terminalLogs,
      unlockedFeatures: stores.features.unlockedFeatures,
      lastOfflineReport: stores.meta.lastOfflineReport.value,
      prestige: stores.prestigeStore.getPrestigeState(),
    }
  }

  /**
   * Hydrates sub-stores from a partial loaded GameState.
   */
  public static hydrateStores(
    loaded: Partial<GameState>,
    stores: StoreCollection
  ): void {
    if (loaded.rawText) stores.resources.rawText = loaded.rawText
    if (loaded.tokens) stores.resources.tokens = loaded.tokens
    if (loaded.funds) stores.resources.funds = loaded.funds
    if (loaded.parameters) stores.resources.parameters = loaded.parameters
    if (loaded.researchPoints) stores.resources.researchPoints = loaded.researchPoints
    if (loaded.hardware) stores.hardwareStore.hardware = loaded.hardware
    if (loaded.upgrades) stores.upgradesStore.upgrades = loaded.upgrades
    if (loaded.allocations) stores.allocation.allocations = loaded.allocations
    if (loaded.gridCapacityWatts) stores.hardwareStore.gridCapacityWatts = loaded.gridCapacityWatts
    if (loaded.coolingCapacityWatts) stores.hardwareStore.coolingCapacityWatts = loaded.coolingCapacityWatts
    if (loaded.terminalLogs) stores.terminal.setLogs(loaded.terminalLogs)
    if (loaded.unlockedFeatures) stores.features.unlockedFeatures = loaded.unlockedFeatures
    if (loaded.lastTickTimestamp) stores.meta.lastTickTimestamp.value = loaded.lastTickTimestamp
    if (loaded.gameStartTime) stores.meta.gameStartTime.value = loaded.gameStartTime
    if (loaded.currentPhase !== undefined) stores.features.currentPhase = loaded.currentPhase
    if (loaded.totalCharsRead) stores.resources.totalCharsRead = loaded.totalCharsRead
    if (loaded.prestige) stores.prestigeStore.setPrestigeState(loaded.prestige)
  }

  /**
   * Performs a Tier 1 Soft Reset (Fine-Tuning / Checkpoint):
   * Resets volatile resources & hardware while preserving AP, talents, lifetime stats, and unlock flags.
   */
  public static performSoftReset(stores: StoreCollection): void {
    // 1. Reset volatile currencies & counters
    stores.resources.rawText.current = new Decimal(0)
    stores.resources.tokens.current = new Decimal(0)
    stores.resources.funds.current = new Decimal(0)
    stores.resources.parameters = new Decimal(0)
    stores.resources.researchPoints.current = new Decimal(0)
    stores.resources.totalTokensServed = new Decimal(0)
    stores.resources.totalCharsRead = new Decimal(0)
    stores.resources.resetBufferCapacities()

    // 2. Reset hardware to initial catalog
    stores.hardwareStore.hardware = createInitialHardware()
    stores.hardwareStore.gridCapacityWatts = new Decimal(100)
    stores.hardwareStore.coolingCapacityWatts = new Decimal(50)

    // 3. Reset upgrades
    stores.upgradesStore.upgrades = createInitialUpgrades()

    // 4. Reset allocations
    stores.allocation.allocations = {
      inferencePercent: 100,
      trainingPercent: 0,
      researchPercent: 0,
    }

    // 5. Reset phase to Phase 0
    stores.features.setPhase(0, true)

    // 6. Reset early milestones to allow fresh progression
    stores.features.reachedMilestones = {
      readingSkill1: false,
      readingSkill2: false,
      dataBrokerUnlocked: false,
      potatoPcUnlocked: false,
      firstPotatoPc: false,
      firstCpu: false,
      firstGpu: false,
      trainingUnlocked: false,
      researchUnlocked: false,
      first1000Params: false,
      first10000Params: false,
      first1000Funds: false,
      firstThrottling: false,
    }

    // 7. Reset early unlocked features while preserving prestige unlock flags
    stores.features.unlockedFeatures = {
      ...stores.features.unlockedFeatures,
      dataBroker: false,
      hardwareSection: false,
      scriptsSection: false,
      autoBroker: false,
      autoScraping: false,
      tokenizerUnlocked: false,
      oscilloscope: false,
      trainingAllocation: false,
      researchAllocation: false,
      prestigeT1: true, // Permanent unlock once unlocked
    }

    stores.terminal.addLog(
      '🔄 Checkpoint figé avec succès ! Poids synaptiques convertis en Points d’Architecture (AP).',
      'success'
    )
  }
}
