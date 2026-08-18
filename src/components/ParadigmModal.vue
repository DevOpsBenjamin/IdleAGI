<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Sparkles,
  Cpu,
  RotateCcw,
  X,
  Layers,
} from 'lucide-vue-next'
import { PARADIGMS, PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT } from '@/domain/constants/paradigms'
import type { ParadigmId, ParadigmDefinition } from '@/types/paradigm'
import type Decimal from 'break_infinity.js'
import ParadigmCard from './paradigm/ParadigmCard.vue'
import ParadigmResetConfirmDialog from './paradigm/ParadigmResetConfirmDialog.vue'

const props = withDefaults(
  defineProps<{
    insights?: number
    totalInsights?: number
    activeParadigmId?: ParadigmId
    unlockedParadigmIds?: ParadigmId[]
    parameters?: Decimal
    canTriggerTier2?: boolean
    pendingInsights?: number
  }>(),
  {
    insights: 0,
    totalInsights: 0,
    activeParadigmId: 'dense_transformer',
    unlockedParadigmIds: () => ['dense_transformer'],
    canTriggerTier2: false,
    pendingInsights: 0,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-paradigm', paradigmId: ParadigmId): void
  (e: 'unlock-paradigm', paradigmId: ParadigmId): void
  (e: 'trigger-tier2-prestige'): void
}>()

const paradigmList = computed<ParadigmDefinition[]>(() => Object.values(PARADIGMS))
const showResetConfirmation = ref(false)

const passiveTflopsBonusPercent = computed(() => {
  return Math.round((props.totalInsights ?? 0) * PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT * 100)
})

function isUnlocked(id: ParadigmId): boolean {
  return props.unlockedParadigmIds?.includes(id) ?? id === 'dense_transformer'
}

function isActive(id: ParadigmId): boolean {
  return (props.activeParadigmId ?? 'dense_transformer') === id
}

function canUnlock(paradigm: ParadigmDefinition): boolean {
  if (isUnlocked(paradigm.id)) return false
  return (props.insights ?? 0) >= paradigm.cost
}

function handleParadigmAction(paradigm: ParadigmDefinition) {
  if (isActive(paradigm.id)) return

  if (isUnlocked(paradigm.id)) {
    emit('select-paradigm', paradigm.id)
  } else if (canUnlock(paradigm)) {
    emit('unlock-paradigm', paradigm.id)
  }
}

function confirmPrestige() {
  showResetConfirmation.value = false
  emit('trigger-tier2-prestige')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto animate-fade-in font-mono">
    <div class="bg-[#0D1117] border border-[#A855F7]/50 rounded-xl max-w-4xl w-full p-4 sm:p-6 flex flex-col gap-5 shadow-[0_0_40px_rgba(168,85,247,0.2)] max-h-[92vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-[#21262D] pb-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/40 text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Layers class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-bold text-[#F0F6FC] tracking-wider uppercase">
                Paradigmes Architecturaux // Tier 2
              </h2>
              <span class="text-xs px-2 py-0.5 rounded bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] font-bold">
                Prestige Hard Reset
              </span>
            </div>
            <p class="text-xs text-[#8B949E]">
              Refonte fondamentale des réseaux neuronaux & Découvertes Fondamentales ($\Phi$)
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

      <!-- Insights Summary HUD -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-[#161B22]/80 border border-[#A855F7]/30 p-3 rounded-lg flex flex-col gap-1">
          <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-[#A855F7]" />
            <span>Insights Disponibles</span>
          </span>
          <div class="text-xl font-bold text-[#A855F7]">
            {{ insights }} <span class="text-xs text-[#8B949E] font-normal">$\Phi$</span>
          </div>
        </div>

        <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
          <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
            <Layers class="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Total Insights Découverts</span>
          </span>
          <div class="text-xl font-bold text-[#38BDF8]">
            {{ totalInsights }} <span class="text-xs text-[#8B949E] font-normal">$\Phi$ cumulés</span>
          </div>
        </div>

        <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
          <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
            <Cpu class="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Bonus Passif Universel</span>
          </span>
          <div class="text-xl font-bold text-[#00FF66]">
            +{{ passiveTflopsBonusPercent }}% <span class="text-xs text-[#8B949E] font-normal">TFLOPS brut</span>
          </div>
        </div>
      </div>

      <!-- Paradigms Catalog Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ParadigmCard
          v-for="p in paradigmList"
          :key="p.id"
          :paradigm="p"
          :is-unlocked="isUnlocked(p.id)"
          :is-active="isActive(p.id)"
          :can-unlock="canUnlock(p)"
          @action="handleParadigmAction"
        />
      </div>

      <!-- Prestige Reset Footer Action -->
      <div class="border-t border-[#21262D] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="text-xs text-[#8B949E]">
          <span>Prochain palier de gain $\Phi$ à partir de <strong>1.00B Paramètres</strong> (1.000.000.000).</span>
        </div>

        <button
          type="button"
          :disabled="!canTriggerTier2 && (pendingInsights ?? 0) <= 0"
          class="w-full sm:w-auto px-6 py-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 min-h-[46px] select-none touch-manipulation"
          :class="[
            canTriggerTier2 || (pendingInsights ?? 0) > 0
              ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer active:scale-95'
              : 'bg-[#21262D] text-[#8B949E] border border-transparent cursor-not-allowed opacity-60',
          ]"
          @click="showResetConfirmation = true"
        >
          <RotateCcw class="w-4 h-4" />
          <span>{{ (pendingInsights ?? 0) > 0 ? `Initier le Changement Tier 2 (+${pendingInsights} $\\Phi$)` : 'Non Éligible au Reset Tier 2' }}</span>
        </button>
      </div>

      <!-- Hard Reset Confirmation Modal Overlay -->
      <ParadigmResetConfirmDialog
        v-if="showResetConfirmation"
        :pending-insights="pendingInsights ?? 0"
        @cancel="showResetConfirmation = false"
        @confirm="confirmPrestige"
      />
    </div>
  </div>
</template>
