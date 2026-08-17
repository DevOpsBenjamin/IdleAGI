<script setup lang="ts">
import { Activity, Flame, Wifi } from 'lucide-vue-next'
import type { ThermalState } from '@/types/game'

defineProps<{
  fps: number
  tps: number
  thermalState: ThermalState
}>()
</script>

<template>
  <footer class="shrink-0 border-t border-[#21262D] bg-[#0D1117] px-6 py-2.5 text-xs text-[#8B949E] flex flex-wrap justify-between items-center gap-3 font-mono z-20">
    <div class="flex items-center gap-2">
      <span class="text-[#00FF66] font-bold">Project Singularity Loop</span>
      <span>•</span>
      <span>100% Client-Side Engine</span>
      <span>•</span>
      <span class="flex items-center gap-1 text-[#38BDF8]">
        <Wifi class="w-3.5 h-3.5" /> PWA Offline-First
      </span>
    </div>

    <div class="flex items-center gap-4">
      <!-- Loop Engine Rate -->
      <span class="flex items-center gap-1.5">
        <Activity class="w-3.5 h-3.5 text-[#00FF66]" />
        <span class="text-[#F0F6FC] font-semibold">{{ tps }} Ticks/s</span>
        <span class="text-[#8B949E]/70">({{ fps }} FPS)</span>
      </span>

      <span>•</span>

      <!-- Thermals & Throttling -->
      <span class="flex items-center gap-1.5">
        <Flame
          class="w-3.5 h-3.5 transition-colors"
          :class="thermalState.isThrottling ? 'text-[#FFB800] animate-pulse' : 'text-[#38BDF8]'"
        />
        <span :class="thermalState.isThrottling ? 'text-[#FFB800] font-semibold' : 'text-[#8B949E]'">
          Thermique : {{ thermalState.isThrottling ? `${Math.round((1 - thermalState.efficiency) * 100)}% Throttling` : 'Nominal' }}
        </span>
      </span>
    </div>
  </footer>
</template>
