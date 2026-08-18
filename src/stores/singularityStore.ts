import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type Decimal from 'break_infinity.js'
import type {
  SingularityEndingId,
  SingularityEndingDefinition,
  SingularityState,
} from '@/types/singularity'
import type { ParadigmId } from '@/types/paradigm'
import { SingularityEngine } from '@/domain/engine/SingularityEngine'

export const useSingularityStore = defineStore('singularity', () => {
  const singularitiesCompleted = ref<number>(0)
  const discoveredEndings = ref<SingularityEndingId[]>([])
  const chronoCores = ref<number>(0)
  const lastAscensionTimestamp = ref<number | null>(null)
  const currentEndingSelected = ref<SingularityEndingId | null>(null)

  const globalAscensionMultiplier = computed<number>(() => {
    return SingularityEngine.calculateGlobalMultiplier(chronoCores.value)
  })

  const hasDiscoveredAllEndings = computed<boolean>(() => {
    return SingularityEngine.hasDiscoveredAllEndings(discoveredEndings.value)
  })

  const allEndings = computed<SingularityEndingDefinition[]>(() => {
    return SingularityEngine.getAllEndings()
  })

  function canInitiate(parameters: Decimal, activeParadigm: ParadigmId): boolean {
    return SingularityEngine.canInitiateSingularity(parameters, activeParadigm)
  }

  function evaluateEnding(
    entropy: number,
    alignment: number,
    activeParadigm: ParadigmId,
    forceCyclicChoice = false,
  ): SingularityEndingId {
    return SingularityEngine.evaluateQualifiedEnding(
      entropy,
      alignment,
      activeParadigm,
      discoveredEndings.value,
      forceCyclicChoice,
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

  function resetState(): void {
    singularitiesCompleted.value = 0
    discoveredEndings.value = []
    chronoCores.value = 0
    lastAscensionTimestamp.value = null
    currentEndingSelected.value = null
  }

  return {
    singularitiesCompleted,
    discoveredEndings,
    chronoCores,
    lastAscensionTimestamp,
    currentEndingSelected,
    globalAscensionMultiplier,
    hasDiscoveredAllEndings,
    allEndings,
    canInitiate,
    evaluateEnding,
    claimAscension,
    getSingularityState,
    setSingularityState,
    resetState,
  }
})

