import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type Decimal from 'break_infinity.js'
import type { SingularityEndingId, SingularityState } from '@/types/singularity'
import type { ParadigmId } from '@/types/paradigm'
import {
  canInitiateSingularity,
  evaluateQualifiedEnding,
  getSingularityMultiplier,
} from '@/domain/singularityEvaluator'

export const useSingularityStore = defineStore('singularity', () => {
  const singularitiesCompleted = ref<number>(0)
  const discoveredEndings = ref<SingularityEndingId[]>([])
  const chronoCores = ref<number>(0)
  const lastAscensionTimestamp = ref<number | null>(null)
  const currentEndingSelected = ref<SingularityEndingId | null>(null)

  const globalAscensionMultiplier = computed<number>(() => {
    return getSingularityMultiplier(chronoCores.value)
  })

  function canInitiate(parameters: Decimal, activeParadigm: ParadigmId): boolean {
    return canInitiateSingularity(parameters, activeParadigm)
  }

  function evaluateEnding(
    entropy: number,
    alignment: number,
    activeParadigm: ParadigmId,
  ): SingularityEndingId {
    return evaluateQualifiedEnding(
      entropy,
      alignment,
      activeParadigm,
      discoveredEndings.value,
    )
  }

  function claimAscension(endingId: SingularityEndingId): {
    success: boolean
    gainedCores: number
  } {
    if (!discoveredEndings.value.includes(endingId)) {
      discoveredEndings.value.push(endingId)
    }

    singularitiesCompleted.value += 1
    chronoCores.value += 1
    lastAscensionTimestamp.value = Date.now()
    currentEndingSelected.value = endingId

    return {
      success: true,
      gainedCores: 1,
    }
  }

  function getSingularityState(): SingularityState {
    return {
      singularitiesCompleted: singularitiesCompleted.value,
      discoveredEndings: [...discoveredEndings.value],
      chronoCores: chronoCores.value,
      lastAscensionTimestamp: lastAscensionTimestamp.value,
      currentEndingSelected: currentEndingSelected.value,
    }
  }

  function setSingularityState(state: Partial<SingularityState>): void {
    if (state.singularitiesCompleted !== undefined) {
      singularitiesCompleted.value = state.singularitiesCompleted
    }
    if (state.discoveredEndings && Array.isArray(state.discoveredEndings)) {
      discoveredEndings.value = [...state.discoveredEndings]
    }
    if (state.chronoCores !== undefined) {
      chronoCores.value = state.chronoCores
    }
    if (state.lastAscensionTimestamp !== undefined) {
      lastAscensionTimestamp.value = state.lastAscensionTimestamp
    }
    if (state.currentEndingSelected !== undefined) {
      currentEndingSelected.value = state.currentEndingSelected
    }
  }

  return {
    singularitiesCompleted,
    discoveredEndings,
    chronoCores,
    lastAscensionTimestamp,
    currentEndingSelected,
    globalAscensionMultiplier,
    canInitiate,
    evaluateEnding,
    claimAscension,
    getSingularityState,
    setSingularityState,
  }
})
