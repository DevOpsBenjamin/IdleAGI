import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type {
  GameState,
  HardwareNode,
  LogEntry,
  LogType,
  OfflineProgressSummary,
  ThermalState,
  PowerState,
} from '@/types/game'
import {
  SAVE_KEY,
  CURRENT_SAVE_VERSION,
  serializeGameState,
  deserializeGameState,
} from '@/utils/serialization'

export const MAX_OFFLINE_SECONDS = 86400 // 24 heures

const INITIAL_HARDWARE: Record<string, HardwareNode> = {
  used_cpu: {
    id: 'used_cpu',
    name: "CPU d'occasion (4 Cores)",
    count: 1,
    baseCost: new Decimal(25),
    costMult: 1.15,
    tflops: new Decimal(0.05), // 50 GFLOPS
    vram: new Decimal(4),      // 4 GB
    powerWatts: new Decimal(65),
    description: "Processeur de récupération permettant d'exécuter un tokenizer basique.",
    tier: 1,
  },
  gtx_gpu: {
    id: 'gtx_gpu',
    name: 'GPU Grand Public (GTX 1080)',
    count: 0,
    baseCost: new Decimal(150),
    costMult: 1.18,
    tflops: new Decimal(0.5),  // 500 GFLOPS
    vram: new Decimal(8),      // 8 GB
    powerWatts: new Decimal(180),
    description: "Carte graphique grand public accélérant grandement la tokenisation et l'inférence.",
    tier: 1,
  },
  server_blade: {
    id: 'server_blade',
    name: 'Lame de Serveur Datacenter (A100)',
    count: 0,
    baseCost: new Decimal(2500),
    costMult: 1.22,
    tflops: new Decimal(19.5), // 19.5 TFLOPS
    vram: new Decimal(80),     // 80 GB
    powerWatts: new Decimal(400),
    description: "Accélérateur IA de classe entreprise pour modèles à grande échelle.",
    tier: 2,
  },
}

export const useGameStore = defineStore('game', () => {
  const version = ref(CURRENT_SAVE_VERSION)
  const gameStartTime = ref(Date.now())
  const lastTickTimestamp = ref(Date.now())

  // Currencies
  const rawText = ref({
    current: new Decimal(0),
    max: new Decimal(1000),
    ratePerSec: new Decimal(0),
  })

  const tokens = ref({
    current: new Decimal(0),
    max: new Decimal(500),
    ratePerSec: new Decimal(0),
  })

  const funds = ref({
    current: new Decimal(50), // Start capital
    max: new Decimal(Infinity),
    ratePerSec: new Decimal(0),
  })

  const parameters = ref(new Decimal(0))

  const researchPoints = ref({
    current: new Decimal(0),
    max: new Decimal(10000),
    ratePerSec: new Decimal(0),
  })

  // Hardware
  const hardware = ref<Record<string, HardwareNode>>(JSON.parse(JSON.stringify(INITIAL_HARDWARE)))
  // Reinstanciate Decimals in hardware
  for (const node of Object.values(hardware.value)) {
    node.baseCost = new Decimal(node.baseCost)
    node.tflops = new Decimal(node.tflops)
    node.vram = new Decimal(node.vram)
    node.powerWatts = new Decimal(node.powerWatts)
  }

  // Allocations (%)
  const allocations = ref<GameState['allocations']>({
    inferencePercent: 50,
    trainingPercent: 30,
    researchPercent: 20,
  })

  // Physical grid & cooling
  const gridCapacityWatts = ref(new Decimal(500))
  const coolingCapacityWatts = ref(new Decimal(300))

  // Logs
  const terminalLogs = ref<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: Date.now(),
      message: 'Moteur neural initialisé. En attente de flux de données textuelles...',
      type: 'info',
    },
  ])

  // Unlocks
  const unlockedFeatures = ref<GameState['unlockedFeatures']>({
    dashboardView: true,
    autoScraping: false,
    syntheticData: false,
    quantumLayer: false,
    prestigeT1: false,
    prestigeT2: false,
    prestigeT3: false,
  })

  // Offline progress report
  const lastOfflineReport = ref<OfflineProgressSummary | null>(null)

  let saveAccumulator = 0

  // ==========================================
  // COMPUTED ENGINE VALUES
  // ==========================================

  const totalRawCompute = computed<Decimal>(() => {
    let sum = new Decimal(0)
    for (const node of Object.values(hardware.value)) {
      sum = sum.add(node.tflops.mul(node.count))
    }
    return sum
  })

  const totalPowerDrawWatts = computed<Decimal>(() => {
    let sum = new Decimal(0)
    for (const node of Object.values(hardware.value)) {
      sum = sum.add(node.powerWatts.mul(node.count))
    }
    return sum
  })

  const totalVramGB = computed<Decimal>(() => {
    let sum = new Decimal(0)
    for (const node of Object.values(hardware.value)) {
      sum = sum.add(node.vram.mul(node.count))
    }
    return sum
  })

  const thermalState = computed<ThermalState>(() => {
    const heat = totalPowerDrawWatts.value.mul(0.9)
    const cooling = coolingCapacityWatts.value
    let efficiency = 1.0
    if (heat.gt(0) && heat.gt(cooling)) {
      efficiency = cooling.div(heat).toNumber()
    }
    return {
      heatGeneratedWatts: heat,
      coolingCapacityWatts: cooling,
      efficiency: Math.max(0.1, Math.min(1.0, efficiency)),
      isThrottling: efficiency < 1.0,
    }
  })

  const powerState = computed<PowerState>(() => {
    const draw = totalPowerDrawWatts.value
    const cap = gridCapacityWatts.value
    const loadPercent = cap.gt(0) ? draw.div(cap).mul(100).toNumber() : 0
    return {
      totalDrawWatts: draw,
      gridCapacityWatts: cap,
      gridLoadPercent: loadPercent,
      isOverloaded: draw.gt(cap),
    }
  })

  const effectiveCompute = computed<Decimal>(() => {
    let comp = totalRawCompute.value.mul(thermalState.value.efficiency)
    if (powerState.value.isOverloaded) {
      comp = comp.mul(0.5) // 50% penalty if grid is overloaded
    }
    return comp
  })

  // ==========================================
  // ACTIONS & GAME LOGIC
  // ==========================================

  function addLog(message: string, type: LogType = 'info') {
    terminalLogs.value.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      message,
      type,
    })
    if (terminalLogs.value.length > 200) {
      terminalLogs.value.shift()
    }
  }

  function manualScrape(amount = 10) {
    const before = rawText.value.current
    rawText.value.current = Decimal.min(
      rawText.value.max,
      rawText.value.current.add(amount)
    )
    const added = rawText.value.current.sub(before)
    if (added.gt(0) && Math.random() < 0.1) {
      addLog(`Scraping manuel : +${added.toFixed(0)} caractères bruts acquis.`, 'info')
    }
  }

  function manualTokenize(tokensToMake = 1) {
    const charsPerToken = 4
    const neededChars = new Decimal(tokensToMake * charsPerToken)

    if (rawText.value.current.gte(neededChars)) {
      const maxPossibleTokens = rawText.value.max.minus(tokens.value.current)
      const actualTokens = Decimal.min(tokensToMake, maxPossibleTokens)

      if (actualTokens.gt(0)) {
        rawText.value.current = rawText.value.current.sub(actualTokens.mul(charsPerToken))
        tokens.value.current = Decimal.min(
          tokens.value.max,
          tokens.value.current.add(actualTokens)
        )
      }
    }
  }

  function getHardwareCost(id: string): Decimal {
    const item = hardware.value[id]
    if (!item) return new Decimal(Infinity)
    return item.baseCost.mul(Math.pow(item.costMult, item.count))
  }

  function buyHardware(id: string) {
    const item = hardware.value[id]
    if (!item) return false

    const cost = getHardwareCost(id)
    if (funds.value.current.gte(cost)) {
      funds.value.current = funds.value.current.sub(cost)
      item.count += 1
      addLog(`Achat effectué : ${item.name} (#${item.count}) pour $${cost.toFixed(2)}.`, 'success')
      return true
    }
    return false
  }

  function updateAllocations(newAllocations: {
    inferencePercent: number
    trainingPercent: number
    researchPercent: number
  }) {
    const total =
      newAllocations.inferencePercent +
      newAllocations.trainingPercent +
      newAllocations.researchPercent
    if (total === 100) {
      allocations.value = { ...newAllocations }
    }
  }

  // Engine Tick (50ms interval)
  function processTick(dt: number) {
    // 1. Scraping automatique (si débloqué ou passif de base du CPU)
    const baseAutoScrapePerSec = unlockedFeatures.value.autoScraping ? 20 : 0
    if (baseAutoScrapePerSec > 0) {
      const charsGained = new Decimal(baseAutoScrapePerSec * dt)
      rawText.value.current = Decimal.min(rawText.value.max, rawText.value.current.add(charsGained))
      rawText.value.ratePerSec = new Decimal(baseAutoScrapePerSec)
    }

    // 2. Tokenisation automatique via le Compute disponible
    // 1 TFLOPS peut tokeniser jusqu'à 50 tokens/s s'il y a du Raw Text disponible
    const compute = effectiveCompute.value
    const tokenizingCapacity = compute.mul(50).mul(dt) // tokens pouvant être traités ce tick
    const charsAvailable = rawText.value.current
    const tokensPossibleFromText = charsAvailable.div(4)
    const tokensToCreate = Decimal.min(tokenizingCapacity, tokensPossibleFromText)

    if (tokensToCreate.gt(0)) {
      const spaceInTokens = tokens.value.max.sub(tokens.value.current)
      const actualCreated = Decimal.min(tokensToCreate, spaceInTokens)
      if (actualCreated.gt(0)) {
        rawText.value.current = rawText.value.current.sub(actualCreated.mul(4))
        tokens.value.current = tokens.value.current.add(actualCreated)
      }
    }

    // 3. Tri-Allocation du Compute : Inférence, Entraînement, R&D
    const infRatio = allocations.value.inferencePercent / 100
    const trainRatio = allocations.value.trainingPercent / 100
    const resRatio = allocations.value.researchPercent / 100

    // A. Inférence : Consomme des Tokens pour générer des Funds ($)
    // 1 TFLOPS alloué à l'inférence traite 20 tokens/s -> $0.05 par token servi
    const infCompute = compute.mul(infRatio)
    const maxTokensToServe = infCompute.mul(20).mul(dt)
    const tokensServed = Decimal.min(maxTokensToServe, tokens.value.current)

    let fundsGained = new Decimal(0)
    if (tokensServed.gt(0)) {
      tokens.value.current = tokens.value.current.sub(tokensServed)
      fundsGained = tokensServed.mul(0.05)
      funds.value.current = funds.value.current.add(fundsGained)
      funds.value.ratePerSec = dt > 0 ? fundsGained.div(dt) : new Decimal(0)
    } else {
      funds.value.ratePerSec = new Decimal(0)
    }

    // B. Entraînement : Consomme des Tokens et du Compute pour augmenter les Paramètres
    // 1 TFLOPS d'entraînement consomme 10 tokens/s et génère 1000 paramètres/s
    const trainCompute = compute.mul(trainRatio)
    const maxTokensToTrain = trainCompute.mul(10).mul(dt)
    const tokensTrained = Decimal.min(maxTokensToTrain, tokens.value.current)

    if (tokensTrained.gt(0)) {
      tokens.value.current = tokens.value.current.sub(tokensTrained)
      const paramsGained = tokensTrained.mul(100)
      parameters.value = parameters.value.add(paramsGained)
    }

    // C. Recherche : Génère des points de recherche
    const resCompute = compute.mul(resRatio)
    const researchGained = resCompute.mul(2).mul(dt)
    if (researchGained.gt(0)) {
      researchPoints.value.current = Decimal.min(
        researchPoints.value.max,
        researchPoints.value.current.add(researchGained)
      )
      researchPoints.value.ratePerSec = dt > 0 ? researchGained.div(dt) : new Decimal(0)
    }

    // Débit net de tokens/s calculé pour les graphiques/oscilloscope
    const netTokensPerSec = tokensToCreate.sub(tokensServed).sub(tokensTrained).div(dt > 0 ? dt : 1)
    tokens.value.ratePerSec = netTokensPerSec

    lastTickTimestamp.value = Date.now()

    // Sauvegarde automatique toutes les 5 secondes (100 ticks)
    saveAccumulator += dt
    if (saveAccumulator >= 5) {
      saveAccumulator = 0
      saveToLocalStorage()
    }
  }

  // ==========================================
  // OFFLINE PROGRESSION CATCH-UP (Max 24h)
  // ==========================================

  function calculateOfflineProgress() {
    const now = Date.now()
    const elapsedSeconds = Math.max(0, (now - lastTickTimestamp.value) / 1000)

    // Seuil minimal pour déclencher un rapport hors-ligne : 10 secondes
    if (elapsedSeconds < 10) {
      lastTickTimestamp.value = now
      return
    }

    const cappedAt24h = elapsedSeconds > MAX_OFFLINE_SECONDS
    const simulatedSeconds = Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS)

    // Capture de l'état initial avant simulation hors-ligne
    const initialRaw = new Decimal(rawText.value.current)
    const initialTokens = new Decimal(tokens.value.current)
    const initialFunds = new Decimal(funds.value.current)
    const initialParams = new Decimal(parameters.value)

    // Simulation rapide par pas de 1 seconde pour respecter les limites et allocations
    const step = 1.0
    const stepsCount = Math.floor(simulatedSeconds / step)
    for (let i = 0; i < stepsCount; i++) {
      processTick(step)
    }
    const remainder = simulatedSeconds - stepsCount * step
    if (remainder > 0) {
      processTick(remainder)
    }

    const report: OfflineProgressSummary = {
      elapsedSeconds,
      simulatedSeconds,
      cappedAt24h,
      rawTextGained: rawText.value.current.sub(initialRaw),
      tokensGained: tokens.value.current.sub(initialTokens),
      fundsGained: funds.value.current.sub(initialFunds),
      parametersGained: parameters.value.sub(initialParams),
      welcomeMessage:
        "Project Singularity Loop est un jeu incrémental à flux continu conçu pour des sessions actives et stratégiques plutôt qu'une attente passive de plusieurs jours. Votre progression a été fidèlement simulée (plafonnée à 24h).",
    }

    lastOfflineReport.value = report
    addLog(
      `Progression hors-ligne traitée : ${Math.floor(simulatedSeconds / 60)} min simulées (+${report.fundsGained.toFixed(2)}$).`,
      'info'
    )
    lastTickTimestamp.value = now
    saveToLocalStorage()
  }

  function dismissOfflineReport() {
    lastOfflineReport.value = null
  }

  // ==========================================
  // SAVE / LOAD / RESET
  // ==========================================

  function getFullState(): GameState {
    return {
      version: version.value,
      lastTickTimestamp: lastTickTimestamp.value,
      gameStartTime: gameStartTime.value,
      rawText: rawText.value,
      tokens: tokens.value,
      funds: funds.value,
      parameters: parameters.value,
      researchPoints: researchPoints.value,
      hardware: hardware.value,
      allocations: allocations.value,
      gridCapacityWatts: gridCapacityWatts.value,
      coolingCapacityWatts: coolingCapacityWatts.value,
      terminalLogs: terminalLogs.value,
      unlockedFeatures: unlockedFeatures.value,
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

      if (loaded.rawText) rawText.value = loaded.rawText
      if (loaded.tokens) tokens.value = loaded.tokens
      if (loaded.funds) funds.value = loaded.funds
      if (loaded.parameters) parameters.value = loaded.parameters
      if (loaded.researchPoints) researchPoints.value = loaded.researchPoints
      if (loaded.hardware) hardware.value = loaded.hardware
      if (loaded.allocations) allocations.value = loaded.allocations
      if (loaded.gridCapacityWatts) gridCapacityWatts.value = loaded.gridCapacityWatts
      if (loaded.coolingCapacityWatts) coolingCapacityWatts.value = loaded.coolingCapacityWatts
      if (loaded.terminalLogs) terminalLogs.value = loaded.terminalLogs
      if (loaded.unlockedFeatures) unlockedFeatures.value = loaded.unlockedFeatures
      if (loaded.lastTickTimestamp) lastTickTimestamp.value = loaded.lastTickTimestamp
      if (loaded.gameStartTime) gameStartTime.value = loaded.gameStartTime

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

  // Initial load on store creation
  loadFromLocalStorage()

  return {
    version,
    gameStartTime,
    lastTickTimestamp,
    rawText,
    tokens,
    funds,
    parameters,
    researchPoints,
    hardware,
    allocations,
    gridCapacityWatts,
    coolingCapacityWatts,
    terminalLogs,
    unlockedFeatures,
    lastOfflineReport,
    totalRawCompute,
    totalPowerDrawWatts,
    totalVramGB,
    thermalState,
    powerState,
    effectiveCompute,
    addLog,
    manualScrape,
    manualTokenize,
    buyHardware,
    getHardwareCost,
    updateAllocations,
    processTick,
    calculateOfflineProgress,
    dismissOfflineReport,
    saveToLocalStorage,
    loadFromLocalStorage,
    hardReset,
  }
})
