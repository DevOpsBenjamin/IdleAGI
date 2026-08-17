<script setup lang="ts">
import { Sliders, DollarSign, Brain, FlaskConical } from 'lucide-vue-next'
import type { AllocationState } from '@/types/game'

const props = defineProps<{
  allocations: AllocationState
}>()

const emit = defineEmits<{
  (e: 'update-allocations', val: AllocationState): void
  (e: 'set-preset', preset: 'balanced' | 'cash' | 'train'): void
}>()

function isPresetActive(preset: 'balanced' | 'cash' | 'train') {
  if (preset === 'balanced') {
    return props.allocations.inferencePercent === 50 && props.allocations.trainingPercent === 30 && props.allocations.researchPercent === 20
  }
  if (preset === 'cash') {
    return props.allocations.inferencePercent === 80 && props.allocations.trainingPercent === 10 && props.allocations.researchPercent === 10
  }
  if (preset === 'train') {
    return props.allocations.inferencePercent === 10 && props.allocations.trainingPercent === 70 && props.allocations.researchPercent === 20
  }
  return false
}
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded bg-[#00FF66]/10 text-[#00FF66]">
          <Sliders class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
          Tri-Allocation du Compute
        </h3>
      </div>
      <span class="text-[10px] font-mono text-[#8B949E]">
        Total : 100%
      </span>
    </div>

    <!-- Presets Selector -->
    <div class="grid grid-cols-3 gap-2">
      <button
        @click="emit('set-preset', 'balanced')"
        :class="[
          'py-1.5 px-2 rounded text-[10px] font-mono font-bold transition-all border cursor-pointer flex flex-col items-center gap-0.5',
          isPresetActive('balanced')
            ? 'bg-[#38BDF8]/20 border-[#38BDF8] text-[#38BDF8]'
            : 'bg-[#161B22] border-[#21262D] text-[#8B949E] hover:text-[#F0F6FC]'
        ]"
      >
        <span>Équilibré</span>
        <span class="text-[8px] font-normal opacity-80">50 / 30 / 20</span>
      </button>

      <button
        @click="emit('set-preset', 'cash')"
        :class="[
          'py-1.5 px-2 rounded text-[10px] font-mono font-bold transition-all border cursor-pointer flex flex-col items-center gap-0.5',
          isPresetActive('cash')
            ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]'
            : 'bg-[#161B22] border-[#21262D] text-[#8B949E] hover:text-[#F0F6FC]'
        ]"
      >
        <span>Cash Rush</span>
        <span class="text-[8px] font-normal opacity-80">80 / 10 / 10</span>
      </button>

      <button
        @click="emit('set-preset', 'train')"
        :class="[
          'py-1.5 px-2 rounded text-[10px] font-mono font-bold transition-all border cursor-pointer flex flex-col items-center gap-0.5',
          isPresetActive('train')
            ? 'bg-[#FFB800]/20 border-[#FFB800] text-[#FFB800]'
            : 'bg-[#161B22] border-[#21262D] text-[#8B949E] hover:text-[#F0F6FC]'
        ]"
      >
        <span>Training</span>
        <span class="text-[8px] font-normal opacity-80">10 / 70 / 20</span>
      </button>
    </div>

    <!-- Allocation Sliders / Visual Gauges -->
    <div class="space-y-2 pt-1 text-xs font-mono">
      <!-- Inference -->
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-[#00FF66] flex items-center gap-1">
            <DollarSign class="w-3 h-3" /> Inférence (Vente API)
          </span>
          <span class="font-bold text-[#F0F6FC]">{{ allocations.inferencePercent }}%</span>
        </div>
        <div class="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
          <div class="bg-[#00FF66] h-full transition-all duration-150" :style="{ width: `${allocations.inferencePercent}%` }"></div>
        </div>
      </div>

      <!-- Training -->
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-[#38BDF8] flex items-center gap-1">
            <Brain class="w-3 h-3" /> Entraînement (Poids)
          </span>
          <span class="font-bold text-[#F0F6FC]">{{ allocations.trainingPercent }}%</span>
        </div>
        <div class="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
          <div class="bg-[#38BDF8] h-full transition-all duration-150" :style="{ width: `${allocations.trainingPercent}%` }"></div>
        </div>
      </div>

      <!-- R&D -->
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span class="text-[#FFB800] flex items-center gap-1">
            <FlaskConical class="w-3 h-3" /> Recherche (R&D)
          </span>
          <span class="font-bold text-[#F0F6FC]">{{ allocations.researchPercent }}%</span>
        </div>
        <div class="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
          <div class="bg-[#FFB800] h-full transition-all duration-150" :style="{ width: `${allocations.researchPercent}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>
