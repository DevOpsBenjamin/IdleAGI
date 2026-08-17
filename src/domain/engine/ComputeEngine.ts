import Decimal from 'break_infinity.js'
import type { HardwareNode } from '@/types/hardware'
import type { ThermalState, PowerState } from '@/types/systems'

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
   * Calculate total video memory (VRAM in GB).
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
