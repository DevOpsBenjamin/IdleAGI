<script setup lang="ts">
import { ref, computed } from 'vue'
import { HardDrive, Plus, Zap, Cpu, MemoryStick, Activity, Layers, Server } from 'lucide-vue-next'
import { formatMoney, formatFlops, formatWatts, formatVram, formatBandwidth } from '@/utils/format'
import type { HardwareNode } from '@/types/game'
import type Decimal from 'break_infinity.js'
import { ComputeEngine, type PcieSlotsState } from '@/domain/engine/ComputeEngine'

const props = defineProps<{
  hardwareList: HardwareNode[]
  fundsCurrent: Decimal
  currentPhase: number
  pcieSlots?: PcieSlotsState
  getHardwareCost: (id: string) => Decimal
}>()

const emit = defineEmits<{
  (e: 'buy-hardware', id: string): void
}>()

const activeTab = ref<'all' | 'host' | 'gpu'>('all')

const hardwareRecord = computed(() => {
  const map: Record<string, HardwareNode> = {}
  for (const node of props.hardwareList) {
    map[node.id] = node
  }
  return map
})

const visibleHardware = computed(() => {
  return props.hardwareList.filter((hw) => {
    // Filter by tab
    if (activeTab.value !== 'all' && hw.category !== activeTab.value) return false

    // Already owned hardware is always visible
    if (hw.count > 0) return true

    // Tier 0 hardware (Potato PC, Core 2 Quad) always visible once hardware section is unlocked
    if (hw.tier === 0) return true

    // Higher tiers unlock when player has accumulated decent capital or unlocked corresponding phase
    const thresholdRatio = hw.tier === 1 ? 0.3 : hw.tier === 2 ? 0.2 : 0.15
    const costThreshold = hw.baseCost.mul(thresholdRatio)
    return props.fundsCurrent.gte(costThreshold) || props.currentPhase >= hw.tier
  })
})

function canBuyNode(hw: HardwareNode): boolean {
  const cost = props.getHardwareCost(hw.id)
  if (props.fundsCurrent.lt(cost)) return false
  if (hw.category === 'gpu') {
    const check = ComputeEngine.canInstallGpu(hardwareRecord.value, hw)
    if (!check.canInstall) return false
  }
  return true
}

function getBuyButtonLabel(hw: HardwareNode): string {
  if (hw.category === 'gpu') {
    const check = ComputeEngine.canInstallGpu(hardwareRecord.value, hw)
    if (!check.canInstall) {
      if (check.reason === 'host_tier_too_low') {
        return `Hôte T${hw.minHostTier ?? 0}+ requis`
      }
      if (check.reason === 'no_pcie_slots') {
        return 'Slot PCIe requis'
      }
    }
  }
  return 'Acquérir'
}
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-3 shadow-lg animate-fadeIn">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1.5 rounded bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20">
          <HardDrive class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider font-mono">
            3. Matériel & Nœuds de Calcul
          </h3>
          <p class="text-[10px] text-[#8B949E] font-mono">
            Stations Hôtes, Slots PCIe & Accélérateurs Dédiés
          </p>
        </div>
      </div>

      <!-- PCIe Slots Overview Badge -->
      <div v-if="pcieSlots" class="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161B22] border border-[#21262D] text-[10px] font-mono">
        <Layers class="w-3 h-3 text-[#38BDF8]" />
        <span class="text-[#8B949E]">PCIe :</span>
        <span :class="pcieSlots.freeSlots > 0 ? 'text-[#00FF66] font-bold' : pcieSlots.totalSlots > 0 ? 'text-[#FFB800] font-bold' : 'text-[#8B949E]'">
          {{ pcieSlots.usedSlots }} / {{ pcieSlots.totalSlots }}
        </span>
        <span v-if="pcieSlots.totalSlots > 0" class="text-[9px] text-[#8B949E]">
          ({{ pcieSlots.freeSlots }} libre{{ pcieSlots.freeSlots > 1 ? 's' : '' }})
        </span>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="flex items-center gap-1 bg-[#161B22] p-1 rounded-md border border-[#21262D] text-xs font-mono">
      <button
        @click="activeTab = 'all'"
        :class="activeTab === 'all' ? 'bg-[#21262D] text-[#F0F6FC] font-bold shadow-sm' : 'text-[#8B949E] hover:text-[#F0F6FC]'"
        class="flex-1 py-1 rounded transition-all cursor-pointer text-center"
      >
        Tout
      </button>
      <button
        @click="activeTab = 'host'"
        :class="activeTab === 'host' ? 'bg-[#21262D] text-[#38BDF8] font-bold shadow-sm' : 'text-[#8B949E] hover:text-[#38BDF8]'"
        class="flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
      >
        <Server class="w-3 h-3" />
        Hôtes & RAM
      </button>
      <button
        @click="activeTab = 'gpu'"
        :class="activeTab === 'gpu' ? 'bg-[#21262D] text-[#00FF66] font-bold shadow-sm' : 'text-[#8B949E] hover:text-[#00FF66]'"
        class="flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
      >
        <Zap class="w-3 h-3" />
        GPUs & Accélérateurs
      </button>
    </div>

    <!-- Hardware Nodes List -->
    <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
      <div
        v-for="hw in visibleHardware"
        :key="hw.id"
        class="bg-[#161B22]/80 border border-[#21262D] hover:border-[#38BDF8]/40 transition-all rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm"
      >
        <!-- Node Top Bar -->
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-bold text-[#F0F6FC] font-mono flex items-center gap-2">
              {{ hw.name }}
              <span
                :class="hw.category === 'host' ? 'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20' : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/20'"
                class="text-[9px] px-1.5 py-0.2 rounded border font-normal uppercase"
              >
                {{ hw.category === 'host' ? 'Hôte' : 'GPU' }} • T{{ hw.tier }}
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
              <!-- PCIe slot info -->
              <span v-if="hw.category === 'host' && (hw.pcieSlotsProvided ?? 0) > 0" class="text-[#38BDF8] font-bold">
                • +{{ hw.pcieSlotsProvided }} Slot PCIe
              </span>
              <span v-else-if="hw.category === 'gpu'" class="text-[#FFB800] font-bold">
                • {{ hw.pcieSlotsRequired ?? 1 }} Slot (Hôte T{{ hw.minHostTier ?? 0 }}+)
              </span>
            </div>
          </div>

          <!-- Quantity Badge -->
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#21262D] text-[#F0F6FC] border border-[#30363D]">
            x{{ hw.count }}
          </span>
        </div>

        <!-- Node Description -->
        <p v-if="hw.description" class="text-[10px] text-[#8B949E] leading-relaxed">
          {{ hw.description }}
        </p>

        <!-- Bottom Cost & Acquisition Action -->
        <div class="flex justify-between items-center pt-2 border-t border-[#21262D]/60 text-xs font-mono">
          <div class="flex flex-col">
            <span class="text-[9px] text-[#8B949E] uppercase">Coût unitaire</span>
            <span class="font-bold text-[#00FF66]">
              {{ formatMoney(getHardwareCost(hw.id)) }}
            </span>
          </div>

          <button
            @click="emit('buy-hardware', hw.id)"
            :disabled="!canBuyNode(hw)"
            :class="canBuyNode(hw) ? 'hover:bg-[#30363D] hover:text-[#00FF66] text-[#F0F6FC]' : 'opacity-40 cursor-not-allowed text-[#8B949E]'"
            class="px-3.5 py-1.5 rounded bg-[#21262D] active:scale-95 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
          >
            <Plus class="w-3.5 h-3.5" />
            {{ getBuyButtonLabel(hw) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
