import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore, MAX_OFFLINE_SECONDS } from '@/stores/gameStore'
import Decimal from 'break_infinity.js'
import { serializeGameState, deserializeGameState } from '@/utils/serialization'

describe('GameStore Core Gameplay & Bootstrap Economy', () => {
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

  it('initializes in Cold Boot mode: $0, 0 CPU, 0 tokens, raw data broker ready', () => {
    const store = useGameStore()
    expect(store.funds.current.toNumber()).toBe(0)
    expect(store.rawText.current.toNumber()).toBe(0)
    expect(store.tokens.current.toNumber()).toBe(0)
    expect(store.hardware.used_cpu.count).toBe(0)
    expect(store.totalRawCompute.toNumber()).toBe(0)
    expect(store.unlockedFeatures.trainingAllocation).toBe(false)
    expect(store.unlockedFeatures.researchAllocation).toBe(false)
  })

  it('allows scraping and selling raw text to data brokers for initial cash', () => {
    const store = useGameStore()
    // Scrape 40 characters (4 clicks)
    store.manualScrape() // 10
    store.manualScrape() // 20
    store.manualScrape() // 30
    store.manualScrape() // 40
    expect(store.rawText.current.toNumber()).toBe(40)

    // Sell 20 characters for $0.05
    const sold = store.sellRawText(20)
    expect(sold).toBe(true)
    expect(store.rawText.current.toNumber()).toBe(20)
    expect(store.funds.current.toNumber()).toBeCloseTo(0.05)

    // Sell remaining all
    const soldAll = store.sellAllRawText()
    expect(soldAll).toBe(true)
    expect(store.rawText.current.toNumber()).toBe(0)
    expect(store.funds.current.toNumber()).toBeCloseTo(0.10)
  })

  it('allows purchasing early micro-upgrades to accelerate scraping power and sell rate', () => {
    const store = useGameStore()
    expect(store.manualScrapePower).toBe(10)

    // Give $0.50 and buy regex_parser_v0
    store.funds.current = new Decimal(0.50)
    const bought1 = store.buyUpgrade('regex_parser_v0')
    expect(bought1).toBe(true)
    expect(store.manualScrapePower).toBe(15)

    // Buy broker contract ($3.50)
    store.funds.current = new Decimal(3.50)
    const boughtBroker = store.buyUpgrade('raw_data_broker_contract')
    expect(boughtBroker).toBe(true)
    expect(store.rawTextSellPrice).toBe(0.08)
  })

  it('activates the hardware tokenizer and inference pipeline upon buying the 1st CPU', () => {
    const store = useGameStore()
    expect(store.totalRawCompute.toNumber()).toBe(0)

    // Cost for 1st CPU is $12 (12 * 1.15^0 = 12)
    expect(store.getHardwareCost('used_cpu').toNumber()).toBe(12)

    store.funds.current = new Decimal(12)
    const boughtCpu = store.buyHardware('used_cpu')
    expect(boughtCpu).toBe(true)
    expect(store.hardware.used_cpu.count).toBe(1)
    expect(store.totalRawCompute.toNumber()).toBeCloseTo(0.05)

    // Auto-tokenization now functions: 20 chars -> 5 tokens via 0.05 TFLOPS
    store.rawText.current = new Decimal(20)
    store.processTick(1.0) // 1 second: 0.05 TFLOPS * 50 tokens/s = 2.5 tokens

    expect(store.tokens.current.toNumber()).toBeGreaterThan(0)
    expect(store.rawText.current.toNumber()).toBeLessThan(20)
  })

  it('progressively unlocks Training allocation when enough tokens are served', () => {
    const store = useGameStore()
    store.hardware.used_cpu.count = 1
    expect(store.unlockedFeatures.trainingAllocation).toBe(false)

    // Serve 30 tokens through inference
    store.tokens.current = new Decimal(30)
    store.allocations = { inferencePercent: 100, trainingPercent: 0, researchPercent: 0 }

    // Run tick with enough compute to serve tokens
    store.hardware.gtx_gpu.count = 1 // 0.5 TFLOPS -> fast inference
    store.processTick(3.0)

    expect(store.unlockedFeatures.trainingAllocation).toBe(true)
  })

  it('increases API token sale price based on accumulated model parameters', () => {
    const store = useGameStore()
    // At 0 parameters, quality multiplier is 1.0
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
    store.unlockedFeatures.trainingAllocation = true
    expect(store.unlockedFeatures.researchAllocation).toBe(false)

    store.tokens.current = new Decimal(100)
    store.hardware.gtx_gpu.count = 1
    store.allocations = { inferencePercent: 0, trainingPercent: 100, researchPercent: 0 }

    // Training 1 token = 100 params -> 6 tokens = 600 params
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

  it('serializes and deserializes state accurately without data loss', () => {
    const store = useGameStore()
    store.funds.current = new Decimal(1337.5)
    store.parameters = new Decimal(42000)
    store.hardware.gtx_gpu.count = 3
    store.upgrades.fast_bpe_tokenizer.purchased = true
    store.unlockedFeatures.trainingAllocation = true
    store.unlockedFeatures.researchAllocation = true

    const fullState = store.getFullState()
    const serialized = serializeGameState(fullState)
    const deserialized = deserializeGameState(serialized, fullState)

    expect(deserialized).not.toBeNull()
    expect(deserialized?.funds?.current.toNumber()).toBe(1337.5)
    expect(deserialized?.parameters?.toNumber()).toBe(42000)
    expect(deserialized?.hardware?.gtx_gpu.count).toBe(3)
    expect(deserialized?.upgrades?.fast_bpe_tokenizer.purchased).toBe(true)
    expect(deserialized?.unlockedFeatures?.trainingAllocation).toBe(true)
  })

  it('simulates offline progress up to 24h cap without exceeding buffers', () => {
    const store = useGameStore()
    store.hardware.used_cpu.count = 1
    store.upgrades.crawler_daemon_v1.purchased = true
    store.lastTickTimestamp = Date.now() - 3600 * 1000 // 1 hour offline

    store.calculateOfflineProgress()

    expect(store.lastOfflineReport).not.toBeNull()
    expect(store.lastOfflineReport?.simulatedSeconds).toBeCloseTo(3600, -1)
    expect(store.lastOfflineReport?.cappedAt24h).toBe(false)
  })

  it('enforces strict 24h ceiling on offline progress', () => {
    const store = useGameStore()
    store.hardware.used_cpu.count = 1
    store.lastTickTimestamp = Date.now() - 100000 * 1000 // > 27 hours offline

    store.calculateOfflineProgress()

    expect(store.lastOfflineReport).not.toBeNull()
    expect(store.lastOfflineReport?.simulatedSeconds).toBe(MAX_OFFLINE_SECONDS)
    expect(store.lastOfflineReport?.cappedAt24h).toBe(true)
  })
})
