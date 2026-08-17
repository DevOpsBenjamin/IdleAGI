import Decimal from 'break_infinity.js'
import type { HardwareNode } from '@/types/hardware'
import type { ThermalState, PowerState } from '@/types/systems'

export interface PcieSlotsState {
  totalSlots: number
  usedSlots: number
  freeSlots: number
}

export type GpuInstallResult =
  | { canInstall: true }
  | { canInstall: false; reason: 'no_pcie_slots' | 'host_tier_too_low' }

export class ComputeEngine {
  /**
   * Calculate total raw compute (TFLOPS) from all active hardware nodes.
   */
  public static calculateRawCompute(hardware: Record<string, HardwareNode>): Decimal {
    let sum = new Decimal(0)
    for (const node of Object.values(hardware)) {
      if (node.count > 0) {
        sum = sum.add(node.tflops.mul(node.count))
      }
    }
    return sum
  }

  /**
   * Calculate total electrical power draw (Watts).
   */
  public static calculatePowerDraw(hardware: Record<string, HardwareNode>): Decimal {
    let sum = new Decimal(0)
    for (const node of Object.values(hardware)) {
      if (node.count > 0) {
        sum = sum.add(node.powerWatts.mul(node.count))
      }
    }
    return sum
  }

  /**
   * Calculate total memory capacity (VRAM/RAM in GB).
   */
  public static calculateVram(hardware: Record<string, HardwareNode>): Decimal {
    let sum = new Decimal(0)
    for (const node of Object.values(hardware)) {
      if (node.count > 0) {
        sum = sum.add(node.vram.mul(node.count))
      }
    }
    return sum
  }

  /**
   * Calculate total memory bandwidth (GB/s) across all active hardware nodes.
   */
  public static calculateTotalMemoryBandwidth(hardware: Record<string, HardwareNode>): Decimal {
    let sum = new Decimal(0)
    for (const node of Object.values(hardware)) {
      if (node.count > 0 && node.memoryBandwidthGBs) {
        sum = sum.add(node.memoryBandwidthGBs.mul(node.count))
      }
    }
    return sum
  }

  /**
   * Memory bandwidth speed multiplier for memory-bound token operations.
   * Multiplier = 1.0 + 0.20 * log10(max(1, bandwidthGBs))
   */
  public static calculateBandwidthSpeedMultiplier(totalBandwidthGBs: Decimal | number): number {
    const bw = totalBandwidthGBs instanceof Decimal ? totalBandwidthGBs.toNumber() : totalBandwidthGBs
    if (bw <= 1) return 1.0
    return 1.0 + 0.20 * Math.log10(bw)
  }

  /**
   * Calculate PCIe slots provided, used, and free.
   */
  public static calculatePcieSlots(hardware: Record<string, HardwareNode>): PcieSlotsState {
    let totalSlots = 0
    let usedSlots = 0

    for (const node of Object.values(hardware)) {
      if (node.count > 0) {
        if (node.category === 'host' && node.pcieSlotsProvided) {
          totalSlots += node.pcieSlotsProvided * node.count
        } else if (node.category === 'gpu' && node.pcieSlotsRequired) {
          usedSlots += node.pcieSlotsRequired * node.count
        }
      }
    }

    return {
      totalSlots,
      usedSlots,
      freeSlots: Math.max(0, totalSlots - usedSlots),
    }
  }

  /**
   * Check if a GPU can be installed given host tier constraints (minHostTier) and PCIe slots availability.
   */
  public static canInstallGpu(
    hardware: Record<string, HardwareNode>,
    gpuNode: HardwareNode | undefined
  ): GpuInstallResult {
    if (!gpuNode || gpuNode.category !== 'gpu') return { canInstall: true }

    const reqTier = gpuNode.minHostTier ?? 0
    const reqSlots = gpuNode.pcieSlotsRequired ?? 1

    // 1. Check if total overall slots are sufficient
    const overall = this.calculatePcieSlots(hardware)
    if (overall.freeSlots < reqSlots) {
      return { canInstall: false, reason: 'no_pcie_slots' }
    }

    // 2. Check cumulative capacity condition for all tiers k <= reqTier
    for (let k = 0; k <= reqTier; k++) {
      let slotsProvidedAtTier = 0
      let slotsUsedAtTier = 0

      for (const node of Object.values(hardware)) {
        if (node.count > 0) {
          if (node.category === 'host' && node.tier >= k && node.pcieSlotsProvided) {
            slotsProvidedAtTier += node.pcieSlotsProvided * node.count
          }
          if (node.category === 'gpu' && (node.minHostTier ?? 0) >= k && node.pcieSlotsRequired) {
            slotsUsedAtTier += node.pcieSlotsRequired * node.count
          }
        }
      }

      if (slotsUsedAtTier + reqSlots > slotsProvidedAtTier) {
        return { canInstall: false, reason: 'host_tier_too_low' }
      }
    }

    return { canInstall: true }
  }

  /**
   * Compute thermodynamic state and thermal throttling efficiency.
   */
  public static calculateThermalState(
    totalPowerWatts: Decimal,
    coolingCapacityWatts: Decimal
  ): ThermalState {
    const heat = totalPowerWatts.mul(0.9)
    const cooling = coolingCapacityWatts
    let efficiency = 1.0

    if (heat.gt(0) && heat.gt(cooling)) {
      efficiency = cooling.div(heat).toNumber()
    }

    const clampedEfficiency = Math.max(0.1, Math.min(1.0, efficiency))
    return {
      heatGeneratedWatts: heat,
      coolingCapacityWatts: cooling,
      efficiency: clampedEfficiency,
      isThrottling: clampedEfficiency < 1.0,
    }
  }

  /**
   * Compute power grid state and load percentage.
   */
  public static calculatePowerState(
    totalDrawWatts: Decimal,
    gridCapacityWatts: Decimal
  ): PowerState {
    const loadPercent = gridCapacityWatts.gt(0)
      ? totalDrawWatts.div(gridCapacityWatts).mul(100).toNumber()
      : 0

    return {
      totalDrawWatts,
      gridCapacityWatts,
      gridLoadPercent: loadPercent,
      isOverloaded: totalDrawWatts.gt(gridCapacityWatts),
    }
  }

  /**
   * Calculate effective compute factoring in thermal throttling and power grid status.
   */
  public static calculateEffectiveCompute(
    rawCompute: Decimal,
    thermalState: ThermalState,
    powerState: PowerState
  ): Decimal {
    let comp = rawCompute.mul(thermalState.efficiency)
    if (powerState.isOverloaded) {
      comp = comp.mul(0.5) // 50% penalty if grid is overloaded
    }
    return comp
  }

  /**
   * Calculate cost of purchasing the next hardware node instance.
   */
  public static calculateHardwareCost(node: HardwareNode | undefined): Decimal {
    if (!node) return new Decimal(Infinity)
    return node.baseCost.mul(Math.pow(node.costMult, node.count))
  }
}
