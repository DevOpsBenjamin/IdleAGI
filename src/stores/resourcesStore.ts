import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import Decimal from 'break_infinity.js'
import type { Resource } from '@/types'
import { RAW_TEXT_SNIPPETS } from '@/domain/constants/snippets'
import { usePrestigeStore } from './prestigeStore'

export const useResourcesStore = defineStore('resources', () => {
  const prestigeStore = usePrestigeStore()

  const baseMaxRawText = ref<Decimal>(new Decimal(200))
  const baseMaxTokens = ref<Decimal>(new Decimal(100))

  const rawText = ref<Resource>({
    current: new Decimal(0),
    max: new Decimal(200),
    ratePerSec: new Decimal(0),
  })

  const tokens = ref<Resource>({
    current: new Decimal(0),
    max: new Decimal(100),
    ratePerSec: new Decimal(0),
  })

  function recalculateBufferCapacities(multiplier = prestigeStore.talentMultipliers.bufferCapacityMultiplier) {
    rawText.value.max = baseMaxRawText.value.mul(multiplier)
    tokens.value.max = baseMaxTokens.value.mul(multiplier)
  }

  function setMaxRawText(val: Decimal | number) {
    const d = typeof val === 'number' ? new Decimal(val) : val
    baseMaxRawText.value = Decimal.max(baseMaxRawText.value, d)
    recalculateBufferCapacities()
  }

  function setMaxTokens(val: Decimal | number) {
    const d = typeof val === 'number' ? new Decimal(val) : val
    baseMaxTokens.value = Decimal.max(baseMaxTokens.value, d)
    recalculateBufferCapacities()
  }

  function resetBufferCapacities() {
    baseMaxRawText.value = new Decimal(200)
    baseMaxTokens.value = new Decimal(100)
    recalculateBufferCapacities()
  }

  watch(
    () => prestigeStore.talentMultipliers.bufferCapacityMultiplier,
    (newMult) => {
      recalculateBufferCapacities(newMult)
    },
    { immediate: true }
  )

  const funds = ref<Resource>({
    current: new Decimal(0),
    max: new Decimal(Infinity),
    ratePerSec: new Decimal(0),
  })

  const parameters = ref<Decimal>(new Decimal(0))

  const researchPoints = ref<Resource>({
    current: new Decimal(0),
    max: new Decimal(10000),
    ratePerSec: new Decimal(0),
  })

  const totalCharsRead = ref<Decimal>(new Decimal(0))
  const totalTokensServed = ref<Decimal>(new Decimal(0))
  const currentSnippetIndex = ref<number>(0)

  const currentSnippet = computed<string>(() => {
    return RAW_TEXT_SNIPPETS[currentSnippetIndex.value % RAW_TEXT_SNIPPETS.length]
  })

  function manualScrape(power: number): Decimal {
    const before = rawText.value.current
    rawText.value.current = Decimal.min(
      rawText.value.max,
      rawText.value.current.add(power)
    )
    const added = rawText.value.current.sub(before)
    totalCharsRead.value = totalCharsRead.value.add(power)
    currentSnippetIndex.value = (currentSnippetIndex.value + 1) % RAW_TEXT_SNIPPETS.length
    return added
  }

  function sellRawText(charsToSell = 20, pricePer20 = 0.05): { success: boolean; earned: Decimal } {
    if (rawText.value.current.gte(charsToSell)) {
      rawText.value.current = rawText.value.current.sub(charsToSell)
      const batches = charsToSell / 20
      const earned = new Decimal(batches * pricePer20)
      funds.value.current = funds.value.current.add(earned)
      return { success: true, earned }
    }
    return { success: false, earned: new Decimal(0) }
  }

  function sellAllRawText(pricePer20 = 0.05): { success: boolean; earned: Decimal; charsSold: number } {
    const available = rawText.value.current.floor().toNumber()
    const batches = Math.floor(available / 20)
    if (batches > 0) {
      const charsToSell = batches * 20
      rawText.value.current = rawText.value.current.sub(charsToSell)
      const earned = new Decimal(batches * pricePer20)
      funds.value.current = funds.value.current.add(earned)
      return { success: true, earned, charsSold: charsToSell }
    }
    return { success: false, earned: new Decimal(0), charsSold: 0 }
  }

  return {
    rawText,
    tokens,
    funds,
    parameters,
    researchPoints,
    totalCharsRead,
    totalTokensServed,
    currentSnippetIndex,
    currentSnippet,
    baseMaxRawText,
    baseMaxTokens,
    setMaxRawText,
    setMaxTokens,
    recalculateBufferCapacities,
    resetBufferCapacities,
    manualScrape,
    sellRawText,
    sellAllRawText,
  }
})
