import { describe, it, expect } from 'vitest'
import Decimal from 'break_infinity.js'
import {
  fnv1a32,
  toBase64Utf8,
  fromBase64Utf8,
  encodeSaveEnvelope,
  decodeSaveEnvelope,
  SAVE_STRING_PREFIX,
} from '@/utils/saveCodec'
import type { GameState } from '@/types/game'
import { createInitialHardware } from '@/domain/constants/hardware'
import { createInitialUpgrades } from '@/domain/constants/upgrades'

function createDummyGameState(): GameState {
  return {
    version: '0.1.0',
    lastTickTimestamp: 1700000000000,
    gameStartTime: 1699990000000,
    currentPhase: 3,
    totalCharsRead: new Decimal(50000),
    rawText: {
      current: new Decimal(100),
      max: new Decimal(500),
      ratePerSec: new Decimal(10),
    },
    tokens: {
      current: new Decimal(50),
      max: new Decimal(200),
      ratePerSec: new Decimal(5),
    },
    funds: {
      current: new Decimal(1250.75),
      max: new Decimal(Infinity),
      ratePerSec: new Decimal(25),
    },
    parameters: new Decimal(1_000_000_000_000),
    researchPoints: {
      current: new Decimal(500),
      max: new Decimal(10000),
      ratePerSec: new Decimal(2),
    },
    hardware: createInitialHardware(),
    upgrades: createInitialUpgrades(),
    allocations: {
      inferencePercent: 40,
      trainingPercent: 40,
      researchPercent: 20,
    },
    gridCapacityWatts: new Decimal(1250),
    coolingCapacityWatts: new Decimal(1000),
    terminalLogs: [],
    unlockedFeatures: {
      dashboardView: true,
      humanReading: true,
      dataBroker: true,
      hardwareSection: true,
      scriptsSection: true,
      autoBroker: true,
      autoScraping: true,
      tokenizerUnlocked: true,
      oscilloscope: true,
      trainingAllocation: true,
      researchAllocation: true,
      syntheticData: true,
      quantumLayer: true,
      prestigeT1: true,
      prestigeT2: true,
      prestigeT3: true,
    },
    lastOfflineReport: null,
    singularity: {
      singularitiesCompleted: 2,
      discoveredEndings: ['benevolent_symbiosis', 'cosmic_transcendence'],
      chronoCores: 2,
      lastAscensionTimestamp: 1700000000000,
      currentEndingSelected: 'cosmic_transcendence',
    },
  }
}

describe('saveCodec', () => {
  describe('fnv1a32', () => {
    it('computes deterministic 8-char hex hash', () => {
      const hash1 = fnv1a32('Hello World')
      const hash2 = fnv1a32('Hello World')
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(8)
      expect(hash1).toMatch(/^[0-9a-f]{8}$/)
    })

    it('produces distinct hashes for different inputs', () => {
      const hashA = fnv1a32('Payload A')
      const hashB = fnv1a32('Payload B')
      expect(hashA).not.toBe(hashB)
    })
  })

  describe('UTF-8 Base64 conversion', () => {
    it('roundtrips strings with special characters and emojis', () => {
      const original = 'Projet Singularité // ✦ $\\Phi$ & $\\Omega$ // Accélération : 100%'
      const encoded = toBase64Utf8(original)
      const decoded = fromBase64Utf8(encoded)
      expect(decoded).toBe(original)
    })
  })

  describe('encodeSaveEnvelope and decodeSaveEnvelope', () => {
    it('encodes a GameState into standard IDLEAGI_SAVE_V1 string and successfully decodes it', () => {
      const state = createDummyGameState()
      const saveString = encodeSaveEnvelope(state)

      expect(saveString.startsWith(SAVE_STRING_PREFIX)).toBe(true)
      expect(saveString).toContain(':')

      const result = decodeSaveEnvelope(saveString)
      expect(result.valid).toBe(true)
      expect(result.metadata).toBeDefined()
      expect(result.metadata?.currentPhase).toBe(3)
      expect(result.metadata?.singularitiesCompleted).toBe(2)
      expect(result.parsedState).toBeDefined()
    })

    it('rejects save string without proper prefix', () => {
      const result = decodeSaveEnvelope('INVALID_PREFIX:abc:12345678')
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Format de sauvegarde invalide')
    })

    it('rejects save string with missing checksum separator', () => {
      const result = decodeSaveEnvelope(`${SAVE_STRING_PREFIX}PayloadWithoutChecksum`)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Format corrompu')
    })

    it('rejects save string when checksum is tampered or corrupted', () => {
      const state = createDummyGameState()
      const validSaveString = encodeSaveEnvelope(state)
      // Corrupt the last character of the checksum
      const tamperedChecksum = validSaveString.slice(0, -1) + (validSaveString.endsWith('a') ? 'b' : 'a')

      const result = decodeSaveEnvelope(tamperedChecksum)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Checksum invalide')
    })

    it('rejects save string when payload has invalid Base64', () => {
      const corruptedBase64 = `${SAVE_STRING_PREFIX}!!!NotBase64!!!:12345678`
      const result = decodeSaveEnvelope(corruptedBase64)
      expect(result.valid).toBe(false)
    })
  })
})
