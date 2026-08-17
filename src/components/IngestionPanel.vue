<script setup lang="ts">
import { computed } from 'vue'
import { Layers, Cpu } from 'lucide-vue-next'
import { formatNumber } from '@/utils/format'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  rawTextCurrent: Decimal
  rawTextMax: Decimal
  rawTextRate: Decimal
  tokensCurrent: Decimal
  tokensMax: Decimal
  tokensRate: Decimal
  hasCpu: boolean
  effectiveCompute: Decimal
}>()

const tokenPercent = computed(() => {
  if (props.tokensMax.lte(0)) return 0
  return Math.min(100, (props.tokensCurrent.toNumber() / props.tokensMax.toNumber()) * 100)
})

const tokenizingCapacity = computed(() => {
  return props.effectiveCompute.mul(50)
})
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-4 shadow-lg animate-fadeIn">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20">
          <Layers class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider font-mono">
            2. Tokenizer BPE & Buffer ($T$)
          </h3>
          <p class="text-[10px] text-[#8B949E] font-mono">
            Conversion vectorielle 4 Chars &rarr; 1 Token
          </p>
        </div>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20">
        Phase 2
      </span>
    </div>

    <!-- Pipeline Conversion Flow Banner -->
    <div class="p-2.5 rounded-lg border bg-[#00FF66]/5 border-[#00FF66]/20 text-xs font-mono flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 text-[#00FF66]">
        <Cpu class="w-4 h-4 shrink-0" />
        <span class="text-[11px]">
          Tokenizer BPE Actif : {{ formatNumber(tokenizingCapacity) }} T/s max
        </span>
      </div>
      <span class="text-[9px] px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30">
        4 Chars &rarr; 1 $T$
      </span>
    </div>

    <!-- Token Output Buffer -->
    <div class="space-y-2 bg-[#161B22]/60 border border-[#21262D] rounded-lg p-3">
      <div class="flex justify-between items-center text-xs font-mono">
        <span class="text-[#8B949E] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
          Processed Tokens Buffer ($T$)
        </span>
        <span class="font-bold text-[#00FF66]">
          {{ formatNumber(tokensCurrent) }} / {{ formatNumber(tokensMax) }} $T$
        </span>
      </div>

      <!-- Meter -->
      <div class="w-full bg-[#0D1117] h-2.5 rounded-full overflow-hidden border border-[#21262D] relative">
        <div
          class="bg-gradient-to-r from-[#059669] to-[#00FF66] h-full transition-all duration-150"
          :style="{ width: `${tokenPercent}%` }"
        ></div>
      </div>

      <div class="flex justify-between items-center text-[10px] font-mono text-[#8B949E]">
        <span>Stockage : {{ tokenPercent.toFixed(1) }}%</span>
        <span class="text-[#00FF66] font-bold">
          Flux net : {{ formatNumber(tokensRate) }}/s
        </span>
      </div>

      <p class="text-[10px] text-[#8B949E] leading-relaxed pt-1 border-t border-[#21262D]/60">
        Les tokens sont consommés en continu par les requêtes d'Inférence ($) et l'Entraînement Neuronal (Poids).
      </p>
    </div>
  </div>
</template>
