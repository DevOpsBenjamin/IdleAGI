import { describe, it, expect } from 'vitest'
import Decimal from 'break_infinity.js'
import { CognitiveEngine } from '@/domain/engine/CognitiveEngine'
import type { SoftwareUpgrade } from '@/types/upgrades'

function makeUpgrades(upgrades: Partial<Record<string, boolean>> = {}): Record<string, SoftwareUpgrade> {
  const result: Record<string, SoftwareUpgrade> = {}
  for (const [id, purchased] of Object.entries(upgrades)) {
    result[id] = {
      id,
      name: id,
      description: '',
      cost: new Decimal(100),
      currency: 'funds',
      purchased: Boolean(purchased),
      category: 'security',
    }
  }
  return result
}

describe('CognitiveEngine: Pure Domain Math & RLHF Dynamics', () => {
  describe('Drift Equation & Safety Multipliers', () => {
    it('produces zero drift if training percent is 0', () => {
      const drift = CognitiveEngine.calculateDriftAmount(0, new Decimal(100), 0, 1.0)
      expect(drift.toNumber()).toBe(0)
    })

    it('produces zero drift if compute is 0 or negative', () => {
      const drift = CognitiveEngine.calculateDriftAmount(100, new Decimal(0), 0, 1.0)
      expect(drift.toNumber()).toBe(0)
    })

    it('computes exact base drift at 100% training and 100 TFLOPS (DeltaE = 0.015/s)', () => {
      // DeltaE = 0.015 * (100/100) * (100/100)^0.5 * (1.0 - 0) * 1.0 = 0.015
      const drift = CognitiveEngine.calculateDriftAmount(100, new Decimal(100), 0, 1.0)
      expect(drift.toNumber()).toBeCloseTo(0.015, 6)
    })

    it('scales with square root of compute and training ratio', () => {
      // 50% training, 400 TFLOPS: 0.015 * 0.5 * (400/100)^0.5 = 0.015 * 0.5 * 2 = 0.015
      const drift = CognitiveEngine.calculateDriftAmount(50, new Decimal(400), 0, 1.0)
      expect(drift.toNumber()).toBeCloseTo(0.015, 6)
    })

    it('reduces drift when Constitutional AI (-20%) and DPO (-30%) are purchased', () => {
      const upgrades = makeUpgrades({
        safety_constitutional_ai: true,
        safety_dpo_optimization: true,
      })
      const reduction = CognitiveEngine.calculateSafetyReduction(upgrades)
      expect(reduction).toBeCloseTo(0.50, 4)

      // With 50% reduction, drift is halved
      const drift = CognitiveEngine.calculateDriftAmount(100, new Decimal(100), reduction, 1.0)
      expect(drift.toNumber()).toBeCloseTo(0.015 * 0.50, 6)
    })

    it('caps safety reduction at 90% max', () => {
      const upgrades = makeUpgrades({
        safety_constitutional_ai: true,
        safety_dpo_optimization: true,
      })
      // If extra reduction was added
      const reduction = CognitiveEngine.calculateSafetyReduction(upgrades)
      expect(reduction).toBeLessThanOrEqual(0.90)
    })
  })

  describe('Passive Dissipation & Safety Benchmarks', () => {
    it('returns 0.005/s passive dissipation when Automated RLHF is purchased', () => {
      const withUpgrade = makeUpgrades({ safety_automated_rlhf: true })
      expect(CognitiveEngine.calculatePassiveDissipationRate(withUpgrade)).toBe(0.005)

      const withoutUpgrade = makeUpgrades({})
      expect(CognitiveEngine.calculatePassiveDissipationRate(withoutUpgrade)).toBe(0.0)
    })

    it('identifies when Automated Safety Benchmarks is active', () => {
      const withUpgrade = makeUpgrades({ safety_benchmarks: true })
      expect(CognitiveEngine.hasSafetyBenchmarks(withUpgrade)).toBe(true)

      const withoutUpgrade = makeUpgrades({})
      expect(CognitiveEngine.hasSafetyBenchmarks(withoutUpgrade)).toBe(false)
    })
  })

  describe('Cognitive Regimes / Status Transitions', () => {
    it('qualifies status correctly across entropy tiers', () => {
      expect(CognitiveEngine.calculateStatus(0.0)).toBe('nominal')
      expect(CognitiveEngine.calculateStatus(0.29)).toBe('nominal')
      expect(CognitiveEngine.calculateStatus(0.30)).toBe('divergent')
      expect(CognitiveEngine.calculateStatus(0.69)).toBe('divergent')
      expect(CognitiveEngine.calculateStatus(0.70)).toBe('critical_hallucination')
      expect(CognitiveEngine.calculateStatus(1.0)).toBe('critical_hallucination')
    })
  })

  describe('API Pricing and R&D Multipliers', () => {
    it('keeps API multiplier at 1.0 in nominal regime (E < 30%)', () => {
      expect(CognitiveEngine.calculateApiMultiplier(0.15)).toBe(1.0)
    })

    it('scales API multiplier linearly from 1.0 to 0.85 in divergent regime (30% <= E < 70%)', () => {
      expect(CognitiveEngine.calculateApiMultiplier(0.30)).toBeCloseTo(1.0, 4)
      expect(CognitiveEngine.calculateApiMultiplier(0.50)).toBeCloseTo(0.925, 4)
      expect(CognitiveEngine.calculateApiMultiplier(0.70)).toBeCloseTo(0.85, 4)
    })

    it('applies severe API penalty in critical hallucination regime without benchmarks', () => {
      expect(CognitiveEngine.calculateApiMultiplier(0.70, false)).toBeCloseTo(0.85, 4)
      expect(CognitiveEngine.calculateApiMultiplier(0.85, false)).toBeCloseTo(0.475, 4)
      expect(CognitiveEngine.calculateApiMultiplier(1.0, false)).toBeCloseTo(0.10, 4)
    })

    it('caps hallucination penalty to maximum -20% when Safety Benchmarks is active', () => {
      // With benchmarks, floor is 0.80
      expect(CognitiveEngine.calculateApiMultiplier(0.70, true)).toBeCloseTo(0.85, 4)
      expect(CognitiveEngine.calculateApiMultiplier(0.85, true)).toBeCloseTo(0.80, 4)
      expect(CognitiveEngine.calculateApiMultiplier(1.0, true)).toBeCloseTo(0.80, 4)
    })

    it('calculates R&D creativity bonus up to +25%', () => {
      expect(CognitiveEngine.calculateResearchMultiplier(0.10)).toBe(1.0)
      expect(CognitiveEngine.calculateResearchMultiplier(0.30)).toBeCloseTo(1.0, 4)
      expect(CognitiveEngine.calculateResearchMultiplier(0.50)).toBeCloseTo(1.125, 4)
      expect(CognitiveEngine.calculateResearchMultiplier(0.70)).toBeCloseTo(1.25, 4)
      expect(CognitiveEngine.calculateResearchMultiplier(0.90)).toBe(1.25)
    })
  })

  describe('Human RLHF Batch Action', () => {
    it('computes RLHF cost scaling (50 * 1.10^n)', () => {
      expect(CognitiveEngine.calculateRlhfCost(0).toNumber()).toBe(50)
      expect(CognitiveEngine.calculateRlhfCost(1).toNumber()).toBeCloseTo(55, 2)
      expect(CognitiveEngine.calculateRlhfCost(2).toNumber()).toBeCloseTo(60.5, 2)
      expect(CognitiveEngine.calculateRlhfCost(5).toNumber()).toBeCloseTo(80.5255, 2)
    })

    it('validates whether RLHF can be performed based on funds and entropy', () => {
      // Zero entropy cannot be reduced further
      expect(CognitiveEngine.canPerformRlhf(new Decimal(100), 0.0, 0)).toBe(false)
      // Insufficient funds
      expect(CognitiveEngine.canPerformRlhf(new Decimal(20), 0.5, 0)).toBe(false)
      // Sufficient funds and positive entropy
      expect(CognitiveEngine.canPerformRlhf(new Decimal(50), 0.5, 0)).toBe(true)
    })

    it('applies RLHF reduction (-15% entropy) and increments batch counters', () => {
      const state = {
        entropy: new Decimal(0.40),
        alignment: new Decimal(0.60),
        rlhfBatchCount: 0,
        totalRlhfConducted: new Decimal(0),
      }

      const result = CognitiveEngine.applyRlhf(state, new Decimal(100))
      expect(result.success).toBe(true)
      expect(result.cost.toNumber()).toBe(50)
      expect(result.newState.entropy.toNumber()).toBeCloseTo(0.25, 4)
      expect(result.newState.alignment.toNumber()).toBeCloseTo(0.75, 4)
      expect(result.newState.rlhfBatchCount).toBe(1)
      expect(result.newState.totalRlhfConducted.toNumber()).toBe(1)
    })

    it('floors entropy at 0 when applying RLHF to small entropy', () => {
      const state = {
        entropy: new Decimal(0.08),
        alignment: new Decimal(0.92),
        rlhfBatchCount: 2,
        totalRlhfConducted: new Decimal(2),
      }

      const result = CognitiveEngine.applyRlhf(state, new Decimal(100))
      expect(result.success).toBe(true)
      expect(result.newState.entropy.toNumber()).toBe(0.0)
      expect(result.newState.alignment.toNumber()).toBe(1.0)
    })
  })

  describe('Tick Cycle Simulation (processTick)', () => {
    it('processes tick drift and passive dissipation combined', () => {
      const upgrades = makeUpgrades({
        safety_constitutional_ai: true, // -20% drift
        safety_automated_rlhf: true, // -0.005/s dissipation
      })

      const res = CognitiveEngine.processTick(
        {
          entropy: new Decimal(0.20),
          alignment: new Decimal(0.80),
          trainingPercent: 100,
          effectiveCompute: new Decimal(100), // Base drift = 0.015 * 0.8 = 0.012/s
          upgrades,
          isTrainingUnlocked: true,
        },
        1.0 // 1 second
      )

      // Net change = +0.012 - 0.005 = +0.007
      expect(res.driftAmount.toNumber()).toBeCloseTo(0.012, 5)
      expect(res.passiveDissipationAmount.toNumber()).toBeCloseTo(0.005, 5)
      expect(res.entropy.toNumber()).toBeCloseTo(0.207, 5)
      expect(res.alignment.toNumber()).toBeCloseTo(0.793, 5)
      expect(res.status).toBe('nominal')
    })
  })
})
