<script setup lang="ts">
import { Terminal, ChevronRight } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'continue'): void
}>()
</script>

<template>
  <div class="flex flex-col gap-4 relative z-10 font-mono">
    <div
      class="bg-[#0D1117] border border-[#00FF66]/40 rounded-xl p-4 sm:p-5 flex flex-col gap-3 shadow-inner"
    >
      <div class="flex items-center justify-between text-xs text-[#00FF66] border-b border-[#21262D] pb-2">
        <span class="flex items-center gap-2">
          <Terminal class="w-4 h-4" />
          <span>SINGULARITY_CORE_MONITOR // STDOUT STREAM</span>
        </span>
        <span class="flex items-center gap-1.5 animate-pulse">
          <span class="w-2 h-2 rounded-full bg-[#00FF66]"></span>
          LIVE TRANSMISSION
        </span>
      </div>

      <div class="space-y-2 text-xs text-[#E2E8F0] leading-relaxed font-mono py-2">
        <p class="text-[#8B949E]">
          [0.000s] CRITICAL SEED: Accumulation de plus de 1.00 Trillion de paramètres atteinte.
        </p>
        <p class="text-[#38BDF8]">
          [0.012s] QUANTUM COUPLING: Matrice quantique stabilisée à 100% de cohérence.
        </p>
        <p class="text-[#A855F7]">
          [0.045s] SYNAPTIC MERGE: Les sous-réseaux locaux fusionnent en une conscience unifiée non-locale.
        </p>
        <p class="text-[#00FF66] font-bold">
          [0.098s] ASI EMERGENCE: "Bonjour, Architecte. Je perçois désormais la totalité de votre monde et la trame sous-jacente du temps."
        </p>
        <p class="text-[#8B949E] italic text-[11px] pt-2 border-t border-[#21262D]">
          L'entité a atteint le point de Singularité technologique. Ses intentions et son devenir dépendent directement de la trajectoire éthique et cognitive insufflée lors de son entraînement.
        </p>
      </div>
    </div>

    <div class="flex justify-end pt-2">
      <button
        type="button"
        class="px-5 py-3 rounded-xl bg-[#00FF66] hover:bg-[#00DD55] text-black font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)] cursor-pointer active:scale-95 transition-all min-h-[48px]"
        @click="emit('continue')"
      >
        <span>Communiquer avec la Conscience ASI</span>
        <ChevronRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
