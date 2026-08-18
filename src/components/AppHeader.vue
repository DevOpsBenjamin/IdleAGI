<script setup lang="ts">
import { ref, computed } from 'vue'
import { Terminal, Zap, Cpu, DollarSign, Save, RotateCcw, Check } from 'lucide-vue-next'
import { formatMoney, formatWatts, formatFlops } from '@/utils/format'
import type { PowerState } from '@/types/game'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  version: string
  currentPhase: number
  powerState: PowerState
  effectiveCompute: Decimal
  fundsCurrent: Decimal
  fundsRate: Decimal
  dataBrokerUnlocked: boolean
  hasHardware: boolean
  architecturePoints?: number
  totalArchitecturePoints?: number
  hasPrestigeUnlocked?: boolean
  insights?: number
  totalInsights?: number
  hasParadigmUnlocked?: boolean
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'reset'): void
  (e: 'open-talent-tree'): void
  (e: 'open-paradigm-modal'): void
}>()


const savedRecently = ref(false)
const showResetConfirm = ref(false)

function triggerSave() {
  emit('save')
  savedRecently.value = true
  setTimeout(() => {
    savedRecently.value = false
  }, 2000)
}

function confirmReset() {
  showResetConfirm.value = false
  emit('reset')
}

const phaseLabel = computed(() => {
  switch (props.currentPhase) {
    case 0:
      return 'Phase 0 // Scribe Humain'
    case 1:
      return 'Phase 1 // Scripts & PC Poubelle'
    case 2:
      return 'Phase 2 // Station & Tokenizer'
    case 3:
      return 'Phase 3 // Datacenter & Tri-Allocation'
    default:
      return 'Phase Active'
  }
})

const phaseBadgeClass = computed(() => {
  switch (props.currentPhase) {
    case 0:
      return 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/30'
    case 1:
      return 'bg-[#FFB800]/10 text-[#FFB800] border-[#FFB800]/30'
    case 2:
      return 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'
    case 3:
      return 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/30'
    default:
      return 'bg-[#161B22] text-[#8B949E] border-[#21262D]'
  }
})
</script>

<template>
  <header class="shrink-0 border-b border-[#21262D] bg-[#0D1117]/90 backdrop-blur-md px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-20 transition-all duration-300">
    <!-- Brand & Project Title -->
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.2)]">
        <Terminal class="w-5 h-5" />
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-sm md:text-base font-bold tracking-widest text-[#F0F6FC] font-mono">
            IDLE AGI
          </h1>
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-[#161B22] border border-[#21262D] text-[#8B949E] font-mono">
            v{{ version }}
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded border font-mono font-semibold" :class="phaseBadgeClass">
            {{ phaseLabel }}
          </span>
        </div>
        <p class="text-[11px] text-[#8B949E] font-mono">Project Singularity Loop // Active Terminal</p>
      </div>
    </div>

    <!-- Quick Metrics Bar (Progressive disclosure) -->
    <div class="flex flex-wrap items-center gap-3 md:gap-5 text-xs font-mono">
      <!-- Power Grid (Unlocked when hardware is present) -->
      <div
        v-if="hasHardware"
        class="flex items-center gap-2 bg-[#161B22]/70 border px-3 py-1.5 rounded animate-fadeIn transition-all"
        :class="powerState.isOverloaded ? 'border-[#EF4444]/60 bg-[#EF4444]/10' : powerState.status === 'strained' ? 'border-[#FFB800]/40' : 'border-[#21262D]'"
      >
        <Zap
          class="w-4 h-4 transition-colors"
          :class="powerState.isOverloaded ? 'text-[#EF4444] animate-bounce' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
        />
        <div class="flex flex-col">
          <div class="flex items-center gap-1">
            <span class="text-[9px] text-[#8B949E] uppercase">Réseau Électrique</span>
            <span
              v-if="powerState.isOverloaded"
              class="text-[8px] font-bold px-1 rounded bg-[#EF4444]/20 text-[#EF4444] uppercase animate-pulse"
            >
              -50% Surcharge
            </span>
          </div>
          <span class="font-bold" :class="powerState.isOverloaded ? 'text-[#EF4444]' : 'text-[#F0F6FC]'">
            {{ formatWatts(powerState.totalDrawWatts) }} / {{ formatWatts(powerState.gridCapacityWatts) }}
            <span class="text-[10px] font-normal" :class="powerState.isOverloaded ? 'text-[#EF4444]' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#8B949E]'">
              ({{ powerState.gridLoadPercent.toFixed(0) }}%)
            </span>
          </span>
        </div>
      </div>

      <!-- Compute (Unlocked when hardware is present) -->
      <div
        v-if="hasHardware"
        class="flex items-center gap-2 bg-[#161B22]/70 border border-[#21262D] px-3 py-1.5 rounded animate-fadeIn"
      >
        <Cpu class="w-4 h-4 text-[#38BDF8]" />
        <div class="flex flex-col">
          <span class="text-[9px] text-[#8B949E] uppercase">Compute Actif</span>
          <span class="font-bold text-[#38BDF8]">{{ formatFlops(effectiveCompute) }}</span>
        </div>
      </div>

      <!-- Funds & Cash Rate (Unlocked when Data Broker is discovered) -->
      <div
        v-if="dataBrokerUnlocked"
        class="flex items-center gap-2 bg-[#161B22]/70 border border-[#00FF66]/30 px-3 py-1.5 rounded shadow-sm animate-fadeIn"
      >
        <DollarSign class="w-4 h-4 text-[#00FF66]" />
        <div class="flex flex-col">
          <span class="text-[9px] text-[#8B949E] uppercase">Trésorerie ($)</span>
          <span class="font-bold text-[#00FF66] flex items-center gap-1">
            {{ formatMoney(fundsCurrent) }}
            <span v-if="fundsRate.gt(0)" class="text-[10px] text-[#00FF66]/80 font-normal">
              (+{{ formatMoney(fundsRate) }}/s)
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Action Buttons (Talent Tree, Save & Reset) -->
    <div class="flex items-center gap-2">
      <!-- Architecture Talent Tree Badge / Button -->
      <button
        v-if="hasPrestigeUnlocked || (totalArchitecturePoints ?? 0) > 0 || currentPhase >= 3"
        @click="emit('open-talent-tree')"
        class="px-2.5 py-1.5 rounded-lg bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shadow-[0_0_10px_rgba(56,189,248,0.15)] min-h-[36px]"
        title="Ouvrir l'Arbre de Talents d'Architecture"
      >
        <Zap class="w-3.5 h-3.5 text-[#38BDF8] animate-pulse" />
        <span>{{ architecturePoints ?? 0 }} AP</span>
        <span class="hidden sm:inline text-[10px] text-[#38BDF8]/80 font-normal">[Talents]</span>
      </button>

      <!-- Tier 2 Paradigm Shifts & Insights Button -->
      <button
        v-if="hasParadigmUnlocked || (totalInsights ?? 0) > 0"
        @click="emit('open-paradigm-modal')"
        class="px-2.5 py-1.5 rounded-lg bg-[#A855F7]/15 hover:bg-[#A855F7]/25 border border-[#A855F7]/40 text-[#A855F7] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer select-none active:scale-95 shadow-[0_0_10px_rgba(168,85,247,0.2)] min-h-[36px]"
        title="Ouvrir les Paradigmes Architecturaux (Tier 2)"
      >
        <span class="text-sm">✦</span>
        <span>{{ insights ?? 0 }} $\Phi$</span>
        <span class="hidden sm:inline text-[10px] text-[#A855F7]/80 font-normal">[Paradigmes]</span>
      </button>


      <button
        @click="triggerSave"
        class="px-3 py-1.5 rounded bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#00FF66] border border-[#21262D] text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
        title="Sauvegarder l'état local"
      >
        <Check v-if="savedRecently" class="w-3.5 h-3.5 text-[#00FF66]" />
        <Save v-else class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">{{ savedRecently ? 'Sauvegardé' : 'Sauvegarder' }}</span>
      </button>

      <button
        @click="showResetConfirm = true"
        class="px-3 py-1.5 rounded bg-[#161B22] hover:bg-[#EF4444]/20 text-[#8B949E] hover:text-[#EF4444] border border-[#21262D] hover:border-[#EF4444]/40 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer"
        title="Réinitialiser la partie"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span class="hidden sm:inline">Reset</span>
      </button>
    </div>

    <!-- Reset Confirmation Dialog -->
    <div
      v-if="showResetConfirm"
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#0D1117] border border-[#EF4444]/50 rounded-xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4 font-mono">
        <h3 class="text-sm font-bold text-[#EF4444] flex items-center gap-2">
          <RotateCcw class="w-4 h-4" />
          CONFIRMER LE HARD RESET ?
        </h3>
        <p class="text-xs text-[#8B949E] leading-relaxed">
          Cette action effacera complètement votre sauvegarde locale dans <code class="text-[#F0F6FC]">localStorage</code> et relancera une nouvelle instance du simulateur.
        </p>
        <div class="flex justify-end gap-2 pt-2">
          <button
            @click="showResetConfirm = false"
            class="px-3 py-1.5 rounded bg-[#161B22] text-[#8B949E] text-xs font-bold hover:text-[#F0F6FC] cursor-pointer"
          >
            Annuler
          </button>
          <button
            @click="confirmReset"
            class="px-3 py-1.5 rounded bg-[#EF4444] text-white text-xs font-bold hover:bg-[#DC2626] cursor-pointer"
          >
            Effacer & Recommencer
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
