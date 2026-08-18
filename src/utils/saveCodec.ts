import type { SaveMetadata, SerializedSaveEnvelope, SaveValidationResult } from '@/types/save'
import type { GameState } from '@/types/game'
import { serializeGameState } from './serialization'

export const SAVE_STRING_PREFIX = 'IDLEAGI_SAVE_V1:'

/**
 * Computes a deterministic 32-bit FNV-1a hash formatted as an 8-character lowercase hexadecimal string.
 */
export function fnv1a32(str: string): string {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0').toLowerCase()
}

/**
 * UTF-8 safe Base64 encoder supporting Node.js (Vitest) and browser environments.
 */
export function toBase64Utf8(str: string): string {
  if (typeof globalThis !== 'undefined' && 'Buffer' in globalThis) {
    const BufferClass = (globalThis as unknown as { Buffer: { from(s: string, enc: string): { toString(enc: string): string } } }).Buffer
    return BufferClass.from(str, 'utf-8').toString('base64')
  }
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  )
}

/**
 * UTF-8 safe Base64 decoder supporting Node.js (Vitest) and browser environments.
 */
export function fromBase64Utf8(base64: string): string {
  if (typeof globalThis !== 'undefined' && 'Buffer' in globalThis) {
    const BufferClass = (globalThis as unknown as { Buffer: { from(s: string, enc: string): { toString(enc: string): string } } }).Buffer
    return BufferClass.from(base64, 'base64').toString('utf-8')
  }
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}


/**
 * Generates an exportable save envelope string with metadata and FNV-1a checksum.
 */
export function encodeSaveEnvelope(
  state: GameState,
  customMetadata?: Partial<SaveMetadata>,
): string {
  const jsonState = serializeGameState(state)
  const rawParsedState = JSON.parse(jsonState)

  const metadata: SaveMetadata = {
    version: state.version ?? '0.1.0',
    timestamp: Date.now(),
    currentPhase: state.currentPhase ?? 0,
    highestParameters: state.parameters?.toString() ?? '0',
    singularitiesCompleted: state.singularity?.singularitiesCompleted ?? 0,
    totalPlaytimeMs: Date.now() - (state.gameStartTime || Date.now()),
    ...customMetadata,
  }

  const envelope: SerializedSaveEnvelope = {
    version: '1.0',
    metadata,
    state: rawParsedState,
  }

  const envelopeJson = JSON.stringify(envelope)
  const base64Payload = toBase64Utf8(envelopeJson)
  const checksum = fnv1a32(envelopeJson)

  return `${SAVE_STRING_PREFIX}${base64Payload}:${checksum}`
}

/**
 * Validates and decodes a save string. Detects format corruption, checksum mismatches, and JSON errors.
 */
export function decodeSaveEnvelope(saveString: string): SaveValidationResult {
  const trimmed = saveString.trim()

  if (!trimmed.startsWith(SAVE_STRING_PREFIX)) {
    return {
      valid: false,
      error: `Format de sauvegarde invalide. La chaîne doit débuter par "${SAVE_STRING_PREFIX}".`,
    }
  }

  const rest = trimmed.substring(SAVE_STRING_PREFIX.length)
  const colonIndex = rest.lastIndexOf(':')
  if (colonIndex === -1) {
    return {
      valid: false,
      error: 'Format corrompu : séparateur de checksum manquant.',
    }
  }

  const base64Payload = rest.substring(0, colonIndex)
  const expectedChecksum = rest.substring(colonIndex + 1).trim().toLowerCase()

  if (!base64Payload || !expectedChecksum) {
    return {
      valid: false,
      error: 'Données de sauvegarde ou checksum vides.',
    }
  }

  let envelopeJson: string
  try {
    envelopeJson = fromBase64Utf8(base64Payload)
  } catch {
    return {
      valid: false,
      error: 'Décodage Base64 échoué : la charge utile contient des caractères corrompus.',
    }
  }

  const actualChecksum = fnv1a32(envelopeJson)
  if (actualChecksum !== expectedChecksum) {
    return {
      valid: false,
      error: `Checksum invalide (attendu: ${expectedChecksum}, calculé: ${actualChecksum}). La sauvegarde a été altérée ou tronquée.`,
    }
  }

  try {
    const envelope = JSON.parse(envelopeJson) as SerializedSaveEnvelope
    if (!envelope || typeof envelope !== 'object' || !envelope.metadata || !envelope.state) {
      return {
        valid: false,
        error: 'Structure d\'enveloppe de sauvegarde JSON incomplète.',
      }
    }

    return {
      valid: true,
      metadata: envelope.metadata,
      parsedState: envelope.state,
    }
  } catch {
    return {
      valid: false,
      error: 'Erreur lors de l\'analyse JSON interne de la sauvegarde.',
    }
  }
}
