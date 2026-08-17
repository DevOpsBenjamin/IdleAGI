<script setup lang="ts">
import { computed } from 'vue'
import { Zap, Check } from 'lucide-vue-next'
import { formatMoney, formatWatts } from '@/utils/format'
import type { HardwareNode, SoftwareUpgrade, PowerState } from '@/types/game'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  currentHost: HardwareNode | null
  powerUpgradesList?: SoftwareUpgrade[]
  powerState?: PowerState
  currentPhase: number
  fundsCurrent: Decimal
}>()

const emit = defineEmits<{
  (e: 'buy-upgrade', id: string): void
}>()

const visiblePowerUpgrades = computed(() => {
  if (!props.powerUpgradesList) return []
  const currentTier = props.currentHost?.tier ?? -1

  return props.powerUpgradesList.filter((up) => {
    if (up.purchased) return true
    if (!props.currentHost) return false

    if (up.requiredFeature === 'scriptsSection') {
      return props.currentPhase >= 1
    }
    if (up.requiredFeature === 'tokenizerUnlocked') {
      return props.currentPhase >= 2
    }
    if (up.requiredFeature === 'trainingAllocation') {
      return props.currentPhase >= 3 || currentTier >= 2
    }
    return true
  })
})

function canAffordUpgrade(up: SoftwareUpgrade): boolean {
  if (up.purchased) return false
  return props.fundsCurrent.gte(up.cost)
}
</script>

<template>
  <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
    <!-- Power Grid Status Card -->
    <div
      v-if="powerState"
      class="bg-[#161B22]/90 border rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm transition-all"
      :class="powerState.isOverloaded ? 'border-[#EF4444]/60 bg-[#EF4444]/5' : powerState.status === 'strained' ? 'border-[#FFB800]/40' : 'border-[#00FF66]/30'"
    >
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <Zap
            class="w-4 h-4 transition-colors"
            :class="powerState.isOverloaded ? 'text-[#EF4444] animate-bounce' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
          />
          <span class="text-xs font-bold text-[#F0F6FC] font-mono uppercase">
            Bilan du Réseau Électrique
          </span>
        </div>

        <span
          class="text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1"
          :class="powerState.isOverloaded ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40 animate-pulse' : powerState.status === 'strained' ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40' : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'"
        >
          {{ powerState.isOverloaded ? 'Surcharge (-50% Compute)' : powerState.status === 'strained' ? 'En Charge (100%)' : 'Nominal (100%)' }}
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
        <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
          <span class="text-[#8B949E]">Puissance Appelée</span>
          <span class="font-bold text-[#FFB800] text-xs mt-0.5">
            {{ formatWatts(powerState.totalDrawWatts) }}
          </span>
        </div>
        <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
          <span class="text-[#8B949E]">Capacité Réseau</span>
          <span class="font-bold text-[#00FF66] text-xs mt-0.5">
            {{ formatWatts(powerState.gridCapacityWatts) }}
          </span>
        </div>
        <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
          <span class="text-[#8B949E]">Multiplicateur Compute</span>
          <span
            class="font-bold text-xs mt-0.5"
            :class="powerState.isOverloaded ? 'text-[#EF4444]' : 'text-[#00FF66]'"
          >
            {{ Math.round(powerState.effectiveMultiplier * 100) }}%
          </span>
        </div>
      </div>

      <!-- Power Load Progress Bar -->
      <div class="flex flex-col gap-1 pt-1">
        <div class="flex justify-between text-[9px] text-[#8B949E] font-mono">
          <span>Charge du Réseau Électrique</span>
          <span :class="powerState.isOverloaded ? 'text-[#EF4444] font-bold' : powerState.status === 'strained' ? 'text-[#FFB800] font-bold' : 'text-[#8B949E]'">
            {{ powerState.gridLoadPercent.toFixed(1) }}%
          </span>
        </div>
        <div class="h-1.5 w-full bg-[#0D1117] rounded-full overflow-hidden border border-[#21262D]">
          <div
            class="h-full transition-all duration-300 rounded-full"
            :class="powerState.isOverloaded ? 'bg-[#EF4444]' : powerState.status === 'strained' ? 'bg-[#FFB800]' : 'bg-[#00FF66]'"
            :style="{ width: `${Math.min(100, powerState.gridLoadPercent)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Power Upgrades List -->
    <div
      v-for="up in visiblePowerUpgrades"
      :key="up.id"
      :class="[
        'border rounded-lg p-3 flex flex-col gap-2 transition-all shadow-sm',
        up.purchased
          ? 'bg-[#161B22]/40 border-[#21262D]/60 opacity-70'
          : 'bg-[#161B22]/80 border-[#21262D] hover:border-[#FFB800]/40'
      ]"
    >
      <div class="flex justify-between items-start gap-2">
        <div class="flex items-center gap-1.5">
          <Zap class="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
          <span class="text-xs font-bold text-[#F0F6FC] font-mono">
            {{ up.name }}
          </span>
        </div>

        <span
          v-if="up.purchased"
          class="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1 shrink-0"
        >
          <Check class="w-3 h-3" /> Connecté
        </span>
        <span
          v-else
          class="text-xs font-mono font-bold text-[#00FF66] shrink-0"
        >
          {{ formatMoney(up.cost) }}
        </span>
      </div>

      <p class="text-[10px] text-[#8B949E] leading-relaxed">
        {{ up.description }}
      </p>

      <div v-if="!up.purchased" class="flex justify-end pt-1">
        <button
          @click="emit('buy-upgrade', up.id)"
          :disabled="!canAffordUpgrade(up)"
          class="w-full py-1.5 px-3 rounded bg-[#21262D] hover:bg-[#30363D] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F6FC] hover:text-[#FFB800] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
        >
          Mettre à niveau l’infrastructure électrique
        </button>
      </div>
    </div>
  </div>
</template>
