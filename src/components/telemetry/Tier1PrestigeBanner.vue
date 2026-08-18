<script setup lang="ts">
import { Zap, Sparkles, Cpu } from 'lucide-vue-next'
import type Decimal from 'break_infinity.js'

defineProps<{
  parameters: Decimal
  canPrestige?: boolean
  pendingAP?: number
  architecturePoints?: number
  totalArchitecturePoints?: number
}>()

const emit = defineEmits<{
  (e: 'open-talent-tree'): void
  (e: 'trigger-prestige'): void
}>()
</script>

<template>
  <div
    v-if="parameters.gte(500000) || (totalArchitecturePoints ?? 0) > 0"
    class="mt-1 p-3 rounded-lg bg-[#161B22]/90 border border-[#38BDF8]/40 flex flex-col gap-2.5 shadow-[0_0_15px_rgba(56,189,248,0.1)] font-mono"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-xs font-bold text-[#F0F6FC]">
        <Zap class="w-4 h-4 text-[#38BDF8] animate-pulse" />
        <span>Checkpoint & Fine-Tuning</span>
      </div>
      <span
        class="text-[10px] font-bold px-2 py-0.5 rounded border"
        :class="
          canPrestige
            ? 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'
            : 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30'
        "
      >
        {{ canPrestige ? `+${pendingAP} AP Disponibles` : 'Seuil : 1.00M Params' }}
      </span>
    </div>

    <div class="text-[11px] text-[#8B949E] leading-relaxed">
      Figez les poids synaptiques du modèle pour convertir vos connaissances en
      <strong class="text-[#38BDF8]">Points d'Architecture permanents</strong>.
    </div>

    <div class="grid grid-cols-2 gap-2 pt-1">
      <button
        type="button"
        @click="emit('open-talent-tree')"
        class="min-h-[40px] px-3 py-2 rounded-lg bg-[#38BDF8]/15 hover:bg-[#38BDF8]/25 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 touch-manipulation"
      >
        <Sparkles class="w-3.5 h-3.5" />
        <span>Arbre de Talents ({{ architecturePoints ?? 0 }} AP)</span>
      </button>

      <button
        type="button"
        :disabled="!canPrestige"
        @click="emit('trigger-prestige')"
        class="min-h-[40px] px-3 py-2 rounded-lg text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all select-none touch-manipulation"
        :class="
          canPrestige
            ? 'bg-[#00FF66] hover:bg-[#00DD55] text-black shadow-[0_0_12px_rgba(0,255,102,0.3)] cursor-pointer active:scale-95'
            : 'bg-[#21262D] text-[#8B949E] border border-transparent cursor-not-allowed opacity-60'
        "
      >
        <Cpu class="w-3.5 h-3.5" />
        <span>{{ canPrestige ? `Prestige (+${pendingAP} AP)` : 'Non Éligible' }}</span>
      </button>
    </div>
  </div>
</template>
