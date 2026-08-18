<script setup lang="ts">
import { Check, Lock } from 'lucide-vue-next'
import type { TalentNode, TalentNodeStatus } from '@/types/prestige'

defineProps<{
  talent: TalentNode
  isSelected: boolean
  status: TalentNodeStatus
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
}>()
</script>

<template>
  <button
    type="button"
    @click="emit('select', talent.id)"
    class="text-left p-3 rounded-xl border transition-all relative overflow-hidden cursor-pointer active:scale-98 touch-manipulation group font-mono"
    :class="[
      isSelected
        ? 'ring-2 ring-[#38BDF8] shadow-[0_0_15px_rgba(56,189,248,0.25)]'
        : '',
      talent.purchased
        ? 'bg-[#161B22]/90 border-[#38BDF8]/60 shadow-[0_0_10px_rgba(56,189,248,0.1)]'
        : status === 'available'
          ? 'bg-[#00FF66]/5 border-[#00FF66]/60 animate-pulse hover:bg-[#00FF66]/10'
          : status === 'insufficient_ap'
            ? 'bg-[#FFB800]/5 border-[#FFB800]/40'
            : 'bg-[#161B22]/30 border-[#21262D] opacity-60',
    ]"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-lg">{{ talent.icon }}</span>
        <div>
          <div class="text-xs font-bold text-[#F0F6FC] leading-snug group-hover:text-[#38BDF8] transition-colors">
            {{ talent.name }}
          </div>
          <div class="text-[10px] text-[#8B949E]">
            {{ talent.branch.toUpperCase() }}
          </div>
        </div>
      </div>

      <!-- Status Badge -->
      <span
        v-if="talent.purchased"
        class="px-1.5 py-0.5 rounded bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] text-[9px] font-bold flex items-center gap-1"
      >
        <Check class="w-3 h-3" />
        ACTIF
      </span>
      <span
        v-else-if="status === 'available'"
        class="px-1.5 py-0.5 rounded bg-[#00FF66]/20 border border-[#00FF66]/50 text-[#00FF66] text-[9px] font-bold"
      >
        {{ talent.cost }} AP
      </span>
      <span
        v-else-if="status === 'insufficient_ap'"
        class="px-1.5 py-0.5 rounded bg-[#FFB800]/20 border border-[#FFB800]/40 text-[#FFB800] text-[9px] font-bold"
      >
        {{ talent.cost }} AP
      </span>
      <span
        v-else
        class="px-1.5 py-0.5 rounded bg-[#21262D] text-[#8B949E] text-[9px] font-bold flex items-center gap-0.5"
      >
        <Lock class="w-2.5 h-2.5" />
      </span>
    </div>
  </button>
</template>
