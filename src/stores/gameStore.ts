import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type {
  GameState,
  LogType,
  OfflineProgressSummary,
  AllocationPreset,
} from '@/types'
import {
  SAVE_KEY,
  CURRENT_SAVE_VERSION,
  serializeGameState,
  deserializeGameState,
} from '@/utils/serialization'
import { RAW_TEXT_SNIPPETS } from '@/domain/constants/snippets'
import { EconomyEngine } from '@/domain/engine/EconomyEngine'
import { MilestoneTracker } from '@/domain/engine/MilestoneTracker'
import { TickEngine } from '@/domain/engine/TickEngine'
import { OfflineEngine, MAX_OFFLINE_SECONDS } from '@/domain/engine/OfflineEngine'
import { useTerminalStore } from './terminalStore'
import { useResourcesStore } from './resourcesStore'
import { useHardwareStore } from './hardwareStore'
import { useUpgradesStore } from './upgradesStore'
import { useAllocationStore } from './allocationStore'
import { useFeaturesStore } from './featuresStore'

export { MAX_OFFLINE_SECONDS, RAW_TEXT_SNIPPETS }

export const useGameStore = defineStore('game', () => {
  // Sub-stores composition
  const terminal = useTerminalStore()
  const resources = useResourcesStore()
  const hardwareStore = useHardwareStore()
  const upgradesStore = useUpgradesStore()
  const allocation = useAllocationStore()
  const features = useFeaturesStore()

  // Meta state
  const version = ref(CURRENT_SAVE_VERSION)
  const gameStartTime = ref(Date.now())
  const lastTickTimestamp = ref(Date.now())
  const lastOfflineReport = ref<OfflineProgressSummary | null>(null)

  let saveAccumulator = 0
  let autoBrokerAccumulator = 0

  // ==========================================
  // COMPUTED ENGINE VALUES
  // ==========================================

  const modelQualityMultiplier = computed<number>(() => {
    return EconomyEngine.calculateModelQualityMultiplier(resources.parameters)
  })

  // Shortcuts & getters
  const manualScrapePower = computed(() => upgradesStore.manualScrapePower)
  const rawTextSellPrice = computed(() => upgradesStore.rawTextSellPrice)
  const autoScrapeRate = computed(() => upgradesStore.autoScrapeRate)
  const totalRawCompute = computed(() => hardwareStore.totalRawCompute)
  const totalPowerDrawWatts = computed(() => hardwareStore.totalPowerDrawWatts)
  const totalVramGB = computed(() => hardwareStore.totalVramGB)
  const totalMemoryBandwidthGBs = computed(() => hardwareStore.totalMemoryBandwidthGBs)
  const bandwidthSpeedMultiplier = computed(() => hardwareStore.bandwidthSpeedMultiplier)
  const pcieSlots = computed(() => hardwareStore.pcieSlots)
  const thermalState = computed(() => hardwareStore.thermalState)
  const powerState = computed(() => hardwareStore.powerState)
  const effectiveCompute = computed(() => hardwareStore.effectiveCompute)
  const hasPotatoPc = computed(() => hardwareStore.hasPotatoPc)
  const hasWorkstation = computed(() => hardwareStore.hasWorkstation)
  const currentSnippet = computed(() => resources.currentSnippet)

  // ==========================================
  // ACTIONS & GAME LOGIC
  // ==========================================

  function addLog(message: string, type: LogType = 'info') {
    terminal.addLog(message, type)
  }

  function clearLogs() {
    terminal.clearLogs()
  }

  function checkEarlyGameProgress() {
    const chars = resources.totalCharsRead.toNumber()
    const events = MilestoneTracker.checkEarlyGameProgress(
      chars,
      features.reachedMilestones,
      features.unlockedFeatures
    )
    for (const evt of events) {
      terminal.addLog(evt.message, evt.type)
    }

    const hwEvents = MilestoneTracker.checkHardwareUnlock(
      resources.funds.current,
      chars,
      features.unlockedFeatures,
      features.reachedMilestones
    )
    for (const evt of hwEvents) {
      terminal.addLog(evt.message, evt.type)
    }
  }

  function manualScrape(amount?: number) {
    const power = amount ?? manualScrapePower.value
    const added = resources.manualScrape(power)

    checkEarlyGameProgress()

    if (added.gt(0) && Math.random() < 0.2) {
      terminal.addLog(
        `Lecture & transcription manuelle : +${added.toFixed(0)} caractères transcrits.`,
        'info'
      )
    }
  }

  function sellRawText(charsToSell = 20, silent = false): boolean {
    const { success, earned } = resources.sellRawText(charsToSell, rawTextSellPrice.value)
    if (success) {
      if (!silent) {
        terminal.addLog(
          `Données brutes vendues au courtier : +$${earned.toFixed(2)} (${charsToSell} chars).`,
          'info'
        )
      }

      const hwEvents = MilestoneTracker.checkHardwareUnlock(
        resources.funds.current,
        resources.totalCharsRead.toNumber(),
        features.unlockedFeatures,
        features.reachedMilestones
      )
      for (const evt of hwEvents) {
        terminal.addLog(evt.message, evt.type)
      }
      return true
    }
    return false
  }

  function sellAllRawText(): boolean {
    const { success, earned, charsSold } = resources.sellAllRawText(rawTextSellPrice.value)
    if (success) {
      terminal.addLog(
        `Lot complet de données brutes vendu : +$${earned.toFixed(2)} (${charsSold} chars).`,
        'info'
      )
      return true
    }
    return false
  }

  function getHardwareCost(id: string): Decimal {
    return hardwareStore.getHardwareCost(id)
  }

  function buyHardware(id: string): boolean {
    const purchasedUpgrades = new Set(
      Object.values(upgradesStore.upgrades)
        .filter((u) => u.purchased)
        .map((u) => u.id)
    )
    const result = hardwareStore.buyHardware(id, resources.funds.current, purchasedUpgrades)
    if (result.success && result.node) {
      resources.funds.current = resources.funds.current.sub(result.cost)
      terminal.addLog(
        `Achat matériel effectué : ${result.node.name} pour $${result.cost.toFixed(2)}.`,
        'success'
      )

      // Phase 1 trigger: First Potato PC
      if (id === 'potato_pc' && result.node.count === 1) {
        features.unlockFeature('scriptsSection')
        features.unlockFeature('hardwareSection')
        features.unlockFeature('autoScraping')
        resources.rawText.max = Decimal.max(resources.rawText.max, 500)
        hardwareStore.gridCapacityWatts = Decimal.max(hardwareStore.gridCapacityWatts, 150)
        hardwareStore.coolingCapacityWatts = Decimal.max(hardwareStore.coolingCapacityWatts, 100)
        features.setPhase(1)

        if (!features.reachedMilestones.firstPotatoPc) {
          features.reachedMilestones.firstPotatoPc = true
          terminal.addLog(
            'Relique allumée ! Le disque dur IDE 5400 RPM crépite et le ventilateur hurle. Vous pouvez maintenant exécuter vos premiers scripts Python.',
            'event'
          )
        }
      }

      // Phase 2 trigger: First Workstation CPU or GPU
      if ((id === 'core2_quad' || id === 'gtx_750ti' || id === 'used_cpu') && result.node.count === 1) {
        features.unlockFeature('tokenizerUnlocked')
        features.unlockFeature('oscilloscope')
        resources.rawText.max = Decimal.max(resources.rawText.max, 2000)
        resources.tokens.max = Decimal.max(resources.tokens.max, 1000)
        hardwareStore.gridCapacityWatts = Decimal.max(hardwareStore.gridCapacityWatts, 500)
        hardwareStore.coolingCapacityWatts = Decimal.max(hardwareStore.coolingCapacityWatts, 300)
        features.setPhase(2)

        if (!features.reachedMilestones.firstCpu) {
          features.reachedMilestones.firstCpu = true
          terminal.addLog(
            'Station Tour en ligne ! Tokenizer BPE activé : conversion automatique du Raw Text en Tokens ($T$) et requêtes d’inférence démarrées.',
            'event'
          )
        }
      }

      if ((id === 'rtx_3060' || id === 'gtx_750ti' || id === 'gtx_1060' || id === 'gtx_gpu') && !features.reachedMilestones.firstGpu) {
        features.reachedMilestones.firstGpu = true
        terminal.addLog(
          'GPU dédié déployé avec succès. Accélération massive de la bande passante mémoire et tokenisation !',
          'event'
        )
      }

      if (id === 'a100_sxm4' || id === 'a100_blade') {
        terminal.addLog(
          'Lame Datacenter NVIDIA A100 en ligne ! Mémoire HBM2e 2 To/s connectée.',
          'success'
        )
      }

      return true
    }

    if (result.reason === 'missing_ram_upgrade') {
      terminal.addLog(
        'Impossible d’acquérir cette tour : vous devez d’abord installer tous les kits de RAM requis sur votre machine actuelle !',
        'warn'
      )
    } else if (result.reason === 'max_count_reached') {
      terminal.addLog(
        'Cette machine est déjà installée et active !',
        'warn'
      )
    } else if (result.reason === 'host_tier_too_low') {
      const node = hardwareStore.hardware[id]
      const minTier = node?.minHostTier ?? 1
      terminal.addLog(
        `Impossible d’installer ce GPU : nécessite une station hôte de Tier ${minTier}+ avec un slot PCIe libre !`,
        'warn'
      )
    } else if (result.reason === 'no_pcie_slots') {
      terminal.addLog(
        'Impossible d’installer ce GPU : aucun slot PCIe disponible ! Achetez ou améliorez une station hôte pour obtenir des slots supplémentaires.',
        'warn'
      )
    }

    return false
  }

  function applyUpgradeEffects(id: string) {
    if (id === 'script_simple_scraper' || id === 'crawler_daemon_v2') {
      features.unlockFeature('autoScraping')
    } else if (id === 'script_cron_autobroker') {
      features.unlockFeature('autoBroker')
    } else if (id === 'ram_sdram_256mb') {
      resources.rawText.max = Decimal.max(resources.rawText.max, 1500)
    } else if (id === 'script_ram_expansion_512') {
      resources.rawText.max = Decimal.max(resources.rawText.max, 2500)
    } else if (id === 'ram_ddr2_8gb') {
      resources.rawText.max = Decimal.max(resources.rawText.max, 6000)
      resources.tokens.max = Decimal.max(resources.tokens.max, 3000)
    } else if (id === 'ram_ddr3_16gb') {
      resources.rawText.max = Decimal.max(resources.rawText.max, 15000)
      resources.tokens.max = Decimal.max(resources.tokens.max, 8000)
    } else if (id === 'ram_ddr4_32gb') {
      resources.rawText.max = Decimal.max(resources.rawText.max, 40000)
      resources.tokens.max = Decimal.max(resources.tokens.max, 25000)
    } else if (id === 'ram_ddr4_64gb') {
      resources.rawText.max = Decimal.max(resources.rawText.max, 100000)
      resources.tokens.max = Decimal.max(resources.tokens.max, 75000)
    } else if (id === 'ram_ddr5_128gb') {
      resources.rawText.max = Decimal.max(resources.rawText.max, 300000)
      resources.tokens.max = Decimal.max(resources.tokens.max, 250000)
    } else if (id === 'ram_ddr5_256gb') {
      resources.rawText.max = Decimal.max(resources.rawText.max, 1000000)
      resources.tokens.max = Decimal.max(resources.tokens.max, 1000000)
    } else if (id === 'cooling_optimization_v1') {
      hardwareStore.coolingCapacityWatts = hardwareStore.coolingCapacityWatts.add(200)
    }
  }

  function buyUpgrade(id: string): boolean {
    const result = upgradesStore.buyUpgrade(
      id,
      resources.funds.current,
      resources.researchPoints.current,
      features.unlockedFeatures
    )

    if (result.success && result.upgrade) {
      if (result.currency === 'funds') {
        resources.funds.current = resources.funds.current.sub(result.cost)
        terminal.addLog(
          `Module activé : ${result.upgrade.name} pour $${result.cost.toFixed(2)}.`,
          'success'
        )
      } else {
        resources.researchPoints.current = resources.researchPoints.current.sub(result.cost)
        terminal.addLog(`Recherche complétée : ${result.upgrade.name}.`, 'success')
      }
      applyUpgradeEffects(id)
      return true
    }
    return false
  }

  function updateAllocations(newAllocations: {
    inferencePercent: number
    trainingPercent: number
    researchPercent: number
  }) {
    allocation.updateAllocations(
      newAllocations,
      features.unlockedFeatures.trainingAllocation,
      features.unlockedFeatures.researchAllocation
    )
  }

  function setAllocationPreset(preset: AllocationPreset) {
    const logMsg = allocation.setAllocationPreset(
      preset,
      features.unlockedFeatures.trainingAllocation,
      features.unlockedFeatures.researchAllocation
    )
    if (logMsg) {
      terminal.addLog(logMsg, 'info')
    }
  }

  function processTick(dt: number) {
    const tickResult = TickEngine.processTick(
      {
        rawText: resources.rawText,
        tokens: resources.tokens,
        funds: resources.funds,
        parameters: resources.parameters,
        researchPoints: resources.researchPoints,
        upgrades: upgradesStore.upgrades,
        allocations: allocation.allocations,
        unlockedFeatures: features.unlockedFeatures,
        milestones: features.reachedMilestones,
        effectiveCompute: effectiveCompute.value,
        modelQualityMultiplier: modelQualityMultiplier.value,
        bandwidthSpeedMultiplier: bandwidthSpeedMultiplier.value,
        totalTokensServed: resources.totalTokensServed,
        autoBrokerAccumulator,
        onSellRawTextQuiet: (amount: number) => sellRawText(amount, true),
        onAddLog: (msg: string, type?: LogType) => terminal.addLog(msg, type ?? 'info'),
      },
      dt
    )

    autoBrokerAccumulator = tickResult.newAutoBrokerAccumulator
    resources.totalTokensServed = tickResult.updatedTotalTokensServed
    resources.parameters = tickResult.updatedParameters

    if (features.unlockedFeatures.trainingAllocation && features.currentPhase < 3) {
      features.setPhase(3)
    }

    lastTickTimestamp.value = Date.now()

    // Autosave interval
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
      terminal.addLog(
        `Progression hors-ligne traitée : ${Math.floor(report.simulatedSeconds / 60)} min simulées (+${report.fundsGained.toFixed(2)}$).`,
        'info'
      )
    }

    lastTickTimestamp.value = now
    saveToLocalStorage()
  }

  function dismissOfflineReport() {
    lastOfflineReport.value = null
  }

  function getFullState(): GameState {
    return {
      version: version.value,
      lastTickTimestamp: lastTickTimestamp.value,
      gameStartTime: gameStartTime.value,
      currentPhase: features.currentPhase,
      totalCharsRead: resources.totalCharsRead,
      rawText: resources.rawText,
      tokens: resources.tokens,
      funds: resources.funds,
      parameters: resources.parameters,
      researchPoints: resources.researchPoints,
      hardware: hardwareStore.hardware,
      upgrades: upgradesStore.upgrades,
      allocations: allocation.allocations,
      gridCapacityWatts: hardwareStore.gridCapacityWatts,
      coolingCapacityWatts: hardwareStore.coolingCapacityWatts,
      terminalLogs: terminal.terminalLogs,
      unlockedFeatures: features.unlockedFeatures,
      lastOfflineReport: lastOfflineReport.value,
    }
  }

  function saveToLocalStorage() {
    try {
      const state = getFullState()
      const json = serializeGameState(state)
      localStorage.setItem(SAVE_KEY, json)
    } catch (err) {
      console.error('[Save] Erreur lors de la sauvegarde :', err)
    }
  }

  function loadFromLocalStorage(): boolean {
    try {
      const json = localStorage.getItem(SAVE_KEY)
      if (!json) return false

      const dummyState = getFullState()
      const loaded = deserializeGameState(json, dummyState)
      if (!loaded) return false

      if (loaded.rawText) resources.rawText = loaded.rawText
      if (loaded.tokens) resources.tokens = loaded.tokens
      if (loaded.funds) resources.funds = loaded.funds
      if (loaded.parameters) resources.parameters = loaded.parameters
      if (loaded.researchPoints) resources.researchPoints = loaded.researchPoints
      if (loaded.hardware) hardwareStore.hardware = loaded.hardware
      if (loaded.upgrades) upgradesStore.upgrades = loaded.upgrades
      if (loaded.allocations) allocation.allocations = loaded.allocations
      if (loaded.gridCapacityWatts) hardwareStore.gridCapacityWatts = loaded.gridCapacityWatts
      if (loaded.coolingCapacityWatts) hardwareStore.coolingCapacityWatts = loaded.coolingCapacityWatts
      if (loaded.terminalLogs) terminal.setLogs(loaded.terminalLogs)
      if (loaded.unlockedFeatures) features.unlockedFeatures = loaded.unlockedFeatures
      if (loaded.lastTickTimestamp) lastTickTimestamp.value = loaded.lastTickTimestamp
      if (loaded.gameStartTime) gameStartTime.value = loaded.gameStartTime
      if (loaded.currentPhase !== undefined) features.currentPhase = loaded.currentPhase
      if (loaded.totalCharsRead) resources.totalCharsRead = loaded.totalCharsRead

      calculateOfflineProgress()
      return true
    } catch (err) {
      console.error('[Load] Erreur lors du chargement de la sauvegarde :', err)
      return false
    }
  }

  function hardReset() {
    localStorage.removeItem(SAVE_KEY)
    location.reload()
  }

  // Initial load
  loadFromLocalStorage()

  return {
    // Meta & System
    version,
    gameStartTime,
    lastTickTimestamp,
    lastOfflineReport,
    // Features & Milestones
    currentPhase: computed({
      get: () => features.currentPhase,
      set: (val: number) => { features.currentPhase = val },
    }),
    unlockedFeatures: computed({
      get: () => features.unlockedFeatures,
      set: (val) => { features.unlockedFeatures = val },
    }),
    reachedMilestones: computed(() => features.reachedMilestones),
    // Resources
    rawText: computed({
      get: () => resources.rawText,
      set: (val) => { resources.rawText = val },
    }),
    tokens: computed({
      get: () => resources.tokens,
      set: (val) => { resources.tokens = val },
    }),
    funds: computed({
      get: () => resources.funds,
      set: (val) => { resources.funds = val },
    }),
    parameters: computed({
      get: () => resources.parameters,
      set: (val) => { resources.parameters = val },
    }),
    researchPoints: computed({
      get: () => resources.researchPoints,
      set: (val) => { resources.researchPoints = val },
    }),
    totalCharsRead: computed({
      get: () => resources.totalCharsRead,
      set: (val) => { resources.totalCharsRead = val },
    }),
    totalTokensServed: computed({
      get: () => resources.totalTokensServed,
      set: (val) => { resources.totalTokensServed = val },
    }),
    currentSnippetIndex: computed({
      get: () => resources.currentSnippetIndex,
      set: (val: number) => { resources.currentSnippetIndex = val },
    }),
    currentSnippet,
    // Hardware & Physics
    hardware: computed({
      get: () => hardwareStore.hardware,
      set: (val) => { hardwareStore.hardware = val },
    }),
    gridCapacityWatts: computed({
      get: () => hardwareStore.gridCapacityWatts,
      set: (val) => { hardwareStore.gridCapacityWatts = val },
    }),
    coolingCapacityWatts: computed({
      get: () => hardwareStore.coolingCapacityWatts,
      set: (val) => { hardwareStore.coolingCapacityWatts = val },
    }),
    totalRawCompute,
    totalPowerDrawWatts,
    totalVramGB,
    totalMemoryBandwidthGBs,
    bandwidthSpeedMultiplier,
    pcieSlots,
    thermalState,
    powerState,
    effectiveCompute,
    hasPotatoPc,
    hasWorkstation,
    activeHostNode: computed(() => hardwareStore.activeHostNode),
    nextHostNode: computed(() => hardwareStore.nextHostNode),
    // Upgrades
    upgrades: computed({
      get: () => upgradesStore.upgrades,
      set: (val) => { upgradesStore.upgrades = val },
    }),
    manualScrapePower,
    rawTextSellPrice,
    autoScrapeRate,
    // Allocations
    allocations: computed({
      get: () => allocation.allocations,
      set: (val) => { allocation.allocations = val },
    }),
    // Logs
    terminalLogs: computed(() => terminal.terminalLogs),
    // Multipliers & Computeds
    modelQualityMultiplier,
    // Actions
    addLog,
    clearLogs,
    manualScrape,
    sellRawText,
    sellAllRawText,
    buyHardware,
    buyUpgrade,
    getHardwareCost,
    updateAllocations,
    setAllocationPreset,
    processTick,
    calculateOfflineProgress,
    dismissOfflineReport,
    getFullState,
    saveToLocalStorage,
    loadFromLocalStorage,
    hardReset,
  }
})
