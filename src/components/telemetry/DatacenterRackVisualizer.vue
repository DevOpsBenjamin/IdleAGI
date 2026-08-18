<script setup lang="ts">
import { computed } from 'vue'
import { Server, Layers, Cpu } from 'lucide-vue-next'
import { formatFlops, formatVram } from '@/utils/format'
import type { HardwareNode } from '@/types/game'
import type { PcieSlotsState } from '@/domain/engine/ComputeEngine'

const props = defineProps<{
  activeHostNode: HardwareNode | null
  hardwareList: HardwareNode[]
  pcieSlots?: PcieSlotsState
}>()

const installedGpus = computed(() => {
  return props.hardwareList.filter((hw) => hw.category === 'gpu' && hw.count > 0)
})

const emptyPcieSlotsCount = computed(() => {
  if (!props.pcieSlots) return 0
  return Math.max(0, props.pcieSlots.freeSlots)
})
</script>

<template>
  <div class="bg-[#161B22]/50 border border-[#21262D] rounded-lg p-3 flex flex-col gap-2 font-mono">
    <div class="flex items-center justify-between text-xs">
      <div class="flex items-center gap-1.5 text-[#8B949E]">
        <Server class="w-3.5 h-3.5 text-[#38BDF8]" />
        <span class="font-bold text-[#F0F6FC]">Baie Serveur // Topologie Hardware</span>
      </div>
      <span class="text-[10px] text-[#8B949E]">
        Hôte actif : <strong class="text-[#38BDF8]">{{ activeHostNode?.name || 'Aucun' }}</strong>
      </span>
    </div>

    <!-- Rack Visualization Grid -->
    <div class="flex flex-col gap-1.5 p-2 bg-[#07090E] border border-[#21262D] rounded">
      <!-- Active Host Server Bar -->
      <div
        class="flex items-center justify-between px-2.5 py-1.5 rounded bg-[#161B22] border border-[#38BDF8]/40 text-xs"
      >
        <div class="flex items-center gap-2">
          <Server class="w-4 h-4 text-[#38BDF8]" />
          <div>
            <span class="font-bold text-[#F0F6FC]">{{ activeHostNode?.name || 'Station Standard' }}</span>
            <span class="text-[10px] text-[#8B949E] ml-2">
              Slots PCIe : {{ pcieSlots?.usedSlots || 0 }} / {{ pcieSlots?.totalSlots || 0 }}
            </span>
          </div>
        </div>
        <div class="text-[10px] text-[#8B949E]">
          <span class="text-[#00FF66] font-bold">En ligne</span>
        </div>
      </div>

      <!-- PCIe Slots & GPUs List -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
        <!-- GPU Cards Installed -->
        <div
          v-for="gpu in installedGpus"
          :key="gpu.id"
          class="flex items-center justify-between px-2 py-1.5 rounded bg-[#161B22]/80 border border-[#00FF66]/30 text-xs"
        >
          <div class="flex items-center gap-2">
            <Cpu class="w-3.5 h-3.5 text-[#00FF66]" />
            <div class="flex flex-col">
              <span class="font-bold text-[#F0F6FC] text-[11px] leading-tight">
                {{ gpu.count }}x {{ gpu.name }}
              </span>
              <span class="text-[9px] text-[#8B949E]">
                {{ formatFlops(gpu.tflops.times(gpu.count)) }} | {{ formatVram(gpu.vram.times(gpu.count)) }}
              </span>
            </div>
          </div>
          <span class="text-[9px] px-1.5 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 font-bold">
            PCIe x16
          </span>
        </div>

        <!-- Empty PCIe Slots -->
        <div
          v-for="slotIdx in emptyPcieSlotsCount"
          :key="'empty-' + slotIdx"
          class="flex items-center justify-between px-2 py-1.5 rounded bg-[#0D1117] border border-dashed border-[#21262D] text-xs text-[#8B949E]/60"
        >
          <span class="flex items-center gap-1.5 text-[10px]">
            <Layers class="w-3 h-3 text-[#8B949E]/40" /> {{ emptyPcieSlotsCount }} Emplacement(s) PCIe x16 libre(s)
          </span>
          <span class="text-[9px] text-[#8B949E]/40">Disponible</span>
        </div>
      </div>
    </div>
  </div>
</template>
