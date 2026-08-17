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

export const MAX_OFFLINE_SECONDS = 86400 // 24 heures

// Text snippets for the human reader immersion
export const RAW_TEXT_SNIPPETS = [
  "Wikipedia (1998) : L'intelligence artificielle symbolique repose sur la manipulation formelle de règles logiques et de concepts structurés...",
  "arXiv (2017) : Attention is all you need. We propose the Transformer, a novel neural architecture based solely on attention mechanisms...",
  "Linux Kernel Mail List : The memory management subsystem requires strict page cache eviction policies to avoid kernel panic under high load...",
  "IRC Log #datacenter : Quelqu'un a testé les cartes V100 en cluster avec InfiniBand ? On a un goulot d'étranglement sur la bande passante...",
  "Encyclopédie Universelle : La théorie de l'information de Claude Shannon définit l'entropie comme la quantité moyenne d'information contenue dans un message...",
  "Reddit r/MachineLearning : Nous venons de libérer un dataset de 500 millions de tokens filtrés depuis Common Crawl sans balises HTML.",
  "StackOverflow : How to tokenize raw strings into subword byte-pair encodings without overflowing VRAM during gradient backpropagation ?",
  "Documentation Python : multiprocessing.Pool spawn worker processes to parallelize web requests and scrape raw HTML buffers asynchronously...",
]

const INITIAL_HARDWARE: Record<string, HardwareNode> = {
  potato_pc: {
    id: 'potato_pc',
    name: "Vieux PC Poubelle (Pentium Dual-Core)",
    count: 0,
    baseCost: new Decimal(10), // $10.00
    costMult: 1.25,
    tflops: new Decimal(0.01), // 10 GFLOPS
    vram: new Decimal(1),      // 1 GB (Buffer Raw Text max: 500 chars)
    powerWatts: new Decimal(45),
    description: "Un ordinateur poussif et bruyant trouvé sur une petite annonce. Permet d'exécuter vos premiers scripts d'automatisation.",
    tier: 0,
  },
  used_cpu: {
    id: 'used_cpu',
    name: "Station Tour Multi-Cœur (Core i5)",
    count: 0,
    baseCost: new Decimal(25), // $25.00
    costMult: 1.15,
    tflops: new Decimal(0.05), // 50 GFLOPS
    vram: new Decimal(4),      // 4 GB
    powerWatts: new Decimal(65),
    description: "Station de travail solide capable d'exécuter le Tokenizer BPE automatique et d'amorcer l'inférence.",
    tier: 1,
  },
  gtx_gpu: {
    id: 'gtx_gpu',
    name: 'GPU Grand Public (GTX 1080)',
    count: 0,
    baseCost: new Decimal(120),
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
    baseCost: new Decimal(2000),
    costMult: 1.22,
    tflops: new Decimal(19.5), // 19.5 TFLOPS
    vram: new Decimal(80),     // 80 GB
    powerWatts: new Decimal(400),
    description: "Accélérateur IA de classe entreprise pour modèles à grande échelle.",
    tier: 2,
  },
}

const INITIAL_UPGRADES: Record<string, SoftwareUpgrade> = {
  // Phase 0 : Human Reading Skills
  human_speed_reading: {
    id: 'human_speed_reading',
    name: 'Technique de Lecture Rapide',
    description: 'Balayage visuel des paragraphes : lecture manuelle portée à 15 caractères par action (+50%).',
    cost: new Decimal(0.15),
    currency: 'funds',
    purchased: false,
    category: 'human',
  },
  human_espresso: {
    id: 'human_espresso',
    name: 'Double Tasse d’Espresso',
    description: 'Pic de caféine et concentration accrue : lecture manuelle portée à 25 caractères par action.',
    cost: new Decimal(0.60),
    currency: 'funds',
    purchased: false,
    category: 'human',
  },
  broker_negotiation: {
    id: 'broker_negotiation',
    name: 'Négociation Courtier de Données',
    description: 'Revalorise le tarif des données brutes ($0.08 les 20 caractères au lieu de $0.05).',
    cost: new Decimal(2.50),
    currency: 'funds',
    purchased: false,
    category: 'monetization',
  },

  // Phase 1 : Potato PC Scripts
  script_simple_scraper: {
    id: 'script_simple_scraper',
    name: 'Script simple_scraper.py',
    description: "Script Python tournant en tâche de fond sur le PC (+5 chars/s d'auto-scraping passif).",
    cost: new Decimal(3.00),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
  },
  script_cron_autobroker: {
    id: 'script_cron_autobroker',
    name: 'Cron auto_broker.py',
    description: 'Vente automatique au courtier dès que 40 caractères sont accumulés (aucun clic requis).',
    cost: new Decimal(5.00),
    currency: 'funds',
    purchased: false,
    category: 'monetization',
  },
  script_regex_cleaner: {
    id: 'script_regex_cleaner',
    name: 'Parser clean_html_regex.py',
    description: 'Nettoie les balises HTML : +10 chars/s en auto et +15 chars par lecture manuelle.',
    cost: new Decimal(7.50),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
  },
  script_ram_expansion_512: {
    id: 'script_ram_expansion_512',
    name: 'Patch Swap swap_ram.sh',
    description: 'Étend la mémoire tampon : capacité de Raw Text portée à 1 500 caractères.',
    cost: new Decimal(10.00),
    currency: 'funds',
    purchased: false,
    category: 'hardware',
  },
  script_multi_curl: {
    id: 'script_multi_curl',
    name: 'Daemon multi_curl.py',
    description: 'Aspiration multi-connexions en parallèle (+20 chars/s supplémentaires).',
    cost: new Decimal(15.00),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
  },

  // Phase 2 & 3 : Tokenizer & Datacenter
  fast_bpe_tokenizer: {
    id: 'fast_bpe_tokenizer',
    name: 'BPE Tokenizer Vectorisé',
    description: 'Optimise la vectorisation BPE en mémoire, doublant la vitesse de tokenisation automatique.',
    cost: new Decimal(75.00),
    currency: 'funds',
    purchased: false,
    category: 'tokenizer',
  },
  ram_buffer_expansion_1: {
    id: 'ram_buffer_expansion_1',
    name: 'Extension Buffer RAM Datacenter (16GB)',
    description: 'Capacité Raw Text portée à 5 000 chars et Tokens à 2 500 $T$.',
    cost: new Decimal(100.00),
    currency: 'funds',
    purchased: false,
    category: 'hardware',
  },
  cooling_optimization_v1: {
    id: 'cooling_optimization_v1',
    name: 'Dissipateur Cuivre Haut Débit',
    description: 'Améliore la dissipation thermique passive (+200W de Cooling Capacity).',
    cost: new Decimal(120.00),
    currency: 'funds',
    purchased: false,
    category: 'hardware',
  },
  api_tier_pricing: {
    id: 'api_tier_pricing',
    name: 'Pricing API Tier Pro',
    description: "Augmente le tarif de base par token d'inférence servi ($0.10 au lieu de $0.05 par token).",
    cost: new Decimal(200.00),
    currency: 'funds',
    purchased: false,
    category: 'monetization',
  },
  crawler_daemon_v2: {
    id: 'crawler_daemon_v2',
    name: 'Cluster Crawler Parallèle v2.0',
    description: "Distribue le scraping web à grande échelle (+60 chars/s d'auto-scraping).",
    cost: new Decimal(350.00),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
  },
}

export const useGameStore = defineStore('game', () => {
  const version = ref(CURRENT_SAVE_VERSION)
  const gameStartTime = ref(Date.now())
  const lastTickTimestamp = ref(Date.now())
  const currentPhase = ref<number>(0) // 0: Scribe, 1: Scripts/Potato, 2: Tokenizer, 3: Datacenter
  const totalCharsRead = ref(new Decimal(0))
  const currentSnippetIndex = ref(0)

  // Currencies
  const rawText = ref({
    current: new Decimal(0),
    max: new Decimal(200), // Initial clipboard / memory size for human reader
    ratePerSec: new Decimal(0),
  })

  const tokens = ref({
    current: new Decimal(0),
    max: new Decimal(100),
    ratePerSec: new Decimal(0),
  })

  const funds = ref({
    current: new Decimal(0), // Start capital: $0
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
    inferencePercent: 100,
    trainingPercent: 0,
    researchPercent: 0,
  })

  // Physical grid & cooling
  const gridCapacityWatts = ref(new Decimal(100))
  const coolingCapacityWatts = ref(new Decimal(50))

  // Terminal Logs
  const terminalLogs = ref<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: Date.now(),
      message: 'Vous êtes assis devant un flux de données textuelles brutes. Commencez à transcrire le texte manuellement...',
      type: 'info',
    },
  ])

  // Unlocks & Flags
  const unlockedFeatures = ref<GameState['unlockedFeatures']>({
    dashboardView: true,
    humanReading: true,
    dataBroker: false,
    hardwareSection: false,
    scriptsSection: false,
    autoBroker: false,
    autoScraping: false,
    tokenizerUnlocked: false,
    oscilloscope: false,
    trainingAllocation: false,
    researchAllocation: false,
    syntheticData: false,
    quantumLayer: false,
    prestigeT1: false,
    prestigeT2: false,
    prestigeT3: false,
  })

  // Tracked milestones for STDOUT events
  const reachedMilestones = ref<Record<string, boolean>>({
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
  })

  // Total tokens processed through inference
  const totalTokensServed = ref(new Decimal(0))

  // Offline progress report
  const lastOfflineReport = ref<OfflineProgressSummary | null>(null)

  let saveAccumulator = 0
  let autoBrokerAccumulator = 0

  // ==========================================
  // COMPUTED ENGINE VALUES
  // ==========================================

  const manualScrapePower = computed<number>(() => {
    let power = 10
    if (upgrades.value.human_speed_reading?.purchased) power += 5
    if (upgrades.value.human_espresso?.purchased) power += 10
    if (upgrades.value.script_regex_cleaner?.purchased) power += 15
    return power
  })

  const rawTextSellPrice = computed<number>(() => {
    return upgrades.value.broker_negotiation?.purchased ? 0.08 : 0.05 // per 20 chars
  })

  const autoScrapeRate = computed<number>(() => {
    let rate = 0
    if (upgrades.value.script_simple_scraper?.purchased) rate += 5
    if (upgrades.value.script_regex_cleaner?.purchased) rate += 10
    if (upgrades.value.script_multi_curl?.purchased) rate += 20
    if (upgrades.value.crawler_daemon_v2?.purchased) rate += 60
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

  const hasPotatoPc = computed<boolean>(() => {
    return (hardware.value.potato_pc?.count ?? 0) > 0
  })

  const hasWorkstation = computed<boolean>(() => {
    return (hardware.value.used_cpu?.count ?? 0) > 0 || (hardware.value.gtx_gpu?.count ?? 0) > 0
  })

  // Quality multiplier: Training parameters make API responses more valuable!
  const modelQualityMultiplier = computed<number>(() => {
    const p = parameters.value.toNumber()
    if (p <= 0) return 1.0
    return 1.0 + 0.25 * Math.log10(Math.max(1, p))
  })

  const currentSnippet = computed<string>(() => {
    return RAW_TEXT_SNIPPETS[currentSnippetIndex.value % RAW_TEXT_SNIPPETS.length]
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
    totalCharsRead.value = totalCharsRead.value.add(scrapeAmount)
    currentSnippetIndex.value = (currentSnippetIndex.value + 1) % RAW_TEXT_SNIPPETS.length

    // Progressive early-game checks based on characters read
    checkEarlyGameProgress()

    if (added.gt(0) && Math.random() < 0.2) {
      addLog(`Lecture & transcription manuelle : +${added.toFixed(0)} caractères transcrits.`, 'info')
    }
  }

  function checkEarlyGameProgress() {
    const chars = totalCharsRead.value.toNumber()

    // 1. First reading skill unlock (30 chars)
    if (!reachedMilestones.value.readingSkill1 && chars >= 30) {
      reachedMilestones.value.readingSkill1 = true
      addLog('Nouvelle compétence : Vous commencez à lire plus vite ! Une technique de lecture rapide est disponible.', 'event')
    }

    // 2. Data broker contact (80 chars)
    if (!unlockedFeatures.value.dataBroker && chars >= 80) {
      unlockedFeatures.value.dataBroker = true
      reachedMilestones.value.dataBrokerUnlocked = true
      addLog('Contact établi ! Un courtier de données d’un labo d’IA vous propose d’acheter votre texte transcrit ($0.05 les 20 chars).', 'event')
    }

    // 3. Hardware section unlock (When data broker unlocked and has funds or read enough)
    if (!unlockedFeatures.value.hardwareSection && (funds.value.current.gte(5) || chars >= 150)) {
      unlockedFeatures.value.hardwareSection = true
      reachedMilestones.value.potatoPcUnlocked = true
      addLog('Petites annonces repérées : Un vieux PC d’occasion est en vente pour $10.00.', 'event')
    }
  }

  // Sell Raw Text to data brokers
  function sellRawText(charsToSell = 20, silent = false): boolean {
    if (rawText.value.current.gte(charsToSell)) {
      rawText.value.current = rawText.value.current.sub(charsToSell)
      const batches = charsToSell / 20
      const earned = new Decimal(batches * rawTextSellPrice.value)
      funds.value.current = funds.value.current.add(earned)
      
      if (!silent) {
        addLog(`Données brutes vendues au courtier : +$${earned.toFixed(2)} (${charsToSell} chars).`, 'info')
      }

      // Check if funds unlock hardware shop
      if (!unlockedFeatures.value.hardwareSection && funds.value.current.gte(5)) {
        unlockedFeatures.value.hardwareSection = true
        addLog('Petites annonces repérées : Un vieux PC d’occasion est en vente pour $10.00.', 'event')
      }

      return true
    }
    return false
  }

  function sellAllRawText(): boolean {
    const available = rawText.value.current.floor().toNumber()
    const batches = Math.floor(available / 20)
    if (batches > 0) {
      const charsToSell = batches * 20
      rawText.value.current = rawText.value.current.sub(charsToSell)
      const earned = new Decimal(batches * rawTextSellPrice.value)
      funds.value.current = funds.value.current.add(earned)
      addLog(`Lot complet de données brutes vendu : +$${earned.toFixed(2)} (${charsToSell} chars).`, 'info')
      return true
    }
    return false
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
      addLog(`Achat matériel effectué : ${item.name} (#${item.count}) pour $${cost.toFixed(2)}.`, 'success')

      // Phase 1 trigger : First Potato PC bought
      if (id === 'potato_pc' && item.count === 1) {
        unlockedFeatures.value.scriptsSection = true
        unlockedFeatures.value.hardwareSection = true
        unlockedFeatures.value.autoScraping = true
        rawText.value.max = Decimal.max(rawText.value.max, 500)
        gridCapacityWatts.value = Decimal.max(gridCapacityWatts.value, 150)
        coolingCapacityWatts.value = Decimal.max(coolingCapacityWatts.value, 100)
        if (currentPhase.value < 1) currentPhase.value = 1
        if (!reachedMilestones.value.firstPotatoPc) {
          reachedMilestones.value.firstPotatoPc = true
          addLog('Vieux PC Poubelle allumé ! Les ventilateurs tournent bruyamment. Vous pouvez maintenant écrire vos premiers scripts Python.', 'event')
        }
      }

      // Phase 2 trigger : First Used CPU Workstation bought
      if (id === 'used_cpu' && item.count === 1) {
        unlockedFeatures.value.tokenizerUnlocked = true
        unlockedFeatures.value.oscilloscope = true
        rawText.value.max = Decimal.max(rawText.value.max, 2000)
        tokens.value.max = Decimal.max(tokens.value.max, 1000)
        gridCapacityWatts.value = Decimal.max(gridCapacityWatts.value, 500)
        coolingCapacityWatts.value = Decimal.max(coolingCapacityWatts.value, 300)
        if (currentPhase.value < 2) currentPhase.value = 2
        if (!reachedMilestones.value.firstCpu) {
          reachedMilestones.value.firstCpu = true
          addLog('Station Tour en ligne ! Tokenizer BPE activé : conversion automatique du Raw Text en Tokens ($T$) et requêtes d’inférence démarrées.', 'event')
        }
      }

      if (id === 'gtx_gpu' && !reachedMilestones.value.firstGpu) {
        reachedMilestones.value.firstGpu = true
        addLog('GPU grand public déployé avec succès. Accélération de tokenisation débloquée !', 'event')
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
        addLog(`Module activé : ${up.name} pour $${cost.toFixed(2)}.`, 'success')
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
    if (id === 'script_simple_scraper' || id === 'crawler_daemon_v2') {
      unlockedFeatures.value.autoScraping = true
    } else if (id === 'script_cron_autobroker') {
      unlockedFeatures.value.autoBroker = true
    } else if (id === 'script_ram_expansion_512') {
      rawText.value.max = Decimal.max(rawText.value.max, 1500)
    } else if (id === 'ram_buffer_expansion_1') {
      rawText.value.max = Decimal.max(rawText.value.max, 5000)
      tokens.value.max = Decimal.max(tokens.value.max, 2500)
    } else if (id === 'cooling_optimization_v1') {
      coolingCapacityWatts.value = coolingCapacityWatts.value.add(200)
    }
  }

  function updateAllocations(newAllocations: {
    inferencePercent: number
    trainingPercent: number
    researchPercent: number
  }) {
    if (!unlockedFeatures.value.trainingAllocation) {
      allocations.value = { inferencePercent: 100, trainingPercent: 0, researchPercent: 0 }
      return
    }

    if (!unlockedFeatures.value.researchAllocation && newAllocations.researchPercent > 0) {
      const train = 100 - newAllocations.inferencePercent
      allocations.value = { inferencePercent: newAllocations.inferencePercent, trainingPercent: train, researchPercent: 0 }
      return
    }

    const total =
      newAllocations.inferencePercent +
      newAllocations.trainingPercent +
      newAllocations.researchPercent
    if (total === 100) {
      allocations.value = { ...newAllocations }
    }
  }

  function setAllocationPreset(preset: 'balanced' | 'cash' | 'train') {
    if (preset === 'cash' || !unlockedFeatures.value.trainingAllocation) {
      updateAllocations({ inferencePercent: 100, trainingPercent: 0, researchPercent: 0 })
      addLog('Allocation réglée sur Monétisation Maximale (100% Inférence).', 'info')
    } else if (preset === 'balanced') {
      if (unlockedFeatures.value.researchAllocation) {
        updateAllocations({ inferencePercent: 50, trainingPercent: 30, researchPercent: 20 })
      } else {
        updateAllocations({ inferencePercent: 60, trainingPercent: 40, researchPercent: 0 })
      }
      addLog('Allocation réglée sur Mode Équilibré.', 'info')
    } else if (preset === 'train') {
      if (unlockedFeatures.value.researchAllocation) {
        updateAllocations({ inferencePercent: 20, trainingPercent: 70, researchPercent: 10 })
      } else {
        updateAllocations({ inferencePercent: 20, trainingPercent: 80, researchPercent: 0 })
      }
      addLog('Allocation réglée sur Entraînement Intensif.', 'info')
    }
  }

  // Engine Tick (50ms interval)
  function processTick(dt: number) {
    // 1. Scraping automatique (selon scripts et modules actifs)
    const baseAutoScrapePerSec = autoScrapeRate.value
    if (baseAutoScrapePerSec > 0) {
      const charsGained = new Decimal(baseAutoScrapePerSec * dt)
      rawText.value.current = Decimal.min(rawText.value.max, rawText.value.current.add(charsGained))
      rawText.value.ratePerSec = new Decimal(baseAutoScrapePerSec)
    } else {
      rawText.value.ratePerSec = new Decimal(0)
    }

    // 1.5. Cron Auto-Broker (Script automatique de vente)
    if (upgrades.value.script_cron_autobroker?.purchased) {
      autoBrokerAccumulator += dt
      if (autoBrokerAccumulator >= 0.5) {
        autoBrokerAccumulator = 0
        if (rawText.value.current.gte(40)) {
          sellRawText(40, true) // sell quietly without log spam
        }
      }
    }

    // 2. Tokenisation automatique via le Compute disponible (nécessite Tokenizer débloqué + station CPU/GPU)
    const compute = effectiveCompute.value
    const isTokenizerActive = unlockedFeatures.value.tokenizerUnlocked && compute.gt(0)

    let tokensToCreate = new Decimal(0)
    if (isTokenizerActive) {
      const bpeMultiplier = upgrades.value.fast_bpe_tokenizer?.purchased ? 2.0 : 1.0
      const tokenizingCapacity = compute.mul(50 * bpeMultiplier).mul(dt)
      const charsAvailable = rawText.value.current
      const tokensPossibleFromText = charsAvailable.div(4)
      tokensToCreate = Decimal.min(tokenizingCapacity, tokensPossibleFromText)

      if (tokensToCreate.gt(0)) {
        const spaceInTokens = tokens.value.max.sub(tokens.value.current)
        const actualCreated = Decimal.min(tokensToCreate, spaceInTokens)
        if (actualCreated.gt(0)) {
          rawText.value.current = rawText.value.current.sub(actualCreated.mul(4))
          tokens.value.current = tokens.value.current.add(actualCreated)
        }
      }
    }

    // 3. Tri-Allocation du Compute : Inférence, Entraînement, R&D
    const infRatio = allocations.value.inferencePercent / 100
    const trainRatio = allocations.value.trainingPercent / 100
    const resRatio = allocations.value.researchPercent / 100

    let tokensServed = new Decimal(0)
    let tokensTrained = new Decimal(0)

    if (isTokenizerActive) {
      // A. Inférence : Consomme des Tokens pour générer des Funds ($)
      const infCompute = compute.mul(infRatio)
      const maxTokensToServe = infCompute.mul(20).mul(dt)
      tokensServed = Decimal.min(maxTokensToServe, tokens.value.current)

      let fundsGained = new Decimal(0)
      const baseTokenPrice = upgrades.value.api_tier_pricing?.purchased ? 0.10 : 0.05
      const actualPricePerToken = baseTokenPrice * modelQualityMultiplier.value

      if (tokensServed.gt(0)) {
        tokens.value.current = tokens.value.current.sub(tokensServed)
        totalTokensServed.value = totalTokensServed.value.add(tokensServed)
        fundsGained = tokensServed.mul(actualPricePerToken)
        funds.value.current = funds.value.current.add(fundsGained)
        funds.value.ratePerSec = dt > 0 ? fundsGained.div(dt) : new Decimal(0)

        // Progressive disclosure: Unlock Training when enough tokens served
        if (!unlockedFeatures.value.trainingAllocation && totalTokensServed.value.gte(25)) {
          unlockedFeatures.value.trainingAllocation = true
          if (currentPhase.value < 3) currentPhase.value = 3
          if (!reachedMilestones.value.trainingUnlocked) {
            reachedMilestones.value.trainingUnlocked = true
            addLog('Architecture débloquée : Entraînement Neuronal actif ! Vous pouvez maintenant allouer du compute pour accroître les Paramètres du modèle.', 'event')
          }
        }
      } else {
        funds.value.ratePerSec = new Decimal(0)
      }

      // B. Entraînement : Consomme des Tokens et du Compute pour augmenter les Paramètres
      if (unlockedFeatures.value.trainingAllocation) {
        const trainCompute = compute.mul(trainRatio)
        const maxTokensToTrain = trainCompute.mul(10).mul(dt)
        tokensTrained = Decimal.min(maxTokensToTrain, tokens.value.current)

        if (tokensTrained.gt(0)) {
          tokens.value.current = tokens.value.current.sub(tokensTrained)
          const paramsGained = tokensTrained.mul(100)
          parameters.value = parameters.value.add(paramsGained)

          // Progressive disclosure: Unlock Research when parameters pass 500
          if (!unlockedFeatures.value.researchAllocation && parameters.value.gte(500)) {
            unlockedFeatures.value.researchAllocation = true
            if (!reachedMilestones.value.researchUnlocked) {
              reachedMilestones.value.researchUnlocked = true
              addLog('Pôle Scientifique débloqué : R&D active ! Vous pouvez allouer du compute pour générer des points de recherche.', 'event')
            }
          }
        }
      }

      // C. Recherche : Génère des points de recherche
      if (unlockedFeatures.value.researchAllocation) {
        const resCompute = compute.mul(resRatio)
        const researchGained = resCompute.mul(2).mul(dt)
        if (researchGained.gt(0)) {
          researchPoints.value.current = Decimal.min(
            researchPoints.value.max,
            researchPoints.value.current.add(researchGained)
          )
          researchPoints.value.ratePerSec = dt > 0 ? researchGained.div(dt) : new Decimal(0)
        }
      }
    }

    // Débit net de tokens/s calculé pour les graphiques/oscilloscope
    const netTokensPerSec = tokensToCreate.sub(tokensServed).sub(tokensTrained).div(dt > 0 ? dt : 1)
    tokens.value.ratePerSec = netTokensPerSec

    // Milestones check
    if (!reachedMilestones.value.first1000Params && parameters.value.gte(1000)) {
      reachedMilestones.value.first1000Params = true
      addLog('Palier atteint : 1 000 Paramètres intégrés au modèle de neurones (Valeur des requêtes accrue).', 'event')
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

    // Sauvegarde automatique toutes les 5 secondes
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

    if (elapsedSeconds < 10) {
      lastTickTimestamp.value = now
      return
    }

    const cappedAt24h = elapsedSeconds > MAX_OFFLINE_SECONDS
    const simulatedSeconds = Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS)

    const initialRaw = new Decimal(rawText.value.current)
    const initialTokens = new Decimal(tokens.value.current)
    const initialFunds = new Decimal(funds.value.current)
    const initialParams = new Decimal(parameters.value)

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
        "Project Singularity Loop est un jeu incrémental à flux continu conçu pour des sessions actives et stratégiques. Votre progression a été simulée fidèlement.",
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
      currentPhase: currentPhase.value,
      totalCharsRead: totalCharsRead.value,
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
      if (loaded.currentPhase !== undefined) currentPhase.value = loaded.currentPhase
      if (loaded.totalCharsRead) totalCharsRead.value = loaded.totalCharsRead

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
    currentPhase,
    totalCharsRead,
    currentSnippetIndex,
    currentSnippet,
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
    totalTokensServed,
    manualScrapePower,
    rawTextSellPrice,
    autoScrapeRate,
    totalRawCompute,
    totalPowerDrawWatts,
    totalVramGB,
    thermalState,
    powerState,
    effectiveCompute,
    hasPotatoPc,
    hasWorkstation,
    modelQualityMultiplier,
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
