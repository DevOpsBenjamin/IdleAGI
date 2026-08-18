import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import Decimal from 'break_infinity.js'
import { useGameStore } from '@/stores/gameStore'
import { ScenarioRunner } from '@/domain/engine/ScenarioRunner'
import { SaveFormatCodec } from '@/domain/engine/SaveFormatCodec'

describe('Singularity Ascension & New Game+ Scenario Functional Tests', () => {
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

  it('progresses to Singularity Tier 3, activates Quantum Paradigm, triggers Ascension and validates New Game+ state', () => {
    const store = useGameStore()
    const runner = new ScenarioRunner(store)

    // 1. Bootstrap early game resources
    store.funds.current = new Decimal(50_000_000)
    store.parameters = new Decimal(1_500_000_000_000) // 1.5 Trillion params
    store.tokens.current = new Decimal(100_000)
    store.rawText.current = new Decimal(500_000)
    store.unlockedFeatures.prestigeT1 = true
    store.unlockedFeatures.prestigeT2 = true
    store.unlockedFeatures.prestigeT3 = true

    // 2. Unlock and select Quantum-Annealed Paradigm
    store.paradigm.insights = 25
    store.paradigm.totalInsightsEarned = 25
    const unlockRes = store.unlockParadigm('quantum_annealed')
    expect(unlockRes).toBe(true)

    const selectRes = store.selectParadigm('quantum_annealed')
    expect(selectRes).toBe(true)
    expect(store.activeParadigmId).toBe('quantum_annealed')

    // 3. Align cognitive model towards Benevolent Symbiosis (Alignment >= 80%, Entropy <= 20%)
    store.cognitive.entropy = new Decimal(0.12)
    store.cognitive.alignment = new Decimal(0.88)

    // 4. Verify emergence and qualified ending
    expect(store.canTriggerSingularity).toBe(true)
    expect(store.qualifiedEndingId).toBe('benevolent_symbiosis')
    expect(store.qualifiedEndingDef.title).toBe('Symbiose Bienveillante')

    // 5. Trigger Singularity Ascension
    const ascensionRes = store.triggerSingularityAscension('benevolent_symbiosis')
    expect(ascensionRes).toBe(true)

    // 6. Verify New Game+ reset semantics
    const state = runner.getState()

    // Volatiles are reset
    expect(state.currentPhase).toBe(0)
    expect(state.parameters.toNumber()).toBe(0)
    expect(state.funds.toNumber()).toBe(0)
    expect(state.rawText.toNumber()).toBe(0)
    expect(state.tokens.toNumber()).toBe(0)

    // Permanent Chrono-Core & Singularity state are retained
    expect(store.chronoCores).toBe(1)
    expect(store.singularitiesCompleted).toBe(1)
    expect(store.discoveredEndings).toContain('benevolent_symbiosis')
    expect(store.globalAscensionMultiplier).toBe(2.0) // 1.0 + 1 * 1.0 = 2.0 (x2.0 speed)

    // Checkpoints & Paradigmes remain unlocked
    expect(state.unlockedFeatures.prestigeT1).toBe(true)
    expect(state.unlockedFeatures.prestigeT2).toBe(true)
    expect(state.unlockedFeatures.prestigeT3).toBe(true)
  })

  it('performs full Save Format Codec export, modification and import roundtrip with integrity checksum', () => {
    const store = useGameStore()

    // Setup an advanced run with 2 singularities completed
    store.funds.current = new Decimal(1_234_567)
    store.parameters = new Decimal(50_000_000_000)
    store.singularity.singularitiesCompleted = 2
    store.singularity.chronoCores = 2
    store.singularity.discoveredEndings = ['benevolent_symbiosis', 'cosmic_transcendence']

    // Export save string
    const saveString = store.exportSaveString({ currentPhase: 3 })
    expect(saveString).toMatch(/^IDLEAGI_SAVE_V1:[A-Za-z0-9+/=]+:[0-9a-f]{8}$/)

    // Validate decode
    const decodeResult = SaveFormatCodec.decode(saveString)
    expect(decodeResult.valid).toBe(true)
    expect(decodeResult.metadata?.singularitiesCompleted).toBe(2)

    // Reset store to fresh state
    store.hardReset()
    store.funds.current = new Decimal(0)
    store.parameters = new Decimal(0)
    store.singularity.resetState()
    expect(store.chronoCores).toBe(0)

    // Import save string
    const importResult = store.importSaveString(saveString)
    expect(importResult.success).toBe(true)

    // Verify restored values
    expect(store.chronoCores).toBe(2)
    expect(store.singularitiesCompleted).toBe(2)
    expect(store.discoveredEndings).toEqual(['benevolent_symbiosis', 'cosmic_transcendence'])
    expect(store.globalAscensionMultiplier).toBe(3.0)
    expect(store.parameters.gte(50_000_000_000)).toBe(true)
  })

  it('handles corrupted save imports gracefully with descriptive errors', () => {
    const store = useGameStore()

    const invalidPrefix = store.importSaveString('BAD_FORMAT:abc:12345678')
    expect(invalidPrefix.success).toBe(false)
    expect(invalidPrefix.error).toContain('Format de sauvegarde invalide')

    const badChecksum = store.importSaveString('IDLEAGI_SAVE_V1:e30=:deadbeef')
    expect(badChecksum.success).toBe(false)
    expect(badChecksum.error).toContain('Checksum invalide')
  })
})
