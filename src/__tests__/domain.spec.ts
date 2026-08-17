import { describe, it, expect } from 'vitest'
import Decimal from 'break_infinity.js'
import {
  ComputeEngine,
  EconomyEngine,
  MilestoneTracker,
  OfflineEngine,
  MAX_OFFLINE_SECONDS,
} from '@/domain'
import { createInitialHardware } from '@/domain/constants/hardware'
import { createInitialUpgrades } from '@/domain/constants/upgrades'
import {
  createInitialMilestones,
  createInitialUnlockedFeatures,
} from '@/domain/constants/milestones'

describe('ComputeEngine Domain Unit Tests', () => {
  it('calculates raw compute accurately based on node count and tflops', () => {
    const hw = createInitialHardware()
    expect(ComputeEngine.calculateRawCompute(hw).toNumber()).toBe(0)

    hw.potato_pc.count = 2 // 2 * 0.001 = 0.002
    hw.used_cpu.count = 1   // 1 * 0.05 = 0.05
    hw.gtx_gpu.count = 2    // 2 * 0.5 = 1.0

    const raw = ComputeEngine.calculateRawCompute(hw)
    expect(raw.toNumber()).toBeCloseTo(1.052)
  })

  it('calculates total power draw and vram correctly', () => {
    const hw = createInitialHardware()
    hw.potato_pc.count = 1 // 35W, 0.064GB
    hw.gtx_gpu.count = 2   // 2 * 150 = 300W, 2 * 6 = 12GB

    const power = ComputeEngine.calculatePowerDraw(hw)
    expect(power.toNumber()).toBe(335)

    const vram = ComputeEngine.calculateVram(hw)
    expect(vram.toNumber()).toBeCloseTo(12.064)
  })

  it('calculates thermal state and throttling correctly', () => {
    // Under cooling capacity: 100W power -> 90W heat <= 100W cooling -> efficiency 1.0
    const stateNormal = ComputeEngine.calculateThermalState(
      new Decimal(100),
      new Decimal(100)
    )
    expect(stateNormal.isThrottling).toBe(false)
    expect(stateNormal.efficiency).toBe(1.0)

    // Over cooling capacity: 500W power -> 450W heat > 150W cooling -> efficiency = 150/450 = 0.333
    const stateThrottled = ComputeEngine.calculateThermalState(
      new Decimal(500),
      new Decimal(150)
    )
    expect(stateThrottled.isThrottling).toBe(true)
    expect(stateThrottled.efficiency).toBeCloseTo(0.333, 2)
  })

  it('calculates power grid state and overload penalty correctly', () => {
    const gridNormal = ComputeEngine.calculatePowerState(
      new Decimal(80),
      new Decimal(100)
    )
    expect(gridNormal.isOverloaded).toBe(false)
    expect(gridNormal.gridLoadPercent).toBe(80)

    const gridOverloaded = ComputeEngine.calculatePowerState(
      new Decimal(150),
      new Decimal(100)
    )
    expect(gridOverloaded.isOverloaded).toBe(true)
    expect(gridOverloaded.gridLoadPercent).toBe(150)

    // Effective compute suffers 50% penalty on grid overload
    const thermal = { heatGeneratedWatts: new Decimal(0), coolingCapacityWatts: new Decimal(100), efficiency: 1.0, isThrottling: false }
    const comp = ComputeEngine.calculateEffectiveCompute(new Decimal(10), thermal, gridOverloaded)
    expect(comp.toNumber()).toBe(5.0)
  })

  it('computes exponential hardware cost scaling accurately', () => {
    const hw = createInitialHardware()
    const potato = hw.potato_pc
    expect(ComputeEngine.calculateHardwareCost(potato).toNumber()).toBe(10)

    potato.count = 1
    // 10 * 1.25^1 = 12.5
    expect(ComputeEngine.calculateHardwareCost(potato).toNumber()).toBe(12.5)

    potato.count = 2
    // 10 * 1.25^2 = 15.625
    expect(ComputeEngine.calculateHardwareCost(potato).toNumber()).toBe(15.625)
  })
})

describe('EconomyEngine Domain Unit Tests', () => {
  it('calculates manual scrape power based on human upgrades', () => {
    const up = createInitialUpgrades()
    expect(EconomyEngine.calculateManualScrapePower(up)).toBe(10)

    up.human_speed_reading.purchased = true
    expect(EconomyEngine.calculateManualScrapePower(up)).toBe(15)

    up.human_espresso.purchased = true
    expect(EconomyEngine.calculateManualScrapePower(up)).toBe(25)

    up.script_regex_cleaner.purchased = true
    expect(EconomyEngine.calculateManualScrapePower(up)).toBe(40)
  })

  it('calculates raw text sell price based on negotiation upgrade', () => {
    const up = createInitialUpgrades()
    expect(EconomyEngine.calculateRawTextSellPrice(up)).toBe(0.05)

    up.broker_negotiation.purchased = true
    expect(EconomyEngine.calculateRawTextSellPrice(up)).toBe(0.08)
  })

  it('calculates auto scrape rate from scripts and crawler daemons', () => {
    const up = createInitialUpgrades()
    expect(EconomyEngine.calculateAutoScrapeRate(up)).toBe(0)

    up.script_simple_scraper.purchased = true
    expect(EconomyEngine.calculateAutoScrapeRate(up)).toBe(5)

    up.script_multi_curl.purchased = true
    expect(EconomyEngine.calculateAutoScrapeRate(up)).toBe(25)

    up.crawler_daemon_v2.purchased = true
    expect(EconomyEngine.calculateAutoScrapeRate(up)).toBe(85)
  })

  it('calculates model quality multiplier logarithmic progression', () => {
    expect(EconomyEngine.calculateModelQualityMultiplier(0)).toBe(1.0)
    expect(EconomyEngine.calculateModelQualityMultiplier(10)).toBeCloseTo(1.25)
    expect(EconomyEngine.calculateModelQualityMultiplier(100)).toBeCloseTo(1.50)
    expect(EconomyEngine.calculateModelQualityMultiplier(10000)).toBeCloseTo(2.00)
  })

  it('calculates tokenizing capacity with vectorization boost', () => {
    const up = createInitialUpgrades()
    const compute = new Decimal(2) // 2 TFLOPS

    // Base: 2 * 50 * 1.0 * 0.1s = 10 tokens
    const cap1 = EconomyEngine.calculateTokenizingCapacity(compute, up, 0.1)
    expect(cap1.toNumber()).toBe(10)

    // Fast BPE: 2 * 50 * 2.0 * 0.1s = 20 tokens
    up.fast_bpe_tokenizer.purchased = true
    const cap2 = EconomyEngine.calculateTokenizingCapacity(compute, up, 0.1)
    expect(cap2.toNumber()).toBe(20)
  })
})

describe('MilestoneTracker Domain Unit Tests', () => {
  it('triggers early game milestones at exact character thresholds', () => {
    const milestones = createInitialMilestones()
    const unlocks = createInitialUnlockedFeatures()

    const events1 = MilestoneTracker.checkEarlyGameProgress(20, milestones, unlocks)
    expect(events1).toHaveLength(0)

    const events2 = MilestoneTracker.checkEarlyGameProgress(30, milestones, unlocks)
    expect(events2).toHaveLength(1)
    expect(milestones.readingSkill1).toBe(true)

    const events3 = MilestoneTracker.checkEarlyGameProgress(80, milestones, unlocks)
    expect(events3).toHaveLength(1)
    expect(unlocks.dataBroker).toBe(true)
    expect(milestones.dataBrokerUnlocked).toBe(true)
  })

  it('triggers hardware unlock on reaching $5 or 150 characters', () => {
    const milestones = createInitialMilestones()
    const unlocks = createInitialUnlockedFeatures()

    const events = MilestoneTracker.checkHardwareUnlock(new Decimal(5), 20, unlocks, milestones)
    expect(events).toHaveLength(1)
    expect(unlocks.hardwareSection).toBe(true)
    expect(milestones.potatoPcUnlocked).toBe(true)
  })
})

describe('OfflineEngine Domain Unit Tests', () => {
  it('ignores offline durations under 10 seconds', () => {
    const report = OfflineEngine.calculateOfflineProgress({
      now: 100000,
      lastTickTimestamp: 95000,
      rawTextCurrent: new Decimal(0),
      tokensCurrent: new Decimal(0),
      fundsCurrent: new Decimal(0),
      parametersCurrent: new Decimal(0),
      runStep: () => {},
    })
    expect(report).toBeNull()
  })

  it('simulates steps and respects the 24 hour ceiling', () => {
    let stepsExecuted = 0
    const report = OfflineEngine.calculateOfflineProgress({
      now: 200000 * 1000,
      lastTickTimestamp: 0,
      rawTextCurrent: new Decimal(10),
      tokensCurrent: new Decimal(5),
      fundsCurrent: new Decimal(100),
      parametersCurrent: new Decimal(50),
      runStep: () => { stepsExecuted++ },
    })

    expect(report).not.toBeNull()
    expect(report?.cappedAt24h).toBe(true)
    expect(report?.simulatedSeconds).toBe(MAX_OFFLINE_SECONDS)
    expect(stepsExecuted).toBe(MAX_OFFLINE_SECONDS)
  })
})
