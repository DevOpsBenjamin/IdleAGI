<script setup lang="ts">
import { computed } from 'vue'
import { MemoryStick, Check } from 'lucide-vue-next'
import { formatMoney } from '@/utils/format'
import type { HardwareNode, SoftwareUpgrade } from '@/types/game'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  currentHost: HardwareNode | null
  ramUpgradesList?: SoftwareUpgrade[]
  fundsCurrent: Decimal
}>()

const emit = defineEmits<{
  (e: 'buy-upgrade', id: string): void
}>()

const visibleRamUpgrades = computed(() => {
  if (!props.ramUpgradesList) return []
  const currentTier = props.currentHost?.tier ?? -1

  return props.ramUpgradesList.filter((up) => {
    if (up.purchased) return true
    if (!props.currentHost) return false

    if (currentTier === 0) {
      return (
        up.id === 'ram_sdram_256mb' ||
        up.id === 'script_ram_expansion_512' ||
        up.id === 'ram_ddr2_8gb' ||
        up.id === 'ram_ddr3_16gb'
      )
    } else if (currentTier === 1) {
      return up.id === 'ram_ddr4_32gb' || up.id === 'ram_ddr4_64gb'
    } else if (currentTier === 2) {
      return up.id === 'ram_ddr5_128gb' || up.id === 'ram_ddr5_256gb'
    } else {
      return true
    }
  })
})

function canAffordUpgrade(up: SoftwareUpgrade): boolean {
  if (up.purchased) return false
  return props.fundsCurrent.gte(up.cost)
}
</script>

<template>
  <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
    <div v-if="visibleRamUpgrades.length === 0" class="p-4 text-center text-xs font-mono text-[#8B949E]">
      Aucune extension de RAM disponible pour le moment.
    </div>

    <div
      v-for="up in visibleRamUpgrades"
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
          <MemoryStick class="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
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
          class="w-full py-1.5 px-3 rounded bg-[#21262D] hover:bg-[#30363D] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F6FC] hover:text-[#FFB800] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
        >
          Installer la barrette
        </button>
      </div>
    </div>
  </div>
</template>
