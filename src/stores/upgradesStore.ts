import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type { SoftwareUpgrade, CurrencyType } from '@/types'
import { createInitialUpgrades } from '@/domain/constants/upgrades'
import { EconomyEngine } from '@/domain/engine/EconomyEngine'

export const useUpgradesStore = defineStore('upgrades', () => {
  const upgrades = ref<Record<string, SoftwareUpgrade>>(createInitialUpgrades())

  const manualScrapePower = computed<number>(() => {
    return EconomyEngine.calculateManualScrapePower(upgrades.value)
  })

  const rawTextSellPrice = computed<number>(() => {
    return EconomyEngine.calculateRawTextSellPrice(upgrades.value)
  })

  const autoScrapeRate = computed<number>(() => {
    return EconomyEngine.calculateAutoScrapeRate(upgrades.value)
  })

  function buyUpgrade(
    id: string,
    availableFunds: Decimal,
    availableResearch: Decimal
  ): { success: boolean; cost: Decimal; currency: CurrencyType; upgrade?: SoftwareUpgrade } {
    const up = upgrades.value[id]
    if (!up || up.purchased) {
      return { success: false, cost: new Decimal(0), currency: 'funds' }
    }

    const cost = up.cost
    if (up.currency === 'funds' && availableFunds.gte(cost)) {
      up.purchased = true
      return { success: true, cost, currency: 'funds', upgrade: up }
    }

    if (up.currency === 'researchPoints' && availableResearch.gte(cost)) {
      up.purchased = true
      return { success: true, cost, currency: 'researchPoints', upgrade: up }
    }

    return { success: false, cost, currency: up.currency, upgrade: up }
  }

  return {
    upgrades,
    manualScrapePower,
    rawTextSellPrice,
    autoScrapeRate,
    buyUpgrade,
  }
})
