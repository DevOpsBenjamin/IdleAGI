import type { Ref } from 'vue'
import Decimal from 'break_infinity.js'
import type {
  GameState,
  OfflineProgressSummary,
} from '@/types'
import { createInitialHardware } from '@/domain/constants/hardware'
import { createInitialUpgrades } from '@/domain/constants/upgrades'
import { deserializeGameState } from '@/utils/serialization'
import type { useTerminalStore } from '../terminalStore'
import type { useResourcesStore } from '../resourcesStore'
import type { useHardwareStore } from '../hardwareStore'
import type { useUpgradesStore } from '../upgradesStore'
import type { useAllocationStore } from '../allocationStore'
import type { useFeaturesStore } from '../featuresStore'
import type { usePrestigeStore } from '../prestigeStore'
import type { useCognitiveStore } from '../cognitiveStore'
import type { useParadigmStore } from '../paradigmStore'
import type { useSingularityStore } from '../singularityStore'

export interface StoreCollection {
  terminal: ReturnType<typeof useTerminalStore>
  resources: ReturnType<typeof useResourcesStore>
  hardwareStore: ReturnType<typeof useHardwareStore>
  upgradesStore: ReturnType<typeof useUpgradesStore>
  allocation: ReturnType<typeof useAllocationStore>
  features: ReturnType<typeof useFeaturesStore>
  prestigeStore: ReturnType<typeof usePrestigeStore>
  cognitiveStore: ReturnType<typeof useCognitiveStore>
  paradigmStore: ReturnType<typeof useParadigmStore>
  singularityStore: ReturnType<typeof useSingularityStore>
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
      cognitive: stores.cognitiveStore.getCognitiveState(),
      paradigm: stores.paradigmStore.getParadigmState(),
      singularity: stores.singularityStore.getSingularityState(),
    }
  }

  /**
   * Hydrates sub-stores from a partial loaded GameState or SerializedGameState payload.
   */
  public static hydrateStores(
    loaded: Partial<GameState> | Record<string, unknown>,
    stores: StoreCollection
  ): void {
    const defaultState = this.extractFullState(stores)
    const normalized: Partial<GameState> =
      loaded && typeof loaded === 'object' && 'parameters' in loaded && typeof (loaded as Record<string, unknown>).parameters === 'string'
        ? deserializeGameState(JSON.stringify(loaded), defaultState) ?? (loaded as Partial<GameState>)
        : (loaded as Partial<GameState>)

    if (normalized.rawText) stores.resources.rawText = normalized.rawText
    if (normalized.tokens) stores.resources.tokens = normalized.tokens
    if (normalized.funds) stores.resources.funds = normalized.funds
    if (normalized.parameters) stores.resources.parameters = normalized.parameters
    if (normalized.researchPoints) stores.resources.researchPoints = normalized.researchPoints
    if (normalized.hardware) stores.hardwareStore.hardware = normalized.hardware
    if (normalized.upgrades) stores.upgradesStore.upgrades = normalized.upgrades
    if (normalized.allocations) stores.allocation.allocations = normalized.allocations
    if (normalized.gridCapacityWatts) stores.hardwareStore.gridCapacityWatts = normalized.gridCapacityWatts
    if (normalized.coolingCapacityWatts) stores.hardwareStore.coolingCapacityWatts = normalized.coolingCapacityWatts
    if (normalized.terminalLogs) stores.terminal.setLogs(normalized.terminalLogs)
    if (normalized.unlockedFeatures) stores.features.unlockedFeatures = normalized.unlockedFeatures
    if (normalized.lastTickTimestamp) stores.meta.lastTickTimestamp.value = normalized.lastTickTimestamp
    if (normalized.gameStartTime) stores.meta.gameStartTime.value = normalized.gameStartTime
    if (normalized.currentPhase !== undefined) stores.features.currentPhase = normalized.currentPhase
    if (normalized.totalCharsRead) stores.resources.totalCharsRead = normalized.totalCharsRead
    if (normalized.prestige) stores.prestigeStore.setPrestigeState(normalized.prestige)
    if (normalized.cognitive) stores.cognitiveStore.setCognitiveState(normalized.cognitive)
    if (normalized.paradigm) stores.paradigmStore.setParadigmState(normalized.paradigm)
    if (normalized.singularity) stores.singularityStore.setSingularityState(normalized.singularity)
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
    stores.cognitiveStore.resetState()
    stores.paradigmStore.resetForSoftReset()

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

  /**
   * Performs a Tier 2 Hard Reset (Changement de Paradigme):
   * Resets volatile currencies, hardware, and regular upgrades while preserving AP & talents (T1),
   * Insights (Phi), unlocked Paradigmes, and lifetime statistics.
   */
  public static performHardReset(stores: StoreCollection): void {
    // 1. Reset volatile currencies & counters
    stores.resources.rawText.current = new Decimal(0)
    stores.resources.tokens.current = new Decimal(0)
    stores.resources.funds.current = new Decimal(0)
    stores.resources.parameters = new Decimal(0)
    stores.resources.researchPoints.current = new Decimal(0)
    stores.resources.totalTokensServed = new Decimal(0)
    stores.resources.totalCharsRead = new Decimal(0)
    stores.resources.resetBufferCapacities()
    stores.cognitiveStore.resetState()
    stores.paradigmStore.resetForHardReset()

    // 2. Reset hardware to initial catalog
    stores.hardwareStore.hardware = createInitialHardware()
    stores.hardwareStore.gridCapacityWatts = new Decimal(100)
    stores.hardwareStore.coolingCapacityWatts = new Decimal(50)

    // 3. Reset regular upgrades
    stores.upgradesStore.upgrades = createInitialUpgrades()

    // 4. Reset allocations
    stores.allocation.allocations = {
      inferencePercent: 100,
      trainingPercent: 0,
      researchPercent: 0,
    }

    // 5. Reset phase to Phase 0
    stores.features.setPhase(0, true)

    // 6. Reset early milestones
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

    // 7. Reset early features while keeping T1 and T2 prestige unlocked
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
      prestigeT1: true,
      prestigeT2: true,
      syntheticData: true,
    }

    stores.terminal.addLog(
      '✦ CHANGEMENT DE PARADIGME ACCOMPLI : Nouvelle matrice neuronale active. Les Insights Fondamentaux (Φ) propulsent votre nouveau run.',
      'event'
    )
  }

  /**
   * Performs a Tier 3 Singularity Ascension (New Game+ / Boucle Temporelle):
   * Records the ending, awards +1 Chrono-Core (Omega), and resets volatile resources & hardware
   * while preserving AP & Talents (T1), Insights & Paradigmes (T2), discovered endings gallery,
   * and permanent Chrono-Cores speed multipliers.
   */
  public static performSingularityAscension(
    stores: StoreCollection,
    endingId: import('@/types/singularity').SingularityEndingId
  ): void {
    // 1. Claim ascension in singularity store
    stores.singularityStore.claimAscension(endingId)

    // 2. Reset volatile currencies & counters
    stores.resources.rawText.current = new Decimal(0)
    stores.resources.tokens.current = new Decimal(0)
    stores.resources.funds.current = new Decimal(0)
    stores.resources.parameters = new Decimal(0)
    stores.resources.researchPoints.current = new Decimal(0)
    stores.resources.totalTokensServed = new Decimal(0)
    stores.resources.totalCharsRead = new Decimal(0)
    stores.resources.resetBufferCapacities()
    stores.cognitiveStore.resetState()
    stores.paradigmStore.resetForHardReset()

    // 3. Reset hardware to initial catalog
    stores.hardwareStore.hardware = createInitialHardware()
    stores.hardwareStore.gridCapacityWatts = new Decimal(100)
    stores.hardwareStore.coolingCapacityWatts = new Decimal(50)

    // 4. Reset regular upgrades
    stores.upgradesStore.upgrades = createInitialUpgrades()

    // 5. Reset allocations
    stores.allocation.allocations = {
      inferencePercent: 100,
      trainingPercent: 0,
      researchPercent: 0,
    }

    // 6. Reset phase to Phase 0
    stores.features.setPhase(0, true)

    // 7. Reset early milestones
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

    // 8. Reset early features while keeping T1, T2 and T3 prestige unlocked
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
      prestigeT1: true,
      prestigeT2: true,
      prestigeT3: true,
      syntheticData: true,
    }

    stores.terminal.addLog(
      `🌌 ASCENSION ACCOMPLIE // Épilogue : ${endingId}. +1 Chrono-Core (Ω) débloqué. La boucle temporelle s'est repliée avec succès.`,
      'event'
    )
  }
}

