<script setup lang="ts">
import { computed } from 'vue'
import { Wind, Flame, Check } from 'lucide-vue-next'
import { formatMoney, formatWatts } from '@/utils/format'
import type { HardwareNode, SoftwareUpgrade, ThermalState } from '@/types/game'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  currentHost: HardwareNode | null
  coolingUpgradesList?: SoftwareUpgrade[]
  thermalState?: ThermalState
  currentPhase: number
  fundsCurrent: Decimal
}>()

const emit = defineEmits<{
  (e: 'buy-upgrade', id: string): void
}>()

const visibleCoolingUpgrades = computed(() => {
  if (!props.coolingUpgradesList) return []
  const currentTier = props.currentHost?.tier ?? -1

  return props.coolingUpgradesList.filter((up) => {
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

const thermalLoadPercent = computed(() => {
  if (!props.thermalState) return 0
  const heat = props.thermalState.heatGeneratedWatts.toNumber()
  const cooling = props.thermalState.coolingCapacityWatts.toNumber()
  if (cooling <= 0) return 100
  return Math.min(150, Math.round((heat / cooling) * 100))
})

function canAffordUpgrade(up: SoftwareUpgrade): boolean {
  if (up.purchased) return false
  return props.fundsCurrent.gte(up.cost)
}
</script>

<template>
  <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
    <!-- Thermodynamic Live Telemetry Box -->
    <div
      v-if="thermalState"
      class="bg-[#161B22]/90 border rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm transition-all"
      :class="thermalState.isThrottling ? 'border-[#EF4444]/60 bg-[#EF4444]/5' : thermalState.status === 'warm' ? 'border-[#FFB800]/40' : 'border-[#38BDF8]/30'"
    >
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <Flame
            class="w-4 h-4 transition-colors"
            :class="thermalState.isThrottling ? 'text-[#EF4444] animate-pulse' : thermalState.status === 'warm' ? 'text-[#FFB800]' : 'text-[#38BDF8]'"
          />
          <span class="text-xs font-bold text-[#F0F6FC] font-mono uppercase">
            Bilan Thermodynamique Actif
          </span>
        </div>

        <span
          class="text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1"
          :class="thermalState.isThrottling ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40 animate-pulse' : thermalState.status === 'warm' ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40' : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'"
        >
          {{ thermalState.isThrottling ? `Throttling (-${Math.round((1 - thermalState.efficiency) * 100)}%)` : thermalState.status === 'warm' ? 'Chaud (100%)' : 'Nominal (100%)' }}
        </span>
      </div>

      <div class="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
        <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
          <span class="text-[#8B949E]">Chaleur (Q = 0.9·P)</span>
          <span class="font-bold text-[#FFB800] text-xs mt-0.5">
            {{ formatWatts(thermalState.heatGeneratedWatts) }}
          </span>
        </div>
        <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
          <span class="text-[#8B949E]">Dissipation Active</span>
          <span class="font-bold text-[#38BDF8] text-xs mt-0.5">
            {{ formatWatts(thermalState.coolingCapacityWatts) }}
          </span>
        </div>
        <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
          <span class="text-[#8B949E]">Température Cœur</span>
          <span
            class="font-bold text-xs mt-0.5"
            :class="thermalState.isThrottling ? 'text-[#EF4444]' : thermalState.status === 'warm' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
          >
            {{ thermalState.temperatureCelsius.toFixed(1) }} °C
          </span>
        </div>
      </div>

      <!-- Thermal Load Progress Bar -->
      <div class="flex flex-col gap-1 pt-1">
        <div class="flex justify-between text-[9px] text-[#8B949E] font-mono">
          <span>Charge Thermique Cluster</span>
          <span :class="thermalLoadPercent > 100 ? 'text-[#EF4444] font-bold' : 'text-[#8B949E]'">
            {{ thermalLoadPercent }}%
          </span>
        </div>
        <div class="h-1.5 w-full bg-[#0D1117] rounded-full overflow-hidden border border-[#21262D]">
          <div
            class="h-full transition-all duration-300 rounded-full"
            :class="thermalLoadPercent > 100 ? 'bg-[#EF4444]' : thermalLoadPercent > 80 ? 'bg-[#FFB800]' : 'bg-[#38BDF8]'"
            :style="{ width: `${Math.min(100, thermalLoadPercent)}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Cooling Units List -->
    <div
      v-for="up in visibleCoolingUpgrades"
      :key="up.id"
      :class="[
        'border rounded-lg p-3 flex flex-col gap-2 transition-all shadow-sm',
        up.purchased
          ? 'bg-[#161B22]/40 border-[#21262D]/60 opacity-70'
          : 'bg-[#161B22]/80 border-[#21262D] hover:border-[#38BDF8]/40'
      ]"
    >
      <div class="flex justify-between items-start gap-2">
        <div class="flex items-center gap-1.5">
          <Wind class="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
          <span class="text-xs font-bold text-[#F0F6FC] font-mono">
            {{ up.name }}
          </span>
        </div>

        <span
          v-if="up.purchased"
          class="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1 shrink-0"
        >
          <Check class="w-3 h-3" /> Installé
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
          class="w-full py-1.5 px-3 rounded bg-[#21262D] hover:bg-[#30363D] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F6FC] hover:text-[#38BDF8] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
        >
          Installer le module de dissipation
        </button>
      </div>
    </div>
  </div>
</template>
