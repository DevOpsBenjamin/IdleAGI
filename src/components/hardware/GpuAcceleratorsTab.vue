<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, Zap, MemoryStick, Activity, Layers, Plus } from 'lucide-vue-next'
import { formatMoney, formatFlops, formatWatts, formatVram, formatBandwidth } from '@/utils/format'
import type { HardwareNode } from '@/types/game'
import type Decimal from 'break_infinity.js'
import { ComputeEngine } from '@/domain/engine/ComputeEngine'

const props = defineProps<{
  currentHost: HardwareNode | null
  hardwareList: HardwareNode[]
  hardwareRecord: Record<string, HardwareNode>
  fundsCurrent: Decimal
  getHardwareCost: (id: string) => Decimal
}>()

const emit = defineEmits<{
  (e: 'buy-hardware', id: string): void
}>()

const visibleGpus = computed(() => {
  const currentTier = props.currentHost?.tier ?? -1

  return props.hardwareList.filter((hw) => {
    if (hw.category !== 'gpu') return false
    if (hw.count > 0) return true
    const minTier = hw.minHostTier ?? 0
    return minTier <= Math.max(0, currentTier)
  })
})

function canBuyGpu(hw: HardwareNode): boolean {
  const cost = props.getHardwareCost(hw.id)
  if (props.fundsCurrent.lt(cost)) return false
  const check = ComputeEngine.canInstallGpu(props.hardwareRecord, hw)
  return check.canInstall
}

function getGpuButtonLabel(hw: HardwareNode): string {
  const check = ComputeEngine.canInstallGpu(props.hardwareRecord, hw)
  if (!check.canInstall) {
    if (check.reason === 'host_tier_too_low') {
      return `Hôte T${hw.minHostTier ?? 0}+ requis`
    }
    if (check.reason === 'no_pcie_slots') {
      return 'Slot PCIe requis'
    }
  }
  return 'Acquérir'
}
</script>

<template>
  <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
    <div
      v-if="!currentHost || (currentHost.pcieSlotsProvided ?? 0) <= 0"
      class="p-4 rounded-lg bg-[#161B22]/60 border border-[#21262D] text-center text-xs font-mono text-[#8B949E] flex flex-col items-center gap-2"
    >
      <Layers class="w-6 h-6 text-[#38BDF8]/60" />
      <p>
        Votre machine actuelle ne possède aucun port d'extension PCIe x16.
      </p>
      <p class="text-[10px] text-[#38BDF8]">
        Améliorez votre station hôte vers un <strong>Chauffage d'Appoint (Core 2 Quad)</strong> ou supérieur pour installer un GPU dédié.
      </p>
    </div>

    <div
      v-for="hw in visibleGpus"
      :key="hw.id"
      class="bg-[#161B22]/80 border border-[#21262D] hover:border-[#00FF66]/40 transition-all rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm"
    >
      <div class="flex justify-between items-start">
        <div>
          <div class="text-xs font-bold text-[#F0F6FC] font-mono flex items-center gap-2">
            {{ hw.name }}
            <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 font-normal uppercase">
              GPU • T{{ hw.tier }}
            </span>
          </div>
          <div class="text-[10px] text-[#8B949E] font-mono flex flex-wrap items-center gap-2 mt-1">
            <span class="flex items-center gap-1 text-[#38BDF8]">
              <Cpu class="w-3 h-3" /> +{{ formatFlops(hw.tflops) }}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1 text-[#FFB800]">
              <Zap class="w-3 h-3" /> {{ formatWatts(hw.powerWatts) }}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1 text-[#00FF66]">
              <MemoryStick class="w-3 h-3" /> {{ formatVram(hw.vram) }}
            </span>
            <span>•</span>
            <span class="flex items-center gap-1 text-[#E2E8F0]">
              <Activity class="w-3 h-3 text-[#38BDF8]" /> {{ formatBandwidth(hw.memoryBandwidthGBs) }} ({{ hw.memoryType }})
            </span>
            <span class="text-[#FFB800] font-bold">
              • {{ hw.pcieSlotsRequired ?? 1 }} Slot requis
            </span>
          </div>
        </div>

        <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#21262D] text-[#F0F6FC] border border-[#30363D]">
          x{{ hw.count }}
        </span>
      </div>

      <p v-if="hw.description" class="text-[10px] text-[#8B949E] leading-relaxed">
        {{ hw.description }}
      </p>

      <div class="flex justify-between items-center pt-2 border-t border-[#21262D]/60 text-xs font-mono">
        <div class="flex flex-col">
          <span class="text-[9px] text-[#8B949E] uppercase">Coût unitaire</span>
          <span class="font-bold text-[#00FF66]">
            {{ formatMoney(getHardwareCost(hw.id)) }}
          </span>
        </div>

        <button
          @click="emit('buy-hardware', hw.id)"
          :disabled="!canBuyGpu(hw)"
          :class="canBuyGpu(hw) ? 'hover:bg-[#30363D] hover:text-[#00FF66] text-[#F0F6FC]' : 'opacity-40 cursor-not-allowed text-[#8B949E]'"
          class="px-3.5 py-1.5 rounded bg-[#21262D] active:scale-95 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
        >
          <Plus class="w-3.5 h-3.5" />
          {{ getGpuButtonLabel(hw) }}
        </button>
      </div>
    </div>
  </div>
</template>
