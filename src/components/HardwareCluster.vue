<script setup lang="ts">
import { computed } from 'vue'
import { HardDrive, Plus, Zap, Cpu, MemoryStick, Activity } from 'lucide-vue-next'
import { formatMoney, formatFlops, formatWatts, formatVram, formatBandwidth } from '@/utils/format'
import type { HardwareNode } from '@/types/game'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  hardwareList: HardwareNode[]
  fundsCurrent: Decimal
  currentPhase: number
  getHardwareCost: (id: string) => Decimal
}>()

const emit = defineEmits<{
  (e: 'buy-hardware', id: string): void
}>()

const visibleHardware = computed(() => {
  return props.hardwareList.filter((hw) => {
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
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-4 shadow-lg animate-fadeIn">
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
            Du PC de récupération aux accélérateurs IA
          </p>
        </div>
      </div>
      <span class="text-[10px] font-mono text-[#8B949E]">
        Poste & Datacenter
      </span>
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
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#21262D] text-[#38BDF8] border border-[#38BDF8]/20 font-normal">
                T{{ hw.tier }}
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
            :disabled="fundsCurrent.lt(getHardwareCost(hw.id))"
            class="px-3.5 py-1.5 rounded bg-[#21262D] hover:bg-[#30363D] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F6FC] hover:text-[#00FF66] text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
          >
            <Plus class="w-3.5 h-3.5" />
            Acquérir
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
