export interface SaveMetadata {
  version: string
  timestamp: number
  currentPhase: number
  highestParameters: string
  singularitiesCompleted: number
  totalPlaytimeMs: number
}

export interface SerializedSaveEnvelope {
  version: string
  metadata: SaveMetadata
  state: unknown
}

export interface SaveValidationResult {
  valid: boolean
  error?: string
  metadata?: SaveMetadata
  parsedState?: unknown
}
