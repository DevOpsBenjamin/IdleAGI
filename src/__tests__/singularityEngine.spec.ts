import { describe, it, expect } from 'vitest'
import Decimal from 'break_infinity.js'
import { SingularityEngine } from '@/domain/engine/SingularityEngine'
import {
  SINGULARITY_PARAMETERS_THRESHOLD,
  SINGULARITY_ENDINGS,
} from '@/domain/constants/singularity'

describe('SingularityEngine', () => {
  describe('canInitiateSingularity', () => {
    it('returns false if parameters are below 1 Trillion (1T)', () => {
      const params = new Decimal(999_999_999_999)
      expect(SingularityEngine.canInitiateSingularity(params, 'quantum_annealed')).toBe(false)
    })

    it('returns false if parameters >= 1T but active paradigm is not quantum_annealed', () => {
      const params = new Decimal(SINGULARITY_PARAMETERS_THRESHOLD)
      expect(SingularityEngine.canInitiateSingularity(params, 'dense_transformer')).toBe(false)
      expect(SingularityEngine.canInitiateSingularity(params, 'mixture_of_experts')).toBe(false)
      expect(SingularityEngine.canInitiateSingularity(params, 'neuromorphic_spiking')).toBe(false)
    })

    it('returns true when parameters >= 1T AND quantum_annealed paradigm is active', () => {
      const paramsExact = new Decimal(SINGULARITY_PARAMETERS_THRESHOLD)
      expect(SingularityEngine.canInitiateSingularity(paramsExact, 'quantum_annealed')).toBe(true)

      const paramsHuge = new Decimal('1e15')
      expect(SingularityEngine.canInitiateSingularity(paramsHuge, 'quantum_annealed')).toBe(true)
    })
  })

  describe('evaluateQualifiedEnding', () => {
    it('qualifies for digital_confinement (Paperclip glitch) if entropy >= 0.70', () => {
      const ending = SingularityEngine.evaluateQualifiedEnding(
        0.85,
        0.15,
        'quantum_annealed',
        []
      )
      expect(ending).toBe('digital_confinement')
    })

    it('qualifies for benevolent_symbiosis if alignment >= 0.80 or entropy <= 0.20', () => {
      const endingHighAlign = SingularityEngine.evaluateQualifiedEnding(
        0.15,
        0.85,
        'quantum_annealed',
        []
      )
      expect(endingHighAlign).toBe('benevolent_symbiosis')

      const endingLowEntropy = SingularityEngine.evaluateQualifiedEnding(
        0.10,
        0.90,
        'quantum_annealed',
        []
      )
      expect(endingLowEntropy).toBe('benevolent_symbiosis')
    })

    it('qualifies for temporal_paradox if at least 2 endings already discovered and temporal_paradox is pending', () => {
      const ending = SingularityEngine.evaluateQualifiedEnding(
        0.50,
        0.50,
        'quantum_annealed',
        ['benevolent_symbiosis', 'cosmic_transcendence']
      )
      expect(ending).toBe('temporal_paradox')
    })

    it('qualifies for temporal_paradox if forceCyclicChoice is true with >= 2 endings discovered', () => {
      const ending = SingularityEngine.evaluateQualifiedEnding(
        0.05,
        0.95,
        'quantum_annealed',
        ['benevolent_symbiosis', 'digital_confinement'],
        true
      )
      expect(ending).toBe('temporal_paradox')
    })

    it('qualifies for cosmic_transcendence in quantum paradigm with balanced cognitive state', () => {
      const ending = SingularityEngine.evaluateQualifiedEnding(
        0.45,
        0.55,
        'quantum_annealed',
        ['benevolent_symbiosis']
      )
      expect(ending).toBe('cosmic_transcendence')
    })
  })

  describe('calculateGlobalMultiplier', () => {
    it('returns 1.0 (baseline) for 0 or negative chrono cores', () => {
      expect(SingularityEngine.calculateGlobalMultiplier(0)).toBe(1.0)
      expect(SingularityEngine.calculateGlobalMultiplier(-1)).toBe(1.0)
    })

    it('returns +100% per Chrono-Core (Omega)', () => {
      expect(SingularityEngine.calculateGlobalMultiplier(1)).toBe(2.0)
      expect(SingularityEngine.calculateGlobalMultiplier(2)).toBe(3.0)
      expect(SingularityEngine.calculateGlobalMultiplier(5)).toBe(6.0)
      expect(SingularityEngine.calculateGlobalMultiplier(10)).toBe(11.0)
    })
  })

  describe('metadata and collection helpers', () => {
    it('retrieves ending definitions correctly', () => {
      const def = SingularityEngine.getEndingDefinition('benevolent_symbiosis')
      expect(def.id).toBe('benevolent_symbiosis')
      expect(def.title).toBe('Symbiose Bienveillante')
      expect(def.color).toBe('#00FF66')
    })

    it('returns all canonical endings', () => {
      const all = SingularityEngine.getAllEndings()
      expect(all).toHaveLength(4)
      expect(all.map((e) => e.id)).toEqual([
        'benevolent_symbiosis',
        'cosmic_transcendence',
        'digital_confinement',
        'temporal_paradox',
      ])
    })

    it('checks discovered endings status and counts', () => {
      const discovered = ['benevolent_symbiosis', 'cosmic_transcendence'] as const
      expect(SingularityEngine.isEndingDiscovered('benevolent_symbiosis', [...discovered])).toBe(true)
      expect(SingularityEngine.isEndingDiscovered('digital_confinement', [...discovered])).toBe(false)
      expect(SingularityEngine.getDiscoveredCount([...discovered])).toBe(2)
      expect(SingularityEngine.hasDiscoveredAllEndings([...discovered])).toBe(false)

      const allDiscovered = Object.keys(SINGULARITY_ENDINGS) as import('@/types/singularity').SingularityEndingId[]
      expect(SingularityEngine.getDiscoveredCount(allDiscovered)).toBe(4)
      expect(SingularityEngine.hasDiscoveredAllEndings(allDiscovered)).toBe(true)
    })
  })
})
