<script setup lang="ts">
import { ref } from 'vue'
import { Terminal, Zap, Cpu, DollarSign, Save, RotateCcw, Check } from 'lucide-vue-next'
import { formatMoney, formatWatts, formatFlops } from '@/utils/format'
import type { PowerState } from '@/types/game'
import type Decimal from 'break_infinity.js'

defineProps<{
  version: string
  powerState: PowerState
  effectiveCompute: Decimal
  fundsCurrent: Decimal
  fundsRate: Decimal
}>()

const emit = defineEmits<{
  (e: 'save'): void
  (e: 'reset'): void
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
</script>

<template>
  <header class="shrink-0 border-b border-[#21262D] bg-[#0D1117]/90 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-20">
    <!-- Brand & Project Title -->
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66] shadow-[0_0_12px_rgba(0,255,102,0.2)]">
        <Terminal class="w-5 h-5" />
      </div>
      <div>
        <h1 class="text-sm md:text-base font-bold tracking-widest text-[#F0F6FC] flex items-center gap-2 font-mono">
          IDLE AGI
          <span class="text-[10px] px-1.5 py-0.2 rounded bg-[#161B22] border border-[#21262D] text-[#8B949E] font-normal">
            v{{ version }}
          </span>
        </h1>
        <p class="text-[11px] text-[#8B949E] font-mono">Project Singularity Loop // Active Terminal</p>
      </div>
    </div>

    <!-- Quick Metrics Bar -->
    <div class="flex flex-wrap items-center gap-4 md:gap-6 text-xs font-mono">
      <!-- Power Grid -->
      <div class="flex items-center gap-2 bg-[#161B22]/70 border border-[#21262D] px-3 py-1.5 rounded">
        <Zap class="w-4 h-4" :class="powerState.isOverloaded ? 'text-[#EF4444] animate-bounce' : 'text-[#FFB800]'" />
        <div class="flex flex-col">
          <span class="text-[9px] text-[#8B949E] uppercase">Réseau Électrique</span>
          <span class="font-bold text-[#F0F6FC]">
            {{ formatWatts(powerState.totalDrawWatts) }} / {{ formatWatts(powerState.gridCapacityWatts) }}
          </span>
        </div>
      </div>

      <!-- Compute -->
      <div class="flex items-center gap-2 bg-[#161B22]/70 border border-[#21262D] px-3 py-1.5 rounded">
        <Cpu class="w-4 h-4 text-[#38BDF8]" />
        <div class="flex flex-col">
          <span class="text-[9px] text-[#8B949E] uppercase">Compute Actif</span>
          <span class="font-bold text-[#38BDF8]">{{ formatFlops(effectiveCompute) }}</span>
        </div>
      </div>

      <!-- Funds & Cash Rate -->
      <div class="flex items-center gap-2 bg-[#161B22]/70 border border-[#21262D] px-3 py-1.5 rounded">
        <DollarSign class="w-4 h-4 text-[#00FF66]" />
        <div class="flex flex-col">
          <span class="text-[9px] text-[#8B949E] uppercase">Liquidités ($)</span>
          <span class="font-bold text-[#00FF66] flex items-center gap-1">
            {{ formatMoney(fundsCurrent) }}
            <span class="text-[10px] text-[#00FF66]/80 font-normal">
              (+{{ formatMoney(fundsRate) }}/s)
            </span>
          </span>
        </div>
      </div>
    </div>

    <!-- Action Buttons (Save & Reset) -->
    <div class="flex items-center gap-2">
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
