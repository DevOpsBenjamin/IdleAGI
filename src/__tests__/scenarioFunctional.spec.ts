import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore } from '@/stores/gameStore'
import { ScenarioRunner } from '@/domain/engine/ScenarioRunner'
import Decimal from 'break_infinity.js'

describe('End-to-End Functional Test: Full Fast-Forward Gameplay Progression Scenario', () => {
  let memoryStorage: Record<string, string> = {}

  beforeAll(() => {
    const mockStorage = {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, val: string) => {
        memoryStorage[key] = val
      },
      removeItem: (key: string) => {
        delete memoryStorage[key]
      },
      clear: () => {
        memoryStorage = {}
      },
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

  it('Time-Warp Engine: Simulates 1 hour (3600s) of game ticks deterministically with configurable speed multiplier', () => {
    const store = useGameStore()
    const runner = new ScenarioRunner(store)

    // Setup basic auto income
    store.funds.current = new Decimal(50)
    store.unlockedFeatures.autoScraping = true
    store.upgrades.script_simple_scraper.purchased = true // +5 chars/s
    store.upgrades.script_cron_autobroker.purchased = true // auto sells 40 chars every 0.5s

    const realStart = performance.now()
    // Advance 3600 virtual seconds with speedMultiplier = 4 (scaled tick steps)
    runner.advanceTime(3600, 0.05, 4)
    const realDurationMs = performance.now() - realStart

    // Execution completes in milliseconds (< 500ms)
    expect(realDurationMs).toBeLessThan(500)
    expect(runner.getState().virtualTimeElapsedSeconds).toBeCloseTo(3600)
    expect(store.funds.current.toNumber()).toBeGreaterThan(50)
  })

  it('Complete End-to-End Gameplay Scenario: Phase 0 Scribe -> Phase 1 PC -> Phase 2 Tokenizer -> Phase 3 Hyperscale Datacenter', () => {
    const store = useGameStore()
    const runner = new ScenarioRunner(store)
    const startRealTime = performance.now()

    // =========================================================================
    // STEP 1 : PHASE 0 - HUMAN SCRIBE BOOTSTRAP
    // =========================================================================
    expect(store.currentPhase).toBe(0)
    expect(store.unlockedFeatures.humanReading).toBe(true)
    expect(store.unlockedFeatures.dataBroker).toBe(false)

    // Manual transcription to unlock Data Broker (80 chars)
    runner.scrapeTimes(8) // 8 * 10 = 80 chars
    expect(store.totalCharsRead.toNumber()).toBe(80)
    expect(store.unlockedFeatures.dataBroker).toBe(true)

    // Sell initial transcribed text: 80 chars / 20 * $0.05 = $0.20
    store.sellAllRawText()
    expect(store.funds.current.toNumber()).toBeCloseTo(0.2)

    // Buy 1st human skill: Technique de Lecture Rapide ($0.15)
    const boughtSpeedReading = store.buyUpgrade('human_speed_reading')
    expect(boughtSpeedReading).toBe(true)
    expect(store.manualScrapePower).toBe(15)

    // Read in chunks within buffer (buffer max 200 chars) and sell to buy Espresso ($0.60)
    runner.scrapeTimes(10) // 10 * 15 = 150 chars
    store.sellAllRawText() // earns +$0.35 (total $0.40)
    runner.scrapeTimes(10) // 10 * 15 = 150 chars
    store.sellAllRawText() // earns +$0.35 (total $0.75)
    expect(store.funds.current.toNumber()).toBeGreaterThanOrEqual(0.6)

    const boughtEspresso = store.buyUpgrade('human_espresso')
    expect(boughtEspresso).toBe(true)
    expect(store.manualScrapePower).toBe(25)

    // Read and sell to buy Broker Negotiation ($2.50)
    for (let i = 0; i < 8; i++) {
      runner.scrapeTimes(6) // 6 * 25 = 150 chars (7 batches of 20 = +$0.35)
      store.sellAllRawText()
    }
    expect(store.funds.current.toNumber()).toBeGreaterThanOrEqual(2.5)

    const boughtNegotiation = store.buyUpgrade('broker_negotiation')
    expect(boughtNegotiation).toBe(true)
    expect(store.rawTextSellPrice).toBeCloseTo(0.08)

    // Read and accumulate $10.00 for the first Potato PC
    for (let i = 0; i < 18; i++) {
      runner.scrapeTimes(6) // 150 chars (7 batches of 20 = 140 chars * $0.08 / 20 = +$0.56 per batch)
      store.sellAllRawText()
    }
    expect(store.funds.current.toNumber()).toBeGreaterThanOrEqual(10.0)

    // =========================================================================
    // STEP 2 : PHASE 1 - POTATO PC & AUTOMATION SCRIPTS
    // =========================================================================
    const boughtPotatoPc = store.buyHardware('potato_pc')
    expect(boughtPotatoPc).toBe(true)
    expect(store.currentPhase).toBe(1)
    expect(store.unlockedFeatures.scriptsSection).toBe(true)
    expect(store.unlockedFeatures.hardwareSection).toBe(true)
    expect(store.hardware.potato_pc.count).toBe(1)

    // Accumulate funds for initial automation scripts & SDRAM
    for (let i = 0; i < 25; i++) {
      runner.scrapeTimes(10) // 250 chars * $0.08 / 20 = +$1.00 per batch
      store.sellAllRawText()
    }

    expect(store.buyUpgrade('script_simple_scraper')).toBe(true) // $3.00, +5 chars/s
    expect(store.buyUpgrade('ram_sdram_256mb')).toBe(true) // $4.50, max rawText 1500
    expect(store.buyUpgrade('script_cron_autobroker')).toBe(true) // $5.00, auto sell every 0.5s

    // Fast forward 15 virtual seconds: cron autobroker sells accumulated text automatically
    runner.advanceTime(15)
    expect(store.funds.current.toNumber()).toBeGreaterThan(0)

    // Buy additional scrapers & power/cooling
    for (let i = 0; i < 40; i++) {
      runner.scrapeTimes(20)
      store.sellAllRawText()
    }
    expect(store.buyUpgrade('script_regex_cleaner')).toBe(true) // $7.50
    expect(store.buyUpgrade('script_ram_expansion_512')).toBe(true) // $10.00
    expect(store.buyUpgrade('script_multi_curl')).toBe(true) // $15.00
    expect(store.buyUpgrade('cooling_case_fans_120mm')).toBe(true) // $18.00
    expect(store.buyUpgrade('power_psu_500w')).toBe(true) // $25.00

    // Accumulate $45.00 for Core 2 Quad workstation host
    for (let i = 0; i < 30; i++) {
      runner.scrapeTimes(20)
      store.sellAllRawText()
    }
    runner.advanceTime(30)
    expect(store.funds.current.toNumber()).toBeGreaterThanOrEqual(45.0)

    // =========================================================================
    // STEP 3 : PHASE 2 - WORKSTATION & TOKENIZER & DEDICATED GPU
    // =========================================================================
    const boughtCore2Quad = store.buyHardware('core2_quad')
    expect(boughtCore2Quad).toBe(true)
    expect(store.currentPhase).toBe(2)
    expect(store.unlockedFeatures.tokenizerUnlocked).toBe(true)
    expect(store.unlockedFeatures.oscilloscope).toBe(true)
    expect(store.pcieSlots.totalSlots).toBe(1)

    // Buy GTX 750 Ti GPU ($35.00)
    for (let i = 0; i < 25; i++) {
      runner.scrapeTimes(20)
      store.sellAllRawText()
    }
    const boughtGtx750 = store.buyHardware('gtx_750ti')
    expect(boughtGtx750).toBe(true)
    expect(store.pcieSlots.usedSlots).toBe(1)
    expect(store.totalRawCompute.toNumber()).toBeGreaterThan(1.0) // > 1.3 TFLOPS

    // Buy RAM upgrades for Core 2 Quad gating & buffer expansion
    for (let i = 0; i < 30; i++) {
      runner.scrapeTimes(20)
      store.sellAllRawText()
    }
    expect(store.buyUpgrade('ram_ddr2_8gb')).toBe(true) // $14.00
    expect(store.buyUpgrade('ram_ddr3_16gb')).toBe(true) // $28.00

    // Tokenizer & Inference are now active! Use passive simulation time to fund remaining upgrades
    runner.advanceUntil((s) => s.funds.gte(75), 300)
    expect(store.buyUpgrade('fast_bpe_tokenizer')).toBe(true) // $75.00
    runner.advanceUntil((s) => s.funds.gte(55), 300)
    expect(store.buyUpgrade('cooling_tower_heatsink')).toBe(true) // $55.00
    runner.advanceUntil((s) => s.funds.gte(75), 300)
    expect(store.buyUpgrade('power_psu_850w_gold')).toBe(true) // $75.00

    // Advance time: Tokenizer creates Tokens from text, Inference serves requests for Funds ($)
    runner.advanceTime(60)
    expect(store.totalTokensServed.toNumber()).toBeGreaterThan(0)
    expect(store.funds.current.toNumber()).toBeGreaterThan(0)

    // Buy Gaming PC ($220.00) - unlocked because DDR2 and DDR3 RAM are purchased
    runner.advanceUntil((s) => s.funds.gte(220), 1200)
    const boughtGamingPc = store.buyHardware('gaming_pc')
    expect(boughtGamingPc).toBe(true)
    expect(store.pcieSlots.totalSlots).toBe(3)

    // Buy RTX 3060 ($260.00) into 2nd PCIe slot
    runner.advanceUntil((s) => s.funds.gte(260), 1200)
    const boughtRtx3060 = store.buyHardware('rtx_3060')
    expect(boughtRtx3060).toBe(true)
    expect(store.pcieSlots.usedSlots).toBe(2)

    // Buy API Tier Pricing ($200.00) & Crawler Daemon ($350.00)
    runner.advanceUntil((s) => s.funds.gte(200), 1200)
    expect(store.buyUpgrade('api_tier_pricing')).toBe(true)
    runner.advanceUntil((s) => s.funds.gte(350), 1200)
    expect(store.buyUpgrade('crawler_daemon_v2')).toBe(true)

    // Fast-forward until training allocation threshold (totalTokensServed >= 25)
    runner.advanceUntil((s) => s.totalTokensServed.gte(25), 1200)
    expect(store.unlockedFeatures.trainingAllocation).toBe(true)
    expect(store.currentPhase).toBe(3)

    // =========================================================================
    // STEP 4 : PHASE 3 - TRI-ALLOCATION & NEURAL TRAINING
    // =========================================================================
    // Focus on Training to integrate initial parameters (100% Training)
    store.updateAllocations({
      inferencePercent: 0,
      trainingPercent: 100,
      researchPercent: 0,
    })

    // Advance time: train parameters to >= 500 to unlock Research Allocation
    runner.advanceUntil((s) => s.parameters.gte(500), 1200)
    expect(store.unlockedFeatures.researchAllocation).toBe(true)

    // Update to Cash Allocation (100% inference) to fund hardware and infrastructure scaling
    store.setAllocationPreset('cash')

    // Buy Phase 3 RAM Kits & Cooling
    runner.advanceUntil((s) => s.funds.gte(65), 5000, 0.2)
    expect(store.buyUpgrade('ram_ddr4_32gb')).toBe(true) // $65.00
    runner.advanceUntil((s) => s.funds.gte(140), 5000, 0.2)
    expect(store.buyUpgrade('ram_ddr4_64gb')).toBe(true) // $140.00
    runner.advanceUntil((s) => s.funds.gte(160), 5000, 0.2)
    expect(store.buyUpgrade('cooling_aio_watercooling_360')).toBe(true) // $160.00
    runner.advanceUntil((s) => s.funds.gte(280), 5000, 0.2)
    expect(store.buyUpgrade('power_dedicated_circuit_16a')).toBe(true) // $280.00
    runner.advanceUntil((s) => s.funds.gte(500), 5000, 0.2)
    expect(store.buyUpgrade('cooling_custom_loop_d5')).toBe(true) // $500.00

    // Upgrade to Workstation Pro Host ($1,200.00, 4 PCIe slots)
    runner.advanceUntil((s) => s.funds.gte(1200), 10000, 2.0)
    const boughtWorkstationPro = store.buyHardware('workstation_pro')
    expect(boughtWorkstationPro).toBe(true)
    expect(store.pcieSlots.totalSlots).toBe(7)

    // Buy RTX 3090 ($850.00)
    runner.advanceUntil((s) => s.funds.gte(850), 10000, 2.0)
    const boughtRtx3090 = store.buyHardware('rtx_3090')
    expect(boughtRtx3090).toBe(true)

    // Power & Cooling Infrastructure Upgrades
    runner.advanceUntil((s) => s.funds.gte(1200), 10000, 2.0)
    expect(store.buyUpgrade('power_triphase_industrial')).toBe(true) // $1,200
    runner.advanceUntil((s) => s.funds.gte(2500), 15000, 5.0)
    expect(store.buyUpgrade('cooling_inrow_datacenter_ac')).toBe(true) // $2,500

    // Buy DDR5 RAM Kits for Datacenter gating
    runner.advanceUntil((s) => s.funds.gte(380), 10000, 2.0)
    expect(store.buyUpgrade('ram_ddr5_128gb')).toBe(true) // $380
    runner.advanceUntil((s) => s.funds.gte(850), 10000, 2.0)
    expect(store.buyUpgrade('ram_ddr5_256gb')).toBe(true) // $850

    // =========================================================================
    // STEP 5 : DATACENTER HYPERSCALE & A100 / H100 SUPERCOMPUTERS
    // =========================================================================
    // Buy Datacenter Chassis 4U ($6,500.00, 8 PCIe/SXM bays)
    runner.advanceUntil((s) => s.funds.gte(6500), 25000, 5.0)
    const boughtDatacenterChassis = store.buyHardware('datacenter_chassis')
    expect(boughtDatacenterChassis).toBe(true)
    expect(store.pcieSlots.totalSlots).toBe(15)

    // Buy High-End Power Transformer & Cryo Cooling
    runner.advanceUntil((s) => s.funds.gte(8500), 25000, 5.0)
    expect(store.buyUpgrade('power_substation_transformer')).toBe(true) // $8,500
    runner.advanceUntil((s) => s.funds.gte(12000), 30000, 5.0)
    expect(store.buyUpgrade('cooling_immersion_cryo')).toBe(true) // $12,000

    // Buy NVIDIA A100 SXM4 Tensor GPU ($10,000.00, 312 TFLOPS)
    runner.advanceUntil((s) => s.funds.gte(10000), 30000, 5.0)
    const boughtA100 = store.buyHardware('a100_sxm4')
    expect(boughtA100).toBe(true)

    // Buy NVIDIA H100 SXM5 Supercomputer ($32,000.00, 40000, 10.0)
    runner.advanceUntil((s) => s.funds.gte(32000), 40000, 10.0)
    const boughtH100 = store.buyHardware('h100_sxm5')
    expect(boughtH100).toBe(true)

    // Switch to Training Allocation to scale parameters into tens of thousands
    store.setAllocationPreset('train')
    runner.advanceTime(30, 0.5)

    // Distribute between Training & Research (50% Training, 50% Research)
    store.updateAllocations({
      inferencePercent: 0,
      trainingPercent: 50,
      researchPercent: 50,
    })
    runner.advanceTime(30, 0.5)

    // Final Validations
    const state = runner.getState()
    const metrics = runner.getMetrics(startRealTime)

    // 1. High compute and parameters
    expect(state.effectiveCompute.toNumber()).toBeGreaterThan(2300) // > 2300 TFLOPS
    expect(state.parameters.toNumber()).toBeGreaterThan(10000)
    expect(state.researchPoints.toNumber()).toBeGreaterThan(0)

    // 2. Physical stability: No thermal throttling, no electrical overload
    expect(state.isThrottling).toBe(false)
    expect(state.isOverloaded).toBe(false)
    expect(store.thermalState.status).toBe('nominal')
    expect(store.powerState.status).toBe('nominal')

    // 3. Execution time: The entire multi-hour progression simulated in less than 2.5s real time!
    expect(metrics.realExecutionTimeMs).toBeLessThan(2500)
    expect(metrics.purchasedHardwareCount).toBeGreaterThanOrEqual(7)
    expect(metrics.purchasedUpgradesCount).toBeGreaterThanOrEqual(20)
  })

  it('Declarative Scenario Engine: Executes a structured ScenarioAction array with assertions', () => {
    const store = useGameStore()
    const runner = new ScenarioRunner(store)

    const result = runner.executeScenario([
      { type: 'manual_scrape', clicks: 8 },
      {
        type: 'assert',
        assertion: (s) => {
          expect(s.totalCharsRead.toNumber()).toBe(80)
          expect(s.unlockedFeatures.dataBroker).toBe(true)
        },
      },
      { type: 'sell_all_raw_text' },
      {
        type: 'assert',
        assertion: (s) => {
          expect(s.funds.toNumber()).toBeCloseTo(0.2)
        },
      },
      { type: 'buy_upgrade', upgradeId: 'human_speed_reading' },
      {
        type: 'assert',
        assertion: (s) => {
          expect(s.upgrades.human_speed_reading.purchased).toBe(true)
        },
      },
    ])

    expect(result.success).toBe(true)
    expect(result.metrics.actionsExecuted).toBe(6)
  })

  it('Gating & Safety: Prevents illegal hardware acquisition and handles errors deterministically', () => {
    const store = useGameStore()
    const runner = new ScenarioRunner(store)

    // Attempt to buy gaming PC directly without potato PC and required RAM
    store.funds.current = new Decimal(500)
    const boughtIllegalHost = store.buyHardware('gaming_pc')
    expect(boughtIllegalHost).toBe(false)
    expect(runner.buyHardwareWhenAffordable('gaming_pc', 1)).toBe(false)

    // Attempt to buy H100 GPU directly on Tier 0 host
    const boughtIllegalGpu = store.buyHardware('h100_sxm5')
    expect(boughtIllegalGpu).toBe(false)
    expect(runner.buyHardwareWhenAffordable('h100_sxm5', 1)).toBe(false)
  })
})
