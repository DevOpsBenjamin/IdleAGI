<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, Sparkles, Gauge, Activity } from 'lucide-vue-next'
import { formatNumber, formatFlops, formatVram, formatBandwidth } from '@/utils/format'
import CognitiveTelemetry from './telemetry/CognitiveTelemetry.vue'
import Tier1PrestigeBanner from './telemetry/Tier1PrestigeBanner.vue'
import Tier2ParadigmBanner from './telemetry/Tier2ParadigmBanner.vue'
import Tier3SingularityBanner from './telemetry/Tier3SingularityBanner.vue'
import type { CognitiveStatus } from '@/types/cognitive'
import type Decimal from 'break_infinity.js'

const props = withDefaults(
  defineProps<{
    parameters: Decimal
    totalVramGB: Decimal
    totalMemoryBandwidthGBs?: Decimal
    bandwidthSpeedMultiplier?: number
    effectiveCompute: Decimal
    thermalEfficiency: number
    modelQualityMultiplier?: number
    canPrestige?: boolean
    pendingAP?: number
    architecturePoints?: number
    totalArchitecturePoints?: number
    // Cognitive props
    entropy?: number
    alignment?: number
    cognitiveStatus?: CognitiveStatus
    rlhfCost?: Decimal | number
    rlhfBatchCount?: number
    canPerformRlhf?: boolean
    apiMultiplier?: number
    researchMultiplier?: number
    isTrainingActive?: boolean
    showCognitive?: boolean
    // Paradigm props (Tier 2)
    canTriggerTier2?: boolean
    pendingInsights?: number
    insights?: number
    totalInsights?: number
    activeParadigmName?: string
    activeParadigmTflopsMult?: number
    hasParadigmUnlocked?: boolean
    // Singularity props (Tier 3)
    canTriggerSingularity?: boolean
    chronoCores?: number
    singularitiesCompleted?: number
    qualifiedEndingTitle?: string
    qualifiedEndingColor?: string
  }>(),
  {
    showCognitive: true,
    hasParadigmUnlocked: false,
    canTriggerSingularity: false,
    chronoCores: 0,
    singularitiesCompleted: 0,
  },
)

const emit = defineEmits<{
  (e: 'open-talent-tree'): void
  (e: 'trigger-prestige'): void
  (e: 'perform-rlhf'): void
  (e: 'open-paradigm-modal'): void
  (e: 'trigger-tier2-prestige'): void
  (e: 'open-singularity-modal'): void
}>()

const paramsFormatted = computed(() => formatNumber(props.parameters))
const vramFormatted = computed(() => formatVram(props.totalVramGB))
const bandwidthFormatted = computed(() => {
  return props.totalMemoryBandwidthGBs ? formatBandwidth(props.totalMemoryBandwidthGBs) : '0 Go/s'
})
const qualityDisplay = computed(() => {
  const mult = props.modelQualityMultiplier ?? 1.0
  return `x${mult.toFixed(2)}`
})
const speedDisplay = computed(() => {
  const mult = props.bandwidthSpeedMultiplier ?? 1.0
  return `x${mult.toFixed(2)}`
})
const shouldShowCognitive = computed(() => props.showCognitive ?? true)
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-3 font-mono">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded bg-[#00FF66]/10 text-[#00FF66]">
          <Cpu class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
          2. Métriques Modèle & Télémétrie
        </h3>
      </div>
      <div class="flex items-center gap-1.5 text-[10px] font-mono text-[#00FF66]">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
        Actif
      </div>
    </div>

    <!-- Telemetry Cards Grid -->
    <div class="grid grid-cols-2 gap-2.5">
      <!-- Parameters -->
      <div class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
        <div class="text-[11px] text-[#8B949E] flex items-center justify-between">
          <span>Poids / Paramètres</span>
          <Gauge class="w-3 h-3 text-[#38BDF8]" />
        </div>
        <div class="text-base font-bold text-[#F0F6FC] font-mono tracking-wide">
          {{ paramsFormatted }}
        </div>
        <div class="text-[9px] text-[#8B949E] font-mono">Complexité cognitive</div>
      </div>

      <!-- Quality Multiplier on API Pricing -->
      <div class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
        <div class="text-[11px] text-[#8B949E] flex items-center justify-between">
          <span>Valeur Requête API</span>
          <Sparkles class="w-3 h-3 text-[#00FF66]" />
        </div>
        <div class="text-base font-bold text-[#00FF66] font-mono tracking-wide">
          {{ qualityDisplay }}
        </div>
        <div class="text-[9px] text-[#00FF66]/80 font-mono">Bonus intelligence IA</div>
      </div>

      <!-- Effective Compute -->
      <div class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
        <div class="text-[11px] text-[#8B949E] flex items-center justify-between">
          <span>Puissance Réelle</span>
          <Cpu class="w-3 h-3 text-[#38BDF8]" />
        </div>
        <div class="text-base font-bold text-[#38BDF8] font-mono tracking-wide">
          {{ formatFlops(effectiveCompute) }}
        </div>
        <div class="text-[9px] text-[#8B949E] font-mono">
          Efficacité thermique : {{ Math.round(thermalEfficiency * 100) }}%
        </div>
      </div>

      <!-- Memory Bandwidth & VRAM -->
      <div class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
        <div class="text-[11px] text-[#8B949E] flex items-center justify-between">
          <span>Bande Passante RAM</span>
          <Activity class="w-3 h-3 text-[#FFB800]" />
        </div>
        <div class="text-base font-bold text-[#FFB800] font-mono tracking-wide">
          {{ bandwidthFormatted }}
        </div>
        <div class="text-[9px] text-[#8B949E] font-mono flex items-center justify-between">
          <span>VRAM : {{ vramFormatted }}</span>
          <span class="text-[#00FF66] font-bold">{{ speedDisplay }} Vitesse</span>
        </div>
      </div>
    </div>

    <!-- Cognitive Model Section (Entropy, Alignment, Multipliers & RLHF) -->
    <CognitiveTelemetry
      v-if="shouldShowCognitive"
      :entropy="entropy"
      :alignment="alignment"
      :status="cognitiveStatus"
      :rlhf-cost="rlhfCost"
      :rlhf-batch-count="rlhfBatchCount"
      :can-perform-rlhf="canPerformRlhf"
      :api-multiplier="apiMultiplier"
      :research-multiplier="researchMultiplier"
      :is-training-active="isTrainingActive"
      @perform-rlhf="emit('perform-rlhf')"
    />

    <!-- Tier 1 Checkpoint & Talent Tree Banner -->
    <Tier1PrestigeBanner
      :parameters="parameters"
      :can-prestige="canPrestige"
      :pending-a-p="pendingAP"
      :architecture-points="architecturePoints"
      :total-architecture-points="totalArchitecturePoints"
      @open-talent-tree="emit('open-talent-tree')"
      @trigger-prestige="emit('trigger-prestige')"
    />

    <!-- Tier 2 Paradigm Shift Banner -->
    <Tier2ParadigmBanner
      :parameters="parameters"
      :total-insights="totalInsights"
      :has-paradigm-unlocked="hasParadigmUnlocked"
      :can-trigger-tier2="canTriggerTier2"
      :pending-insights="pendingInsights"
      :insights="insights"
      :active-paradigm-name="activeParadigmName"
      :active-paradigm-tflops-mult="activeParadigmTflopsMult"
      @open-paradigm-modal="emit('open-paradigm-modal')"
      @trigger-tier2-prestige="emit('trigger-tier2-prestige')"
    />

    <!-- Tier 3 Singularity Banner -->
    <Tier3SingularityBanner
      :parameters="parameters"
      :active-paradigm-name="activeParadigmName"
      :singularities-completed="singularitiesCompleted"
      :can-trigger-singularity="canTriggerSingularity"
      :qualified-ending-title="qualifiedEndingTitle"
      :qualified-ending-color="qualifiedEndingColor"
      :chrono-cores="chronoCores"
      @open-singularity-modal="emit('open-singularity-modal')"
    />
  </div>
</template>
