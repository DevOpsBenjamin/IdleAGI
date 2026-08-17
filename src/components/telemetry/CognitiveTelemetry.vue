<script setup lang="ts">
import { computed } from 'vue'
import {
  Brain,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Activity,
} from 'lucide-vue-next'
import { formatNumber } from '@/utils/format'
import type { CognitiveStatus } from '@/types/cognitive'
import type Decimal from 'break_infinity.js'

const props = withDefaults(
  defineProps<{
    entropy?: number
    alignment?: number
    status?: CognitiveStatus
    rlhfCost?: Decimal | number
    rlhfBatchCount?: number
    canPerformRlhf?: boolean
    apiMultiplier?: number
    researchMultiplier?: number
    isTrainingActive?: boolean
  }>(),
  {
    entropy: 0.0,
    alignment: 1.0,
    status: 'nominal',
    rlhfCost: 50,
    rlhfBatchCount: 0,
    canPerformRlhf: true,
    apiMultiplier: 1.0,
    researchMultiplier: 1.0,
    isTrainingActive: false,
  },
)

const emit = defineEmits<{
  (e: 'perform-rlhf'): void
}>()

const entropyPercent = computed(() => (props.entropy * 100).toFixed(1))
const alignmentPercent = computed(() => (props.alignment * 100).toFixed(1))

const isDivergent = computed(
  () => props.status === 'divergent' || (props.entropy >= 0.30 && props.entropy < 0.70),
)
const isCritical = computed(
  () => props.status === 'critical_hallucination' || props.entropy >= 0.70,
)

const formattedRlhfCost = computed(() => formatNumber(props.rlhfCost))

const statusBadge = computed(() => {
  if (isCritical.value) {
    return {
      label: 'HALLUCINATION CRITIQUE',
      bgClass: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/40 animate-pulse',
      icon: Flame,
    }
  }
  if (isDivergent.value) {
    return {
      label: 'ÉMERGENT / CRÉATIF',
      bgClass: 'bg-[#FFB800]/15 text-[#FFB800] border-[#FFB800]/40',
      icon: Sparkles,
    }
  }
  return {
    label: 'STABLE / NOMINAL',
    bgClass: 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30',
    icon: ShieldCheck,
  }
})

const entropyBarColor = computed(() => {
  if (isCritical.value) return 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]'
  if (isDivergent.value) return 'bg-[#FFB800] shadow-[0_0_8px_rgba(255,184,0,0.5)]'
  return 'bg-[#00FF66] shadow-[0_0_6px_rgba(0,255,102,0.4)]'
})

const rlhfDisabled = computed(() => !props.canPerformRlhf || props.entropy <= 0.001)

function handleRlhf() {
  if (!rlhfDisabled.value) {
    emit('perform-rlhf')
  }
}
</script>

<template>
  <div class="p-3 rounded-lg bg-[#161B22]/90 border border-[#21262D] flex flex-col gap-3">
    <!-- Header with Status Badge -->
    <div class="flex items-center justify-between border-b border-[#21262D]/80 pb-2.5">
      <div class="flex items-center gap-2">
        <div
          class="p-1 rounded transition-colors"
          :class="
            isCritical
              ? 'bg-[#EF4444]/20 text-[#EF4444]'
              : isDivergent
                ? 'bg-[#FFB800]/20 text-[#FFB800]'
                : 'bg-[#38BDF8]/20 text-[#38BDF8]'
          "
        >
          <Brain class="w-4 h-4" />
        </div>
        <div>
          <h4 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider flex items-center gap-1.5">
            Modèle Cognitif & Alignement
            <span
              v-if="isTrainingActive"
              class="inline-block w-1.5 h-1.5 rounded-full bg-[#FFB800] animate-ping"
              title="Entraînement en cours (production d'entropie)"
            ></span>
          </h4>
        </div>
      </div>

      <!-- Regime Badge -->
      <div
        class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border flex items-center gap-1"
        :class="statusBadge.bgClass"
      >
        <component :is="statusBadge.icon" class="w-3 h-3" />
        <span>{{ statusBadge.label }}</span>
      </div>
    </div>

    <!-- Critical Alert Banner (when critical hallucination) -->
    <div
      v-if="isCritical"
      class="p-2.5 rounded-md bg-[#EF4444]/15 border border-[#EF4444]/50 flex items-start gap-2 text-[11px] text-[#F87171] leading-snug animate-pulse"
    >
      <AlertTriangle class="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
      <div>
        <strong class="font-bold text-[#EF4444]">DÉRIVE COGNITIVE CRITIQUE :</strong>
        Le modèle hallucine massivement. Rejet API sévère (-{{ ((1 - apiMultiplier) * 100).toFixed(0) }}%).
        Effectuez un <span class="underline font-bold">Human RLHF Batch</span> pour stabiliser le réseau.
      </div>
    </div>

    <!-- Gauges Grid: Entropy & Alignment -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
      <!-- Entropy Gauge Card -->
      <div class="bg-[#0D1117]/80 border border-[#21262D] p-2.5 rounded-md flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-[11px] font-mono">
          <span class="text-[#8B949E] flex items-center gap-1">
            <Flame class="w-3 h-3 text-[#FFB800]" />
            Entropie
          </span>
          <span
            class="font-bold font-mono"
            :class="
              isCritical
                ? 'text-[#EF4444]'
                : isDivergent
                  ? 'text-[#FFB800]'
                  : 'text-[#00FF66]'
            "
          >
            {{ entropyPercent }}%
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-2 bg-[#21262D] rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="entropyBarColor"
            :style="{ width: `${Math.min(100, Math.max(0, entropy * 100))}%` }"
          ></div>
        </div>

        <div class="text-[9px] text-[#8B949E] font-mono flex items-center justify-between pt-0.5">
          <span>Bruit synaptique</span>
          <span v-if="isTrainingActive" class="text-[#FFB800]">+ Dérive active</span>
          <span v-else class="text-[#8B949E]">Stable</span>
        </div>
      </div>

      <!-- Alignment Gauge Card -->
      <div class="bg-[#0D1117]/80 border border-[#21262D] p-2.5 rounded-md flex flex-col gap-1.5">
        <div class="flex items-center justify-between text-[11px] font-mono">
          <span class="text-[#8B949E] flex items-center gap-1">
            <ShieldCheck class="w-3 h-3 text-[#38BDF8]" />
            Alignement
          </span>
          <span class="font-bold font-mono text-[#38BDF8]">
            {{ alignmentPercent }}%
          </span>
        </div>

        <!-- Progress Bar -->
        <div class="w-full h-2 bg-[#21262D] rounded-full overflow-hidden">
          <div
            class="h-full rounded-full bg-[#38BDF8] shadow-[0_0_6px_rgba(56,189,248,0.4)] transition-all duration-300"
            :style="{ width: `${Math.min(100, Math.max(0, alignment * 100))}%` }"
          ></div>
        </div>

        <div class="text-[9px] text-[#8B949E] font-mono flex items-center justify-between pt-0.5">
          <span>Factualité & Sécurité</span>
          <span class="text-[#38BDF8]">100 - E</span>
        </div>
      </div>
    </div>

    <!-- Impact Multipliers Bar -->
    <div class="grid grid-cols-2 gap-2 text-[10px] font-mono">
      <!-- API Pricing Multiplier -->
      <div class="bg-[#0D1117]/60 border border-[#21262D] p-2 rounded flex items-center justify-between">
        <span class="text-[#8B949E] flex items-center gap-1">
          <TrendingDown class="w-3 h-3 text-[#38BDF8]" />
          Multiplicateur API :
        </span>
        <span
          class="font-bold"
          :class="apiMultiplier < 0.9 ? 'text-[#EF4444]' : 'text-[#00FF66]'"
        >
          x{{ apiMultiplier.toFixed(2) }}
        </span>
      </div>

      <!-- R&D Creativity Multiplier -->
      <div class="bg-[#0D1117]/60 border border-[#21262D] p-2 rounded flex items-center justify-between">
        <span class="text-[#8B949E] flex items-center gap-1">
          <TrendingUp class="w-3 h-3 text-[#FFB800]" />
          Bonus Créativité R&D :
        </span>
        <span
          class="font-bold"
          :class="researchMultiplier > 1.05 ? 'text-[#FFB800]' : 'text-[#8B949E]'"
        >
          +{{ ((researchMultiplier - 1.0) * 100).toFixed(0) }}%
        </span>
      </div>
    </div>

    <!-- Tactical Action Button: Human RLHF Batch -->
    <div class="pt-1">
      <button
        type="button"
        :disabled="rlhfDisabled"
        @click="handleRlhf"
        class="w-full min-h-[44px] px-3 py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-between transition-all select-none touch-manipulation"
        :class="
          rlhfDisabled
            ? 'bg-[#21262D] text-[#8B949E] border border-transparent cursor-not-allowed opacity-60'
            : 'bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 border border-[#38BDF8]/50 text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.15)] cursor-pointer active:scale-95'
        "
      >
        <div class="flex items-center gap-2">
          <Activity class="w-4 h-4 text-[#38BDF8]" />
          <span>Human RLHF Batch (-15% Entropie)</span>
        </div>
        <div class="flex items-center gap-1.5 text-[11px]">
          <span class="text-[#8B949E]">Coût :</span>
          <span class="font-bold text-[#00FF66]">${{ formattedRlhfCost }}</span>
          <span v-if="rlhfBatchCount > 0" class="text-[9px] text-[#8B949E] font-normal">
            (#{{ rlhfBatchCount }})
          </span>
        </div>
      </button>
    </div>
  </div>
</template>
