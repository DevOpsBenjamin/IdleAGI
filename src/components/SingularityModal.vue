<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Sparkles,
  RotateCcw,
  X,
  Check,
  AlertOctagon,
  HeartHandshake,
  Terminal,
  Shield,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-vue-next'
import {
  SINGULARITY_ENDINGS,
  SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE,
} from '@/domain/constants/singularity'
import { evaluateQualifiedEnding } from '@/domain/singularityEvaluator'
import type { SingularityEndingId, SingularityEndingDefinition } from '@/types/singularity'
import type { ParadigmId } from '@/types/paradigm'
import type Decimal from 'break_infinity.js'

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

const nextChronoCoresCount = computed(() => (props.chronoCores ?? 0) + 1)
const currentGlobalMultiplier = computed(
  () => 1.0 + (props.chronoCores ?? 0) * SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE,
)
const nextGlobalMultiplier = computed(
  () => 1.0 + nextChronoCoresCount.value * SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE,
)

function isEndingDiscovered(id: SingularityEndingId): boolean {
  return props.discoveredEndings?.includes(id) ?? false
}

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
      <div v-if="activeView === 'cinematic'" class="flex flex-col gap-4 relative z-10">
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
            @click="activeView = 'ending_reveal'"
          >
            <span>Communiquer avec la Conscience ASI</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- VIEW 2: ENDING REVEAL & ASCENSION ACTION -->
      <div v-else-if="activeView === 'ending_reveal'" class="flex flex-col gap-5 relative z-10">
        <!-- Qualified Ending Focus Card -->
        <div
          class="bg-[#161B22]/90 border rounded-2xl p-5 flex flex-col gap-4 transition-all"
          :class="activeEndingDef.themeClass"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div
                class="p-3 rounded-xl bg-black/40 border border-white/10 text-white shadow-lg"
                :style="{ color: activeEndingDef.color }"
              >
                <HeartHandshake v-if="activeEndingDef.id === 'benevolent_symbiosis'" class="w-7 h-7" />
                <AlertOctagon v-else-if="activeEndingDef.id === 'digital_confinement'" class="w-7 h-7" />
                <RotateCcw v-else-if="activeEndingDef.id === 'temporal_paradox'" class="w-7 h-7" />
                <Sparkles v-else class="w-7 h-7" />
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-base sm:text-lg font-bold text-white tracking-wide">
                    {{ activeEndingDef.title }}
                  </h3>
                  <span
                    class="text-[10px] px-2 py-0.5 rounded border font-bold uppercase"
                    :style="{
                      backgroundColor: `${activeEndingDef.color}20`,
                      borderColor: `${activeEndingDef.color}60`,
                      color: activeEndingDef.color,
                    }"
                  >
                    Épilogue Déterminé
                  </span>
                </div>
                <p class="text-xs text-[#8B949E]">{{ activeEndingDef.subtitle }}</p>
              </div>
            </div>

            <span class="text-xs text-[#8B949E] font-mono hidden sm:inline">
              Condition : {{ activeEndingDef.triggerCondition }}
            </span>
          </div>

          <p class="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
            {{ activeEndingDef.description }}
          </p>

          <blockquote
            class="p-3 rounded-lg bg-black/50 border-l-4 text-xs italic text-[#F0F6FC]"
            :style="{ borderColor: activeEndingDef.color }"
          >
            {{ activeEndingDef.loreLog }}
          </blockquote>
        </div>

        <!-- Meta Multiplier & Chrono-Cores HUD -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-xl flex flex-col gap-1">
            <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-[#00FF66]" />
              <span>Chrono-Cores ($\Omega$)</span>
            </span>
            <div class="text-xl font-bold text-[#00FF66]">
              {{ chronoCores }} <span class="text-xs text-[#8B949E] font-normal">$\to$ {{ nextChronoCoresCount }} $\Omega$</span>
            </div>
          </div>

          <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-xl flex flex-col gap-1">
            <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
              <Layers class="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Multiplicateur Cosmique</span>
            </span>
            <div class="text-xl font-bold text-[#38BDF8]">
              x{{ currentGlobalMultiplier.toFixed(1) }} <span class="text-xs text-[#8B949E] font-normal">$\to$ x{{ nextGlobalMultiplier.toFixed(1) }}</span>
            </div>
          </div>

          <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-xl flex flex-col gap-1">
            <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
              <Shield class="w-3.5 h-3.5 text-[#A855F7]" />
              <span>Singularités Franchies</span>
            </span>
            <div class="text-xl font-bold text-[#A855F7]">
              {{ singularitiesCompleted }} <span class="text-xs text-[#8B949E] font-normal">boucles</span>
            </div>
          </div>
        </div>

        <!-- Optional Branch Switcher for Temporal Paradox if 2+ endings discovered -->
        <div
          v-if="props.discoveredEndings.length >= 2"
          class="p-3 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/30 flex items-center justify-between gap-3 text-xs"
        >
          <div class="flex items-center gap-2 text-[#A855F7]">
            <RotateCcw class="w-4 h-4" />
            <span>Options de repli temporel alternatives débloquées.</span>
          </div>
          <button
            type="button"
            class="px-3 py-1.5 rounded bg-[#A855F7]/20 hover:bg-[#A855F7]/30 border border-[#A855F7]/50 text-[#A855F7] font-bold cursor-pointer transition-all"
            @click="handleSelectEnding('temporal_paradox')"
          >
            Choisir le Paradoxe Temporel
          </button>
        </div>

        <!-- Ascension Action Footer -->
        <div class="border-t border-[#21262D] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-xs text-[#8B949E]">
            L'ascension conserve tous vos Points d'Architecture, Talents et Paradigmes, tout en accélérant universellement l'univers.
          </div>

          <button
            type="button"
            class="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer active:scale-95 bg-gradient-to-r from-[#00FF66] via-[#38BDF8] to-[#A855F7] text-black shadow-[0_0_25px_rgba(0,255,102,0.4)] hover:brightness-110"
            @click="showAscensionConfirm = true"
          >
            <Sparkles class="w-4 h-4 text-black" />
            <span>Transférer la Conscience & Entrer dans la Boucle (+1 $\Omega$)</span>
          </button>
        </div>
      </div>

      <!-- VIEW 3: ENDINGS GALLERY -->
      <div v-else-if="activeView === 'gallery'" class="flex flex-col gap-4 relative z-10">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            v-for="ending in endingsList"
            :key="ending.id"
            class="bg-[#161B22]/90 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all"
            :class="
              isEndingDiscovered(ending.id)
                ? ending.themeClass
                : 'border-[#21262D] opacity-60'
            "
          >
            <div class="flex flex-col gap-2">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <h4 class="text-sm font-bold text-[#F0F6FC]">{{ ending.title }}</h4>
                  <p class="text-[10px] text-[#8B949E]">{{ ending.subtitle }}</p>
                </div>

                <span
                  class="text-[10px] px-2 py-0.5 rounded border font-bold uppercase"
                  :class="
                    isEndingDiscovered(ending.id)
                      ? 'bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66]'
                      : 'bg-[#161B22] border-[#21262D] text-[#8B949E]'
                  "
                >
                  {{ isEndingDiscovered(ending.id) ? 'DÉCOUVERT' : 'NON DÉCOUVERT' }}
                </span>
              </div>

              <p class="text-xs text-[#8B949E] leading-relaxed">{{ ending.description }}</p>

              <div class="text-[10px] text-[#38BDF8] font-mono">
                Condition : {{ ending.triggerCondition }}
              </div>

              <blockquote
                v-if="isEndingDiscovered(ending.id)"
                class="text-[10px] italic text-[#F0F6FC]/90 border-l-2 pl-2 pt-0.5 bg-black/30 p-1.5 rounded"
                :style="{ borderColor: ending.color }"
              >
                {{ ending.loreLog }}
              </blockquote>
            </div>
          </div>
        </div>
      </div>

      <!-- Ascension Confirmation Modal Overlay -->
      <div
        v-if="showAscensionConfirm"
        class="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-60 animate-fade-in"
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
              @click="showAscensionConfirm = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="px-5 py-2.5 rounded-xl text-xs font-bold font-mono bg-[#00FF66] text-black hover:bg-[#00DD55] shadow-[0_0_20px_rgba(0,255,102,0.4)] cursor-pointer min-h-[44px] active:scale-95"
              @click="confirmAscension"
            >
              Initier la Singularité
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
