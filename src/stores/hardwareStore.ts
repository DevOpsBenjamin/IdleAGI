import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type { HardwareNode, ThermalState, PowerState } from '@/types'
import { createInitialHardware } from '@/domain/constants/hardware'
import { ComputeEngine, type PcieSlotsState } from '@/domain/engine/ComputeEngine'
import { usePrestigeStore } from './prestigeStore'
import { useParadigmStore } from './paradigmStore'

export const useHardwareStore = defineStore('hardware', () => {
  const prestigeStore = usePrestigeStore()
  const paradigmStore = useParadigmStore()
  const hardware = ref<Record<string, HardwareNode>>(createInitialHardware())
  const gridCapacityWatts = ref<Decimal>(new Decimal(100))
  const coolingCapacityWatts = ref<Decimal>(new Decimal(50))

  const totalRawCompute = computed<Decimal>(() => {
    return ComputeEngine.calculateRawCompute(hardware.value)
  })

  const totalPowerDrawWatts = computed<Decimal>(() => {
    const raw = ComputeEngine.calculatePowerDraw(hardware.value)
    const reduction = paradigmStore.powerReduction
    return reduction > 0 ? raw.mul(Math.max(0.01, 1.0 - reduction)) : raw
  })

  const totalVramGB = computed<Decimal>(() => {
    const raw = ComputeEngine.calculateVram(hardware.value)
    const efficiency = paradigmStore.vramEfficiency
    return efficiency > 1.0 ? raw.mul(efficiency) : raw
  })

  const totalMemoryBandwidthGBs = computed<Decimal>(() => {
    return ComputeEngine.calculateTotalMemoryBandwidth(hardware.value)
  })

  const bandwidthSpeedMultiplier = computed<number>(() => {
    return ComputeEngine.calculateBandwidthSpeedMultiplier(totalMemoryBandwidthGBs.value)
  })

  const pcieSlots = computed<PcieSlotsState>(() => {
    return ComputeEngine.calculatePcieSlots(hardware.value)
  })

  const thermalState = computed<ThermalState>(() => {
    return ComputeEngine.calculateThermalState(
      totalPowerDrawWatts.value,
      coolingCapacityWatts.value,
      prestigeStore.talentMultipliers.coolingEfficiencyMultiplier,
      paradigmStore.hasNoThrottling
    )
  })

  const powerState = computed<PowerState>(() => {
    return ComputeEngine.calculatePowerState(
      totalPowerDrawWatts.value,
      gridCapacityWatts.value,
      prestigeStore.talentMultipliers.gridCapacityMultiplier
    )
  })

  const effectiveCompute = computed<Decimal>(() => {
    return ComputeEngine.calculateEffectiveCompute(
      totalRawCompute.value,
      thermalState.value,
      powerState.value
    )
  })

  const hasPotatoPc = computed<boolean>(() => {
    return (hardware.value.potato_pc?.count ?? 0) > 0
  })

  const hasWorkstation = computed<boolean>(() => {
    return (
      (hardware.value.core2_quad?.count ?? 0) > 0 ||
      (hardware.value.gtx_750ti?.count ?? 0) > 0 ||
      (hardware.value.gaming_pc?.count ?? 0) > 0 ||
      (hardware.value.workstation_pro?.count ?? 0) > 0 ||
      (hardware.value.datacenter_chassis?.count ?? 0) > 0 ||
      (hardware.value.rtx_3060?.count ?? 0) > 0 ||
      (hardware.value.rtx_3090?.count ?? 0) > 0 ||
      (hardware.value.a100_sxm4?.count ?? 0) > 0 ||
      (hardware.value.h100_sxm5?.count ?? 0) > 0
    )
  })

  const hostNodesInOrder = computed<HardwareNode[]>(() => {
    return Object.values(hardware.value)
      .filter((n) => n.category === 'host')
      .sort((a, b) => a.baseCost.cmp(b.baseCost))
  })

  const activeHostNode = computed<HardwareNode | null>(() => {
    const owned = hostNodesInOrder.value.filter((n) => n.count > 0)
    return owned.length > 0 ? owned[owned.length - 1] : null
  })

  const nextHostNode = computed<HardwareNode | null>(() => {
    return hostNodesInOrder.value.find((n) => n.count === 0) ?? null
  })

  function getHardwareCost(id: string): Decimal {
    const node = hardware.value[id]
    return ComputeEngine.calculateHardwareCost(node)
  }

  function buyHardware(
    id: string,
    availableFunds: Decimal,
    purchasedUpgradeIds: Set<string> | string[] = new Set(),
    costDiscountMultiplier = prestigeStore.talentMultipliers.hardwareDiscountMultiplier
  ): { success: boolean; cost: Decimal; node?: HardwareNode; reason?: string } {
    const node = hardware.value[id]
    if (!node) return { success: false, cost: new Decimal(Infinity) }

    const cost = getHardwareCost(id).mul(costDiscountMultiplier)
    const check = ComputeEngine.canBuyHardware(
      hardware.value,
      node,
      availableFunds,
      purchasedUpgradeIds,
      costDiscountMultiplier
    )

    if (!check.canBuy) {
      return { success: false, cost, reason: check.reason }
    }

    node.count += 1
    return { success: true, cost, node }
  }

  return {
    hardware,
    gridCapacityWatts,
    coolingCapacityWatts,
    totalRawCompute,
    totalPowerDrawWatts,
    totalVramGB,
    totalMemoryBandwidthGBs,
    bandwidthSpeedMultiplier,
    pcieSlots,
    thermalState,
    powerState,
    effectiveCompute,
    hasPotatoPc,
    hasWorkstation,
    activeHostNode,
    nextHostNode,
    getHardwareCost,
    buyHardware,
  }
})
