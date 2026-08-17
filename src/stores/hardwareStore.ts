import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import Decimal from 'break_infinity.js'
import type { HardwareNode, ThermalState, PowerState } from '@/types'
import { createInitialHardware } from '@/domain/constants/hardware'
import { ComputeEngine, type PcieSlotsState } from '@/domain/engine/ComputeEngine'

export const useHardwareStore = defineStore('hardware', () => {
  const hardware = ref<Record<string, HardwareNode>>(createInitialHardware())
  const gridCapacityWatts = ref<Decimal>(new Decimal(100))
  const coolingCapacityWatts = ref<Decimal>(new Decimal(50))

  const totalRawCompute = computed<Decimal>(() => {
    return ComputeEngine.calculateRawCompute(hardware.value)
  })

  const totalPowerDrawWatts = computed<Decimal>(() => {
    return ComputeEngine.calculatePowerDraw(hardware.value)
  })

  const totalVramGB = computed<Decimal>(() => {
    return ComputeEngine.calculateVram(hardware.value)
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
      coolingCapacityWatts.value
    )
  })

  const powerState = computed<PowerState>(() => {
    return ComputeEngine.calculatePowerState(
      totalPowerDrawWatts.value,
      gridCapacityWatts.value
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

  function getHardwareCost(id: string): Decimal {
    const node = hardware.value[id]
    return ComputeEngine.calculateHardwareCost(node)
  }

  function buyHardware(
    id: string,
    availableFunds: Decimal
  ): { success: boolean; cost: Decimal; node?: HardwareNode; reason?: string } {
    const node = hardware.value[id]
    if (!node) return { success: false, cost: new Decimal(Infinity) }

    const cost = getHardwareCost(id)
    if (!availableFunds.gte(cost)) {
      return { success: false, cost, reason: 'insufficient_funds' }
    }

    if (node.category === 'gpu') {
      const slots = ComputeEngine.calculatePcieSlots(hardware.value)
      const required = node.pcieSlotsRequired ?? 1
      if (slots.freeSlots < required) {
        return { success: false, cost, reason: 'no_pcie_slots' }
      }
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
    getHardwareCost,
    buyHardware,
  }
})
