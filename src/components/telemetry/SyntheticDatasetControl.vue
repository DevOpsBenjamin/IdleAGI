<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Power, ShieldAlert } from 'lucide-vue-next'
import { formatNumber } from '@/utils/format'
import type Decimal from 'break_infinity.js'


const props = withDefaults(
  defineProps<{
    isSyntheticActive?: boolean
    syntheticRatio?: number // 0.0 to 1.0
    syntheticRateCharsPerSec?: Decimal | number
    syntheticTextProduced?: Decimal
    modelCollapseActive?: boolean
    collapseThreshold?: number // default 0.70
    unlocked?: boolean
  }>(),
  {
    isSyntheticActive: false,
    syntheticRatio: 0,
    syntheticRateCharsPerSec: 0,
    modelCollapseActive: false,
    collapseThreshold: 0.70,
    unlocked: true,
  },
)

const emit = defineEmits<{
  (e: 'toggle-synthetic'): void
}>()

const ratioPercent = computed(() => Math.round((props.syntheticRatio ?? 0) * 100))
const thresholdPercent = computed(() => Math.round((props.collapseThreshold ?? 0.70) * 100))

const statusLabel = computed(() => {
  if (props.modelCollapseActive) return 'Model Collapse Détecté'
  if (!props.isSyntheticActive) return 'Synthèse en Veille'
  if (ratioPercent.value > thresholdPercent.value) return 'Zone Critique'
  return 'Génération Optimale'
})

const statusBadgeClass = computed(() => {
  if (props.modelCollapseActive) {
    return 'bg-[#FF0055]/20 text-[#FF0055] border-[#FF0055]/50 animate-pulse'
  }
  if (!props.isSyntheticActive) {
    return 'bg-[#161B22] text-[#8B949E] border-[#21262D]'
  }
  if (ratioPercent.value > thresholdPercent.value) {
    return 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40'
  }
  return 'bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/40'
})

const gaugeFillClass = computed(() => {
  if (props.modelCollapseActive || ratioPercent.value >= thresholdPercent.value) {
    return 'bg-gradient-to-r from-[#FFB800] to-[#FF0055]'
  }
  return 'bg-gradient-to-r from-[#38BDF8] via-[#A855F7] to-[#A855F7]'
})
</script>

<template>
  <div
    v-if="unlocked"
    class="bg-[#0D1117] border rounded-lg p-3 sm:p-4 flex flex-col gap-3 transition-colors duration-300"
    :class="
      modelCollapseActive
        ? 'border-[#FF0055]/60 shadow-[0_0_20px_rgba(255,0,85,0.15)]'
        : 'border-[#A855F7]/30 bg-[#0D1117]/80'
    "
  >
    <!-- Section Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-2.5">
      <div class="flex items-center gap-2">
        <div
          class="p-1 rounded"
          :class="modelCollapseActive ? 'bg-[#FF0055]/20 text-[#FF0055]' : 'bg-[#A855F7]/10 text-[#A855F7]'"
        >
          <Sparkles class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider font-mono">
            Générateur de Datasets Synthétiques
          </h3>
          <p class="text-[10px] text-[#8B949E] font-mono">Auto-ingestion neuronale Tier 2</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span
          class="text-[10px] px-2 py-0.5 rounded border font-mono font-bold uppercase transition-all"
          :class="statusBadgeClass"
        >
          {{ statusLabel }}
        </span>

        <!-- Toggle Button -->
        <button
          type="button"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold transition-all min-h-[36px] active:scale-95 cursor-pointer"
          :class="
            isSyntheticActive
              ? 'bg-[#A855F7]/20 border border-[#A855F7] text-[#A855F7] shadow-[0_0_10px_rgba(168,85,247,0.3)]'
              : 'bg-[#161B22] border border-[#21262D] text-[#8B949E] hover:border-[#8B949E]'
          "
          @click="emit('toggle-synthetic')"
        >
          <Power class="w-3.5 h-3.5" :class="isSyntheticActive ? 'text-[#A855F7]' : 'text-[#8B949E]'" />
          <span>{{ isSyntheticActive ? 'ACTIF' : 'OFF' }}</span>
        </button>
      </div>
    </div>

    <!-- Telemetry Metrics Grid -->
    <div class="grid grid-cols-2 gap-2 text-xs font-mono">
      <div class="bg-[#161B22]/70 border border-[#21262D] p-2.5 rounded-lg flex flex-col gap-1">
        <span class="text-[10px] text-[#8B949E]">Débit Synthétique</span>
        <div class="text-sm font-bold text-[#A855F7]">
          +{{ formatNumber(syntheticRateCharsPerSec) }} <span class="text-[10px] text-[#8B949E]">chars/s</span>
        </div>
      </div>

      <div class="bg-[#161B22]/70 border border-[#21262D] p-2.5 rounded-lg flex flex-col gap-1">
        <span class="text-[10px] text-[#8B949E]">Ratio Synthétique</span>
        <div
          class="text-sm font-bold"
          :class="ratioPercent > thresholdPercent ? 'text-[#FF0055]' : 'text-[#F0F6FC]'"
        >
          {{ ratioPercent }}% <span class="text-[10px] text-[#8B949E]">/ Seuil {{ thresholdPercent }}%</span>
        </div>
      </div>
    </div>

    <!-- Segmented Ratio Gauge -->
    <div class="flex flex-col gap-1.5 font-mono">
      <div class="flex items-center justify-between text-[11px]">
        <span class="text-[#8B949E] flex items-center gap-1">
          <span>Pureté de l'Ingestion</span>
          <span v-if="ratioPercent <= thresholdPercent" class="text-[#00FF66] text-[10px]">(Saine)</span>
        </span>
        <span
          class="font-bold"
          :class="ratioPercent > thresholdPercent ? 'text-[#FF0055]' : 'text-[#A855F7]'"
        >
          {{ ratioPercent }}% Synthétique
        </span>
      </div>

      <div class="w-full bg-[#161B22] border border-[#21262D] rounded-full h-2.5 p-0.5 relative overflow-hidden">
        <!-- Safety Threshold Marker -->
        <div
          class="absolute top-0 bottom-0 w-0.5 bg-[#FF0055]/70 z-10"
          :style="{ left: `${thresholdPercent}%` }"
          title="Seuil critique de Model Collapse"
        ></div>

        <!-- Gauge Bar -->
        <div
          class="h-full rounded-full transition-all duration-300"
          :class="gaugeFillClass"
          :style="{ width: `${Math.min(100, Math.max(0, ratioPercent))}%` }"
        ></div>
      </div>
    </div>

    <!-- Model Collapse Banner Warning -->
    <div
      v-if="modelCollapseActive"
      class="p-2.5 rounded-lg bg-[#FF0055]/15 border border-[#FF0055]/60 flex items-start gap-2.5 text-xs text-[#FF0055] font-mono animate-pulse"
    >
      <ShieldAlert class="w-4 h-4 shrink-0 mt-0.5 text-[#FF0055]" />
      <div class="flex flex-col gap-0.5">
        <span class="font-bold uppercase tracking-wider">⚠️ Effondrement de Modèle en Cours</span>
        <span class="text-[11px] text-[#FFA8C5]">
          Le buffer d'ingestion est saturé de données auto-générées (> {{ thresholdPercent }}%). La dérive d'entropie est doublée (+100%) et l'efficacité d'entraînement est réduite de 50%.
        </span>
      </div>
    </div>
  </div>
</template>
