import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import Decimal from 'break_infinity.js'
import {
  useTerminalStore,
  useResourcesStore,
  useHardwareStore,
  useUpgradesStore,
  useAllocationStore,
  useFeaturesStore,
} from '@/stores'

describe('Modular Pinia Stores Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('useTerminalStore', () => {
    it('manages terminal logs and enforces 200 items maximum buffer', () => {
      const store = useTerminalStore()
      expect(store.terminalLogs.length).toBe(1)

      store.addLog('Test log 1', 'info')
      expect(store.terminalLogs.length).toBe(2)

      // Add 250 logs
      for (let i = 0; i < 250; i++) {
        store.addLog(`Spam log ${i}`, 'thought')
      }
      expect(store.terminalLogs.length).toBe(200)

      store.clearLogs()
      expect(store.terminalLogs.length).toBe(0)
    })
  })

  describe('useResourcesStore', () => {
    it('handles manual scrape and text selling with decimal precision', () => {
      const store = useResourcesStore()
      expect(store.rawText.current.toNumber()).toBe(0)

      const added = store.manualScrape(15)
      expect(added.toNumber()).toBe(15)
      expect(store.rawText.current.toNumber()).toBe(15)
      expect(store.totalCharsRead.toNumber()).toBe(15)

      // Add more text to reach 40
      store.manualScrape(25)
      expect(store.rawText.current.toNumber()).toBe(40)

      const sellResult = store.sellRawText(20, 0.08)
      expect(sellResult.success).toBe(true)
      expect(sellResult.earned.toNumber()).toBeCloseTo(0.08)
      expect(store.rawText.current.toNumber()).toBe(20)
      expect(store.funds.current.toNumber()).toBeCloseTo(0.08)

      const sellAllResult = store.sellAllRawText(0.08)
      expect(sellAllResult.success).toBe(true)
      expect(sellAllResult.charsSold).toBe(20)
      expect(store.rawText.current.toNumber()).toBe(0)
    })
  })

  describe('useHardwareStore', () => {
    it('calculates hardware costs and purchases nodes conditionally', () => {
      const store = useHardwareStore()
      expect(store.getHardwareCost('potato_pc').toNumber()).toBe(10)

      // Try buy with insufficient funds
      const failedBuy = store.buyHardware('potato_pc', new Decimal(5))
      expect(failedBuy.success).toBe(false)
      expect(store.hardware.potato_pc.count).toBe(0)

      // Buy with enough funds
      const successBuy = store.buyHardware('potato_pc', new Decimal(10))
      expect(successBuy.success).toBe(true)
      expect(store.hardware.potato_pc.count).toBe(1)
      expect(store.hasPotatoPc).toBe(true)

      // Next cost scaled by 1.25
      expect(store.getHardwareCost('potato_pc').toNumber()).toBe(12.5)
    })
  })

  describe('useUpgradesStore', () => {
    it('manages software upgrades purchases with dual currencies (funds & research)', () => {
      const store = useUpgradesStore()
      expect(store.manualScrapePower).toBe(10)

      // Buy speed reading with funds ($0.15)
      const res = store.buyUpgrade('human_speed_reading', new Decimal(0.15), new Decimal(0))
      expect(res.success).toBe(true)
      expect(res.currency).toBe('funds')
      expect(store.upgrades.human_speed_reading.purchased).toBe(true)
      expect(store.manualScrapePower).toBe(15)

      // Already purchased returns false
      const repeat = store.buyUpgrade('human_speed_reading', new Decimal(10), new Decimal(10))
      expect(repeat.success).toBe(false)

      // Script requires scriptsSection unlocked
      const failedScript = store.buyUpgrade(
        'script_simple_scraper',
        new Decimal(10),
        new Decimal(0),
        { scriptsSection: false }
      )
      expect(failedScript.success).toBe(false)

      const successScript = store.buyUpgrade(
        'script_simple_scraper',
        new Decimal(10),
        new Decimal(0),
        { scriptsSection: true }
      )
      expect(successScript.success).toBe(true)
    })
  })

  describe('useAllocationStore', () => {
    it('manages compute allocations and presets based on unlocks', () => {
      const store = useAllocationStore()
      expect(store.allocations.inferencePercent).toBe(100)

      // Training locked -> stays 100% inference
      store.updateAllocations(
        { inferencePercent: 50, trainingPercent: 50, researchPercent: 0 },
        false,
        false
      )
      expect(store.allocations.inferencePercent).toBe(100)

      // Training unlocked -> updates
      store.updateAllocations(
        { inferencePercent: 40, trainingPercent: 60, researchPercent: 0 },
        true,
        false
      )
      expect(store.allocations.inferencePercent).toBe(40)
      expect(store.allocations.trainingPercent).toBe(60)

      // Balanced preset
      store.setAllocationPreset('balanced', true, true)
      expect(store.allocations.inferencePercent).toBe(50)
      expect(store.allocations.trainingPercent).toBe(30)
      expect(store.allocations.researchPercent).toBe(20)
    })
  })

  describe('useFeaturesStore', () => {
    it('tracks phase transitions and feature unlock flags', () => {
      const store = useFeaturesStore()
      expect(store.currentPhase).toBe(0)
      expect(store.unlockedFeatures.dataBroker).toBe(false)

      store.unlockFeature('dataBroker')
      expect(store.unlockedFeatures.dataBroker).toBe(true)

      store.setPhase(2)
      expect(store.currentPhase).toBe(2)

      // Cannot regress phase
      store.setPhase(1)
      expect(store.currentPhase).toBe(2)
    })
  })
})
