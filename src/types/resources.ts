import type Decimal from 'break_infinity.js'

export type CurrencyType = 'funds' | 'researchPoints'
export type ResourceKey = 'rawText' | 'tokens' | 'funds' | 'researchPoints'

export interface Resource {
  current: Decimal
  max: Decimal
  ratePerSec: Decimal
}

export interface SerializedResource {
  current: string
  max: string
  ratePerSec: string
}
