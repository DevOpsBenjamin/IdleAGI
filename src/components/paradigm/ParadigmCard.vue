<script setup lang="ts">
import { computed } from 'vue'
import { Sparkles, Check, Lock, Cpu, Flame, Activity } from 'lucide-vue-next'
import type { ParadigmDefinition } from '@/types/paradigm'

const props = defineProps<{
  paradigm: ParadigmDefinition
  isUnlocked: boolean
  isActive: boolean
  canUnlock: boolean
}>()

const emit = defineEmits<{
  (e: 'action', paradigm: ParadigmDefinition): void
}>()

const cardBorderClass = computed(() => {
  if (props.isActive) {
    return 'border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.25)] ring-1 ring-[#00FF66]/50 bg-[#00FF66]/5'
  }
  if (props.isUnlocked) {
    return 'border-[#A855F7]/60 shadow-[0_0_15px_rgba(168,85,247,0.15)] bg-[#161B22]'
  }
  if (props.canUnlock) {
    return 'border-[#38BDF8]/60 shadow-[0_0_15px_rgba(56,189,248,0.15)] bg-[#161B22]/80 hover:border-[#38BDF8]'
  }
  return 'border-[#21262D] opacity-60 bg-[#161B22]/40'
})
</script>

<template>
  <div
    class="rounded-xl border p-4 sm:p-5 flex flex-col justify-between gap-4 transition-all font-mono"
    :class="cardBorderClass"
  >
    <div class="flex flex-col gap-3">
      <!-- Card Header -->
      <div class="flex items-start justify-between gap-2">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm sm:text-base font-bold text-[#F0F6FC] tracking-wide">
              {{ paradigm.name }}
            </h3>
            <span
              v-if="isActive"
              class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00FF66]/20 border border-[#00FF66]/50 text-[#00FF66] flex items-center gap-1"
            >
              <Check class="w-3 h-3" />
              ACTIF
            </span>
          </div>
          <p class="text-xs text-[#8B949E]">{{ paradigm.subtitle }}</p>
        </div>

        <div
          class="px-2.5 py-1 rounded text-xs font-bold font-mono shrink-0"
          :class="
            isUnlocked
              ? 'bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7]'
              : canUnlock
                ? 'bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8]'
                : 'bg-[#21262D] text-[#8B949E]'
          "
        >
          {{ isUnlocked ? 'DÉBLOQUÉ' : `${paradigm.cost} $\\Phi$` }}
        </div>
      </div>

      <p class="text-xs text-[#E2E8F0] leading-relaxed">
        {{ paradigm.description }}
      </p>

      <!-- Multipliers Specs Grid -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
        <div class="bg-black/40 border border-[#21262D] rounded p-2 flex flex-col">
          <span class="text-[10px] text-[#8B949E] flex items-center gap-1">
            <Cpu class="w-3 h-3 text-[#00FF66]" />
            Compute Brut
          </span>
          <span class="font-bold text-[#00FF66]">x{{ paradigm.tflopsMultiplier.toFixed(1) }} TFLOPS</span>
        </div>

        <div class="bg-black/40 border border-[#21262D] rounded p-2 flex flex-col">
          <span class="text-[10px] text-[#8B949E] flex items-center gap-1">
            <Flame class="w-3 h-3 text-[#FFB800]" />
            Chaleur & Watts
          </span>
          <span class="font-bold text-[#FFB800]">
            {{ paradigm.powerReduction > 0 ? `-${Math.round(paradigm.powerReduction * 100)}% Watts` : 'Standard' }}
          </span>
        </div>

        <div class="bg-black/40 border border-[#21262D] rounded p-2 flex flex-col col-span-2 sm:col-span-1">
          <span class="text-[10px] text-[#8B949E] flex items-center gap-1">
            <Activity class="w-3 h-3 text-[#38BDF8]" />
            Synthèse
          </span>
          <span class="font-bold text-[#38BDF8]">
            {{ paradigm.syntheticSpeedBonus > 1.0 ? `+${Math.round((paradigm.syntheticSpeedBonus - 1) * 100)}% Débit` : 'Standard' }}
          </span>
        </div>
      </div>

      <!-- Sci-Fi Lore Quote -->
      <blockquote class="text-[11px] italic text-[#8B949E] border-l-2 border-[#A855F7]/40 pl-2.5 py-0.5 bg-black/20 rounded-r">
        {{ paradigm.quote }}
      </blockquote>
    </div>

    <!-- Action Button -->
    <div class="pt-2 border-t border-[#21262D]">
      <button
        type="button"
        :disabled="isActive || (!isUnlocked && !canUnlock)"
        class="w-full py-2.5 px-4 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 min-h-[44px] select-none touch-manipulation"
        :class="[
          isActive
            ? 'bg-[#00FF66]/20 border border-[#00FF66]/40 text-[#00FF66] cursor-default'
            : isUnlocked
              ? 'bg-[#A855F7] hover:bg-[#9333EA] text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer active:scale-95'
              : canUnlock
                ? 'bg-[#38BDF8] hover:bg-[#0284C7] text-black shadow-[0_0_15px_rgba(56,189,248,0.3)] cursor-pointer active:scale-95'
                : 'bg-[#21262D] text-[#8B949E] cursor-not-allowed opacity-50',
        ]"
        @click="emit('action', paradigm)"
      >
        <Check v-if="isActive" class="w-4 h-4" />
        <Sparkles v-else-if="isUnlocked || canUnlock" class="w-4 h-4" />
        <Lock v-else class="w-4 h-4" />
        <span>
          {{
            isActive
              ? 'Architecture Active'
              : isUnlocked
                ? 'Activer cette Architecture'
                : canUnlock
                  ? `Débloquer pour ${paradigm.cost} $\\Phi$`
                  : `Verrouillé (${paradigm.cost} $\\Phi$ requis)`
          }}
        </span>
      </button>
    </div>
  </div>
</template>
