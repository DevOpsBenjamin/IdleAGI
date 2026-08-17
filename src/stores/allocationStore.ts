import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AllocationState, AllocationPreset } from '@/types'

export const useAllocationStore = defineStore('allocation', () => {
  const allocations = ref<AllocationState>({
    inferencePercent: 100,
    trainingPercent: 0,
    researchPercent: 0,
  })

  function updateAllocations(
    newAllocations: AllocationState,
    trainingUnlocked: boolean,
    researchUnlocked: boolean
  ) {
    if (!trainingUnlocked) {
      allocations.value = { inferencePercent: 100, trainingPercent: 0, researchPercent: 0 }
      return
    }

    if (!researchUnlocked && newAllocations.researchPercent > 0) {
      const train = 100 - newAllocations.inferencePercent
      allocations.value = {
        inferencePercent: newAllocations.inferencePercent,
        trainingPercent: train,
        researchPercent: 0,
      }
      return
    }

    const total =
      newAllocations.inferencePercent +
      newAllocations.trainingPercent +
      newAllocations.researchPercent

    if (total === 100) {
      allocations.value = { ...newAllocations }
    }
  }

  function setAllocationPreset(
    preset: AllocationPreset,
    trainingUnlocked: boolean,
    researchUnlocked: boolean
  ): string {
    if (preset === 'cash' || !trainingUnlocked) {
      updateAllocations(
        { inferencePercent: 100, trainingPercent: 0, researchPercent: 0 },
        trainingUnlocked,
        researchUnlocked
      )
      return 'Allocation réglée sur Monétisation Maximale (100% Inférence).'
    }

    if (preset === 'balanced') {
      if (researchUnlocked) {
        updateAllocations(
          { inferencePercent: 50, trainingPercent: 30, researchPercent: 20 },
          trainingUnlocked,
          researchUnlocked
        )
      } else {
        updateAllocations(
          { inferencePercent: 60, trainingPercent: 40, researchPercent: 0 },
          trainingUnlocked,
          researchUnlocked
        )
      }
      return 'Allocation réglée sur Mode Équilibré.'
    }

    if (preset === 'train') {
      if (researchUnlocked) {
        updateAllocations(
          { inferencePercent: 20, trainingPercent: 70, researchPercent: 10 },
          trainingUnlocked,
          researchUnlocked
        )
      } else {
        updateAllocations(
          { inferencePercent: 20, trainingPercent: 80, researchPercent: 0 },
          trainingUnlocked,
          researchUnlocked
        )
      }
      return 'Allocation réglée sur Entraînement Intensif.'
    }

    return ''
  }

  return {
    allocations,
    updateAllocations,
    setAllocationPreset,
  }
})
