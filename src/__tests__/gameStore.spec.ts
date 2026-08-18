import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore, MAX_OFFLINE_SECONDS } from '@/stores/gameStore'
import Decimal from 'break_infinity.js'
import { serializeGameState, deserializeGameState } from '@/utils/serialization'

describe('GameStore Progressive Early Game & Bootstrap Lifecycle', () => {
  let memoryStorage: Record<string, string> = {}

  beforeAll(() => {
    const mockStorage = {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, val: string) => { memoryStorage[key] = val },
      removeItem: (key: string) => { delete memoryStorage[key] },
      clear: () => { memoryStorage = {} },
    }
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    })
  })

  beforeEach(() => {
    memoryStorage = {}
    setActivePinia(createPinia())
  })

  it('Phase 0 (Cold Boot): Initializes in Human Scribe mode with minimal UI unlocks', () => {
    const store = useGameStore()
    expect(store.currentPhase).toBe(0)
    expect(store.funds.current.toNumber()).toBe(0)
    expect(store.rawText.current.toNumber()).toBe(0)
    expect(store.totalCharsRead.toNumber()).toBe(0)
    expect(store.tokens.current.toNumber()).toBe(0)
    expect(store.hardware.potato_pc.count).toBe(0)
    expect(store.hardware.core2_quad.count).toBe(0)
    expect(store.totalRawCompute.toNumber()).toBe(0)

    // Unlocks state
    expect(store.unlockedFeatures.humanReading).toBe(true)
    expect(store.unlockedFeatures.dataBroker).toBe(false)
    expect(store.unlockedFeatures.hardwareSection).toBe(false)
    expect(store.unlockedFeatures.scriptsSection).toBe(false)
    expect(store.unlockedFeatures.tokenizerUnlocked).toBe(false)
    expect(store.unlockedFeatures.oscilloscope).toBe(false)
    expect(store.unlockedFeatures.trainingAllocation).toBe(false)
    expect(store.unlockedFeatures.researchAllocation).toBe(false)
  })

  it('Phase 0 (Human Reading): Transcribes text, cycles snippets, and discovers data brokers at 80 chars', () => {
    const store = useGameStore()
    expect(store.manualScrapePower).toBe(10)

    // Manual read 4 times (40 chars)
    store.manualScrape() // 10
    store.manualScrape() // 20
    store.manualScrape() // 30
    store.manualScrape() // 40
    expect(store.totalCharsRead.toNumber()).toBe(40)
    expect(store.rawText.current.toNumber()).toBe(40)
    expect(store.unlockedFeatures.dataBroker).toBe(false)

    // Read 4 more times (80 chars total) -> Triggers Data Broker discovery!
    store.manualScrape() // 50
    store.manualScrape() // 60
    store.manualScrape() // 70
    store.manualScrape() // 80
    expect(store.totalCharsRead.toNumber()).toBe(80)
    expect(store.unlockedFeatures.dataBroker).toBe(true)
  })

  it('Phase 0 (Selling Data): Allows selling transcribed raw text to data brokers for initial cash', () => {
    const store = useGameStore()
    store.rawText.current = new Decimal(60)
    store.unlockedFeatures.dataBroker = true

    // Sell 20 chars for $0.05
    const sold = store.sellRawText(20)
    expect(sold).toBe(true)
    expect(store.rawText.current.toNumber()).toBe(40)
    expect(store.funds.current.toNumber()).toBeCloseTo(0.05)

    // Sell remaining all
    const soldAll = store.sellAllRawText()
    expect(soldAll).toBe(true)
    expect(store.rawText.current.toNumber()).toBe(0)
    expect(store.funds.current.toNumber()).toBeCloseTo(0.15)
  })

  it('Phase 0 (Human Skills): Unlocks reading skills and broker negotiation', () => {
    const store = useGameStore()
    expect(store.manualScrapePower).toBe(10)

    // Buy speed reading ($0.15)
    store.funds.current = new Decimal(0.15)
    const bought1 = store.buyUpgrade('human_speed_reading')
    expect(bought1).toBe(true)
    expect(store.manualScrapePower).toBe(15)

    // Buy espresso ($0.60)
    store.funds.current = new Decimal(0.60)
    const bought2 = store.buyUpgrade('human_espresso')
    expect(bought2).toBe(true)
    expect(store.manualScrapePower).toBe(25)

    // Buy broker negotiation ($2.50) requires data broker contact first
    store.funds.current = new Decimal(2.50)
    const boughtBrokerLocked = store.buyUpgrade('broker_negotiation')
    expect(boughtBrokerLocked).toBe(false) // Data broker not discovered yet!

    store.unlockedFeatures.dataBroker = true
    const boughtBroker = store.buyUpgrade('broker_negotiation')
    expect(boughtBroker).toBe(true)
    expect(store.rawTextSellPrice).toBe(0.08)

    // Cannot buy Python script without computer
    store.funds.current = new Decimal(5.00)
    const boughtScriptWithoutPc = store.buyUpgrade('script_simple_scraper')
    expect(boughtScriptWithoutPc).toBe(false)
  })

  it('Phase 1 (Potato PC & Scripts): Buying Potato PC ($10) unlocks hardware, scripts, and passive auto-broker', () => {
    const store = useGameStore()
    store.funds.current = new Decimal(10)

    expect(store.getHardwareCost('potato_pc').toNumber()).toBe(10)
    const boughtPotato = store.buyHardware('potato_pc')
    expect(boughtPotato).toBe(true)
    expect(store.hardware.potato_pc.count).toBe(1)
    expect(store.hasPotatoPc).toBe(true)
    expect(store.currentPhase).toBe(1)
    expect(store.unlockedFeatures.scriptsSection).toBe(true)
    expect(store.rawText.max.toNumber()).toBeGreaterThanOrEqual(500)

    // Buy Python auto-scraper script ($3.00)
    store.funds.current = new Decimal(3.00)
    const boughtScraper = store.buyUpgrade('script_simple_scraper')
    expect(boughtScraper).toBe(true)
    expect(store.autoScrapeRate).toBe(5) // +5 chars/s

    // Buy Cron auto-broker script ($5.00)
    store.funds.current = new Decimal(5.00)
    const boughtAutoBroker = store.buyUpgrade('script_cron_autobroker')
    expect(boughtAutoBroker).toBe(true)
    expect(store.unlockedFeatures.autoBroker).toBe(true)

    // Buy SDRAM RAM expansion ($4.50)
    store.funds.current = new Decimal(4.50)
    const boughtRam = store.buyUpgrade('ram_sdram_256mb')
    expect(boughtRam).toBe(true)
    expect(store.rawText.max.toNumber()).toBe(1500)

    // Run ticks to verify passive scraping and automatic broker selling
    store.rawText.current = new Decimal(35)
    store.funds.current = new Decimal(0)
    store.processTick(2.0) // 2s * 5 chars/s = +10 chars -> 45 chars -> auto-broker sells 40 chars

    expect(store.funds.current.toNumber()).toBeGreaterThan(0)
  })

  it('Phase 2 (Workstation & Tokenizer): Buying Workstation ($45) unlocks Tokenizer BPE and Oscilloscope', () => {
    const store = useGameStore()
    store.funds.current = new Decimal(45)
    store.upgrades.ram_sdram_256mb.purchased = true

    const boughtCpu = store.buyHardware('core2_quad')
    expect(boughtCpu).toBe(true)
    expect(store.hardware.core2_quad.count).toBe(1)
    expect(store.currentPhase).toBe(2)
    expect(store.unlockedFeatures.tokenizerUnlocked).toBe(true)
    expect(store.unlockedFeatures.oscilloscope).toBe(true)
    expect(store.totalRawCompute.toNumber()).toBeCloseTo(0.04)

    // Auto-tokenization now converts raw text into tokens
    store.rawText.current = new Decimal(40)
    store.processTick(1.0) // 0.04 TFLOPS * 50 tokens/s * bwMultiplier

    expect(store.tokens.current.toNumber()).toBeGreaterThan(0)
    expect(store.rawText.current.toNumber()).toBeLessThan(40)
  })

  it('Phase 3 (Model & Tri-Allocation): Serving 25 tokens unlocks Neural Training and Model Telemetry', () => {
    const store = useGameStore()
    store.hardware.gaming_pc.count = 1
    store.unlockedFeatures.tokenizerUnlocked = true
    store.gridCapacityWatts = new Decimal(500)
    store.coolingCapacityWatts = new Decimal(300)
    expect(store.unlockedFeatures.trainingAllocation).toBe(false)

    // Serve 30 tokens through inference
    store.tokens.current = new Decimal(30)
    store.allocations = { inferencePercent: 100, trainingPercent: 0, researchPercent: 0 }

    // Add GPU for fast inference
    store.hardware.rtx_3060.count = 1
    store.processTick(3.0)

    expect(store.unlockedFeatures.trainingAllocation).toBe(true)
    expect(store.currentPhase).toBe(3)
  })

  it('increases API token sale price based on accumulated model parameters', () => {
    const store = useGameStore()
    expect(store.modelQualityMultiplier).toBe(1.0)

    // At 100 parameters: 1 + 0.25 * log10(100) = 1.5
    store.parameters = new Decimal(100)
    expect(store.modelQualityMultiplier).toBeCloseTo(1.5)

    // At 10,000 parameters: 1 + 0.25 * log10(10000) = 2.0
    store.parameters = new Decimal(10000)
    expect(store.modelQualityMultiplier).toBeCloseTo(2.0)
  })

  it('progressively unlocks Research allocation when parameters reach 500', () => {
    const store = useGameStore()
    store.unlockedFeatures.tokenizerUnlocked = true
    store.unlockedFeatures.trainingAllocation = true
    store.gridCapacityWatts = new Decimal(500)
    store.coolingCapacityWatts = new Decimal(300)
    expect(store.unlockedFeatures.researchAllocation).toBe(false)

    store.tokens.current = new Decimal(100)
    store.hardware.gaming_pc.count = 1
    store.hardware.rtx_3060.count = 1
    store.allocations = { inferencePercent: 0, trainingPercent: 100, researchPercent: 0 }

    // 1 token trained = 100 params -> 5 tokens * 100 = 500 params
    store.processTick(1.0)

    expect(store.parameters.toNumber()).toBeGreaterThanOrEqual(500)
    expect(store.unlockedFeatures.researchAllocation).toBe(true)
  })

  it('respects allocation presets with progressive unlock constraints', () => {
    const store = useGameStore()
    // With training locked, preset defaults to 100% inference
    store.setAllocationPreset('balanced')
    expect(store.allocations.inferencePercent).toBe(100)

    // Unlock training
    store.unlockedFeatures.trainingAllocation = true
    store.setAllocationPreset('balanced')
    expect(store.allocations.inferencePercent).toBe(60)
    expect(store.allocations.trainingPercent).toBe(40)

    // Unlock research
    store.unlockedFeatures.researchAllocation = true
    store.setAllocationPreset('balanced')
    expect(store.allocations.inferencePercent).toBe(50)
    expect(store.allocations.trainingPercent).toBe(30)
    expect(store.allocations.researchPercent).toBe(20)
  })

  it('serializes and deserializes progressive game state accurately', () => {
    const store = useGameStore()
    store.currentPhase = 2
    store.totalCharsRead = new Decimal(1250)
    store.funds.current = new Decimal(1337.5)
    store.parameters = new Decimal(42000)
    store.hardware.potato_pc.count = 1
    store.hardware.rtx_3060.count = 2
    store.upgrades.fast_bpe_tokenizer.purchased = true
    store.unlockedFeatures.tokenizerUnlocked = true
    store.unlockedFeatures.trainingAllocation = true

    const fullState = store.getFullState()
    const serialized = serializeGameState(fullState)
    const deserialized = deserializeGameState(serialized, fullState)

    expect(deserialized).not.toBeNull()
    expect(deserialized?.currentPhase).toBe(2)
    expect(deserialized?.totalCharsRead?.toNumber()).toBe(1250)
    expect(deserialized?.funds?.current.toNumber()).toBe(1337.5)
    expect(deserialized?.parameters?.toNumber()).toBe(42000)
    expect(deserialized?.hardware?.potato_pc.count).toBe(1)
    expect(deserialized?.hardware?.rtx_3060.count).toBe(2)
    expect(deserialized?.unlockedFeatures?.tokenizerUnlocked).toBe(true)
  })

  it('simulates offline progress up to 24h cap without crashing', () => {
    const store = useGameStore()
    store.hardware.core2_quad.count = 1
    store.unlockedFeatures.tokenizerUnlocked = true
    store.lastTickTimestamp = Date.now() - 3600 * 1000 // 1 hour offline

    store.calculateOfflineProgress()

    expect(store.lastOfflineReport).not.toBeNull()
    expect(store.lastOfflineReport?.simulatedSeconds).toBeCloseTo(3600, -1)
    expect(store.lastOfflineReport?.cappedAt24h).toBe(false)
  })

  it('enforces strict 24h ceiling on offline progress', () => {
    const store = useGameStore()
    store.hardware.core2_quad.count = 1
    store.lastTickTimestamp = Date.now() - 100000 * 1000 // > 27 hours offline

    store.calculateOfflineProgress()

    expect(store.lastOfflineReport).not.toBeNull()
    expect(store.lastOfflineReport?.simulatedSeconds).toBe(MAX_OFFLINE_SECONDS)
    expect(store.lastOfflineReport?.cappedAt24h).toBe(true)
  })

  it('allows purchasing active cooling solutions to expand cooling capacity and eliminate throttling', () => {
    const store = useGameStore()
    store.funds.current = new Decimal(5000)
    store.unlockedFeatures.scriptsSection = true
    store.unlockedFeatures.tokenizerUnlocked = true
    store.unlockedFeatures.trainingAllocation = true
    store.hardware.gaming_pc.count = 1
    store.coolingCapacityWatts = new Decimal(100)

    // Install two power-hungry RTX 3090 GPUs (2 * 350W = 700W power + 120W host = 820W -> 738W heat)
    store.hardware.rtx_3090.count = 2
    expect(store.thermalState.heatGeneratedWatts.toNumber()).toBe(738)
    expect(store.thermalState.isThrottling).toBe(true)
    expect(store.thermalState.efficiency).toBeCloseTo(100 / 738, 2)
    expect(store.thermalState.status).toBe('throttling')

    // Buy cooling upgrades
    expect(store.buyUpgrade('cooling_case_fans_120mm')).toBe(true)
    expect(store.coolingCapacityWatts.toNumber()).toBe(170)

    expect(store.buyUpgrade('cooling_tower_heatsink')).toBe(true)
    expect(store.coolingCapacityWatts.toNumber()).toBe(350)

    expect(store.buyUpgrade('cooling_aio_watercooling_360')).toBe(true)
    expect(store.coolingCapacityWatts.toNumber()).toBe(800)

    // Now cooling capacity (800W) > heat (738W) -> throttling resolved!
    expect(store.thermalState.isThrottling).toBe(false)
    expect(store.thermalState.efficiency).toBe(1.0)
    expect(store.thermalState.status).toBe('warm')
    expect(store.thermalState.temperatureCelsius).toBeLessThan(80)
  })

  it('allows purchasing power grid upgrades to expand electrical capacity and resolve circuit breaker overloads', () => {
    const store = useGameStore()
    store.funds.current = new Decimal(10000)
    store.unlockedFeatures.scriptsSection = true
    store.unlockedFeatures.tokenizerUnlocked = true
    store.unlockedFeatures.trainingAllocation = true
    store.hardware.gaming_pc.count = 1
    store.gridCapacityWatts = new Decimal(500)
    store.coolingCapacityWatts = new Decimal(2000) // prevent thermal throttling

    // Gaming PC (120W) + 2x RTX 3090 (2 * 350W = 700W) = 820W draw > 500W grid capacity!
    store.hardware.rtx_3090.count = 2
    expect(store.totalPowerDrawWatts.toNumber()).toBe(820)
    expect(store.powerState.isOverloaded).toBe(true)
    expect(store.powerState.status).toBe('overloaded')
    expect(store.powerState.effectiveMultiplier).toBe(0.5)

    // Compute suffers 50% penalty
    const rawCompute = store.totalRawCompute // 0.15 (host) + 2 * 35.6 = 71.35 TFLOPS
    expect(store.effectiveCompute.toNumber()).toBeCloseTo(rawCompute.mul(0.5).toNumber())

    // Buy power upgrades
    expect(store.buyUpgrade('power_psu_500w')).toBe(true) // +400W -> 900W
    expect(store.gridCapacityWatts.toNumber()).toBe(900)

    // Now grid capacity (900W) > total draw (820W) -> overload resolved!
    expect(store.powerState.isOverloaded).toBe(false)
    expect(store.powerState.status).toBe('strained') // 820/900 = 91.1%
    expect(store.powerState.effectiveMultiplier).toBe(1.0)
    expect(store.effectiveCompute.toNumber()).toBeCloseTo(rawCompute.toNumber())

    // Buy additional power upgrade to bring load into nominal range (<80%)
    expect(store.buyUpgrade('power_psu_850w_gold')).toBe(true) // +750W -> 1650W
    expect(store.gridCapacityWatts.toNumber()).toBe(1650)
    expect(store.powerState.status).toBe('nominal') // 820/1650 = 49.7%
  })

  it('Phase 3 (Cognitive Dynamics): Generates entropy during training, transitions regimes, and applies Human RLHF Batch', () => {
    const store = useGameStore()
    store.unlockedFeatures.tokenizerUnlocked = true
    store.unlockedFeatures.trainingAllocation = true
    store.unlockedFeatures.researchAllocation = true
    store.currentPhase = 3

    store.hardware.workstation_pro.count = 1
    store.hardware.rtx_3090.count = 2 // >70 TFLOPS
    store.coolingCapacityWatts = new Decimal(2000)
    store.gridCapacityWatts = new Decimal(2000)
    store.tokens.current = new Decimal(10000)
    store.funds.current = new Decimal(500)

    // Set 100% training allocation
    store.updateAllocations({ inferencePercent: 0, trainingPercent: 100, researchPercent: 0 })

    expect(store.entropy.toNumber()).toBe(0.0)
    expect(store.cognitiveStatus).toBe('nominal')

    // Simulate 30 seconds of training -> entropy drifts
    store.processTick(30)
    expect(store.entropy.toNumber()).toBeGreaterThan(0.30)
    expect(store.cognitiveStatus).toBe('divergent')
    expect(store.researchMultiplier).toBeGreaterThan(1.0)

    // Simulate more training to reach critical hallucination (>70%)
    store.processTick(60)
    expect(store.entropy.toNumber()).toBeGreaterThanOrEqual(0.70)
    expect(store.cognitiveStatus).toBe('critical_hallucination')
    expect(store.apiMultiplier).toBeLessThan(0.50)

    // Perform Human RLHF Batch
    const prevEntropy = store.entropy.toNumber()
    expect(store.canPerformRlhf).toBe(true)
    const rlhfSuccess = store.performRlhf()
    expect(rlhfSuccess).toBe(true)
    expect(store.entropy.toNumber()).toBeCloseTo(prevEntropy - 0.15, 3)
    expect(store.rlhfBatchCount).toBe(1)
    expect(store.funds.current.toNumber()).toBeCloseTo(450, 1) // 500 - 50 = 450
  })

  it('Phase 3 (Safety Upgrades): Mitigates entropy drift and caps hallucination penalties', () => {
    const store = useGameStore()
    store.unlockedFeatures.tokenizerUnlocked = true
    store.unlockedFeatures.trainingAllocation = true
    store.currentPhase = 3
    store.funds.current = new Decimal(10000)

    // Buy safety upgrades
    expect(store.buyUpgrade('safety_constitutional_ai')).toBe(true)
    expect(store.buyUpgrade('safety_automated_rlhf')).toBe(true)
    expect(store.buyUpgrade('safety_dpo_optimization')).toBe(true)
    expect(store.buyUpgrade('safety_benchmarks')).toBe(true)

    // Force high entropy (90%)
    store.cognitive.setCognitiveState({ entropy: new Decimal(0.90), alignment: new Decimal(0.10) })
    expect(store.cognitiveStatus).toBe('critical_hallucination')

    // Thanks to safety_benchmarks, API multiplier is floored at 0.80 instead of severe drop
    expect(store.apiMultiplier).toBe(0.80)

    // Passive dissipation from safety_automated_rlhf operates when not training
    store.updateAllocations({ inferencePercent: 100, trainingPercent: 0, researchPercent: 0 })
    store.processTick(10) // 10s * 0.005/s = -0.05
    expect(store.entropy.toNumber()).toBeCloseTo(0.85, 3)
  })

  it('Persistence & Soft Reset: Serializes cognitive state and clears volatile entropy on prestige', () => {
    const store = useGameStore()
    store.unlockedFeatures.tokenizerUnlocked = true
    store.unlockedFeatures.trainingAllocation = true
    store.cognitive.setCognitiveState({
      entropy: new Decimal(0.45),
      alignment: new Decimal(0.55),
      rlhfBatchCount: 3,
      totalRlhfConducted: new Decimal(3),
    })

    const serialized = store.getFullState()
    expect(serialized.cognitive?.entropy.toNumber()).toBe(0.45)
    expect(serialized.cognitive?.rlhfBatchCount).toBe(3)

    // Soft reset resets entropy
    store.parameters = new Decimal(2000000) // 2M params -> 1 AP
    expect(store.triggerPrestige()).toBe(true)
    expect(store.entropy.toNumber()).toBe(0.0)
    expect(store.alignment.toNumber()).toBe(1.0)
    expect(store.rlhfBatchCount).toBe(0)
  })
})
