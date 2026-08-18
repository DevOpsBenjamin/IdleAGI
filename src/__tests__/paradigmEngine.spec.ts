import { describe, it, expect, beforeEach } from 'vitest'
import Decimal from 'break_infinity.js'
import { setActivePinia, createPinia } from 'pinia'
import {
  ParadigmEngine,
  SyntheticDataEngine,
  TIER_2_MIN_PARAMETERS,
} from '@/domain'
import { useParadigmStore } from '@/stores/paradigmStore'
import { useGameStore } from '@/stores/gameStore'
import {
  serializeParadigmState,
  deserializeParadigmState,
} from '@/utils/serialization'
import type { SoftwareUpgrade } from '@/types/upgrades'
import type { ParadigmState } from '@/types/paradigm'

describe('ParadigmEngine & Tier 2 Paradigm Shifts', () => {
  it('correctly gates Tier 2 prestige behind 1 Billion parameters', () => {
    expect(ParadigmEngine.canTriggerTier2(new Decimal(0))).toBe(false)
    expect(ParadigmEngine.canTriggerTier2(new Decimal(999_999_999))).toBe(false)
    expect(ParadigmEngine.canTriggerTier2(TIER_2_MIN_PARAMETERS)).toBe(true)
    expect(ParadigmEngine.canTriggerTier2(new Decimal(5_000_000_000))).toBe(true)
  })

  it('calculates Fundamental Insights (Phi) using the square root formula', () => {
    expect(ParadigmEngine.calculatePendingInsights(new Decimal(500_000_000))).toBe(0)
    expect(ParadigmEngine.calculatePendingInsights(new Decimal(1_000_000_000))).toBe(1)
    expect(ParadigmEngine.calculatePendingInsights(new Decimal(4_000_000_000))).toBe(2)
    expect(ParadigmEngine.calculatePendingInsights(new Decimal(9_000_000_000))).toBe(3)
    expect(ParadigmEngine.calculatePendingInsights(new Decimal(16_000_000_000))).toBe(4)
    expect(ParadigmEngine.calculatePendingInsights(new Decimal(100_000_000_000))).toBe(10)
  })

  it('computes universal passive TFLOPS multiplier (+10% per Phi)', () => {
    expect(ParadigmEngine.calculatePassiveTflopsMultiplier(0)).toBe(1.0)
    expect(ParadigmEngine.calculatePassiveTflopsMultiplier(1)).toBe(1.10)
    expect(ParadigmEngine.calculatePassiveTflopsMultiplier(5)).toBe(1.50)
    expect(ParadigmEngine.calculatePassiveTflopsMultiplier(10)).toBe(2.00)
  })

  it('provides complete multipliers for all 4 architectural paradigms', () => {
    const dense = ParadigmEngine.calculateMultipliers('dense_transformer', 0)
    expect(dense.tflopsMultiplier).toBe(1.0)
    expect(dense.powerReduction).toBe(0.0)
    expect(dense.vramEfficiency).toBe(1.0)
    expect(dense.syntheticSpeedBonus).toBe(1.0)
    expect(dense.hasNoThrottling).toBe(false)

    const moe = ParadigmEngine.calculateMultipliers('mixture_of_experts', 2)
    expect(moe.tflopsMultiplier).toBe(2.5)
    expect(moe.powerReduction).toBe(0.15)
    expect(moe.vramEfficiency).toBe(2.0)
    expect(moe.syntheticSpeedBonus).toBe(1.5)
    expect(moe.passiveTflopsMultiplier).toBe(1.20)

    const neuro = ParadigmEngine.calculateMultipliers('neuromorphic_spiking', 5)
    expect(neuro.tflopsMultiplier).toBe(4.0)
    expect(neuro.powerReduction).toBe(0.75) // -75% power draw
    expect(neuro.vramEfficiency).toBe(3.0)
    expect(neuro.syntheticSpeedBonus).toBe(2.5)
    expect(neuro.hasNoThrottling).toBe(true)

    const quantum = ParadigmEngine.calculateMultipliers('quantum_annealed', 20)
    expect(quantum.tflopsMultiplier).toBe(10.0)
    expect(quantum.powerReduction).toBe(0.50)
    expect(quantum.vramEfficiency).toBe(5.0)
    expect(quantum.syntheticSpeedBonus).toBe(6.0)
  })

  it('manages unlocking and selection permissions accurately', () => {
    const unlocked = ['dense_transformer'] as const

    expect(ParadigmEngine.canUnlockParadigm('dense_transformer', 10, [...unlocked])).toBe(false)
    expect(ParadigmEngine.canUnlockParadigm('mixture_of_experts', 0, [...unlocked])).toBe(false)
    expect(ParadigmEngine.canUnlockParadigm('mixture_of_experts', 1, [...unlocked])).toBe(true)
    expect(ParadigmEngine.canUnlockParadigm('neuromorphic_spiking', 4, [...unlocked])).toBe(false)
    expect(ParadigmEngine.canUnlockParadigm('neuromorphic_spiking', 5, [...unlocked])).toBe(true)

    expect(ParadigmEngine.canSelectParadigm('dense_transformer', [...unlocked])).toBe(true)
    expect(ParadigmEngine.canSelectParadigm('mixture_of_experts', [...unlocked])).toBe(false)
  })
})

describe('SyntheticDataEngine & Model Collapse Dynamics', () => {
  it('calculates synthetic generation rate based on compute and active state', () => {
    expect(SyntheticDataEngine.calculateSyntheticRate(new Decimal(100), 1.5, false).toNumber()).toBe(0)
    expect(SyntheticDataEngine.calculateSyntheticRate(new Decimal(0), 1.5, true).toNumber()).toBe(0)
    expect(SyntheticDataEngine.calculateSyntheticRate(new Decimal(100), 1.5, true).toNumber()).toBe(150)
    expect(SyntheticDataEngine.calculateSyntheticRate(new Decimal(200), 2.5, true).toNumber()).toBe(500)
  })

  it('calculates synthetic ratio accurately', () => {
    expect(SyntheticDataEngine.calculateSyntheticRatio(new Decimal(0), new Decimal(0))).toBe(0)
    expect(SyntheticDataEngine.calculateSyntheticRatio(new Decimal(300), new Decimal(1000))).toBe(0.3)
    expect(SyntheticDataEngine.calculateSyntheticRatio(new Decimal(750), new Decimal(1000))).toBe(0.75)
    expect(SyntheticDataEngine.calculateSyntheticRatio(new Decimal(1500), new Decimal(1000))).toBe(1.0)
  })

  it('evaluates collapse threshold with RLAIF upgrade', () => {
    const mockUpgrades: Record<string, SoftwareUpgrade> = {
      safety_rlaif: {
        id: 'safety_rlaif',
        name: 'RLAIF',
        description: '',
        cost: new Decimal(10000),
        currency: 'funds',
        purchased: false,
        category: 'security',
      },
    }

    expect(SyntheticDataEngine.calculateCollapseThreshold(mockUpgrades)).toBe(0.70)
    mockUpgrades.safety_rlaif.purchased = true
    expect(SyntheticDataEngine.calculateCollapseThreshold(mockUpgrades)).toBe(0.85)
  })

  it('detects model collapse and applies safety immunities', () => {
    const mockUpgrades: Record<string, SoftwareUpgrade> = {
      safety_synthetic_density_filter: {
        id: 'safety_synthetic_density_filter',
        name: 'Density Filter',
        description: '',
        cost: new Decimal(250000),
        currency: 'funds',
        purchased: false,
        category: 'security',
      },
      safety_syntactic_diversity: {
        id: 'safety_syntactic_diversity',
        name: 'Syntactic Diversity',
        description: '',
        cost: new Decimal(50000),
        currency: 'funds',
        purchased: false,
        category: 'security',
      },
    }

    // Ratio 75% > 70% threshold -> Collapse active
    expect(SyntheticDataEngine.isModelCollapseActive(0.75, 0.70, false)).toBe(true)
    expect(SyntheticDataEngine.calculateSyntheticDriftMultiplier(true)).toBe(2.0)
    expect(SyntheticDataEngine.calculateTrainingEfficiencyMultiplier(true, false)).toBe(0.50)

    // With syntactic diversity -> Training penalty cancelled
    expect(SyntheticDataEngine.calculateTrainingEfficiencyMultiplier(true, true)).toBe(1.0)

    // With synthetic density filter -> Model collapse immune
    mockUpgrades.safety_synthetic_density_filter.purchased = true
    expect(SyntheticDataEngine.isModelCollapseImmune(mockUpgrades)).toBe(true)
    expect(SyntheticDataEngine.isModelCollapseActive(0.95, 0.70, true)).toBe(false)
  })

  it('executes a discrete synthetic tick step', () => {
    const context = {
      effectiveCompute: new Decimal(100),
      syntheticSpeedBonus: 2.0,
      isSyntheticActive: true,
      syntheticProducedSoFar: new Decimal(100),
      totalCharsReadSoFar: new Decimal(200),
      upgrades: {},
      dt: 0.1,
    }

    const result = SyntheticDataEngine.processTick(context)
    expect(result.syntheticRateCharsPerSec.toNumber()).toBe(200)
    expect(result.charsProducedThisTick.toNumber()).toBe(20)
    expect(result.updatedSyntheticProduced.toNumber()).toBe(120)
    expect(result.updatedTotalChars.toNumber()).toBe(220)
    expect(result.syntheticRatio).toBeCloseTo(0.545, 2)
    expect(result.isModelCollapseActive).toBe(false)
  })
})

describe('useParadigmStore Pinia Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with dense transformer and baseline metrics', () => {
    const store = useParadigmStore()
    expect(store.activeParadigm).toBe('dense_transformer')
    expect(store.unlockedParadigms).toEqual(['dense_transformer'])
    expect(store.insights).toBe(0)
    expect(store.totalInsightsEarned).toBe(0)
    expect(store.passiveTflopsMultiplier).toBe(1.0)
    expect(store.activeTflopsMultiplier).toBe(1.0)
    expect(store.isSyntheticActive).toBe(false)
  })

  it('claims Tier 2 prestige and unlocks new paradigms', () => {
    const store = useParadigmStore()
    const fourBillionParams = new Decimal(4_000_000_000)

    const claimRes = store.claimTier2Prestige(fourBillionParams)
    expect(claimRes.success).toBe(true)
    expect(claimRes.gainedInsights).toBe(2)
    expect(store.insights).toBe(2)
    expect(store.totalInsightsEarned).toBe(2)
    expect(store.passiveTflopsMultiplier).toBe(1.20)

    // Unlock MoE (cost 1 Phi)
    const unlockMoe = store.unlockParadigm('mixture_of_experts')
    expect(unlockMoe.success).toBe(true)
    expect(store.insights).toBe(1)
    expect(store.unlockedParadigms).toContain('mixture_of_experts')

    // Select MoE
    const selectMoe = store.selectParadigm('mixture_of_experts')
    expect(selectMoe.success).toBe(true)
    expect(store.activeParadigm).toBe('mixture_of_experts')
    expect(store.activeTflopsMultiplier).toBe(2.5)
  })

  it('toggles synthetic data auto-generation', () => {
    const store = useParadigmStore()
    expect(store.isSyntheticActive).toBe(false)
    expect(store.toggleSynthetic()).toBe(true)
    expect(store.isSyntheticActive).toBe(true)
    expect(store.toggleSynthetic()).toBe(false)
    expect(store.isSyntheticActive).toBe(false)
  })

  it('serializes and deserializes paradigm state with 100% fidelity', () => {
    const original: ParadigmState = {
      insights: 5,
      totalInsightsEarned: 10,
      activeParadigm: 'neuromorphic_spiking',
      unlockedParadigms: ['dense_transformer', 'mixture_of_experts', 'neuromorphic_spiking'],
      tier2PrestigeCount: 2,
      isSyntheticActive: true,
      syntheticTextProduced: new Decimal(45000),
      syntheticRatio: 0.62,
      modelCollapseActive: false,
    }

    const serialized = serializeParadigmState(original)
    expect(serialized.activeParadigm).toBe('neuromorphic_spiking')
    expect(serialized.insights).toBe(5)
    expect(serialized.syntheticTextProduced).toBe('45000')

    const deserialized = deserializeParadigmState(serialized)
    expect(deserialized.activeParadigm).toBe('neuromorphic_spiking')
    expect(deserialized.insights).toBe(5)
    expect(deserialized.totalInsightsEarned).toBe(10)
    expect(deserialized.unlockedParadigms).toHaveLength(3)
    expect(deserialized.syntheticTextProduced.toNumber()).toBe(45000)
    expect(deserialized.syntheticRatio).toBe(0.62)
  })
})

describe('Tier 2 Hard Reset & Game Integration', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('performs a complete Tier 2 Hard Reset preserving meta & meta-prestige', () => {
    const store = useGameStore()

    // Simulate accumulated progress
    store.funds.current = new Decimal(50000)
    store.tokens.current = new Decimal(8000)
    store.rawText.current = new Decimal(12000)
    store.parameters = new Decimal(4_000_000_000) // 4B params
    store.prestige.architecturePoints = 15
    store.prestige.totalArchitecturePoints = 25

    // Trigger Tier 2 prestige
    const res = store.triggerTier2Prestige()
    expect(res).toBe(true)

    // Volatile resources reset to 0
    expect(store.funds.current.toNumber()).toBe(0)
    expect(store.tokens.current.toNumber()).toBe(0)
    expect(store.rawText.current.toNumber()).toBe(0)
    expect(store.parameters.toNumber()).toBe(0)

    // Permanent prestige preserved
    expect(store.prestige.architecturePoints).toBe(15)
    expect(store.prestige.totalArchitecturePoints).toBe(25)
    expect(store.insights).toBe(2)
    expect(store.totalInsights).toBe(2)
    expect(store.unlockedFeatures.prestigeT1).toBe(true)
    expect(store.unlockedFeatures.prestigeT2).toBe(true)
  })

  it('streams synthetic raw text into the ingestion buffer during tick execution', () => {
    const store = useGameStore()
    store.unlockedFeatures.tokenizerUnlocked = true
    store.unlockedFeatures.trainingAllocation = true
    store.unlockedFeatures.scriptsSection = true
    store.unlockedFeatures.hardwareSection = true

    // Give some compute
    store.hardware.gaming_pc.count = 1
    store.hardware.rtx_3060.count = 1
    expect(store.effectiveCompute.gt(0)).toBe(true)

    // 1. Without tokenizer unlocked: raw text accumulates directly in rawText buffer
    store.isSyntheticActive = true
    store.unlockedFeatures.tokenizerUnlocked = false
    const beforeRaw = store.rawText.current
    store.processTick(1.0) // 1 second tick

    expect(store.syntheticTextProduced.gt(0)).toBe(true)
    expect(store.rawText.current.gt(beforeRaw)).toBe(true)

    // 2. With tokenizer unlocked: synthetic text flows into tokens
    store.unlockedFeatures.tokenizerUnlocked = true
    store.allocations.inferencePercent = 0
    store.allocations.trainingPercent = 0
    store.allocations.researchPercent = 0
    store.processTick(1.0)
    expect(store.tokens.current.gt(0)).toBe(true)
  })
})
