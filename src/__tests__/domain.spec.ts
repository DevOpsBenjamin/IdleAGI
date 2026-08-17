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

    hw.potato_pc.count = 2   // 2 * 0.001 = 0.002
    hw.core2_quad.count = 1  // 1 * 0.04 = 0.04
    hw.gtx_750ti.count = 2   // 2 * 1.3 = 2.6

    const raw = ComputeEngine.calculateRawCompute(hw)
    expect(raw.toNumber()).toBeCloseTo(2.642)
  })

  it('calculates total power draw, vram and memory bandwidth correctly', () => {
    const hw = createInitialHardware()
    hw.potato_pc.count = 1 // 35W, 0.064GB, 0.8 GB/s
    hw.gtx_750ti.count = 2  // 2 * 60 = 120W, 2 * 2 = 4GB, 2 * 86.4 = 172.8 GB/s

    const power = ComputeEngine.calculatePowerDraw(hw)
    expect(power.toNumber()).toBe(155)

    const vram = ComputeEngine.calculateVram(hw)
    expect(vram.toNumber()).toBeCloseTo(4.064)

    const bw = ComputeEngine.calculateTotalMemoryBandwidth(hw)
    expect(bw.toNumber()).toBeCloseTo(173.6)

    const mult = ComputeEngine.calculateBandwidthSpeedMultiplier(100)
    expect(mult).toBeCloseTo(1.40)
  })

  it('calculates PCIe slots provided and used across host machines and GPUs', () => {
    const hw = createInitialHardware()
    // Potato PC has 0 PCIe slots
    hw.potato_pc.count = 1
    let pcie = ComputeEngine.calculatePcieSlots(hw)
    expect(pcie.totalSlots).toBe(0)
    expect(pcie.freeSlots).toBe(0)
    expect(ComputeEngine.canInstallGpu(hw, hw.gtx_750ti).canInstall).toBe(false)

    // Add 1 Core 2 Quad (Tier 0, 1 slot PCIe)
    hw.core2_quad.count = 1
    expect(ComputeEngine.canInstallGpu(hw, hw.gtx_750ti).canInstall).toBe(true)
    const rtxOnCore2 = ComputeEngine.canInstallGpu(hw, hw.rtx_3060)
    expect(rtxOnCore2.canInstall).toBe(false)
    if (!rtxOnCore2.canInstall) {
      expect(rtxOnCore2.reason).toBe('host_tier_too_low') // RTX 3060 requires Tier 1+ host!
    }

    // Add 1 Gaming PC (Tier 1, 2 slots PCIe)
    hw.gaming_pc.count = 1
    pcie = ComputeEngine.calculatePcieSlots(hw)
    expect(pcie.totalSlots).toBe(3) // 1 (Core 2) + 2 (Gaming PC)
    expect(ComputeEngine.canInstallGpu(hw, hw.rtx_3060).canInstall).toBe(true)

    // Install 3 GPUs to fill all slots
    hw.gtx_750ti.count = 1
    hw.rtx_3060.count = 2
    pcie = ComputeEngine.calculatePcieSlots(hw)
    expect(pcie.usedSlots).toBe(3)
    expect(pcie.freeSlots).toBe(0)
    const saturated = ComputeEngine.canInstallGpu(hw, hw.rtx_3060)
    expect(saturated.canInstall).toBe(false)
    if (!saturated.canInstall) {
      expect(saturated.reason).toBe('no_pcie_slots')
    }
  })

  it('calculates heat generated with canonical Q = P * 0.90 formula', () => {
    const heat1 = ComputeEngine.calculateHeatGenerated(new Decimal(100))
    expect(heat1.toNumber()).toBe(90)

    const heat2 = ComputeEngine.calculateHeatGenerated(new Decimal(700))
    expect(heat2.toNumber()).toBe(630)
  })

  it('calculates simulated operating temperature and qualified thermal status', () => {
    // Ambient / zero load: 22°C nominal
    expect(ComputeEngine.calculateTemperatureCelsius(new Decimal(0), new Decimal(100), 1.0)).toBe(22.0)
    expect(ComputeEngine.calculateThermalStatus(22.0)).toBe('nominal')

    // 50% thermal load: 22 + 10 + 45 * 0.5 = 54.5°C nominal
    const tempHalf = ComputeEngine.calculateTemperatureCelsius(new Decimal(50), new Decimal(100), 1.0)
    expect(tempHalf).toBe(54.5)
    expect(ComputeEngine.calculateThermalStatus(tempHalf)).toBe('nominal')

    // 100% thermal load: 22 + 10 + 45 * 1.0 = 77°C warm
    const tempFull = ComputeEngine.calculateTemperatureCelsius(new Decimal(100), new Decimal(100), 1.0)
    expect(tempFull).toBe(77.0)
    expect(ComputeEngine.calculateThermalStatus(tempFull)).toBe('warm')

    // Overload / throttling with 50% efficiency: 77 + 28 * 0.5 = 91°C throttling
    const tempThrottled = ComputeEngine.calculateTemperatureCelsius(new Decimal(200), new Decimal(100), 0.5)
    expect(tempThrottled).toBe(91.0)
    expect(ComputeEngine.calculateThermalStatus(tempThrottled)).toBe('throttling')
  })

  it('calculates thermal state, temperature, and throttling correctly', () => {
    // Under cooling capacity: 100W power -> 90W heat <= 100W cooling -> efficiency 1.0, ~72.5°C
    const stateNormal = ComputeEngine.calculateThermalState(
      new Decimal(100),
      new Decimal(100)
    )
    expect(stateNormal.isThrottling).toBe(false)
    expect(stateNormal.efficiency).toBe(1.0)
    expect(stateNormal.heatGeneratedWatts.toNumber()).toBe(90)
    expect(stateNormal.temperatureCelsius).toBeCloseTo(72.5, 1)
    expect(stateNormal.status).toBe('warm')

    // Over cooling capacity: 500W power -> 450W heat > 150W cooling -> efficiency = 150/450 = 0.333
    const stateThrottled = ComputeEngine.calculateThermalState(
      new Decimal(500),
      new Decimal(150)
    )
    expect(stateThrottled.isThrottling).toBe(true)
    expect(stateThrottled.efficiency).toBeCloseTo(0.333, 2)
    expect(stateThrottled.status).toBe('throttling')
    expect(stateThrottled.temperatureCelsius).toBeGreaterThan(90)
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
    const thermal = ComputeEngine.calculateThermalState(new Decimal(0), new Decimal(100))
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
