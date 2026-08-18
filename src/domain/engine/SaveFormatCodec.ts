import type { SaveMetadata, SerializedSaveEnvelope, SaveValidationResult } from '@/types/save'
import type { GameState } from '@/types/game'
import { serializeGameState } from '@/utils/serialization'

export class SaveFormatCodec {
  public static readonly PREFIX = 'IDLEAGI_SAVE_V1:'

  /**
   * Computes a deterministic 32-bit FNV-1a hash formatted as an 8-character lowercase hexadecimal string.
   */
  public static computeChecksum(str: string): string {
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
  public static toBase64(str: string): string {
    if (typeof globalThis !== 'undefined' && 'Buffer' in globalThis) {
      const BufferClass = (
        globalThis as unknown as {
          Buffer: { from(s: string, enc: string): { toString(enc: string): string } }
        }
      ).Buffer
      return BufferClass.from(str, 'utf-8').toString('base64')
    }
    return btoa(
      encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
        String.fromCharCode(parseInt(p1, 16))
      )
    )
  }

  /**
   * UTF-8 safe Base64 decoder supporting Node.js (Vitest) and browser environments.
   */
  public static fromBase64(base64: string): string {
    if (typeof globalThis !== 'undefined' && 'Buffer' in globalThis) {
      const BufferClass = (
        globalThis as unknown as {
          Buffer: { from(s: string, enc: string): { toString(enc: string): string } }
        }
      ).Buffer
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
  public static encode(
    state: GameState,
    customMetadata?: Partial<SaveMetadata>
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
    const base64Payload = this.toBase64(envelopeJson)
    const checksum = this.computeChecksum(envelopeJson)

    return `${this.PREFIX}${base64Payload}:${checksum}`
  }

  /**
   * Validates and decodes a save string. Detects format corruption, checksum mismatches, and JSON errors.
   */
  public static decode(saveString: string): SaveValidationResult {
    const trimmed = saveString.trim()

    if (!trimmed.startsWith(this.PREFIX)) {
      return {
        valid: false,
        error: `Format de sauvegarde invalide. La chaîne doit débuter par "${this.PREFIX}".`,
      }
    }

    const rest = trimmed.substring(this.PREFIX.length)
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
      envelopeJson = this.fromBase64(base64Payload)
    } catch {
      return {
        valid: false,
        error: 'Décodage Base64 échoué : la charge utile contient des caractères corrompus.',
      }
    }

    const actualChecksum = this.computeChecksum(envelopeJson)
    if (actualChecksum !== expectedChecksum) {
      return {
        valid: false,
        error: `Checksum invalide (attendu: ${expectedChecksum}, calculé: ${actualChecksum}). La sauvegarde a été altérée ou tronquée.`,
      }
    }

    try {
      const envelope = JSON.parse(envelopeJson) as SerializedSaveEnvelope
      if (
        !envelope ||
        typeof envelope !== 'object' ||
        !envelope.metadata ||
        !envelope.state
      ) {
        return {
          valid: false,
          error: "Structure d'enveloppe de sauvegarde JSON incomplète.",
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
        error: "Erreur lors de l'analyse JSON interne de la sauvegarde.",
      }
    }
  }
}
