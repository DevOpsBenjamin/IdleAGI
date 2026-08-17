<script setup lang="ts">
import { computed } from 'vue'
import { Terminal, Check, Sparkles, DollarSign, Cpu, Layers, Coffee } from 'lucide-vue-next'
import { formatMoney } from '@/utils/format'
import type { SoftwareUpgrade } from '@/types/game'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  upgradesList: SoftwareUpgrade[]
  fundsCurrent: Decimal
  researchPointsCurrent: Decimal
  currentPhase: number
  dataBrokerUnlocked: boolean
  scriptsUnlocked: boolean
  tokenizerUnlocked: boolean
}>()

const emit = defineEmits<{
  (e: 'buy-upgrade', id: string): void
}>()

const visibleUpgrades = computed(() => {
  return props.upgradesList.filter((up) => {
    // Hardware (RAM kits, cooling) are presented in Panel 3 (HardwareCluster)
    if (up.category === 'hardware') return false

    // Already purchased upgrades stay visible as completed
    if (up.purchased) return true

    // Human reading skills are always visible in Phase 0
    if (up.category === 'human') return true

    // Feature requirement checks
    if (up.requiredFeature === 'dataBroker') {
      return props.dataBrokerUnlocked
    }
    if (up.requiredFeature === 'scriptsSection') {
      return props.scriptsUnlocked
    }
    if (up.requiredFeature === 'tokenizerUnlocked') {
      return props.tokenizerUnlocked
    }
    if (up.requiredFeature === 'trainingAllocation') {
      return props.currentPhase >= 3
    }

    return !up.requiredFeature
  })
})

const sortedUpgrades = computed(() => {
  return [...visibleUpgrades.value].sort((a, b) => {
    if (a.purchased === b.purchased) return 0
    return a.purchased ? 1 : -1
  })
})

function canAfford(up: SoftwareUpgrade): boolean {
  if (up.purchased) return false
  if (up.currency === 'funds') {
    return props.fundsCurrent.gte(up.cost)
  }
  return props.researchPointsCurrent.gte(up.cost)
}

function getCategoryIcon(cat: SoftwareUpgrade['category']) {
  switch (cat) {
    case 'human':
      return Coffee
    case 'scraping':
      return Sparkles
    case 'tokenizer':
      return Layers
    case 'monetization':
      return DollarSign
    case 'hardware':
      return Cpu
    default:
      return Terminal
  }
}
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-4 shadow-lg animate-fadeIn">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
          <Terminal class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider font-mono">
            4. Compétences & Scripts Logiciels
          </h3>
          <p class="text-[10px] text-[#8B949E] font-mono">
            Optimisations de lecture, scripts Python et modules
          </p>
        </div>
      </div>
      <span class="text-[10px] font-mono text-[#8B949E]">
        {{ sortedUpgrades.filter(u => u.purchased).length }} / {{ sortedUpgrades.length }} Actifs
      </span>
    </div>

    <!-- Upgrades List -->
    <div class="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
      <div
        v-for="up in sortedUpgrades"
        :key="up.id"
        :class="[
          'border rounded-lg p-3 flex flex-col gap-2 transition-all shadow-sm',
          up.purchased
            ? 'bg-[#161B22]/40 border-[#21262D]/60 opacity-70'
            : 'bg-[#161B22]/80 border-[#21262D] hover:border-[#38BDF8]/40'
        ]"
      >
        <!-- Top Bar -->
        <div class="flex justify-between items-start gap-2">
          <div class="flex items-center gap-1.5">
            <component
              :is="getCategoryIcon(up.category)"
              class="w-3.5 h-3.5 text-[#38BDF8] shrink-0"
            />
            <span class="text-xs font-bold text-[#F0F6FC] font-mono">
              {{ up.name }}
            </span>
          </div>

          <span
            v-if="up.purchased"
            class="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1 shrink-0"
          >
            <Check class="w-3 h-3" /> Acquis
          </span>
          <span
            v-else
            class="text-xs font-mono font-bold text-[#00FF66] shrink-0"
          >
            {{ formatMoney(up.cost) }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-[10px] text-[#8B949E] leading-relaxed">
          {{ up.description }}
        </p>

        <!-- Buy Action Button if not purchased -->
        <div v-if="!up.purchased" class="flex justify-end pt-1">
          <button
            @click="emit('buy-upgrade', up.id)"
            :disabled="!canAfford(up)"
            class="w-full py-1.5 px-3 rounded bg-[#21262D] hover:bg-[#30363D] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F6FC] hover:text-[#38BDF8] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
          >
            Débloquer l'optimisation
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
