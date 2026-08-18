<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Save,
  Download,
  Upload,
  Copy,
  Check,
  X,
  AlertTriangle,
  FileText,
} from 'lucide-vue-next'

import {
  encodeSaveEnvelope,
  decodeSaveEnvelope,
} from '@/utils/saveCodec'
import type { GameState } from '@/types/game'
import type { SerializedSaveEnvelope } from '@/types/save'

const props = defineProps<{
  gameState: GameState
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'restore-save', envelope: SerializedSaveEnvelope): void
}>()

type ActiveTab = 'export' | 'import'

const activeTab = ref<ActiveTab>('export')
const copiedToast = ref(false)
const importInputText = ref('')
const showImportConfirmation = ref(false)

// Generated export string
const currentSaveString = computed(() => {
  return encodeSaveEnvelope(props.gameState)
})

// Validation for import string
const importValidation = computed(() => {
  if (!importInputText.value.trim()) {
    return null
  }
  return decodeSaveEnvelope(importInputText.value)
})

async function copySaveStringToClipboard() {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(currentSaveString.value)
    } else {
      // Fallback for non-secure contexts
      const textarea = document.createElement('textarea')
      textarea.value = currentSaveString.value
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
  const blob = new Blob([currentSaveString.value], { type: 'text/plain;charset=utf-8' })
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

function confirmImport() {
  if (importValidation.value?.valid && importValidation.value.metadata && importValidation.value.parsedState) {
    const envelope: SerializedSaveEnvelope = {
      version: importValidation.value.metadata.version,
      metadata: importValidation.value.metadata,
      state: importValidation.value.parsedState,
    }
    showImportConfirmation.value = false
    emit('restore-save', envelope)
  }
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto animate-fade-in font-mono"
  >
    <div
      class="bg-[#0D1117] border border-[#38BDF8]/50 rounded-2xl max-w-2xl w-full p-4 sm:p-6 flex flex-col gap-5 shadow-[0_0_40px_rgba(56,189,248,0.2)] max-h-[92vh] overflow-y-auto"
    >
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-[#21262D] pb-4">
        <div class="flex items-center gap-3">
          <div
            class="p-2.5 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.3)]"
          >
            <Save class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-bold text-[#F0F6FC] tracking-wider uppercase">
                Gestionnaire de Sauvegardes
              </h2>
              <span
                class="text-xs px-2 py-0.5 rounded bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] font-bold"
              >
                Base64 + FNV-1a
              </span>
            </div>
            <p class="text-xs text-[#8B949E]">
              Sauvegarde locale chiffrée, transfert de progression & intégrité des données
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-2 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] border border-transparent hover:border-[#21262D] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="grid grid-cols-2 gap-2 border-b border-[#21262D] pb-2">
        <button
          type="button"
          class="py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          :class="
            activeTab === 'export'
              ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/50 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
              : 'bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-[#F0F6FC]'
          "
          @click="activeTab = 'export'"
        >
          <Download class="w-4 h-4" />
          <span>Exporter une Sauvegarde</span>
        </button>

        <button
          type="button"
          class="py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          :class="
            activeTab === 'import'
              ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/50 shadow-[0_0_12px_rgba(0,255,102,0.2)]'
              : 'bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-[#F0F6FC]'
          "
          @click="activeTab = 'import'"
        >
          <Upload class="w-4 h-4" />
          <span>Importer une Sauvegarde</span>
        </button>
      </div>

      <!-- TAB 1: EXPORT -->
      <div v-if="activeTab === 'export'" class="flex flex-col gap-4">
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

      <!-- TAB 2: IMPORT -->
      <div v-else class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-xs text-[#8B949E] flex items-center justify-between">
            <span>Collez la clé de sauvegarde <code class="text-[#38BDF8]">IDLEAGI_SAVE_V1:...</code> :</span>
          </label>
          <textarea
            v-model="importInputText"
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
          @click="showImportConfirmation = true"
        >
          <Upload class="w-4 h-4" />
          <span>Restaurer cette Sauvegarde</span>
        </button>
      </div>

      <!-- Import Confirmation Prompt Overlay -->
      <div
        v-if="showImportConfirmation"
        class="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-60 animate-fade-in"
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
              @click="showImportConfirmation = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-[#EF4444] text-white hover:bg-[#DC2626] shadow-[0_0_15px_rgba(239,68,68,0.4)] cursor-pointer min-h-[44px] active:scale-95"
              @click="confirmImport"
            >
              Écraser & Charger
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
