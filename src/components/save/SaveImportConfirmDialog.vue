<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next'

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
      class="bg-[#0D1117] border border-[#EF4444]/60 rounded-2xl p-5 max-w-md w-full flex flex-col gap-4 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
    >
      <div class="flex items-center gap-3 text-[#EF4444]">
        <AlertTriangle class="w-6 h-6 shrink-0" />
        <h3 class="text-base font-bold uppercase tracking-wider">
          CONFIRMER L'IMPORTATION
        </h3>
      </div>

      <p class="text-xs text-[#E2E8F0] leading-relaxed">
        L'importation de cette sauvegarde <strong>remplacera intégralement votre session courante</strong>. Assurez-vous d'avoir exporté votre état actuel si vous souhaitez le conserver.
      </p>

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
          class="px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer min-h-[44px] active:scale-95"
          @click="emit('confirm')"
        >
          Écraser & Charger
        </button>
      </div>
    </div>
  </div>
</template>
