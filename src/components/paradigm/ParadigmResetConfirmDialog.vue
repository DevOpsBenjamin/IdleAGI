<script setup lang="ts">
import { AlertTriangle, Check, RotateCcw } from 'lucide-vue-next'

defineProps<{
  pendingInsights: number
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <div
    class="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-60 animate-fade-in font-mono"
  >
    <div
      class="bg-[#0D1117] border border-[#A855F7]/60 rounded-2xl p-5 sm:p-6 max-w-md w-full flex flex-col gap-4 shadow-[0_0_30px_rgba(168,85,247,0.3)]"
    >
      <div class="flex items-center gap-3 text-[#A855F7]">
        <AlertTriangle class="w-6 h-6 shrink-0" />
        <div>
          <h3 class="text-base font-bold uppercase tracking-wider">
            Confirmer le Changement de Paradigme
          </h3>
          <span class="text-[10px] text-[#8B949E] uppercase">Hard Reset Tier 2</span>
        </div>
      </div>

      <p class="text-xs text-[#E2E8F0] leading-relaxed">
        Déclencher un Changement de Paradigme effectue une <strong>refonte fondamentale de votre modèle</strong> et réinitialise les couches physiques et logiques en échange de <strong class="text-[#A855F7]">+{{ pendingInsights }} Insights Fondamentaux ($\Phi$)</strong>.
      </p>

      <div class="bg-[#161B22] border border-[#21262D] p-3 rounded-lg text-xs flex flex-col gap-2 font-mono">
        <div class="text-[#00FF66] font-bold flex items-center gap-1.5">
          <Check class="w-3.5 h-3.5" /> Éléments conservés :
        </div>
        <ul class="text-[11px] text-[#8B949E] list-disc list-inside space-y-0.5">
          <li>Points d'Architecture (AP) et Arbre de Talents Tier 1</li>
          <li>Insights Découverts ($\Phi$) et Paradigmes Débloqués</li>
          <li>Bonus passif global permanent (+10% TFLOPS/$\Phi$)</li>
        </ul>

        <div class="text-[#EF4444] font-bold flex items-center gap-1.5 pt-1">
          <RotateCcw class="w-3.5 h-3.5" /> Éléments réinitialisés :
        </div>
        <ul class="text-[11px] text-[#8B949E] list-disc list-inside space-y-0.5">
          <li>Fonds ($), Tokens, Paramètres et Raw Text</li>
          <li>Hardware, Baies PCIe, Refroidissement et Grille Électrique</li>
          <li>Upgrades logicielles et flux de données synthétiques</li>
        </ul>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          class="px-4 py-2 rounded-lg text-xs font-mono text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] cursor-pointer min-h-[44px]"
          @click="emit('cancel')"
        >
          Annuler
        </button>
        <button
          type="button"
          class="px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] cursor-pointer min-h-[44px] active:scale-95"
          @click="emit('confirm')"
        >
          Confirmer la Transition (+{{ pendingInsights }} $\Phi$)
        </button>
      </div>
    </div>
  </div>
</template>
