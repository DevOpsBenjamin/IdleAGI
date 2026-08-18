<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import type Decimal from 'break_infinity.js'

defineProps<{
  parameters: Decimal
  activeParadigmName?: string
  singularitiesCompleted?: number
  canTriggerSingularity?: boolean
  qualifiedEndingTitle?: string
  qualifiedEndingColor?: string
  chronoCores?: number
}>()

const emit = defineEmits<{
  (e: 'open-singularity-modal'): void
}>()
</script>

<template>
  <div
    v-if="parameters.gte(100000000000) || activeParadigmName?.includes('Quantum') || (singularitiesCompleted ?? 0) > 0 || canTriggerSingularity"
    class="mt-1 p-3 rounded-lg bg-[#07090E] border border-[#00FF66]/50 flex flex-col gap-2.5 shadow-[0_0_20px_rgba(0,255,102,0.15)] font-mono"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-xs font-bold text-[#F0F6FC]">
        <Sparkles class="w-4 h-4 text-[#00FF66] animate-pulse" />
        <span>Singularité & ASI // Tier 3</span>
      </div>
      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded border"
        :class="
          canTriggerSingularity
            ? 'bg-[#00FF66]/20 text-[#00FF66] border-[#00FF66]/50 shadow-[0_0_8px_rgba(0,255,102,0.3)] animate-pulse'
            : 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30'
        "
      >
        {{ canTriggerSingularity ? 'Émergence ASI Prête !' : 'Seuil : 1.00T Params + Quantum' }}
      </span>
    </div>

    <div class="text-[11px] text-[#8B949E] leading-relaxed flex items-center justify-between">
      <span>
        Épilogue qualifié : <strong :style="{ color: qualifiedEndingColor ?? '#00FF66' }">{{ qualifiedEndingTitle ?? 'Symbiose Bienveillante' }}</strong>
      </span>
      <span v-if="(chronoCores ?? 0) > 0" class="text-[#38BDF8] font-bold text-[10px]">
        {{ chronoCores }} $\Omega$ (x{{ (1 + (chronoCores ?? 0)).toFixed(1) }} All)
      </span>
    </div>

    <div class="pt-1">
      <button
        type="button"
        @click="emit('open-singularity-modal')"
        class="w-full min-h-[42px] px-4 py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 touch-manipulation"
        :class="
          canTriggerSingularity
            ? 'bg-gradient-to-r from-[#00FF66] via-[#38BDF8] to-[#A855F7] text-black shadow-[0_0_15px_rgba(0,255,102,0.4)] hover:brightness-110'
            : 'bg-[#00FF66]/15 hover:bg-[#00FF66]/25 border border-[#00FF66]/40 text-[#00FF66]'
        "
      >
        <Sparkles class="w-4 h-4" />
        <span>{{ canTriggerSingularity ? 'Déclencher la Singularité Technologique (Tier 3)' : 'Examiner la Singularité & Galerie' }}</span>
      </button>
    </div>
  </div>
</template>
