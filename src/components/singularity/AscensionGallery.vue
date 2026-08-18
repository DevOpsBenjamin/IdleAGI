<script setup lang="ts">
import type { SingularityEndingDefinition, SingularityEndingId } from '@/types/singularity'

defineProps<{
  endingsList: SingularityEndingDefinition[]
  discoveredEndings: SingularityEndingId[]
}>()

function isEndingDiscovered(id: SingularityEndingId, list: SingularityEndingId[]): boolean {
  return list.includes(id)
}
</script>

<template>
  <div class="flex flex-col gap-4 relative z-10 font-mono">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="ending in endingsList"
        :key="ending.id"
        class="bg-[#161B22]/90 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all"
        :class="
          isEndingDiscovered(ending.id, discoveredEndings)
            ? ending.themeClass
            : 'border-[#21262D] opacity-60'
        "
      >
        <div class="flex flex-col gap-2">
          <div class="flex items-start justify-between gap-2">
            <div>
              <h4 class="text-sm font-bold text-[#F0F6FC]">{{ ending.title }}</h4>
              <p class="text-[10px] text-[#8B949E]">{{ ending.subtitle }}</p>
            </div>

            <span
              class="text-[10px] px-2 py-0.5 rounded border font-bold uppercase"
              :class="
                isEndingDiscovered(ending.id, discoveredEndings)
                  ? 'bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66]'
                  : 'bg-[#161B22] border-[#21262D] text-[#8B949E]'
              "
            >
              {{ isEndingDiscovered(ending.id, discoveredEndings) ? 'DÉCOUVERT' : 'NON DÉCOUVERT' }}
            </span>
          </div>

          <p class="text-xs text-[#8B949E] leading-relaxed">{{ ending.description }}</p>

          <div class="text-[10px] text-[#38BDF8] font-mono">
            Condition : {{ ending.triggerCondition }}
          </div>

          <blockquote
            v-if="isEndingDiscovered(ending.id, discoveredEndings)"
            class="text-[10px] italic text-[#F0F6FC]/90 border-l-2 pl-2 pt-0.5 bg-black/30 p-1.5 rounded"
            :style="{ borderColor: ending.color }"
          >
            {{ ending.loreLog }}
          </blockquote>
        </div>
      </div>
    </div>
  </div>
</template>
