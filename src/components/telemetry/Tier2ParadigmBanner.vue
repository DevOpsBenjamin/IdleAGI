<script setup lang="ts">
import { Sparkles, RotateCcw } from 'lucide-vue-next'
import type Decimal from 'break_infinity.js'

defineProps<{
  parameters: Decimal
  totalInsights?: number
  hasParadigmUnlocked?: boolean
  canTriggerTier2?: boolean
  pendingInsights?: number
  insights?: number
  activeParadigmName?: string
  activeParadigmTflopsMult?: number
}>()

const emit = defineEmits<{
  (e: 'open-paradigm-modal'): void
  (e: 'trigger-tier2-prestige'): void
}>()
</script>

<template>
  <div
    v-if="parameters.gte(100000000) || (totalInsights ?? 0) > 0 || hasParadigmUnlocked"
    class="mt-1 p-3 rounded-lg bg-[#161B22]/90 border border-[#A855F7]/40 flex flex-col gap-2.5 shadow-[0_0_15px_rgba(168,85,247,0.15)] font-mono"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-xs font-bold text-[#F0F6FC]">
        <Sparkles class="w-4 h-4 text-[#A855F7] animate-pulse" />
        <span>Paradigmes IA // Tier 2</span>
      </div>
      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded border"
        :class="
          canTriggerTier2
            ? 'bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/40'
            : 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30'
        "
      >
        {{ canTriggerTier2 ? `+${pendingInsights} $\\Phi$ Disponibles` : 'Seuil : 1.00B Params' }}
      </span>
    </div>

    <div class="text-[11px] text-[#8B949E] leading-relaxed flex items-center justify-between">
      <span>
        Architecture active : <strong class="text-[#A855F7]">{{ activeParadigmName ?? 'Dense Transformer' }}</strong>
      </span>
      <span v-if="(activeParadigmTflopsMult ?? 1) > 1" class="text-[#00FF66] font-bold text-[10px]">
        x{{ activeParadigmTflopsMult?.toFixed(1) }} TFLOPS
      </span>
    </div>

    <div class="grid grid-cols-2 gap-2 pt-1">
      <button
        type="button"
        @click="emit('open-paradigm-modal')"
        class="min-h-[40px] px-3 py-2 rounded-lg bg-[#A855F7]/15 hover:bg-[#A855F7]/25 border border-[#A855F7]/40 text-[#A855F7] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 touch-manipulation"
      >
        <Sparkles class="w-3.5 h-3.5" />
        <span>Paradigmes ({{ insights ?? 0 }} $\Phi$)</span>
      </button>

      <button
        type="button"
        :disabled="!canTriggerTier2 && (pendingInsights ?? 0) <= 0"
        @click="emit('trigger-tier2-prestige')"
        class="min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all select-none touch-manipulation"
        :class="
          canTriggerTier2 || (pendingInsights ?? 0) > 0
            ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer active:scale-95'
            : 'bg-[#21262D] text-[#8B949E] border border-transparent cursor-not-allowed opacity-60'
        "
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>{{ (pendingInsights ?? 0) > 0 ? `Reset (+${pendingInsights} $\\Phi$)` : 'Non Éligible' }}</span>
      </button>
    </div>
  </div>
</template>
