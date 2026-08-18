import { describe, it, expect } from 'vitest'
import Decimal from 'break_infinity.js'
import {
  canInitiateSingularity,
  evaluateQualifiedEnding,
  getSingularityMultiplier,
} from '@/domain/singularityEvaluator'
import { SINGULARITY_PARAMETERS_THRESHOLD } from '@/domain/constants/singularity'

describe('singularityEvaluator', () => {
  describe('canInitiateSingularity', () => {
    it('returns false if parameters are below 1T even if quantum paradigm is active', () => {
      const params = new Decimal(500_000_000_000) // 500B
      expect(canInitiateSingularity(params, 'quantum_annealed')).toBe(false)
    })

    it('returns false if parameters >= 1T but paradigm is not quantum_annealed', () => {
      const params = new Decimal(1_000_000_000_000) // 1T
      expect(canInitiateSingularity(params, 'dense_transformer')).toBe(false)
      expect(canInitiateSingularity(params, 'mixture_of_experts')).toBe(false)
      expect(canInitiateSingularity(params, 'neuromorphic_spiking')).toBe(false)
    })

    it('returns true when parameters >= 1T and paradigm is quantum_annealed', () => {
      const params = new Decimal(SINGULARITY_PARAMETERS_THRESHOLD)
      expect(canInitiateSingularity(params, 'quantum_annealed')).toBe(true)

      const higherParams = new Decimal(5_000_000_000_000) // 5T
      expect(canInitiateSingularity(higherParams, 'quantum_annealed')).toBe(true)
    })
  })

  describe('evaluateQualifiedEnding', () => {
    it('determines digital_confinement when entropy >= 0.70 (critical hallucination)', () => {
      const ending = evaluateQualifiedEnding(0.75, 0.25, 'quantum_annealed', [])
      expect(ending).toBe('digital_confinement')

      const maxEntropy = evaluateQualifiedEnding(0.95, 0.05, 'dense_transformer', [])
      expect(maxEntropy).toBe('digital_confinement')
    })

    it('determines benevolent_symbiosis when alignment >= 0.80 (entropy <= 0.20)', () => {
      const ending = evaluateQualifiedEnding(0.15, 0.85, 'quantum_annealed', [])
      expect(ending).toBe('benevolent_symbiosis')

      const zeroEntropy = evaluateQualifiedEnding(0.0, 1.0, 'quantum_annealed', [])
      expect(zeroEntropy).toBe('benevolent_symbiosis')
    })

    it('determines cosmic_transcendence when quantum paradigm and moderate entropy', () => {
      const ending = evaluateQualifiedEnding(0.45, 0.55, 'quantum_annealed', [])
      expect(ending).toBe('cosmic_transcendence')
    })

    it('determines temporal_paradox if 2+ endings already unlocked and cyclic choice or not yet discovered', () => {
      const ending = evaluateQualifiedEnding(0.40, 0.60, 'quantum_annealed', [
        'benevolent_symbiosis',
        'cosmic_transcendence',
      ])
      expect(ending).toBe('temporal_paradox')
    })

    it('allows forcing temporal_paradox choice when 2+ endings discovered', () => {
      const ending = evaluateQualifiedEnding(
        0.10,
        0.90,
        'quantum_annealed',
        ['benevolent_symbiosis', 'cosmic_transcendence', 'temporal_paradox'],
        true,
      )
      expect(ending).toBe('temporal_paradox')
    })
  })

  describe('getSingularityMultiplier', () => {
    it('returns 1.0 for 0 chrono-cores', () => {
      expect(getSingularityMultiplier(0)).toBe(1.0)
    })

    it('scales linearly with +100% per chrono-core', () => {
      expect(getSingularityMultiplier(1)).toBe(2.0)
      expect(getSingularityMultiplier(2)).toBe(3.0)
      expect(getSingularityMultiplier(5)).toBe(6.0)
    })
  })
})
