import { defineStore } from 'pinia'
import { ref } from 'vue'
import Decimal from 'break_infinity.js'
import type { GameState } from '@/types/game'

export const useGameStore = defineStore('game', () => {
  const version = ref('0.1.0')
  const lastTickTimestamp = ref(Date.now())

  // Core Currencies
  const rawText = ref({
    current: new Decimal(0),
    max: new Decimal(1000),
    ratePerSec: new Decimal(0),
  })

  const tokens = ref({
    current: new Decimal(0),
    max: new Decimal(500),
    ratePerSec: new Decimal(0),
  })

  const funds = ref({
    current: new Decimal(50), // Start capital
    max: new Decimal(Infinity),
    ratePerSec: new Decimal(0),
  })

  const parameters = ref(new Decimal(0))

  // Hardware
  const hardware = ref<GameState['hardware']>({
    used_cpu: {
      id: 'used_cpu',
      name: 'CPU d\'occasion (4 Cores)',
      count: 1,
      baseCost: new Decimal(25),
      costMult: 1.15,
      tflops: new Decimal(0.05), // 50 GFLOPS
      vram: new Decimal(4),      // 4 GB
      powerWatts: new Decimal(65),
    },
    gtx_gpu: {
      id: 'gtx_gpu',
      name: 'GPU Grand Public (GTX 1080)',
      count: 0,
      baseCost: new Decimal(150),
      costMult: 1.18,
      tflops: new Decimal(0.5),  // 500 GFLOPS
      vram: new Decimal(8),      // 8 GB
      powerWatts: new Decimal(180),
    },
  })

  // Allocations (%)
  const allocations = ref<GameState['allocations']>({
    inferencePercent: 50,
    trainingPercent: 30,
    researchPercent: 20,
  })

  // Physical grid
  const gridCapacityWatts = ref(new Decimal(500))
  const coolingCapacityWatts = ref(new Decimal(300))

  // Unlocks
  const unlockedFeatures = ref<GameState['unlockedFeatures']>({
    dashboardView: true,
    autoScraping: false,
    syntheticData: false,
    quantumLayer: false,
    prestigeT1: false,
    prestigeT2: false,
    prestigeT3: false,
  })

  // Basic manual actions
  function manualScrape() {
    rawText.value.current = Decimal.min(
      rawText.value.max,
      rawText.value.current.add(10)
    )
  }

  function manualTokenize() {
    const charsNeeded = 4
    if (rawText.value.current.gte(charsNeeded)) {
      rawText.value.current = rawText.value.current.sub(charsNeeded)
      tokens.value.current = Decimal.min(
        tokens.value.max,
        tokens.value.current.add(1)
      )
    }
  }

  function buyHardware(id: string) {
    const item = hardware.value[id]
    if (!item) return

    const cost = item.baseCost.mul(Math.pow(item.costMult, item.count))
    if (funds.value.current.gte(cost)) {
      funds.value.current = funds.value.current.sub(cost)
      item.count += 1
    }
  }

  return {
    version,
    lastTickTimestamp,
    rawText,
    tokens,
    funds,
    parameters,
    hardware,
    allocations,
    gridCapacityWatts,
    coolingCapacityWatts,
    unlockedFeatures,
    manualScrape,
    manualTokenize,
    buyHardware,
  }
})
