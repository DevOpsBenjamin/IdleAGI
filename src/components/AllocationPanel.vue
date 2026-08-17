<script setup lang="ts">
import { Sliders, DollarSign, Brain, FlaskConical, Lock } from 'lucide-vue-next'
import type { AllocationState } from '@/types/game'

const props = defineProps<{
  allocations: AllocationState
  trainingUnlocked: boolean
  researchUnlocked: boolean
  hasCpu: boolean
}>()

const emit = defineEmits<{
  (e: 'update-allocations', val: AllocationState): void
  (e: 'set-preset', preset: 'balanced' | 'cash' | 'train'): void
}>()

function isPresetActive(preset: 'balanced' | 'cash' | 'train') {
  if (preset === 'cash') {
    return props.allocations.inferencePercent === 100
  }
  if (preset === 'balanced') {
    if (props.researchUnlocked) {
      return props.allocations.inferencePercent === 50 && props.allocations.trainingPercent === 30 && props.allocations.researchPercent === 20
    }
    return props.allocations.inferencePercent === 60 && props.allocations.trainingPercent === 40
  }
  if (preset === 'train') {
    if (props.researchUnlocked) {
      return props.allocations.inferencePercent === 20 && props.allocations.trainingPercent === 70 && props.allocations.researchPercent === 10
    }
    return props.allocations.inferencePercent === 20 && props.allocations.trainingPercent === 80
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
          Allocation du Compute
        </h3>
      </div>
      <span class="text-[10px] font-mono text-[#8B949E]">
        {{ hasCpu ? 'Total : 100%' : 'CPU requis' }}
      </span>
    </div>

    <!-- Cold Boot Notification (no CPU yet) -->
    <div v-if="!hasCpu" class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg text-xs font-mono text-[#8B949E] flex items-center gap-2">
      <Lock class="w-4 h-4 text-[#FFB800] shrink-0" />
      <span>Achetez votre premier processeur (12$) pour activer l'allocation du Compute.</span>
    </div>

    <!-- Locked Training Note -->
    <div v-else-if="!trainingUnlocked" class="bg-[#00FF66]/5 border border-[#00FF66]/20 p-2.5 rounded-lg text-[11px] font-mono text-[#8B949E]">
      <span class="text-[#00FF66] font-bold">100% Inférence Active :</span> Chaque token est vendu pour générer du cash. L'entraînement se débloque après 25 tokens servis.
    </div>

    <!-- Presets Selector (when training is unlocked) -->
    <div v-if="hasCpu && trainingUnlocked" class="grid grid-cols-3 gap-2">
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
        <span class="text-[8px] font-normal opacity-80">100% Inf</span>
      </button>

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
        <span class="text-[8px] font-normal opacity-80">{{ researchUnlocked ? '50/30/20' : '60/40' }}</span>
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
        <span class="text-[8px] font-normal opacity-80">{{ researchUnlocked ? '20/70/10' : '20/80' }}</span>
      </button>
    </div>

    <!-- Allocation Gauges -->
    <div v-if="hasCpu" class="space-y-2 pt-1 text-xs font-mono">
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
          <span class="flex items-center gap-1" :class="trainingUnlocked ? 'text-[#38BDF8]' : 'text-[#8B949E]/60'">
            <Brain class="w-3 h-3" /> Entraînement (Poids)
          </span>
          <span v-if="trainingUnlocked" class="font-bold text-[#F0F6FC]">{{ allocations.trainingPercent }}%</span>
          <span v-else class="text-[9px] text-[#8B949E] flex items-center gap-1">
            <Lock class="w-2.5 h-2.5" /> 25 tokens
          </span>
        </div>
        <div class="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
          <div class="bg-[#38BDF8] h-full transition-all duration-150" :style="{ width: `${allocations.trainingPercent}%` }"></div>
        </div>
      </div>

      <!-- R&D -->
      <div class="space-y-1">
        <div class="flex justify-between items-center text-[10px]">
          <span class="flex items-center gap-1" :class="researchUnlocked ? 'text-[#FFB800]' : 'text-[#8B949E]/60'">
            <FlaskConical class="w-3 h-3" /> Recherche (R&D)
          </span>
          <span v-if="researchUnlocked" class="font-bold text-[#F0F6FC]">{{ allocations.researchPercent }}%</span>
          <span v-else class="text-[9px] text-[#8B949E] flex items-center gap-1">
            <Lock class="w-2.5 h-2.5" /> 500 Params
          </span>
        </div>
        <div class="w-full bg-[#161B22] h-1.5 rounded-full overflow-hidden">
          <div class="bg-[#FFB800] h-full transition-all duration-150" :style="{ width: `${allocations.researchPercent}%` }"></div>
        </div>
      </div>
    </div>
  </div>
</template>
