import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useGameStore, MAX_OFFLINE_SECONDS } from '@/stores/gameStore'
import Decimal from 'break_infinity.js'
import { serializeGameState, deserializeGameState } from '@/utils/serialization'

describe('GameStore Core Gameplay (Sprint 1)', () => {
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

  it('initializes with default values and 1 used CPU', () => {
    const store = useGameStore()
    expect(store.funds.current.toNumber()).toBe(50)
    expect(store.rawText.current.toNumber()).toBe(0)
    expect(store.tokens.current.toNumber()).toBe(0)
    expect(store.hardware.used_cpu.count).toBe(1)
    expect(store.hardware.gtx_gpu.count).toBe(0)
    expect(store.totalRawCompute.toNumber()).toBeCloseTo(0.05)
    expect(store.thermalState.efficiency).toBe(1.0)
    expect(store.powerState.isOverloaded).toBe(false)
  })

  it('handles manual scraping with default power (+10 chars)', () => {
    const store = useGameStore()
    store.manualScrape()
    expect(store.rawText.current.toNumber()).toBe(10)
    store.manualScrape()
    expect(store.rawText.current.toNumber()).toBe(20)
  })

  it('handles manual tokenization and conversion ratio (4 chars -> 1 token)', () => {
    const store = useGameStore()
    store.manualScrape(12) // 12 chars
    expect(store.rawText.current.toNumber()).toBe(12)

    store.manualTokenize(1) // 1 token = 4 chars
    expect(store.rawText.current.toNumber()).toBe(8)
    expect(store.tokens.current.toNumber()).toBe(1)

    store.manualTokenize(2) // 2 tokens = 8 chars
    expect(store.rawText.current.toNumber()).toBe(0)
    expect(store.tokens.current.toNumber()).toBe(3)
  })

  it('handles manualTokenizeMax converting all available characters up to buffer limit', () => {
    const store = useGameStore()
    store.manualScrape(43) // 43 chars -> 10 tokens with 3 chars remainder
    store.manualTokenizeMax()

    expect(store.tokens.current.toNumber()).toBe(10)
    expect(store.rawText.current.toNumber()).toBe(3)
  })

  it('calculates hardware costs exponentially and allows purchasing', () => {
    const store = useGameStore()
    // Initial used CPU cost is 25 * (1.15^1) = 28.75
    const cost1 = store.getHardwareCost('used_cpu')
    expect(cost1.toNumber()).toBeCloseTo(28.75)

    // Store has $50
    const bought = store.buyHardware('used_cpu')
    expect(bought).toBe(true)
    expect(store.hardware.used_cpu.count).toBe(2)
    expect(store.funds.current.toNumber()).toBeCloseTo(50 - 28.75)

    // Next cost should be 25 * (1.15^2) = 33.0625
    const cost2 = store.getHardwareCost('used_cpu')
    expect(cost2.toNumber()).toBeCloseTo(33.0625)

    // Cannot afford next
    const boughtAgain = store.buyHardware('used_cpu')
    expect(boughtAgain).toBe(false)
  })

  it('allows purchasing software upgrades and applies their immediate effects', () => {
    const store = useGameStore()
    // Purchase Multi-thread scraper ($30)
    expect(store.upgrades.multi_thread_scraper.purchased).toBe(false)
    expect(store.manualScrapePower).toBe(10)

    const boughtScraper = store.buyUpgrade('multi_thread_scraper')
    expect(boughtScraper).toBe(true)
    expect(store.upgrades.multi_thread_scraper.purchased).toBe(true)
    expect(store.manualScrapePower).toBe(30)

    // Scrape with upgraded power
    store.manualScrape()
    expect(store.rawText.current.toNumber()).toBe(30)

    // Add funds and buy RAM buffer expansion ($80)
    store.funds.current = new Decimal(100)
    const boughtRam = store.buyUpgrade('ram_buffer_expansion_1')
    expect(boughtRam).toBe(true)
    expect(store.rawText.max.toNumber()).toBe(5000)
    expect(store.tokens.max.toNumber()).toBe(2500)
  })

  it('processes continuous engine ticks (auto-scraping, auto-tokenizing, inference, training, R&D)', () => {
    const store = useGameStore()
    // Enable auto-scraping via upgrade
    store.upgrades.crawler_daemon_v1.purchased = true
    expect(store.autoScrapeRate).toBe(20)

    // Run 1 second simulation (20 ticks of 0.05s)
    for (let i = 0; i < 20; i++) {
      store.processTick(0.05)
    }

    // Auto-scraping produced ~20 chars, tokenized by 0.05 TFLOPS CPU
    expect(store.rawText.current.toNumber() + store.tokens.current.toNumber() * 4).toBeGreaterThan(15)
  })

  it('generates funds from inference and parameters from training according to allocations', () => {
    const store = useGameStore()
    // Give 500 tokens and server blade compute
    store.tokens.max = new Decimal(1000)
    store.tokens.current = new Decimal(500)
    store.hardware.server_blade.count = 1 // 19.5 TFLOPS
    store.allocations = {
      inferencePercent: 50,
      trainingPercent: 50,
      researchPercent: 0,
    }

    const initialFunds = store.funds.current.toNumber()
    const initialParams = store.parameters.toNumber()

    store.processTick(1.0) // 1 second

    expect(store.funds.current.toNumber()).toBeGreaterThan(initialFunds)
    expect(store.parameters.toNumber()).toBeGreaterThan(initialParams)
  })

  it('respects allocation presets', () => {
    const store = useGameStore()
    store.setAllocationPreset('cash')
    expect(store.allocations.inferencePercent).toBe(80)
    expect(store.allocations.trainingPercent).toBe(10)
    expect(store.allocations.researchPercent).toBe(10)

    store.setAllocationPreset('train')
    expect(store.allocations.inferencePercent).toBe(10)
    expect(store.allocations.trainingPercent).toBe(70)
    expect(store.allocations.researchPercent).toBe(20)

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

    const fullState = store.getFullState()
    const serialized = serializeGameState(fullState)
    const deserialized = deserializeGameState(serialized, fullState)

    expect(deserialized).not.toBeNull()
    expect(deserialized?.funds?.current.toNumber()).toBe(1337.5)
    expect(deserialized?.parameters?.toNumber()).toBe(42000)
    expect(deserialized?.hardware?.gtx_gpu.count).toBe(3)
    expect(deserialized?.upgrades?.fast_bpe_tokenizer.purchased).toBe(true)
  })

  it('simulates offline progress up to 24h cap without exceeding buffers', () => {
    const store = useGameStore()
    store.upgrades.crawler_daemon_v1.purchased = true
    store.lastTickTimestamp = Date.now() - 3600 * 1000 // 1 hour offline

    store.calculateOfflineProgress()

    expect(store.lastOfflineReport).not.toBeNull()
    expect(store.lastOfflineReport?.simulatedSeconds).toBeCloseTo(3600, -1)
    expect(store.lastOfflineReport?.cappedAt24h).toBe(false)
  })

  it('enforces strict 24h ceiling on offline progress', () => {
    const store = useGameStore()
    store.lastTickTimestamp = Date.now() - 100000 * 1000 // > 27 hours offline

    store.calculateOfflineProgress()

    expect(store.lastOfflineReport).not.toBeNull()
    expect(store.lastOfflineReport?.simulatedSeconds).toBe(MAX_OFFLINE_SECONDS)
    expect(store.lastOfflineReport?.cappedAt24h).toBe(true)
  })
})
