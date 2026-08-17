import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UnlockedFeatures, MilestoneState } from '@/types'
import {
  createInitialMilestones,
  createInitialUnlockedFeatures,
} from '@/domain/constants/milestones'

export const useFeaturesStore = defineStore('features', () => {
  const currentPhase = ref<number>(0)
  const unlockedFeatures = ref<UnlockedFeatures>(createInitialUnlockedFeatures())
  const reachedMilestones = ref<MilestoneState>(createInitialMilestones())

  function unlockFeature(feature: keyof UnlockedFeatures) {
    unlockedFeatures.value[feature] = true
  }

  function setPhase(phase: number, force = false) {
    if (force || phase > currentPhase.value) {
      currentPhase.value = phase
    }
  }

  function resetFeatures() {
    currentPhase.value = 0
    unlockedFeatures.value = createInitialUnlockedFeatures()
    reachedMilestones.value = createInitialMilestones()
  }

  return {
    currentPhase,
    unlockedFeatures,
    reachedMilestones,
    unlockFeature,
    setPhase,
    resetFeatures,
  }
})
