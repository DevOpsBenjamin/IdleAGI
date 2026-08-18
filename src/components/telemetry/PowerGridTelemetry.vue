<script setup lang="ts">
import { computed } from 'vue'
import { Zap } from 'lucide-vue-next'
import { formatWatts } from '@/utils/format'
import type { PowerState } from '@/types/game'

const props = defineProps<{
  powerState: PowerState
}>()

const POWER_SEGMENT_COUNT = 16
const powerSegments = computed(() => {
  const loadPercent = props.powerState.gridLoadPercent
  const step = 120 / POWER_SEGMENT_COUNT
  const segments = []

  for (let i = 0; i < POWER_SEGMENT_COUNT; i++) {
    const threshold = (i + 1) * step
    const isActive = loadPercent >= threshold - step / 2
    const isOverloaded = threshold > 100
    const isStrained = threshold > 80 && threshold <= 100

    segments.push({
      index: i,
      thresholdPercent: Math.round(threshold),
      isActive,
      isOverloaded,
      isStrained,
    })
  }
  return segments
})
</script>

<template>
  <div class="bg-[#161B22]/50 border border-[#21262D] rounded-lg p-3 flex flex-col gap-2 font-mono">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-1.5 text-xs text-[#8B949E]">
        <Zap class="w-3.5 h-3.5 text-[#FFB800]" />
        <span class="font-bold text-[#F0F6FC]">Réseau Électrique (Grid Load)</span>
      </div>
      <div class="text-xs font-bold flex items-center gap-1.5 font-mono">
        <span
          :class="[
            powerState.isOverloaded
              ? 'text-[#EF4444] animate-pulse'
              : powerState.gridLoadPercent > 80
                ? 'text-[#FFB800]'
                : 'text-[#00FF66]',
          ]"
        >
          {{ powerState.gridLoadPercent.toFixed(1) }}%
        </span>
        <span class="text-[10px] text-[#8B949E] font-normal">
          ({{ formatWatts(powerState.totalDrawWatts) }} / {{ formatWatts(powerState.gridCapacityWatts) }})
        </span>
      </div>
    </div>

    <!-- Power Segmented Bar -->
    <div class="grid grid-cols-16 gap-1 h-3 p-0.5 bg-[#07090E] border border-[#21262D] rounded">
      <div
        v-for="seg in powerSegments"
        :key="seg.index"
        class="h-full rounded-xs transition-colors duration-150"
        :class="[
          !seg.isActive
            ? 'bg-[#21262D]/40'
            : seg.isOverloaded
              ? 'bg-[#EF4444] shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse'
              : seg.isStrained
                ? 'bg-[#FFB800] shadow-[0_0_5px_rgba(255,184,0,0.6)]'
                : 'bg-[#38BDF8] shadow-[0_0_4px_rgba(56,189,248,0.4)]',
        ]"
      ></div>
    </div>

    <div class="flex items-center justify-between text-[9px] text-[#8B949E]">
      <span class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span> Nominal (&lt; 80%)
      </span>
      <span class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-[#FFB800]"></span> Tension (80-100%)
      </span>
      <span class="flex items-center gap-1">
        <span class="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span> Surcharge (&gt; 100%)
      </span>
    </div>
  </div>
</template>
