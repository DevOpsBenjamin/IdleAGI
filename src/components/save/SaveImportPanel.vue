<script setup lang="ts">
import { computed } from 'vue'
import { Upload, Check, AlertTriangle } from 'lucide-vue-next'
import { decodeSaveEnvelope } from '@/utils/saveCodec'
import type { SaveValidationResult } from '@/types/save'

const inputText = defineModel<string>('inputText', { default: '' })

const emit = defineEmits<{
  (e: 'request-import'): void
}>()

const importValidation = computed<SaveValidationResult | null>(() => {
  if (!inputText.value.trim()) {
    return null
  }
  return decodeSaveEnvelope(inputText.value)
})

function formatPlaytime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  return `${minutes}m ${secs}s`
}
</script>

<template>
  <div class="flex flex-col gap-4 font-mono">
    <div class="flex flex-col gap-2">
      <label class="text-xs text-[#8B949E] flex items-center justify-between">
        <span>Collez la clé de sauvegarde <code class="text-[#38BDF8]">IDLEAGI_SAVE_V1:...</code> :</span>
      </label>
      <textarea
        v-model="inputText"
        rows="4"
        placeholder="IDLEAGI_SAVE_V1:eyJ2ZXJzaW9uIjoiMS4wIi...:a1b2c3d4"
        class="w-full bg-[#07090E] border rounded-xl p-3 text-[11px] text-[#F0F6FC] font-mono focus:outline-none transition-colors"
        :class="
          importValidation === null
            ? 'border-[#21262D] focus:border-[#38BDF8]'
            : importValidation.valid
              ? 'border-[#00FF66] shadow-[0_0_15px_rgba(0,255,102,0.2)]'
              : 'border-[#EF4444] shadow-[0_0_15px_rgba(239,68,68,0.2)]'
        "
      ></textarea>
    </div>

    <!-- Validation Error Message -->
    <div
      v-if="importValidation && !importValidation.valid"
      class="bg-[#EF4444]/10 border border-[#EF4444]/40 rounded-xl p-3.5 flex items-start gap-3 text-xs text-[#EF4444]"
    >
      <AlertTriangle class="w-5 h-5 shrink-0 mt-0.5" />
      <div class="flex flex-col gap-1">
        <strong class="font-bold uppercase">Sauvegarde Invalide ou Corrompue</strong>
        <p class="leading-relaxed text-[11px] text-[#EF4444]/90">{{ importValidation.error }}</p>
      </div>
    </div>

    <!-- Validation Success & Metadata Preview -->
    <div
      v-if="importValidation && importValidation.valid && importValidation.metadata"
      class="bg-[#00FF66]/10 border border-[#00FF66]/40 rounded-xl p-4 flex flex-col gap-3"
    >
      <div class="flex items-center gap-2 text-xs font-bold text-[#00FF66]">
        <Check class="w-4 h-4" />
        <span>Sauvegarde Reconnue & Intègre (Checksum FNV-1a Valide)</span>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div class="bg-black/40 p-2 rounded-lg flex flex-col">
          <span class="text-[10px] text-[#8B949E]">Temps de Jeu</span>
          <span class="font-bold text-[#F0F6FC]">
            {{ formatPlaytime(importValidation.metadata.totalPlaytimeMs) }}
          </span>
        </div>
        <div class="bg-black/40 p-2 rounded-lg flex flex-col">
          <span class="text-[10px] text-[#8B949E]">Poids Max</span>
          <span class="font-bold text-[#38BDF8]">
            {{ importValidation.metadata.highestParameters }}
          </span>
        </div>
        <div class="bg-black/40 p-2 rounded-lg flex flex-col">
          <span class="text-[10px] text-[#8B949E]">Singularités</span>
          <span class="font-bold text-[#00FF66]">
            {{ importValidation.metadata.singularitiesCompleted }}
          </span>
        </div>
        <div class="bg-black/40 p-2 rounded-lg flex flex-col">
          <span class="text-[10px] text-[#8B949E]">Phase Atteinte</span>
          <span class="font-bold text-[#A855F7]">
            Phase {{ importValidation.metadata.currentPhase }}
          </span>
        </div>
      </div>
    </div>

    <!-- Import Restore Trigger Button -->
    <button
      type="button"
      :disabled="!importValidation || !importValidation.valid"
      class="py-3.5 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 min-h-[48px] active:scale-95"
      :class="
        importValidation && importValidation.valid
          ? 'bg-[#00FF66] hover:bg-[#00DD55] text-black shadow-[0_0_20px_rgba(0,255,102,0.4)] cursor-pointer'
          : 'bg-[#161B22] border border-[#21262D] text-[#8B949E] cursor-not-allowed opacity-50'
      "
      @click="emit('request-import')"
    >
      <Upload class="w-4 h-4" />
      <span>Restaurer cette Sauvegarde</span>
    </button>
  </div>
</template>
