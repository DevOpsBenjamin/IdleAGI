import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type { ParadigmId, ParadigmState, ParadigmDefinition } from '@/types/paradigm'
import { PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT } from '@/domain/constants/paradigms'
import { ParadigmEngine, type ParadigmMultipliers } from '@/domain/engine/ParadigmEngine'

export const useParadigmStore = defineStore('paradigm', () => {
  const insights = ref<number>(0)
  const totalInsightsEarned = ref<number>(0)
  const activeParadigm = ref<ParadigmId>('dense_transformer')
  const unlockedParadigms = ref<ParadigmId[]>(['dense_transformer'])
  const tier2PrestigeCount = ref<number>(0)
  const isSyntheticActive = ref<boolean>(false)
  const syntheticTextProduced = ref<Decimal>(new Decimal(0))
  const syntheticRatio = ref<number>(0)
  const modelCollapseActive = ref<boolean>(false)

  const passiveTflopsBonusPercent = computed<number>(() => {
    return Math.round(totalInsightsEarned.value * PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT * 100)
  })

  const passiveTflopsMultiplier = computed<number>(() => {
    return ParadigmEngine.calculatePassiveTflopsMultiplier(totalInsightsEarned.value)
  })

  const activeParadigmDef = computed<ParadigmDefinition>(() => {
    return ParadigmEngine.getParadigmDefinition(activeParadigm.value)
  })

  const multipliers = computed<ParadigmMultipliers>(() => {
    return ParadigmEngine.calculateMultipliers(activeParadigm.value, totalInsightsEarned.value)
  })

  const activeTflopsMultiplier = computed<number>(() => multipliers.value.tflopsMultiplier)
  const powerReduction = computed<number>(() => multipliers.value.powerReduction)
  const vramEfficiency = computed<number>(() => multipliers.value.vramEfficiency)
  const syntheticSpeedBonus = computed<number>(() => multipliers.value.syntheticSpeedBonus)
  const hasNoThrottling = computed<boolean>(() => multipliers.value.hasNoThrottling)

  function canTriggerTier2(parameters: Decimal): boolean {
    return ParadigmEngine.canTriggerTier2(parameters)
  }

  function calculatePendingInsights(parameters: Decimal): number {
    return ParadigmEngine.calculatePendingInsights(parameters)
  }

  function canUnlockParadigm(id: ParadigmId): boolean {
    return ParadigmEngine.canUnlockParadigm(id, insights.value, unlockedParadigms.value)
  }

  function canSelectParadigm(id: ParadigmId): boolean {
    return ParadigmEngine.canSelectParadigm(id, unlockedParadigms.value)
  }

  function claimTier2Prestige(parameters: Decimal): { success: boolean; gainedInsights: number } {
    if (!canTriggerTier2(parameters)) {
      return { success: false, gainedInsights: 0 }
    }

    const gained = calculatePendingInsights(parameters)
    if (gained <= 0) {
      return { success: false, gainedInsights: 0 }
    }

    insights.value += gained
    totalInsightsEarned.value += gained
    tier2PrestigeCount.value += 1

    return { success: true, gainedInsights: gained }
  }

  function unlockParadigm(id: ParadigmId): { success: boolean; reason?: string } {
    if (unlockedParadigms.value.includes(id)) {
      return { success: false, reason: 'already_unlocked' }
    }

    const def = ParadigmEngine.getParadigmDefinition(id)
    if (insights.value < def.cost) {
      return { success: false, reason: 'insufficient_insights' }
    }

    insights.value -= def.cost
    unlockedParadigms.value.push(id)
    return { success: true }
  }

  function selectParadigm(id: ParadigmId): { success: boolean; reason?: string } {
    if (!unlockedParadigms.value.includes(id)) {
      return { success: false, reason: 'paradigm_locked' }
    }

    activeParadigm.value = id
    return { success: true }
  }

  function toggleSynthetic(): boolean {
    isSyntheticActive.value = !isSyntheticActive.value
    return isSyntheticActive.value
  }

  function setSyntheticActive(active: boolean): void {
    isSyntheticActive.value = active
  }

  function updateSyntheticTelemetry(
    produced: Decimal,
    ratio: number,
    isCollapse: boolean
  ): void {
    syntheticTextProduced.value = produced
    syntheticRatio.value = ratio
    modelCollapseActive.value = isCollapse
  }

  function resetForSoftReset(): void {
    syntheticTextProduced.value = new Decimal(0)
    syntheticRatio.value = 0
    modelCollapseActive.value = false
  }

  function resetForHardReset(): void {
    syntheticTextProduced.value = new Decimal(0)
    syntheticRatio.value = 0
    modelCollapseActive.value = false
    isSyntheticActive.value = false
  }

  function getParadigmState(): ParadigmState {
    return {
      insights: insights.value,
      totalInsightsEarned: totalInsightsEarned.value,
      activeParadigm: activeParadigm.value,
      unlockedParadigms: [...unlockedParadigms.value],
      tier2PrestigeCount: tier2PrestigeCount.value,
      isSyntheticActive: isSyntheticActive.value,
      syntheticTextProduced: syntheticTextProduced.value,
      syntheticRatio: syntheticRatio.value,
      modelCollapseActive: modelCollapseActive.value,
    }
  }

  function setParadigmState(state: Partial<ParadigmState>): void {
    if (state.insights !== undefined) insights.value = state.insights
    if (state.totalInsightsEarned !== undefined) totalInsightsEarned.value = state.totalInsightsEarned
    if (state.activeParadigm !== undefined) activeParadigm.value = state.activeParadigm
    if (state.unlockedParadigms && Array.isArray(state.unlockedParadigms)) {
      unlockedParadigms.value = [...state.unlockedParadigms]
    }
    if (state.tier2PrestigeCount !== undefined) tier2PrestigeCount.value = state.tier2PrestigeCount
    if (state.isSyntheticActive !== undefined) isSyntheticActive.value = state.isSyntheticActive
    if (state.syntheticTextProduced !== undefined) {
      syntheticTextProduced.value = new Decimal(state.syntheticTextProduced)
    }
    if (state.syntheticRatio !== undefined) syntheticRatio.value = state.syntheticRatio
    if (state.modelCollapseActive !== undefined) modelCollapseActive.value = state.modelCollapseActive
  }

  return {
    insights,
    totalInsightsEarned,
    activeParadigm,
    unlockedParadigms,
    tier2PrestigeCount,
    isSyntheticActive,
    syntheticTextProduced,
    syntheticRatio,
    modelCollapseActive,
    passiveTflopsBonusPercent,
    passiveTflopsMultiplier,
    activeParadigmDef,
    multipliers,
    activeTflopsMultiplier,
    powerReduction,
    vramEfficiency,
    syntheticSpeedBonus,
    hasNoThrottling,
    canTriggerTier2,
    calculatePendingInsights,
    canUnlockParadigm,
    canSelectParadigm,
    claimTier2Prestige,
    unlockParadigm,
    selectParadigm,
    toggleSynthetic,
    setSyntheticActive,
    updateSyntheticTelemetry,
    resetForSoftReset,
    resetForHardReset,
    getParadigmState,
    setParadigmState,
  }
})
