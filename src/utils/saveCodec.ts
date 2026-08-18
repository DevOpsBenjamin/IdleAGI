import type { SaveMetadata, SaveValidationResult } from '@/types/save'
import type { GameState } from '@/types/game'
import { SaveFormatCodec } from '@/domain/engine/SaveFormatCodec'

export const SAVE_STRING_PREFIX = SaveFormatCodec.PREFIX

export function fnv1a32(str: string): string {
  return SaveFormatCodec.computeChecksum(str)
}

export function toBase64Utf8(str: string): string {
  return SaveFormatCodec.toBase64(str)
}

export function fromBase64Utf8(base64: string): string {
  return SaveFormatCodec.fromBase64(base64)
}

export function encodeSaveEnvelope(
  state: GameState,
  customMetadata?: Partial<SaveMetadata>,
): string {
  return SaveFormatCodec.encode(state, customMetadata)
}

export function decodeSaveEnvelope(saveString: string): SaveValidationResult {
  return SaveFormatCodec.decode(saveString)
}

