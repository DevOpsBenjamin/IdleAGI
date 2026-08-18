import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type {
  CognitiveState,
  CognitiveStatus,
  CognitiveImpactMultipliers,
} from '@/types/cognitive'
import {
  CognitiveEngine,
  type CognitiveTickResult,
} from '@/domain/engine/CognitiveEngine'

export const useCognitiveStore = defineStore('cognitive', () => {
  const entropy = ref<Decimal>(new Decimal(0.0))
  const alignment = ref<Decimal>(new Decimal(1.0))
  const rlhfBatchCount = ref<number>(0)
  const totalRlhfConducted = ref<Decimal>(new Decimal(0))
  const lastRecordedStatus = ref<CognitiveStatus>('nominal')

  const entropyNumber = computed(() => entropy.value.toNumber())
  const alignmentNumber = computed(() => alignment.value.toNumber())

  const status = computed<CognitiveStatus>(() =>
    CognitiveEngine.calculateStatus(entropy.value)
  )

  const rlhfCost = computed<Decimal>(() =>
    CognitiveEngine.calculateRlhfCost(rlhfBatchCount.value)
  )

  function calculateMultipliers(hasSafetyBenchmarks = false): CognitiveImpactMultipliers {
    return CognitiveEngine.calculateImpactMultipliers(entropy.value, hasSafetyBenchmarks)
  }

  function canPerformRlhf(availableFunds: Decimal): boolean {
    return CognitiveEngine.canPerformRlhf(
      availableFunds,
      entropy.value,
      rlhfBatchCount.value
    )
  }

  function performRlhf(availableFunds: Decimal): { success: boolean; cost: Decimal } {
    if (!canPerformRlhf(availableFunds)) {
      return { success: false, cost: new Decimal(0) }
    }

    const current: CognitiveState = {
      entropy: entropy.value,
      alignment: alignment.value,
      rlhfBatchCount: rlhfBatchCount.value,
      totalRlhfConducted: totalRlhfConducted.value,
    }

    const result = CognitiveEngine.applyRlhf(current, availableFunds)
    if (result.success) {
      entropy.value = result.newState.entropy
      alignment.value = result.newState.alignment
      rlhfBatchCount.value = result.newState.rlhfBatchCount
      totalRlhfConducted.value = result.newState.totalRlhfConducted
      lastRecordedStatus.value = CognitiveEngine.calculateStatus(result.newState.entropy)
      return { success: true, cost: result.cost }
    }

    return { success: false, cost: new Decimal(0) }
  }

  function updateFromTick(tickResult: CognitiveTickResult): void {
    entropy.value = tickResult.entropy
    alignment.value = tickResult.alignment
  }

  function resetState(): void {
    entropy.value = new Decimal(0.0)
    alignment.value = new Decimal(1.0)
    rlhfBatchCount.value = 0
    totalRlhfConducted.value = new Decimal(0)
    lastRecordedStatus.value = 'nominal'
  }

  function getCognitiveState(): CognitiveState {
    return {
      entropy: entropy.value,
      alignment: alignment.value,
      rlhfBatchCount: rlhfBatchCount.value,
      totalRlhfConducted: totalRlhfConducted.value,
    }
  }

  function setCognitiveState(state: Partial<CognitiveState>): void {
    if (state.entropy !== undefined) {
      entropy.value = new Decimal(state.entropy)
    }
    if (state.alignment !== undefined) {
      alignment.value = new Decimal(state.alignment)
    }
    if (state.rlhfBatchCount !== undefined) {
      rlhfBatchCount.value = state.rlhfBatchCount
    }
    if (state.totalRlhfConducted !== undefined) {
      totalRlhfConducted.value = new Decimal(state.totalRlhfConducted)
    }
    lastRecordedStatus.value = CognitiveEngine.calculateStatus(entropy.value)
  }

  return {
    entropy,
    alignment,
    entropyNumber,
    alignmentNumber,
    rlhfBatchCount,
    totalRlhfConducted,
    status,
    lastRecordedStatus,
    rlhfCost,
    calculateMultipliers,
    canPerformRlhf,
    performRlhf,
    updateFromTick,
    resetState,
    getCognitiveState,
    setCognitiveState,
  }
})
