<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Activity,
  Flame,
  Zap,
  Cpu,
  Server,
  AlertTriangle,
  Layers,
  ChevronDown,
  ChevronUp,
  Fan,
  ShieldAlert,
  Gauge
} from 'lucide-vue-next'
import { formatWatts, formatFlops, formatVram, formatBandwidth } from '@/utils/format'
import type { HardwareNode, ThermalState, PowerState } from '@/types/game'
import type { PcieSlotsState } from '@/domain/engine/ComputeEngine'
import type Decimal from 'break_infinity.js'

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

// ==========================================
// 1. THERMAL LED MATRIX COMPUTATIONS
// ==========================================
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
      isWarm
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

// ==========================================
// 2. POWER LOAD COMPUTATIONS
// ==========================================
const POWER_SEGMENT_COUNT = 16
const powerSegments = computed(() => {
  const loadPercent = props.powerState.gridLoadPercent
  const step = 120 / POWER_SEGMENT_COUNT
  const segments = []

  for (let i = 0; i < POWER_SEGMENT_COUNT; i++) {
    const threshold = (i + 1) * step
    const isActive = loadPercent >= threshold - step / 2
    const isOverloaded = threshold > 100
    const isStrained = threshold > 80 && threshold <= 100

    segments.push({
      index: i,
      thresholdPercent: Math.round(threshold),
      isActive,
      isOverloaded,
      isStrained
    })
  }
  return segments
})

// ==========================================
// 3. VIRTUAL RACK SLOTS COMPUTATIONS
// ==========================================
const installedGpus = computed(() => {
  return props.hardwareList.filter((hw) => hw.category === 'gpu' && hw.count > 0)
})

const emptyPcieSlotsCount = computed(() => {
  if (!props.pcieSlots) return 0
  return Math.max(0, props.pcieSlots.freeSlots)
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
        : 'border-[#21262D]'
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
      class="p-2.5 rounded bg-[#FFB800]/15 border border-[#EF4444]/60 flex items-start gap-2.5 text-[#EF4444] animate-pulse"
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
          Charge réseau : <strong class="text-[#EF4444]">{{ powerState.gridLoadPercent.toFixed(0) }}%</strong> (Capacité : {{ formatWatts(powerState.gridCapacityWatts) }}). Améliorez la grille dans l’onglet Énergie.
        </p>
      </div>
    </div>

    <!-- 2. TELEMETRY HEADER & TOGGLE -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-2.5">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
          <Activity class="w-3.5 h-3.5" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
            Télémétrie Datacenter & Rack
          </h3>
          <p class="text-[9px] text-[#8B949E]">
            Contraintes thermodynamiques, disjoncteur & nœuds de calcul
          </p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <!-- Global Efficiency Badge -->
        <span
          class="text-[10px] px-2 py-0.5 rounded border font-bold flex items-center gap-1"
          :class="[
            overallEfficiencyPercent < 80
              ? 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30'
              : overallEfficiencyPercent < 100
              ? 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/30'
              : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'
          ]"
        >
          <Gauge class="w-3 h-3" />
          Rendement : {{ overallEfficiencyPercent }}%
        </span>

        <button
          @click="isExpanded = !isExpanded"
          class="p-1 rounded hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer"
          :title="isExpanded ? 'Réduire la télémétrie' : 'Déplier la télémétrie'"
        >
          <ChevronUp v-if="isExpanded" class="w-4 h-4" />
          <ChevronDown v-else class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- COLLAPSIBLE CONTENT -->
    <div v-show="isExpanded" class="flex flex-col gap-3.5">
      <!-- 3. MATRIX THERMOMETER & POWER GAUGE GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- THERMAL MONITORING CARD -->
        <div class="bg-[#161B22]/80 border border-[#21262D] rounded-lg p-3 flex flex-col gap-2">
          <div class="flex justify-between items-center text-[10px]">
            <span class="text-[#8B949E] uppercase flex items-center gap-1">
              <Flame
                class="w-3.5 h-3.5"
                :class="thermalState.isThrottling ? 'text-[#EF4444]' : thermalState.status === 'warm' ? 'text-[#FFB800]' : 'text-[#38BDF8]'"
              />
              Thermomètre Matriciel
            </span>
            <span
              class="font-bold text-xs"
              :class="thermalState.isThrottling ? 'text-[#EF4444]' : thermalState.status === 'warm' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
            >
              {{ thermalState.temperatureCelsius.toFixed(1) }} °C
            </span>
          </div>

          <!-- LED Matrix Segments Bar -->
          <div class="flex items-center gap-0.5 bg-[#0D1117] p-1.5 rounded border border-[#21262D]/80">
            <div
              v-for="seg in ledSegments"
              :key="seg.index"
              class="flex-1 h-3 rounded-xs transition-all duration-200"
              :class="[
                !seg.isActive
                  ? 'bg-[#21262D]/40'
                  : seg.isCritical
                  ? 'bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                  : seg.isWarm
                  ? 'bg-[#FFB800] shadow-[0_0_4px_rgba(255,184,0,0.6)]'
                  : 'bg-[#00FF66] shadow-[0_0_3px_rgba(0,255,102,0.4)]'
              ]"
              :title="`${seg.thresholdTemp}°C`"
            ></div>
          </div>

          <!-- Thermal metrics sub-row -->
          <div class="flex justify-between items-center text-[9px] text-[#8B949E] pt-0.5">
            <span>Chaleur : <strong class="text-[#FFB800]">{{ formatWatts(thermalState.heatGeneratedWatts) }}</strong></span>
            <span>Dissipation : <strong class="text-[#38BDF8]">{{ formatWatts(thermalState.coolingCapacityWatts) }}</strong></span>
            <span class="flex items-center gap-1">
              <Fan
                class="w-3 h-3 text-[#38BDF8] transition-transform duration-700"
                :class="thermalLoadRatio > 0.8 ? 'animate-spin' : ''"
              />
              Ratio Q/W : {{ (thermalLoadRatio * 100).toFixed(0) }}%
            </span>
          </div>
        </div>

        <!-- POWER GRID LOAD CARD -->
        <div class="bg-[#161B22]/80 border border-[#21262D] rounded-lg p-3 flex flex-col gap-2">
          <div class="flex justify-between items-center text-[10px]">
            <span class="text-[#8B949E] uppercase flex items-center gap-1">
              <Zap
                class="w-3.5 h-3.5"
                :class="powerState.isOverloaded ? 'text-[#EF4444]' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
              />
              Charge Disjoncteur
            </span>
            <span
              class="font-bold text-xs"
              :class="powerState.isOverloaded ? 'text-[#EF4444]' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
            >
              {{ powerState.gridLoadPercent.toFixed(1) }}%
            </span>
          </div>

          <!-- Power LED Segments Bar -->
          <div class="flex items-center gap-0.5 bg-[#0D1117] p-1.5 rounded border border-[#21262D]/80">
            <div
              v-for="seg in powerSegments"
              :key="seg.index"
              class="flex-1 h-3 rounded-xs transition-all duration-200"
              :class="[
                !seg.isActive
                  ? 'bg-[#21262D]/40'
                  : seg.isOverloaded
                  ? 'bg-[#EF4444] shadow-[0_0_6px_rgba(239,68,68,0.8)]'
                  : seg.isStrained
                  ? 'bg-[#FFB800] shadow-[0_0_4px_rgba(255,184,0,0.6)]'
                  : 'bg-[#00FF66] shadow-[0_0_3px_rgba(0,255,102,0.4)]'
              ]"
              :title="`${seg.thresholdPercent}%`"
            ></div>
          </div>

          <!-- Power metrics sub-row -->
          <div class="flex justify-between items-center text-[9px] text-[#8B949E] pt-0.5">
            <span>Appel : <strong class="text-[#FFB800]">{{ formatWatts(powerState.totalDrawWatts) }}</strong></span>
            <span>Grille : <strong class="text-[#00FF66]">{{ formatWatts(powerState.gridCapacityWatts) }}</strong></span>
            <span
              class="font-bold uppercase"
              :class="powerState.isOverloaded ? 'text-[#EF4444]' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
            >
              [{{ powerState.isOverloaded ? 'TRIPPED' : powerState.status === 'strained' ? 'STRAINED' : 'OK' }}]
            </span>
          </div>
        </div>
      </div>

      <!-- 4. VIRTUAL RACK TELEMETRY VIEW -->
      <div class="bg-[#161B22]/50 border border-[#21262D] rounded-lg p-3 flex flex-col gap-2.5">
        <div class="flex justify-between items-center text-[10px] text-[#8B949E] border-b border-[#21262D]/60 pb-1.5">
          <span class="flex items-center gap-1.5 font-bold uppercase text-[#F0F6FC]">
            <Server class="w-3.5 h-3.5 text-[#38BDF8]" />
            Baie Serveur Rack & Nœuds Actifs
          </span>
          <div class="flex items-center gap-3">
            <span>Brut : <strong class="text-[#38BDF8]">{{ formatFlops(rawCompute) }}</strong></span>
            <span>Effectif : <strong class="text-[#00FF66]">{{ formatFlops(effectiveCompute) }}</strong></span>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <!-- Slot 0: Active Host Node -->
          <div
            v-if="activeHostNode"
            class="bg-[#0D1117] border border-[#38BDF8]/30 rounded p-2 flex flex-wrap items-center justify-between gap-2 text-[10px]"
          >
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 font-bold text-[9px]">
                SLOT 0 // HÔTE
              </span>
              <span class="font-bold text-[#F0F6FC]">{{ activeHostNode.name }}</span>
              <span class="text-[9px] text-[#8B949E]">Tier {{ activeHostNode.tier }}</span>
            </div>

            <div class="flex items-center gap-3 text-[#8B949E]">
              <span class="text-[#38BDF8] font-semibold flex items-center gap-1">
                <Cpu class="w-3 h-3" /> +{{ formatFlops(activeHostNode.tflops) }}
              </span>
              <span class="text-[#FFB800]">{{ formatWatts(activeHostNode.powerWatts) }}</span>
              <span class="text-[#00FF66]">{{ formatVram(activeHostNode.vram) }} RAM</span>
              <span class="text-[#38BDF8]">{{ activeHostNode.pcieSlotsProvided ?? 0 }} PCIe</span>
            </div>
          </div>

          <!-- Slots 1..N: GPU Accelerators -->
          <div
            v-for="(gpu, idx) in installedGpus"
            :key="gpu.id"
            class="bg-[#0D1117] border border-[#00FF66]/30 rounded p-2 flex flex-wrap items-center justify-between gap-2 text-[10px]"
          >
            <div class="flex items-center gap-2">
              <span class="px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 font-bold text-[9px]">
                SLOT {{ idx + 1 }} // GPU x{{ gpu.count }}
              </span>
              <span class="font-bold text-[#F0F6FC]">{{ gpu.name }}</span>
            </div>

            <div class="flex items-center gap-3 text-[#8B949E]">
              <span class="text-[#38BDF8] font-semibold">+{{ formatFlops(gpu.tflops.mul(gpu.count)) }}</span>
              <span class="text-[#FFB800]">{{ formatWatts(gpu.powerWatts.mul(gpu.count)) }}</span>
              <span class="text-[#00FF66]">{{ formatVram(gpu.vram.mul(gpu.count)) }} VRAM</span>
              <span class="text-[#A855F7]">{{ formatBandwidth(gpu.memoryBandwidthGBs.mul(gpu.count)) }}</span>
            </div>
          </div>

          <!-- Empty PCIe Slots Indicator -->
          <div
            v-if="emptyPcieSlotsCount > 0"
            class="border border-dashed border-[#21262D] rounded p-2 flex items-center justify-between text-[9px] text-[#8B949E] bg-[#161B22]/20"
          >
            <span class="flex items-center gap-1.5">
              <Layers class="w-3 h-3 text-[#38BDF8]/60" />
              {{ emptyPcieSlotsCount }} Emplacement(s) PCIe x16 libre(s)
            </span>
            <span class="text-[#38BDF8]/70">Prêt pour accélérateur GPU</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
