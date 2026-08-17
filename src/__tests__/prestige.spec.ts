import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import Decimal from 'break_infinity.js'
import { PrestigeEngine } from '@/domain/engine/PrestigeEngine'
import { usePrestigeStore, useGameStore } from '@/stores'

describe('Prestige Engine & PrestigeStore Unit Tests', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('PrestigeEngine pure calculations', () => {
    it('evaluates prestige eligibility strictly at >= 1M parameters', () => {
      expect(PrestigeEngine.canPrestige(new Decimal(999_999))).toBe(false)
      expect(PrestigeEngine.canPrestige(new Decimal(1_000_000))).toBe(true)
      expect(PrestigeEngine.canPrestige(new Decimal(10_000_000))).toBe(true)
    })

    it('calculates Architecture Points (AP) with square root scaling formula', () => {
      // AP = floor( (parameters / 10^6) ^ 0.5 )
      expect(PrestigeEngine.calculateArchitecturePoints(new Decimal(500_000))).toBe(0)
      expect(PrestigeEngine.calculateArchitecturePoints(new Decimal(1_000_000))).toBe(1)
      expect(PrestigeEngine.calculateArchitecturePoints(new Decimal(4_000_000))).toBe(2)
      expect(PrestigeEngine.calculateArchitecturePoints(new Decimal(9_000_000))).toBe(3)
      expect(PrestigeEngine.calculateArchitecturePoints(new Decimal(16_000_000))).toBe(4)
      expect(PrestigeEngine.calculateArchitecturePoints(new Decimal(100_000_000))).toBe(10)
    })

    it('calculates universal checkpoint compute multiplier (+5% per AP)', () => {
      expect(PrestigeEngine.calculateCheckpointMultiplier(0)).toBe(1.0)
      expect(PrestigeEngine.calculateCheckpointMultiplier(1)).toBeCloseTo(1.05)
      expect(PrestigeEngine.calculateCheckpointMultiplier(10)).toBeCloseTo(1.50)
      expect(PrestigeEngine.calculateCheckpointMultiplier(20)).toBeCloseTo(2.00)
    })
  })

  describe('usePrestigeStore', () => {
    it('initializes with 0 AP and default talents catalog', () => {
      const store = usePrestigeStore()
      expect(store.totalArchitecturePoints).toBe(0)
      expect(store.architecturePoints).toBe(0)
      expect(store.prestigeCount).toBe(0)
      expect(store.checkpointMultiplier).toBe(1.0)
      expect(store.talents.opt_bpe_fast_track).toBeDefined()
      expect(store.talents.opt_bpe_fast_track.purchased).toBe(false)
    })

    it('claims prestige AP and updates total counters', () => {
      const store = usePrestigeStore()
      const res = store.claimPrestige(new Decimal(4_000_000))
      expect(res.success).toBe(true)
      expect(res.gainedAP).toBe(2)
      expect(store.architecturePoints).toBe(2)
      expect(store.totalArchitecturePoints).toBe(2)
      expect(store.prestigeCount).toBe(1)
      expect(store.checkpointMultiplier).toBeCloseTo(1.10)
    })

    it('enforces talent prerequisite requirements and AP cost', () => {
      const store = usePrestigeStore()
      store.architecturePoints = 10

      // opt_hardware_rebate requires opt_bpe_fast_track
      const buyLocked = store.buyTalent('opt_hardware_rebate')
      expect(buyLocked.success).toBe(false)
      expect(buyLocked.reason).toBe('missing_prerequisite')

      // Buy prerequisite first
      const buyPrereq = store.buyTalent('opt_bpe_fast_track')
      expect(buyPrereq.success).toBe(true)
      expect(store.architecturePoints).toBe(9) // cost was 1
      expect(store.talentMultipliers.scrapePowerMultiplier).toBeCloseTo(1.5)

      // Now buy dependent talent
      const buyUnlocked = store.buyTalent('opt_hardware_rebate')
      expect(buyUnlocked.success).toBe(true)
      expect(store.architecturePoints).toBe(7) // cost was 2
      expect(store.talentMultipliers.hardwareDiscountMultiplier).toBeCloseTo(0.85)
    })
  })

  describe('GameStore Soft Reset & Prestige Integration', () => {
    it('executes a Tier 1 soft reset, resetting volatile state while preserving AP and unlocks', () => {
      const game = useGameStore()

      // Give player initial resources and parameters
      game.rawText.current = new Decimal(100)
      game.tokens.current = new Decimal(50)
      game.funds.current = new Decimal(500)
      game.parameters = new Decimal(4_000_000)
      game.currentPhase = 3

      expect(game.canPrestige).toBe(true)
      expect(game.pendingAP).toBe(2)

      // Trigger soft reset
      const success = game.triggerPrestige()
      expect(success).toBe(true)

      // Volatile resources reset
      expect(game.rawText.current.toNumber()).toBe(0)
      expect(game.tokens.current.toNumber()).toBe(0)
      expect(game.funds.current.toNumber()).toBe(0)
      expect(game.parameters.toNumber()).toBe(0)
      expect(game.currentPhase).toBe(0)

      // Prestige persistent state retained
      expect(game.prestige.architecturePoints).toBe(2)
      expect(game.prestige.totalArchitecturePoints).toBe(2)
      expect(game.prestige.prestigeCount).toBe(1)
      expect(game.checkpointMultiplier).toBeCloseTo(1.10)
      expect(game.unlockedFeatures.prestigeT1).toBe(true)
    })
  })
})
