<script setup lang="ts">
import { ref, computed } from 'vue'
import { Save, Download, Upload, X } from 'lucide-vue-next'
import { encodeSaveEnvelope, decodeSaveEnvelope } from '@/utils/saveCodec'
import type { GameState } from '@/types/game'
import type { SerializedSaveEnvelope } from '@/types/save'
import SaveExportPanel from './save/SaveExportPanel.vue'
import SaveImportPanel from './save/SaveImportPanel.vue'
import SaveImportConfirmDialog from './save/SaveImportConfirmDialog.vue'

const props = defineProps<{
  gameState: GameState
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'restore-save', envelope: SerializedSaveEnvelope): void
}>()

type ActiveTab = 'export' | 'import'

const activeTab = ref<ActiveTab>('export')
const importInputText = ref('')
const showImportConfirmation = ref(false)

const currentSaveString = computed(() => {
  return encodeSaveEnvelope(props.gameState)
})

function handleConfirmImport() {
  const validation = decodeSaveEnvelope(importInputText.value)
  if (validation.valid && validation.metadata && validation.parsedState) {
    const envelope: SerializedSaveEnvelope = {
      version: validation.metadata.version,
      metadata: validation.metadata,
      state: validation.parsedState,
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
      <SaveExportPanel
        v-if="activeTab === 'export'"
        :current-save-string="currentSaveString"
        :game-state="gameState"
      />

      <!-- TAB 2: IMPORT -->
      <SaveImportPanel
        v-else
        v-model:input-text="importInputText"
        @request-import="showImportConfirmation = true"
      />

      <!-- Import Confirmation Prompt Overlay -->
      <SaveImportConfirmDialog
        v-if="showImportConfirmation"
        @cancel="showImportConfirmation = false"
        @confirm="handleConfirmImport"
      />
    </div>
  </div>
</template>
