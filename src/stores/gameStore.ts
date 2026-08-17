import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type {
  GameState,
  HardwareNode,
  SoftwareUpgrade,
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
import { formatNumber } from '@/utils/format'

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

const INITIAL_UPGRADES: Record<string, SoftwareUpgrade> = {
  multi_thread_scraper: {
    id: 'multi_thread_scraper',
    name: 'Scraper Multi-threadé',
    description: 'Optimise les requêtes de scraping manuel pour aspirer 30 caractères par action (+200%).',
    cost: new Decimal(30),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
  },
  crawler_daemon_v1: {
    id: 'crawler_daemon_v1',
    name: 'Daemon Crawler v1.0',
    description: 'Active un crawler de fond générant un flux passif continu de Raw Text (+20 chars/s).',
    cost: new Decimal(60),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
  },
  ram_buffer_expansion_1: {
    id: 'ram_buffer_expansion_1',
    name: 'Extension Buffer RAM (16GB)',
    description: 'Étend le cache mémoire : capacité Raw Text portée à 5 000 chars et Tokens à 2 500 $T$.',
    cost: new Decimal(80),
    currency: 'funds',
    purchased: false,
    category: 'hardware',
  },
  fast_bpe_tokenizer: {
    id: 'fast_bpe_tokenizer',
    name: 'BPE Tokenizer Vectorisé',
    description: 'Optimise la vectorisation BPE en mémoire, doublant la vitesse de tokenisation automatique.',
    cost: new Decimal(160),
    currency: 'funds',
    purchased: false,
    category: 'tokenizer',
  },
  cooling_optimization_v1: {
    id: 'cooling_optimization_v1',
    name: 'Dissipateur Cuivre Haut Débit',
    description: 'Améliore la dissipation thermique passive (+200W de Cooling Capacity).',
    cost: new Decimal(120),
    currency: 'funds',
    purchased: false,
    category: 'hardware',
  },
  api_tier_pricing: {
    id: 'api_tier_pricing',
    name: 'Pricing API Tier Pro',
    description: "Augmente la rémunération par token d'inférence servi ($0.10 au lieu de $0.05 par token).",
    cost: new Decimal(250),
    currency: 'funds',
    purchased: false,
    category: 'monetization',
  },
  crawler_daemon_v2: {
    id: 'crawler_daemon_v2',
    name: 'Cluster Crawler Parallèle v2.0',
    description: "Distribue le scraping web à grande échelle (+60 chars/s supplémentaires d'auto-scraping).",
    cost: new Decimal(400),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
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
  for (const node of Object.values(hardware.value)) {
    node.baseCost = new Decimal(node.baseCost)
    node.tflops = new Decimal(node.tflops)
    node.vram = new Decimal(node.vram)
    node.powerWatts = new Decimal(node.powerWatts)
  }

  // Upgrades
  const upgrades = ref<Record<string, SoftwareUpgrade>>(JSON.parse(JSON.stringify(INITIAL_UPGRADES)))
  for (const up of Object.values(upgrades.value)) {
    up.cost = new Decimal(up.cost)
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

  // Unlocks & Flags
  const unlockedFeatures = ref<GameState['unlockedFeatures']>({
    dashboardView: true,
    autoScraping: false,
    syntheticData: false,
    quantumLayer: false,
    prestigeT1: false,
    prestigeT2: false,
    prestigeT3: false,
  })

  // Tracked milestones for STDOUT events
  const reachedMilestones = ref<Record<string, boolean>>({
    firstGpu: false,
    first1000Params: false,
    first10000Params: false,
    first1000Funds: false,
  })

  // Offline progress report
  const lastOfflineReport = ref<OfflineProgressSummary | null>(null)

  let saveAccumulator = 0

  // ==========================================
  // COMPUTED ENGINE VALUES
  // ==========================================

  const manualScrapePower = computed<number>(() => {
    return upgrades.value.multi_thread_scraper?.purchased ? 30 : 10
  })

  const autoScrapeRate = computed<number>(() => {
    let rate = 0
    if (upgrades.value.crawler_daemon_v1?.purchased || unlockedFeatures.value.autoScraping) {
      rate += 20
    }
    if (upgrades.value.crawler_daemon_v2?.purchased) {
      rate += 60
    }
    return rate
  })

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

  function manualScrape(amount?: number) {
    const scrapeAmount = amount ?? manualScrapePower.value
    const before = rawText.value.current
    rawText.value.current = Decimal.min(
      rawText.value.max,
      rawText.value.current.add(scrapeAmount)
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
      const maxPossibleTokens = tokens.value.max.minus(tokens.value.current)
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

  function manualTokenizeMax() {
    const charsPerToken = 4
    const maxTokensFromChars = rawText.value.current.div(charsPerToken).floor()
    const spaceInTokens = tokens.value.max.sub(tokens.value.current)
    const tokensToMake = Decimal.min(maxTokensFromChars, spaceInTokens)

    if (tokensToMake.gt(0)) {
      rawText.value.current = rawText.value.current.sub(tokensToMake.mul(charsPerToken))
      tokens.value.current = tokens.value.current.add(tokensToMake)
      addLog(`Tokenisation batch max : +${formatNumber(tokensToMake)} $T$ générés.`, 'info')
    }
  }

  function getHardwareCost(id: string): Decimal {
    const item = hardware.value[id]
    if (!item) return new Decimal(Infinity)
    return item.baseCost.mul(Math.pow(item.costMult, item.count))
  }

  function buyHardware(id: string): boolean {
    const item = hardware.value[id]
    if (!item) return false

    const cost = getHardwareCost(id)
    if (funds.value.current.gte(cost)) {
      funds.value.current = funds.value.current.sub(cost)
      item.count += 1
      addLog(`Achat effectué : ${item.name} (#${item.count}) pour $${cost.toFixed(2)}.`, 'success')

      if (id === 'gtx_gpu' && !reachedMilestones.value.firstGpu) {
        reachedMilestones.value.firstGpu = true
        addLog('GPU déployé avec succès. Accélération de tokenisation débloquée !', 'event')
      }
      return true
    }
    return false
  }

  function buyUpgrade(id: string): boolean {
    const up = upgrades.value[id]
    if (!up || up.purchased) return false

    const cost = up.cost
    if (up.currency === 'funds') {
      if (funds.value.current.gte(cost)) {
        funds.value.current = funds.value.current.sub(cost)
        up.purchased = true
        applyUpgradeEffects(id)
        addLog(`Module logiciel activé : ${up.name} pour $${cost.toFixed(2)}.`, 'success')
        return true
      }
    } else if (up.currency === 'researchPoints') {
      if (researchPoints.value.current.gte(cost)) {
        researchPoints.value.current = researchPoints.value.current.sub(cost)
        up.purchased = true
        applyUpgradeEffects(id)
        addLog(`Recherche complétée : ${up.name}.`, 'success')
        return true
      }
    }
    return false
  }

  function applyUpgradeEffects(id: string) {
    if (id === 'crawler_daemon_v1') {
      unlockedFeatures.value.autoScraping = true
    } else if (id === 'ram_buffer_expansion_1') {
      rawText.value.max = new Decimal(5000)
      tokens.value.max = new Decimal(2500)
    } else if (id === 'cooling_optimization_v1') {
      coolingCapacityWatts.value = coolingCapacityWatts.value.add(200)
    }
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

  function setAllocationPreset(preset: 'balanced' | 'cash' | 'train') {
    if (preset === 'balanced') {
      updateAllocations({ inferencePercent: 50, trainingPercent: 30, researchPercent: 20 })
      addLog('Allocation réglée sur Mode Équilibré (50% Inf / 30% Train / 20% R&D).', 'info')
    } else if (preset === 'cash') {
      updateAllocations({ inferencePercent: 80, trainingPercent: 10, researchPercent: 10 })
      addLog('Allocation réglée sur Monétisation Maximale (80% Inf / 10% Train / 10% R&D).', 'info')
    } else if (preset === 'train') {
      updateAllocations({ inferencePercent: 10, trainingPercent: 70, researchPercent: 20 })
      addLog('Allocation réglée sur Entraînement Intensif (10% Inf / 70% Train / 20% R&D).', 'info')
    }
  }

  // Engine Tick (50ms interval)
  function processTick(dt: number) {
    // 1. Scraping automatique (selon modules actifs)
    const baseAutoScrapePerSec = autoScrapeRate.value
    if (baseAutoScrapePerSec > 0) {
      const charsGained = new Decimal(baseAutoScrapePerSec * dt)
      rawText.value.current = Decimal.min(rawText.value.max, rawText.value.current.add(charsGained))
      rawText.value.ratePerSec = new Decimal(baseAutoScrapePerSec)
    } else {
      rawText.value.ratePerSec = new Decimal(0)
    }

    // 2. Tokenisation automatique via le Compute disponible
    const compute = effectiveCompute.value
    const bpeMultiplier = upgrades.value.fast_bpe_tokenizer?.purchased ? 2.0 : 1.0
    const tokenizingCapacity = compute.mul(50 * bpeMultiplier).mul(dt)
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
    const infCompute = compute.mul(infRatio)
    const maxTokensToServe = infCompute.mul(20).mul(dt)
    const tokensServed = Decimal.min(maxTokensToServe, tokens.value.current)

    let fundsGained = new Decimal(0)
    const pricePerToken = upgrades.value.api_tier_pricing?.purchased ? 0.10 : 0.05
    if (tokensServed.gt(0)) {
      tokens.value.current = tokens.value.current.sub(tokensServed)
      fundsGained = tokensServed.mul(pricePerToken)
      funds.value.current = funds.value.current.add(fundsGained)
      funds.value.ratePerSec = dt > 0 ? fundsGained.div(dt) : new Decimal(0)
    } else {
      funds.value.ratePerSec = new Decimal(0)
    }

    // B. Entraînement : Consomme des Tokens et du Compute pour augmenter les Paramètres
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

    // Milestones check
    if (!reachedMilestones.value.first1000Params && parameters.value.gte(1000)) {
      reachedMilestones.value.first1000Params = true
      addLog('Palier atteint : 1 000 Paramètres intégrés au modèle de neurones.', 'event')
    }
    if (!reachedMilestones.value.first10000Params && parameters.value.gte(10000)) {
      reachedMilestones.value.first10000Params = true
      addLog('Capacités émergentes : 10 000 Paramètres. Le modèle commence à générer du sens cohérent.', 'event')
    }
    if (!reachedMilestones.value.first1000Funds && funds.value.current.gte(1000)) {
      reachedMilestones.value.first1000Funds = true
      addLog('Cap financier franchi : 1 000 $ accumulés dans la trésorerie.', 'success')
    }

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
      upgrades: upgrades.value,
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
      if (loaded.upgrades) upgrades.value = loaded.upgrades
      if (loaded.allocations) allocations.value = loaded.allocations
      if (loaded.gridCapacityWatts) gridCapacityWatts.value = loaded.gridCapacityWatts
      if (loaded.coolingCapacityWatts) coolingCapacityWatts.value = loaded.coolingCapacityWatts
      if (loaded.terminalLogs) terminalLogs.value = loaded.terminalLogs
      if (loaded.unlockedFeatures) unlockedFeatures.value = loaded.unlockedFeatures
      if (loaded.lastTickTimestamp) lastTickTimestamp.value = loaded.lastTickTimestamp
      if (loaded.gameStartTime) gameStartTime.value = loaded.gameStartTime

      // Ensure upgrades effects are active
      if (upgrades.value.ram_buffer_expansion_1?.purchased) {
        rawText.value.max = new Decimal(5000)
        tokens.value.max = new Decimal(2500)
      }

      calculateOfflineProgress()
      return true
    } catch (err) {
      console.error('[Load] Erreur lors du chargement de la sauvegarde :', err)
      return false
    }
  }

  function clearLogs() {
    terminalLogs.value = []
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
    upgrades,
    allocations,
    gridCapacityWatts,
    coolingCapacityWatts,
    terminalLogs,
    unlockedFeatures,
    lastOfflineReport,
    manualScrapePower,
    autoScrapeRate,
    totalRawCompute,
    totalPowerDrawWatts,
    totalVramGB,
    thermalState,
    powerState,
    effectiveCompute,
    addLog,
    clearLogs,
    manualScrape,
    manualTokenize,
    manualTokenizeMax,
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
