import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type Decimal from 'break_infinity.js'
import type { GameState, OfflineProgressSummary, AllocationPreset } from '@/types'
import { CURRENT_SAVE_VERSION } from '@/utils/serialization'
import { RAW_TEXT_SNIPPETS } from '@/domain/constants/snippets'
import { EconomyEngine, OfflineEngine, MAX_OFFLINE_SECONDS } from '@/domain/engine'
import { useTerminalStore } from './terminalStore'
import { useResourcesStore } from './resourcesStore'
import { useHardwareStore } from './hardwareStore'
import { useUpgradesStore } from './upgradesStore'
import { useAllocationStore } from './allocationStore'
import { useFeaturesStore } from './featuresStore'
import { usePrestigeStore } from './prestigeStore'
import { GameSaveManager } from './helpers/gameSaveManager'
import { GameStateHydrator, type StoreCollection } from './helpers/gameStateHydrator'
import { GameActionHandler } from './helpers/gameActionHandler'

export { MAX_OFFLINE_SECONDS, RAW_TEXT_SNIPPETS }

function bridge<T>(getter: () => T, setter: (v: T) => void) {
  return computed({ get: getter, set: setter })
}

export const useGameStore = defineStore('game', () => {
  const terminal = useTerminalStore()
  const resources = useResourcesStore()
  const hardwareStore = useHardwareStore()
  const upgradesStore = useUpgradesStore()
  const allocation = useAllocationStore()
  const features = useFeaturesStore()
  const prestigeStore = usePrestigeStore()

  const version = ref(CURRENT_SAVE_VERSION)
  const gameStartTime = ref(Date.now())
  const lastTickTimestamp = ref(Date.now())
  const lastOfflineReport = ref<OfflineProgressSummary | null>(null)

  let saveAccumulator = 0
  let autoBrokerAccumulator = 0

  const stores: StoreCollection = {
    terminal,
    resources,
    hardwareStore,
    upgradesStore,
    allocation,
    features,
    prestigeStore,
    meta: { version, gameStartTime, lastTickTimestamp, lastOfflineReport },
  }

  // Multipliers & Computeds
  const modelQualityMultiplier = computed(() => EconomyEngine.calculateModelQualityMultiplier(resources.parameters))
  const manualScrapePower = computed(() => upgradesStore.manualScrapePower * prestigeStore.talentMultipliers.scrapePowerMultiplier)
  const rawTextSellPrice = computed(() => upgradesStore.rawTextSellPrice * prestigeStore.talentMultipliers.rawTextPriceMultiplier)
  const effectiveCompute = computed(() => {
    return hardwareStore.effectiveCompute
      .mul(prestigeStore.checkpointMultiplier)
      .mul(prestigeStore.talentMultipliers.tflopsMultiplier)
  })

  // Core Actions
  function manualScrape(amount?: number) {
    GameActionHandler.manualScrape(stores, amount ?? manualScrapePower.value)
  }

  function sellRawText(charsToSell = 20, silent = false): boolean {
    return GameActionHandler.sellRawText(stores, charsToSell, rawTextSellPrice.value, silent)
  }

  function sellAllRawText(): boolean {
    return GameActionHandler.sellAllRawText(stores, rawTextSellPrice.value)
  }

  function getHardwareCost(id: string): Decimal {
    return hardwareStore.getHardwareCost(id).mul(prestigeStore.talentMultipliers.hardwareDiscountMultiplier)
  }

  function buyHardware(id: string): boolean {
    return GameActionHandler.buyHardware(stores, id)
  }

  function buyUpgrade(id: string): boolean {
    return GameActionHandler.buyUpgrade(stores, id)
  }

  function updateAllocations(newAllocations: { inferencePercent: number; trainingPercent: number; researchPercent: number }) {
    allocation.updateAllocations(newAllocations, features.unlockedFeatures.trainingAllocation, features.unlockedFeatures.researchAllocation)
  }

  function setAllocationPreset(preset: AllocationPreset) {
    const logMsg = allocation.setAllocationPreset(preset, features.unlockedFeatures.trainingAllocation, features.unlockedFeatures.researchAllocation)
    if (logMsg) terminal.addLog(logMsg, 'info')
  }

  function buyTalent(talentId: string): boolean {
    const res = prestigeStore.buyTalent(talentId)
    if (res.success) {
      terminal.addLog(`Talent d'architecture débloqué : ${prestigeStore.talents[talentId]?.name} (-${prestigeStore.talents[talentId]?.cost} AP).`, 'success')
      return true
    }
    return false
  }

  function triggerPrestige(): boolean {
    const res = prestigeStore.claimPrestige(resources.parameters)
    if (res.success) {
      GameStateHydrator.performSoftReset(stores)
      saveToLocalStorage()
      return true
    }
    return false
  }

  function processTick(dt: number) {
    const res = GameActionHandler.processTick(stores, dt, effectiveCompute.value, modelQualityMultiplier.value, autoBrokerAccumulator)
    autoBrokerAccumulator = res.newAutoBrokerAccumulator
    lastTickTimestamp.value = Date.now()

    saveAccumulator += dt
    if (saveAccumulator >= 5) {
      saveAccumulator = 0
      saveToLocalStorage()
    }
  }

  function calculateOfflineProgress() {
    const now = Date.now()
    const report = OfflineEngine.calculateOfflineProgress({
      now,
      lastTickTimestamp: lastTickTimestamp.value,
      rawTextCurrent: resources.rawText.current,
      tokensCurrent: resources.tokens.current,
      fundsCurrent: resources.funds.current,
      parametersCurrent: resources.parameters,
      runStep: (stepDt: number) => processTick(stepDt),
    })

    if (report) {
      lastOfflineReport.value = report
      terminal.addLog(`Progression hors-ligne traitée : ${Math.floor(report.simulatedSeconds / 60)} min simulées (+${report.fundsGained.toFixed(2)}$).`, 'info')
    }
    lastTickTimestamp.value = now
    saveToLocalStorage()
  }

  function getFullState(): GameState {
    return GameStateHydrator.extractFullState(stores)
  }

  function saveToLocalStorage() {
    GameSaveManager.save(getFullState())
  }

  function loadFromLocalStorage(): boolean {
    const loaded = GameSaveManager.load(getFullState())
    if (!loaded) return false
    GameStateHydrator.hydrateStores(loaded, stores)
    calculateOfflineProgress()
    return true
  }

  loadFromLocalStorage()

  return {
    version,
    gameStartTime,
    lastTickTimestamp,
    lastOfflineReport,
    currentPhase: bridge(() => features.currentPhase, (v) => { features.currentPhase = v }),
    unlockedFeatures: bridge(() => features.unlockedFeatures, (v) => { features.unlockedFeatures = v }),
    reachedMilestones: computed(() => features.reachedMilestones),
    rawText: bridge(() => resources.rawText, (v) => { resources.rawText = v }),
    tokens: bridge(() => resources.tokens, (v) => { resources.tokens = v }),
    funds: bridge(() => resources.funds, (v) => { resources.funds = v }),
    parameters: bridge(() => resources.parameters, (v) => { resources.parameters = v }),
    researchPoints: bridge(() => resources.researchPoints, (v) => { resources.researchPoints = v }),
    totalCharsRead: bridge(() => resources.totalCharsRead, (v) => { resources.totalCharsRead = v }),
    totalTokensServed: bridge(() => resources.totalTokensServed, (v) => { resources.totalTokensServed = v }),
    currentSnippetIndex: bridge(() => resources.currentSnippetIndex, (v) => { resources.currentSnippetIndex = v }),
    currentSnippet: computed(() => resources.currentSnippet),
    hardware: bridge(() => hardwareStore.hardware, (v) => { hardwareStore.hardware = v }),
    gridCapacityWatts: bridge(() => hardwareStore.gridCapacityWatts, (v) => { hardwareStore.gridCapacityWatts = v }),
    coolingCapacityWatts: bridge(() => hardwareStore.coolingCapacityWatts, (v) => { hardwareStore.coolingCapacityWatts = v }),
    totalRawCompute: computed(() => hardwareStore.totalRawCompute),
    totalPowerDrawWatts: computed(() => hardwareStore.totalPowerDrawWatts),
    totalVramGB: computed(() => hardwareStore.totalVramGB),
    totalMemoryBandwidthGBs: computed(() => hardwareStore.totalMemoryBandwidthGBs),
    bandwidthSpeedMultiplier: computed(() => hardwareStore.bandwidthSpeedMultiplier),
    pcieSlots: computed(() => hardwareStore.pcieSlots),
    thermalState: computed(() => hardwareStore.thermalState),
    powerState: computed(() => hardwareStore.powerState),
    effectiveCompute,
    hasPotatoPc: computed(() => hardwareStore.hasPotatoPc),
    hasWorkstation: computed(() => hardwareStore.hasWorkstation),
    activeHostNode: computed(() => hardwareStore.activeHostNode),
    nextHostNode: computed(() => hardwareStore.nextHostNode),
    upgrades: bridge(() => upgradesStore.upgrades, (v) => { upgradesStore.upgrades = v }),
    manualScrapePower,
    rawTextSellPrice,
    autoScrapeRate: computed(() => upgradesStore.autoScrapeRate),
    allocations: bridge(() => allocation.allocations, (v) => { allocation.allocations = v }),
    terminalLogs: computed(() => terminal.terminalLogs),
    modelQualityMultiplier,
    checkpointMultiplier: computed(() => prestigeStore.checkpointMultiplier),
    talentMultipliers: computed(() => prestigeStore.talentMultipliers),
    canPrestige: computed(() => prestigeStore.canPrestige(resources.parameters)),
    pendingAP: computed(() => prestigeStore.calculatePendingAP(resources.parameters)),
    prestige: prestigeStore,
    addLog: terminal.addLog,
    clearLogs: terminal.clearLogs,
    manualScrape,
    sellRawText,
    sellAllRawText,
    buyHardware,
    buyUpgrade,
    getHardwareCost,
    updateAllocations,
    setAllocationPreset,
    buyTalent,
    triggerPrestige,
    softReset: triggerPrestige,
    processTick,
    calculateOfflineProgress,
    dismissOfflineReport: () => { lastOfflineReport.value = null },
    getFullState,
    saveToLocalStorage,
    loadFromLocalStorage,
    hardReset: () => GameSaveManager.hardReset(),
  }
})
