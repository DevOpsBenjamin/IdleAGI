import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DatacenterTelemetry from '@/components/DatacenterTelemetry.vue'
import Decimal from 'break_infinity.js'
import type { ThermalState, PowerState, HardwareNode } from '@/types/game'
import type { PcieSlotsState } from '@/domain/engine/ComputeEngine'

describe('DatacenterTelemetry.vue', () => {
  const defaultThermalState: ThermalState = {
    efficiency: 1.0,
    temperatureCelsius: 45.0,
    heatGeneratedWatts: new Decimal(90),
    coolingCapacityWatts: new Decimal(120),
    isThrottling: false,
    status: 'nominal',
  }

  const defaultPowerState: PowerState = {
    totalDrawWatts: new Decimal(100),
    gridCapacityWatts: new Decimal(500),
    gridLoadPercent: 20,
    effectiveMultiplier: 1.0,
    isOverloaded: false,
    status: 'nominal',
  }

  const mockHostNode: HardwareNode = {
    id: 'potato_pc',
    name: 'Potato PC Récupéré',
    category: 'host',
    tier: 0,
    count: 1,
    maxCount: 1,
    baseCost: new Decimal(25),
    costMult: 1.0,
    tflops: new Decimal(0.0001),
    powerWatts: new Decimal(100),
    vram: new Decimal(0.25),
    memoryBandwidthGBs: new Decimal(1.6),
    memoryType: 'SDRAM',
    description: 'Pentium II avec 256 Mo SDRAM',
    pcieSlotsProvided: 0,
  }

  const mockGpuNode: HardwareNode = {
    id: 'gpu_gt210',
    name: 'GeForce GT 210 Turbo',
    category: 'gpu',
    tier: 0,
    count: 1,
    baseCost: new Decimal(15),
    costMult: 1.15,
    tflops: new Decimal(0.005),
    powerWatts: new Decimal(30),
    vram: new Decimal(0.5),
    memoryBandwidthGBs: new Decimal(8),
    memoryType: 'DDR3',
    description: 'GPU d appoint',
    pcieSlotsRequired: 1,
    minHostTier: 0,
  }

  const mockPcieSlots: PcieSlotsState = {
    totalSlots: 2,
    usedSlots: 1,
    freeSlots: 1,
  }

  it('renders nominal status without alarm banners when within safe limits', () => {
    const wrapper = mount(DatacenterTelemetry, {
      props: {
        thermalState: defaultThermalState,
        powerState: defaultPowerState,
        activeHostNode: mockHostNode,
        hardwareList: [mockHostNode, mockGpuNode],
        pcieSlots: mockPcieSlots,
        rawCompute: new Decimal(0.0051),
        effectiveCompute: new Decimal(0.0051),
      },
    })

    expect(wrapper.text()).toContain('Télémétrie Datacenter & Rack')
    expect(wrapper.text()).toContain('Potato PC Récupéré')
    expect(wrapper.text()).toContain('GeForce GT 210 Turbo')
    expect(wrapper.text()).toContain('1 Emplacement(s) PCIe x16 libre(s)')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })

  it('renders thermal alarm banner when thermal throttling is active', () => {
    const throttledThermalState: ThermalState = {
      ...defaultThermalState,
      efficiency: 0.65,
      temperatureCelsius: 86.8,
      isThrottling: true,
      status: 'throttling',
    }

    const wrapper = mount(DatacenterTelemetry, {
      props: {
        thermalState: throttledThermalState,
        powerState: defaultPowerState,
        activeHostNode: mockHostNode,
        hardwareList: [mockHostNode],
        pcieSlots: mockPcieSlots,
        rawCompute: new Decimal(0.0001),
        effectiveCompute: new Decimal(0.000065),
      },
    })

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('ALERTE THERMIQUE // THROTTLING ACTIF')
    expect(alert.text()).toContain('-35% COMPUTE')
    expect(alert.text()).toContain('86.8°C')
  })

  it('renders power overload banner when electrical grid is overloaded', () => {
    const overloadedPowerState: PowerState = {
      totalDrawWatts: new Decimal(600),
      gridCapacityWatts: new Decimal(500),
      gridLoadPercent: 120,
      effectiveMultiplier: 0.5,
      isOverloaded: true,
      status: 'overloaded',
    }

    const wrapper = mount(DatacenterTelemetry, {
      props: {
        thermalState: defaultThermalState,
        powerState: overloadedPowerState,
        activeHostNode: mockHostNode,
        hardwareList: [mockHostNode],
        pcieSlots: mockPcieSlots,
        rawCompute: new Decimal(0.0001),
        effectiveCompute: new Decimal(0.00005),
      },
    })

    const alert = wrapper.find('[role="alert"]')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('ALERTE ÉLECTRIQUE // DISJONCTEUR DÉCLENCHÉ')
    expect(alert.text()).toContain('-50% COMPUTE')
    expect(alert.text()).toContain('120%')
  })

  it('computes overall efficiency accurately combining thermal and power factors', () => {
    const throttledThermalState: ThermalState = {
      ...defaultThermalState,
      efficiency: 0.8,
      temperatureCelsius: 82.6,
      isThrottling: true,
      status: 'throttling',
    }
    const overloadedPowerState: PowerState = {
      ...defaultPowerState,
      effectiveMultiplier: 0.5,
      isOverloaded: true,
      gridLoadPercent: 110,
      status: 'overloaded',
    }

    const wrapper = mount(DatacenterTelemetry, {
      props: {
        thermalState: throttledThermalState,
        powerState: overloadedPowerState,
        activeHostNode: mockHostNode,
        hardwareList: [mockHostNode],
        pcieSlots: mockPcieSlots,
        rawCompute: new Decimal(0.0001),
        effectiveCompute: new Decimal(0.00004),
      },
    })

    // 0.8 * 0.5 = 0.40 -> 40%
    expect(wrapper.text()).toContain('Rendement : 40%')
  })
})
