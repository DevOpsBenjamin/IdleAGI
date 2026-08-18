import { computed } from 'vue'
import type { useGameStore } from '@/stores/gameStore'

export function useAppLayout(store: ReturnType<typeof useGameStore>) {
  const hardwareArray = computed(() => Object.values(store.hardware))
  const upgradesArray = computed(() => Object.values(store.upgrades))
  const ramUpgradesArray = computed(() =>
    Object.values(store.upgrades).filter((u) => u.category === 'hardware'),
  )
  const coolingUpgradesArray = computed(() =>
    Object.values(store.upgrades).filter((u) => u.category === 'cooling'),
  )
  const powerUpgradesArray = computed(() =>
    Object.values(store.upgrades).filter((u) => u.category === 'power'),
  )
  const purchasedUpgradeIds = computed(() =>
    Object.values(store.upgrades)
      .filter((u) => u.purchased)
      .map((u) => u.id),
  )

  const hasHardware = computed(
    () => store.hasPotatoPc || store.hasWorkstation || store.totalRawCompute.gt(0),
  )
  const hasCpu = computed(() => store.hasWorkstation)

  const affordableUpgradesCount = computed(() => {
    let count = 0
    for (const up of upgradesArray.value) {
      if (!up.purchased) {
        if (up.currency === 'funds' && store.funds.current.gte(up.cost)) {
          if (
            up.category === 'human' ||
            (up.requiredFeature === 'dataBroker' && store.unlockedFeatures.dataBroker) ||
            (up.requiredFeature === 'scriptsSection' && store.unlockedFeatures.scriptsSection) ||
            (up.requiredFeature === 'tokenizerUnlocked' && store.unlockedFeatures.tokenizerUnlocked) ||
            (up.requiredFeature === 'trainingAllocation' && store.currentPhase >= 3) ||
            !up.requiredFeature
          ) {
            count++
          }
        }
      }
    }
    return count
  })

  const hasThermalOrPowerWarning = computed(() => {
    return store.thermalState.isThrottling || store.powerState.isOverloaded
  })

  const unreadErrorsCount = computed(() => {
    return store.terminalLogs.filter((l) => l.type === 'error' || l.type === 'warn').length
  })

  return {
    hardwareArray,
    upgradesArray,
    ramUpgradesArray,
    coolingUpgradesArray,
    powerUpgradesArray,
    purchasedUpgradeIds,
    hasHardware,
    hasCpu,
    affordableUpgradesCount,
    hasThermalOrPowerWarning,
    unreadErrorsCount,
  }
}
