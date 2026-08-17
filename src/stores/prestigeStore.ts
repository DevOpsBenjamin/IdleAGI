import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type { TalentNode, PrestigeState } from '@/types/prestige'
import { TALENT_TREE_NODES } from '@/domain/constants/talents'
import { PrestigeEngine } from '@/domain/engine/PrestigeEngine'

export const usePrestigeStore = defineStore('prestige', () => {
  const totalArchitecturePoints = ref<number>(0)
  const architecturePoints = ref<number>(0)
  const prestigeCount = ref<number>(0)
  const maxParametersReached = ref<Decimal>(new Decimal(0))
  const talents = ref<Record<string, TalentNode>>(
    JSON.parse(JSON.stringify(TALENT_TREE_NODES))
  )

  const checkpointMultiplier = computed<number>(() => {
    return PrestigeEngine.calculateCheckpointMultiplier(totalArchitecturePoints.value)
  })

  const talentMultipliers = computed(() => {
    return PrestigeEngine.calculateTalentMultipliers(talents.value)
  })

  function calculatePendingAP(parameters: Decimal): number {
    return PrestigeEngine.calculateArchitecturePoints(parameters)
  }

  function canPrestige(parameters: Decimal): boolean {
    return PrestigeEngine.canPrestige(parameters)
  }

  function claimPrestige(parameters: Decimal): { success: boolean; gainedAP: number } {
    if (!canPrestige(parameters)) {
      return { success: false, gainedAP: 0 }
    }

    const gainedAP = calculatePendingAP(parameters)
    if (gainedAP <= 0) {
      return { success: false, gainedAP: 0 }
    }

    architecturePoints.value += gainedAP
    totalArchitecturePoints.value += gainedAP
    prestigeCount.value += 1
    maxParametersReached.value = Decimal.max(maxParametersReached.value, parameters)

    return { success: true, gainedAP }
  }

  function buyTalent(talentId: string): { success: boolean; reason?: string } {
    const check = PrestigeEngine.canBuyTalent(
      talentId,
      talents.value,
      architecturePoints.value
    )

    if (!check.canBuy) {
      return { success: false, reason: check.reason }
    }

    const node = talents.value[talentId]
    if (node) {
      architecturePoints.value -= node.cost
      node.purchased = true
      return { success: true }
    }

    return { success: false }
  }

  function getPrestigeState(): PrestigeState {
    return {
      totalArchitecturePoints: totalArchitecturePoints.value,
      architecturePoints: architecturePoints.value,
      prestigeCount: prestigeCount.value,
      maxParametersReached: maxParametersReached.value,
      talents: talents.value,
    }
  }

  function setPrestigeState(state: Partial<PrestigeState>) {
    if (state.totalArchitecturePoints !== undefined) {
      totalArchitecturePoints.value = state.totalArchitecturePoints
    }
    if (state.architecturePoints !== undefined) {
      architecturePoints.value = state.architecturePoints
    }
    if (state.prestigeCount !== undefined) {
      prestigeCount.value = state.prestigeCount
    }
    if (state.maxParametersReached !== undefined) {
      maxParametersReached.value = new Decimal(state.maxParametersReached)
    }
    if (state.talents) {
      // Merge saved purchased status with definition catalog
      const baseTalents: Record<string, TalentNode> = JSON.parse(JSON.stringify(TALENT_TREE_NODES))
      for (const [id, node] of Object.entries(state.talents)) {
        if (baseTalents[id]) {
          baseTalents[id].purchased = node.purchased
        }
      }
      talents.value = baseTalents
    }
  }

  return {
    totalArchitecturePoints,
    architecturePoints,
    prestigeCount,
    maxParametersReached,
    talents,
    checkpointMultiplier,
    talentMultipliers,
    calculatePendingAP,
    canPrestige,
    claimPrestige,
    buyTalent,
    getPrestigeState,
    setPrestigeState,
  }
})
