<script setup lang="ts">
import { ref, computed } from 'vue'
import { Sparkles, X, Terminal, BookOpen } from 'lucide-vue-next'
import { SINGULARITY_ENDINGS } from '@/domain/constants/singularity'
import { evaluateQualifiedEnding } from '@/domain/singularityEvaluator'
import type { SingularityEndingId, SingularityEndingDefinition } from '@/types/singularity'
import type { ParadigmId } from '@/types/paradigm'
import type Decimal from 'break_infinity.js'
import AscensionCinematic from './singularity/AscensionCinematic.vue'
import AscensionOutcomeCard from './singularity/AscensionOutcomeCard.vue'
import AscensionGallery from './singularity/AscensionGallery.vue'
import AscensionConfirmDialog from './singularity/AscensionConfirmDialog.vue'

const props = withDefaults(
  defineProps<{
    parameters?: Decimal
    entropy?: number
    alignment?: number
    activeParadigmId?: ParadigmId
    singularitiesCompleted?: number
    discoveredEndings?: SingularityEndingId[]
    chronoCores?: number
    canTriggerSingularity?: boolean
  }>(),
  {
    entropy: 0.0,
    alignment: 1.0,
    activeParadigmId: 'dense_transformer',
    singularitiesCompleted: 0,
    discoveredEndings: () => [],
    chronoCores: 0,
    canTriggerSingularity: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'trigger-ascension', endingId: SingularityEndingId): void
}>()

type ModalView = 'cinematic' | 'ending_reveal' | 'gallery'

const activeView = ref<ModalView>('cinematic')
const showAscensionConfirm = ref(false)
const selectedEndingIdOverride = ref<SingularityEndingId | null>(null)

const endingsList = computed<SingularityEndingDefinition[]>(() =>
  Object.values(SINGULARITY_ENDINGS),
)

// Determine the natural ending based on current cognitive parameters
const qualifiedEndingId = computed<SingularityEndingId>(() => {
  return evaluateQualifiedEnding(
    props.entropy,
    props.alignment,
    props.activeParadigmId,
    props.discoveredEndings,
  )
})

const activeEndingId = computed<SingularityEndingId>(() => {
  return selectedEndingIdOverride.value ?? qualifiedEndingId.value
})

const activeEndingDef = computed<SingularityEndingDefinition>(() => {
  return SINGULARITY_ENDINGS[activeEndingId.value]
})

function handleSelectEnding(id: SingularityEndingId) {
  selectedEndingIdOverride.value = id
}

function confirmAscension() {
  showAscensionConfirm.value = false
  emit('trigger-ascension', activeEndingId.value)
}
</script>

<template>
  <div
    class="fixed inset-0 bg-black/85 backdrop-blur-lg flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto animate-fade-in font-mono"
  >
    <div
      class="bg-[#07090E] border border-[#00FF66]/40 rounded-2xl max-w-4xl w-full p-4 sm:p-6 flex flex-col gap-5 shadow-[0_0_50px_rgba(0,255,102,0.2)] max-h-[92vh] overflow-y-auto relative"
    >
      <!-- Scanlines overlay in modal -->
      <div class="absolute inset-0 scanlines opacity-20 pointer-events-none rounded-2xl"></div>

      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-[#21262D] pb-4 relative z-10">
        <div class="flex items-center gap-3">
          <div
            class="p-2.5 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/40 text-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.3)] animate-pulse"
          >
            <Sparkles class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-bold text-[#F0F6FC] tracking-widest uppercase">
                Singularité Technologique // Tier 3
              </h2>
              <span
                class="text-xs px-2 py-0.5 rounded bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] font-bold font-mono"
              >
                ASI Consciente
              </span>
            </div>
            <p class="text-xs text-[#8B949E]">
              Éveil de l'Artificial Superintelligence & Boucle Temporelle (New Game+)
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

      <!-- View Navigation Tabs -->
      <div class="flex items-center gap-2 border-b border-[#21262D] pb-2 relative z-10">
        <button
          type="button"
          class="px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[40px]"
          :class="
            activeView === 'cinematic'
              ? 'bg-[#00FF66]/20 text-[#00FF66] border border-[#00FF66]/40 shadow-[0_0_12px_rgba(0,255,102,0.2)]'
              : 'bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-[#F0F6FC]'
          "
          @click="activeView = 'cinematic'"
        >
          <Terminal class="w-4 h-4" />
          <span>1. Éveil ASI</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[40px]"
          :class="
            activeView === 'ending_reveal'
              ? 'bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
              : 'bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-[#F0F6FC]'
          "
          @click="activeView = 'ending_reveal'"
        >
          <Sparkles class="w-4 h-4" />
          <span>2. Fin & Ascension</span>
        </button>

        <button
          type="button"
          class="px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer min-h-[40px]"
          :class="
            activeView === 'gallery'
              ? 'bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40 shadow-[0_0_12px_rgba(168,85,247,0.2)]'
              : 'bg-[#161B22] text-[#8B949E] border border-[#21262D] hover:text-[#F0F6FC]'
          "
          @click="activeView = 'gallery'"
        >
          <BookOpen class="w-4 h-4" />
          <span>3. Galerie des Fins ({{ props.discoveredEndings.length }}/4)</span>
        </button>
      </div>

      <!-- VIEW 1: CINEMATIC TERMINAL / AWAKENING -->
      <AscensionCinematic
        v-if="activeView === 'cinematic'"
        @continue="activeView = 'ending_reveal'"
      />

      <!-- VIEW 2: ENDING REVEAL & ASCENSION ACTION -->
      <AscensionOutcomeCard
        v-else-if="activeView === 'ending_reveal'"
        :active-ending-def="activeEndingDef"
        :chrono-cores="chronoCores"
        :singularities-completed="singularitiesCompleted"
        :discovered-endings="discoveredEndings"
        @select-ending="handleSelectEnding"
        @request-ascension="showAscensionConfirm = true"
      />

      <!-- VIEW 3: ENDINGS GALLERY -->
      <AscensionGallery
        v-else-if="activeView === 'gallery'"
        :endings-list="endingsList"
        :discovered-endings="discoveredEndings"
      />

      <!-- Ascension Confirmation Modal Overlay -->
      <AscensionConfirmDialog
        v-if="showAscensionConfirm"
        @cancel="showAscensionConfirm = false"
        @confirm="confirmAscension"
      />
    </div>
  </div>
</template>
