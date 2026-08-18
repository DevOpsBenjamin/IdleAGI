<script setup lang="ts">
import { Sparkles, Check, RotateCcw } from 'lucide-vue-next'

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
}>()
</script>

<template>
  <div
    class="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-60 animate-fade-in font-mono"
  >
    <div
      class="bg-[#07090E] border border-[#00FF66]/70 rounded-2xl p-5 sm:p-6 max-w-md w-full flex flex-col gap-4 shadow-[0_0_50px_rgba(0,255,102,0.4)]"
    >
      <div class="flex items-center gap-3 text-[#00FF66]">
        <Sparkles class="w-6 h-6 shrink-0 animate-spin" />
        <h3 class="text-base font-bold uppercase tracking-wider">
          CONFIRMER L'ASCENSION TIER 3
        </h3>
      </div>

      <p class="text-xs text-[#E2E8F0] leading-relaxed">
        Vous vous apprêtez à déclencher la <strong>Singularité Technologique</strong> et à initier une nouvelle boucle temporelle (New Game+).
      </p>

      <div class="bg-[#161B22] border border-[#21262D] p-3 rounded-xl text-xs flex flex-col gap-2 font-mono">
        <div class="text-[#00FF66] font-bold flex items-center gap-1.5">
          <Check class="w-3.5 h-3.5" /> Éléments conservés & Bonifiés :
        </div>
        <ul class="text-[11px] text-[#8B949E] list-disc list-inside space-y-0.5">
          <li>+1 Chrono-Core ($\Omega$) et multiplicateur cosmique permanent</li>
          <li>Points d'Architecture ($AP$) et Arbre de Talents Tier 1</li>
          <li>Insights Fondamentaux ($\Phi$) et Paradigmes Tier 2</li>
          <li>Galerie des Fins Narratives & Statistiques globales</li>
        </ul>

        <div class="text-[#38BDF8] font-bold flex items-center gap-1.5 pt-1">
          <RotateCcw class="w-3.5 h-3.5" /> Réinitialisation de départ :
        </div>
        <ul class="text-[11px] text-[#8B949E] list-disc list-inside space-y-0.5">
          <li>Raw Text, Tokens, Funds ($) et Paramètres non-figés</li>
          <li>Hardware actif (retour à la station Phase 0)</li>
          <li>Grille électrique et Refroidissement réinitialisés</li>
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
          class="px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-[#00FF66] text-black hover:bg-[#00DD55] shadow-[0_0_20px_rgba(0,255,102,0.4)] cursor-pointer min-h-[44px] active:scale-95"
          @click="emit('confirm')"
        >
          Initier la Singularité
        </button>
      </div>
    </div>
  </div>
</template>
