export type SingularityEndingId =
  | 'benevolent_symbiosis'
  | 'cosmic_transcendence'
  | 'digital_confinement'
  | 'temporal_paradox'

export interface SingularityEndingDefinition {
  readonly id: SingularityEndingId
  readonly title: string
  readonly subtitle: string
  readonly description: string
  readonly loreLog: string
  readonly triggerCondition: string
  readonly icon: string
  readonly color: string
  readonly themeClass: string
}

export interface SingularityState {
  singularitiesCompleted: number
  discoveredEndings: SingularityEndingId[]
  chronoCores: number
  lastAscensionTimestamp: number | null
  currentEndingSelected: SingularityEndingId | null
}

export interface SerializedSingularityState {
  singularitiesCompleted: number
  discoveredEndings: SingularityEndingId[]
  chronoCores: number
  lastAscensionTimestamp: number | null
  currentEndingSelected: SingularityEndingId | null
}
