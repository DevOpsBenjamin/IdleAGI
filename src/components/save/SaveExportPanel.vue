<script setup lang="ts">
import { ref } from 'vue'
import { FileText, Copy, Check, Download } from 'lucide-vue-next'
import type { GameState } from '@/types/game'

const props = defineProps<{
  currentSaveString: string
  gameState: GameState
}>()

const copiedToast = ref(false)

async function copySaveStringToClipboard() {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(props.currentSaveString)
    } else {
      const textarea = document.createElement('textarea')
      textarea.value = props.currentSaveString
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    copiedToast.value = true
    setTimeout(() => {
      copiedToast.value = false
    }, 2500)
  } catch (err) {
    console.error('Erreur lors de la copie presse-papier:', err)
  }
}

function downloadSaveFile() {
  const blob = new Blob([props.currentSaveString], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `idleagi_singularity_save_${Date.now()}.save`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

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
    <!-- Save String Box -->
    <div class="flex flex-col gap-2">
      <label class="text-xs text-[#8B949E] flex items-center justify-between">
        <span class="flex items-center gap-1.5">
          <FileText class="w-3.5 h-3.5 text-[#38BDF8]" />
          Clé de sauvegarde encodée (Base64 + Checksum) :
        </span>
        <span v-if="copiedToast" class="text-[#00FF66] font-bold animate-pulse text-[11px]">
          ✓ Copié dans le presse-papier !
        </span>
      </label>
      <textarea
        readonly
        rows="4"
        :value="currentSaveString"
        class="w-full bg-[#07090E] border border-[#21262D] rounded-xl p-3 text-[11px] text-[#38BDF8] font-mono select-all focus:outline-none focus:border-[#38BDF8]"
      ></textarea>
    </div>

    <!-- Action Buttons Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <button
        type="button"
        class="py-3 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer active:scale-95 bg-[#38BDF8] hover:bg-[#0284C7] text-black shadow-[0_0_15px_rgba(56,189,248,0.3)]"
        @click="copySaveStringToClipboard"
      >
        <Check v-if="copiedToast" class="w-4 h-4 text-black" />
        <Copy v-else class="w-4 h-4 text-black" />
        <span>{{ copiedToast ? 'Clé copiée !' : 'Copier dans le Presse-Papier' }}</span>
      </button>

      <button
        type="button"
        class="py-3 px-4 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer active:scale-95 bg-[#161B22] hover:bg-[#21262D] border border-[#21262D] text-[#F0F6FC]"
        @click="downloadSaveFile"
      >
        <Download class="w-4 h-4 text-[#38BDF8]" />
        <span>Télécharger le Fichier (.save)</span>
      </button>
    </div>

    <!-- Current Save Metadata Recap -->
    <div class="bg-[#161B22]/70 border border-[#21262D] rounded-xl p-3.5 flex flex-col gap-2">
      <span class="text-[11px] text-[#8B949E] uppercase font-bold tracking-wider">
        Métadonnées de la Partie en Cours :
      </span>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div class="flex flex-col">
          <span class="text-[10px] text-[#8B949E]">Temps de Jeu</span>
          <span class="font-bold text-[#F0F6FC]">
            {{ formatPlaytime(Date.now() - (gameState.gameStartTime || Date.now())) }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] text-[#8B949E]">Paramètres</span>
          <span class="font-bold text-[#38BDF8]">
            {{ gameState.parameters?.toString() ?? '0' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] text-[#8B949E]">Singularités</span>
          <span class="font-bold text-[#00FF66]">
            {{ gameState.singularity?.singularitiesCompleted ?? 0 }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-[10px] text-[#8B949E]">Version Save</span>
          <span class="font-bold text-[#A855F7]">{{ gameState.version ?? '0.1.0' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
