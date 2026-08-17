import type Decimal from 'break_infinity.js'
import type { CurrencyType } from './resources'

export type UpgradeCategory = 'human' | 'scraping' | 'tokenizer' | 'monetization' | 'hardware'

export interface SoftwareUpgrade {
  readonly id: string
  readonly name: string
  readonly description: string
  cost: Decimal
  readonly currency: CurrencyType
  purchased: boolean
  readonly category: UpgradeCategory
}

export interface SerializedSoftwareUpgrade {
  id: string
  name: string
  description: string
  cost: string
  currency: CurrencyType
  purchased: boolean
  category: UpgradeCategory
}
