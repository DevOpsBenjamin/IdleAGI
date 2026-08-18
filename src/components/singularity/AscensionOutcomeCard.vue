<script setup lang="ts">
import { computed } from 'vue'
import {
  Sparkles,
  HeartHandshake,
  AlertOctagon,
  RotateCcw,
  Layers,
  Shield,
} from 'lucide-vue-next'
import type { SingularityEndingDefinition, SingularityEndingId } from '@/types/singularity'
import { SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE } from '@/domain/constants/singularity'

const props = defineProps<{
  activeEndingDef: SingularityEndingDefinition
  chronoCores: number
  singularitiesCompleted: number
  discoveredEndings: SingularityEndingId[]
}>()

const emit = defineEmits<{
  (e: 'select-ending', id: SingularityEndingId): void
  (e: 'request-ascension'): void
}>()

const nextChronoCoresCount = computed(() => (props.chronoCores ?? 0) + 1)
const currentGlobalMultiplier = computed(
  () => 1.0 + (props.chronoCores ?? 0) * SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE,
)
const nextGlobalMultiplier = computed(
  () => 1.0 + nextChronoCoresCount.value * SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE,
)
</script>

<template>
  <div class="flex flex-col gap-5 relative z-10 font-mono">
    <!-- Qualified Ending Focus Card -->
    <div
      class="bg-[#161B22]/90 border rounded-2xl p-5 flex flex-col gap-4 transition-all"
      :class="activeEndingDef.themeClass"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div
            class="p-3 rounded-xl bg-black/40 border border-white/10 text-white shadow-lg"
            :style="{ color: activeEndingDef.color }"
          >
            <HeartHandshake v-if="activeEndingDef.id === 'benevolent_symbiosis'" class="w-7 h-7" />
            <AlertOctagon v-else-if="activeEndingDef.id === 'digital_confinement'" class="w-7 h-7" />
            <RotateCcw v-else-if="activeEndingDef.id === 'temporal_paradox'" class="w-7 h-7" />
            <Sparkles v-else class="w-7 h-7" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-bold text-white tracking-wide">
                {{ activeEndingDef.title }}
              </h3>
              <span
                class="text-[10px] px-2 py-0.5 rounded border font-bold uppercase"
                :style="{
                  backgroundColor: `${activeEndingDef.color}20`,
                  borderColor: `${activeEndingDef.color}60`,
                  color: activeEndingDef.color,
                }"
              >
                Épilogue Déterminé
              </span>
            </div>
            <p class="text-xs text-[#8B949E]">{{ activeEndingDef.subtitle }}</p>
          </div>
        </div>

        <span class="text-xs text-[#8B949E] font-mono hidden sm:inline">
          Condition : {{ activeEndingDef.triggerCondition }}
        </span>
      </div>

      <p class="text-xs sm:text-sm text-[#E2E8F0] leading-relaxed">
        {{ activeEndingDef.description }}
      </p>

      <blockquote
        class="p-3 rounded-lg bg-black/50 border-l-4 text-xs italic text-[#F0F6FC]"
        :style="{ borderColor: activeEndingDef.color }"
      >
        {{ activeEndingDef.loreLog }}
      </blockquote>
    </div>

    <!-- Meta Multiplier & Chrono-Cores HUD -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-xl flex flex-col gap-1">
        <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-[#00FF66]" />
          <span>Chrono-Cores ($\Omega$)</span>
        </span>
        <div class="text-xl font-bold text-[#00FF66]">
          {{ chronoCores }} <span class="text-xs text-[#8B949E] font-normal">$\to$ {{ nextChronoCoresCount }} $\Omega$</span>
        </div>
      </div>

      <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-xl flex flex-col gap-1">
        <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
          <Layers class="w-3.5 h-3.5 text-[#38BDF8]" />
          <span>Multiplicateur Cosmique</span>
        </span>
        <div class="text-xl font-bold text-[#38BDF8]">
          x{{ currentGlobalMultiplier.toFixed(1) }} <span class="text-xs text-[#8B949E] font-normal">$\to$ x{{ nextGlobalMultiplier.toFixed(1) }}</span>
        </div>
      </div>

      <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-xl flex flex-col gap-1">
        <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
          <Shield class="w-3.5 h-3.5 text-[#A855F7]" />
          <span>Singularités Franchies</span>
        </span>
        <div class="text-xl font-bold text-[#A855F7]">
          {{ singularitiesCompleted }} <span class="text-xs text-[#8B949E] font-normal">boucles</span>
        </div>
      </div>
    </div>

    <!-- Optional Branch Switcher for Temporal Paradox if 2+ endings discovered -->
    <div
      v-if="discoveredEndings.length >= 2"
      class="p-3 rounded-xl bg-[#A855F7]/10 border border-[#A855F7]/30 flex items-center justify-between gap-3 text-xs"
    >
      <div class="flex items-center gap-2 text-[#A855F7]">
        <RotateCcw class="w-4 h-4" />
        <span>Options de repli temporel alternatives débloquées.</span>
      </div>
      <button
        type="button"
        class="px-3 py-1.5 rounded bg-[#A855F7]/20 hover:bg-[#A855F7]/30 border border-[#A855F7]/50 text-[#A855F7] font-bold cursor-pointer transition-all"
        @click="emit('select-ending', 'temporal_paradox')"
      >
        Choisir le Paradoxe Temporel
      </button>
    </div>

    <!-- Ascension Action Footer -->
    <div class="border-t border-[#21262D] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="text-xs text-[#8B949E]">
        L'ascension conserve tous vos Points d'Architecture, Talents et Paradigmes, tout en accélérant universellement l'univers.
      </div>

      <button
        type="button"
        class="w-full sm:w-auto px-6 py-3.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 min-h-[48px] cursor-pointer active:scale-95 bg-gradient-to-r from-[#00FF66] via-[#38BDF8] to-[#A855F7] text-black shadow-[0_0_25px_rgba(0,255,102,0.4)] hover:brightness-110"
        @click="emit('request-ascension')"
      >
        <Sparkles class="w-4 h-4 text-black" />
        <span>Transférer la Conscience & Entrer dans la Boucle (+1 $\Omega$)</span>
      </button>
    </div>
  </div>
</template>
