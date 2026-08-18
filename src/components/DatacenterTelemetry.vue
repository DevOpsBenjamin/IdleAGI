<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Activity,
  Flame,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Fan,
  ShieldAlert,
  Gauge,
} from 'lucide-vue-next'
import { formatWatts } from '@/utils/format'
import type { HardwareNode, ThermalState, PowerState } from '@/types/game'
import type { PcieSlotsState } from '@/domain/engine/ComputeEngine'
import type Decimal from 'break_infinity.js'
import PowerGridTelemetry from './telemetry/PowerGridTelemetry.vue'
import DatacenterRackVisualizer from './telemetry/DatacenterRackVisualizer.vue'

const props = defineProps<{
  thermalState: ThermalState
  powerState: PowerState
  activeHostNode: HardwareNode | null
  hardwareList: HardwareNode[]
  pcieSlots?: PcieSlotsState
  rawCompute: Decimal
  effectiveCompute: Decimal
}>()

const isExpanded = ref(true)

// Thermal LED matrix computations
const SEGMENT_COUNT = 16
const MIN_TEMP = 30
const MAX_TEMP = 105

interface LedSegment {
  index: number
  thresholdTemp: number
  isActive: boolean
  isCritical: boolean
  isWarm: boolean
}

const ledSegments = computed<LedSegment[]>(() => {
  const currentTemp = props.thermalState.temperatureCelsius
  const step = (MAX_TEMP - MIN_TEMP) / SEGMENT_COUNT
  const segments: LedSegment[] = []

  for (let i = 0; i < SEGMENT_COUNT; i++) {
    const threshold = MIN_TEMP + (i + 1) * step
    const isActive = currentTemp >= threshold - step / 2
    const isCritical = threshold >= 80
    const isWarm = threshold >= 70 && threshold < 80

    segments.push({
      index: i,
      thresholdTemp: Math.round(threshold),
      isActive,
      isCritical,
      isWarm,
    })
  }
  return segments
})

const thermalLoadRatio = computed(() => {
  const heat = props.thermalState.heatGeneratedWatts.toNumber()
  const cooling = props.thermalState.coolingCapacityWatts.toNumber()
  if (cooling <= 0) return 1.5
  return heat / cooling
})

const overallEfficiencyPercent = computed(() => {
  const thermalEff = props.thermalState.efficiency
  const powerMul = props.powerState.effectiveMultiplier
  return Math.round(thermalEff * powerMul * 100)
})
</script>

<template>
  <div
    class="bg-[#0D1117] border rounded-lg p-3.5 flex flex-col gap-3 shadow-lg transition-all duration-300 font-mono"
    :class="[
      thermalState.isThrottling || powerState.isOverloaded
        ? 'border-[#EF4444]/60 shadow-[0_0_15px_rgba(239,68,68,0.15)] ring-1 ring-[#EF4444]/30'
        : 'border-[#21262D]',
    ]"
  >
    <!-- 1. CRITICAL ALARM BANNERS (Active Throttling or Power Overload) -->
    <div
      v-if="thermalState.isThrottling"
      class="p-2.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/50 flex items-start gap-2.5 text-[#EF4444] animate-pulse"
      role="alert"
      aria-live="assertive"
    >
      <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5" />
      <div class="flex-1 text-[11px] leading-tight">
        <div class="font-bold flex items-center justify-between">
          <span>ALERTE THERMIQUE // THROTTLING ACTIF</span>
          <span class="text-[10px] bg-[#EF4444]/20 px-1.5 py-0.5 rounded font-bold">
            -{{ Math.round((1 - thermalState.efficiency) * 100) }}% COMPUTE
          </span>
        </div>
        <p class="text-[#8B949E] text-[10px] mt-1">
          Température cœur : <strong class="text-[#EF4444]">{{ thermalState.temperatureCelsius.toFixed(1) }}°C</strong> (Seuil : 80°C). Installez des modules de dissipation active dans l’onglet Refroidissement.
        </p>
      </div>
    </div>

    <div
      v-if="powerState.isOverloaded"
      class="p-2.5 rounded bg-[#EF4444]/15 border border-[#EF4444]/50 flex items-start gap-2.5 text-[#EF4444] animate-pulse"
      role="alert"
      aria-live="assertive"
    >
      <AlertTriangle class="w-4 h-4 shrink-0 mt-0.5" />
      <div class="flex-1 text-[11px] leading-tight">
        <div class="font-bold flex items-center justify-between">
          <span>ALERTE ÉLECTRIQUE // DISJONCTEUR DÉCLENCHÉ</span>
          <span class="text-[10px] bg-[#EF4444]/20 px-1.5 py-0.5 rounded font-bold">
            -50% COMPUTE
          </span>
        </div>
        <p class="text-[#8B949E] text-[10px] mt-1">
          Consommation : <strong class="text-[#EF4444]">{{ Math.round(powerState.gridLoadPercent) }}%</strong> de la capacité de ligne. Améliorez le réseau électrique dans l’onglet Électricité.
        </p>
      </div>
    </div>

    <!-- 2. HEADER & COLLAPSE TOGGLE -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div
          class="p-1.5 rounded transition-colors"
          :class="[
            thermalState.isThrottling || powerState.isOverloaded
              ? 'bg-[#EF4444]/20 text-[#EF4444]'
              : 'bg-[#38BDF8]/10 text-[#38BDF8]',
          ]"
        >
          <Activity class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-2">
            Télémétrie Datacenter & Rack
            <span
              v-if="thermalState.isThrottling || powerState.isOverloaded"
              class="text-[9px] px-1.5 py-0.2 bg-[#EF4444]/20 text-[#EF4444] rounded border border-[#EF4444]/40 font-bold"
            >
              DÉGRADÉ
            </span>
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Quick Efficiency Status Pill -->
        <div
          class="text-xs font-mono px-2 py-0.5 rounded border flex items-center gap-1.5"
          :class="[
            overallEfficiencyPercent < 50
              ? 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30'
              : overallEfficiencyPercent < 90
                ? 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30'
                : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30',
          ]"
        >
          <Gauge class="w-3 h-3" />
          <span>Rendement : {{ overallEfficiencyPercent }}%</span>
        </div>

        <button
          type="button"
          @click="isExpanded = !isExpanded"
          class="p-1 rounded hover:bg-[#161B22] text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer"
          :aria-expanded="isExpanded"
          aria-label="Afficher ou masquer la télémétrie"
        >
          <ChevronUp v-if="isExpanded" class="w-4 h-4" />
          <ChevronDown v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- 3. EXPANDABLE TELEMETRY CONTENT -->
    <div v-show="isExpanded" class="flex flex-col gap-3 pt-1 animate-fade-in">
      <!-- A. THERMAL TELEMETRY SECTION -->
      <div class="bg-[#161B22]/50 border border-[#21262D] rounded-lg p-3 flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5 text-xs text-[#8B949E]">
            <Flame class="w-3.5 h-3.5 text-[#FFB800]" />
            <span class="font-bold text-[#F0F6FC]">Thermique & Dissipation</span>
          </div>
          <div class="text-xs font-bold flex items-center gap-1.5 font-mono">
            <span
              :class="[
                thermalState.temperatureCelsius >= 80
                  ? 'text-[#EF4444] animate-pulse'
                  : thermalState.temperatureCelsius >= 70
                    ? 'text-[#FFB800]'
                    : 'text-[#00FF66]',
              ]"
            >
              {{ thermalState.temperatureCelsius.toFixed(1) }}°C
            </span>
            <span class="text-[10px] text-[#8B949E] font-normal">
              ({{ formatWatts(thermalState.heatGeneratedWatts) }} / {{ formatWatts(thermalState.coolingCapacityWatts) }} Dissipé)
            </span>
          </div>
        </div>

        <!-- Thermal LED Segmented Gauge -->
        <div class="grid grid-cols-16 gap-1 h-3 p-0.5 bg-[#07090E] border border-[#21262D] rounded">
          <div
            v-for="seg in ledSegments"
            :key="seg.index"
            class="h-full rounded-xs transition-colors duration-150"
            :class="[
              !seg.isActive
                ? 'bg-[#21262D]/40'
                : seg.isCritical
                  ? 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
                  : seg.isWarm
                    ? 'bg-[#FFB800] shadow-[0_0_5px_rgba(255,184,0,0.6)]'
                    : 'bg-[#00FF66] shadow-[0_0_4px_rgba(0,255,102,0.4)]',
            ]"
          ></div>
        </div>

        <!-- Thermal Subtext -->
        <div class="flex items-center justify-between text-[9px] text-[#8B949E]">
          <span class="flex items-center gap-1">
            <Fan class="w-2.5 h-2.5 text-[#38BDF8]" />
            Refroidissement : {{ formatWatts(thermalState.coolingCapacityWatts) }}
          </span>
          <span>
            Charge thermique : <strong :class="thermalLoadRatio > 1.0 ? 'text-[#EF4444]' : 'text-[#38BDF8]'">{{ Math.round(thermalLoadRatio * 100) }}%</strong>
          </span>
        </div>
      </div>

      <!-- B. POWER GRID SECTION -->
      <PowerGridTelemetry :power-state="powerState" />

      <!-- C. VIRTUAL RACK & PCIE SLOTS VISUALIZER -->
      <DatacenterRackVisualizer
        :active-host-node="activeHostNode"
        :hardware-list="hardwareList"
        :pcie-slots="pcieSlots"
      />
    </div>
  </div>
</template>
