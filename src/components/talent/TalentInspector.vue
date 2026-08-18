<script setup lang="ts">
import { Sparkles, Check, Lock } from 'lucide-vue-next'
import type { TalentNode, TalentNodeStatus } from '@/types/prestige'

defineProps<{
  selectedTalent: TalentNode | null
  status: TalentNodeStatus
  talents: Record<string, TalentNode>
  architecturePoints: number
}>()

const emit = defineEmits<{
  (e: 'buy', id: string): void
}>()
</script>

<template>
  <div class="lg:col-span-4 bg-[#07090E]/60 p-4 md:p-6 flex flex-col justify-between overflow-y-auto font-mono">
    <div v-if="selectedTalent" class="flex flex-col gap-4">
      <!-- Inspector Header -->
      <div class="flex items-start justify-between gap-3 border-b border-[#21262D] pb-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-[#161B22] border border-[#38BDF8]/30 text-2xl">
            {{ selectedTalent.icon }}
          </div>
          <div>
            <h3 class="text-sm font-bold text-[#F0F6FC]">
              {{ selectedTalent.name }}
            </h3>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-[#161B22] border border-[#21262D] text-[#38BDF8] uppercase">
                {{ selectedTalent.branch }}
              </span>
              <span class="text-[10px] text-[#8B949E]">
                Palier {{ selectedTalent.tier }}
              </span>
            </div>
          </div>
        </div>

        <div class="text-right">
          <div class="text-sm font-bold text-[#00FF66]">
            {{ selectedTalent.cost }} AP
          </div>
        </div>
      </div>

      <!-- Description & Effect -->
      <div class="flex flex-col gap-3">
        <div class="bg-[#161B22]/70 border border-[#21262D] p-3.5 rounded-xl flex flex-col gap-1.5">
          <span class="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">
            Effet Permanent
          </span>
          <p class="text-xs text-[#00FF66] font-semibold leading-relaxed">
            {{ selectedTalent.description }}
          </p>
        </div>

        <!-- Lore / Flavor Text -->
        <div v-if="selectedTalent.lore" class="p-3 rounded-xl bg-[#0D1117] border border-[#21262D] text-[11px] text-[#8B949E] italic leading-relaxed">
          « {{ selectedTalent.lore }} »
        </div>

        <!-- Prerequisites List -->
        <div v-if="selectedTalent.requires && selectedTalent.requires.length > 0" class="flex flex-col gap-2">
          <span class="text-[10px] text-[#8B949E] uppercase font-bold tracking-wider">
            Prérequis de Recherche
          </span>
          <div class="flex flex-col gap-1.5">
            <div
              v-for="reqId in selectedTalent.requires"
              :key="reqId"
              class="flex items-center justify-between px-3 py-1.5 rounded-lg border text-xs"
              :class="
                talents[reqId]?.purchased
                  ? 'bg-[#38BDF8]/10 border-[#38BDF8]/30 text-[#38BDF8]'
                  : 'bg-[#161B22] border-[#21262D] text-[#8B949E]'
              "
            >
              <span class="flex items-center gap-1.5">
                <Check v-if="talents[reqId]?.purchased" class="w-3.5 h-3.5 text-[#38BDF8]" />
                <Lock v-else class="w-3.5 h-3.5 text-[#8B949E]" />
                {{ talents[reqId]?.name ?? reqId }}
              </span>
              <span class="text-[10px] font-bold">
                {{ talents[reqId]?.purchased ? 'VALIDÉ' : 'REQUIS' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="flex items-center justify-center p-8 text-center text-xs text-[#8B949E]">
      Sélectionnez un talent dans la matrice pour inspecter ses caractéristiques et ses effets.
    </div>

    <!-- Purchase Action Button -->
    <div class="pt-4 border-t border-[#21262D] mt-4">
      <button
        v-if="status === 'purchased'"
        type="button"
        disabled
        class="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#38BDF8]/15 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-bold flex items-center justify-center gap-2 cursor-default select-none"
      >
        <Check class="w-4 h-4" />
        <span>TALENT DÉJÀ ACTIVÉ</span>
      </button>

      <button
        v-else-if="status === 'available'"
        type="button"
        @click="selectedTalent && emit('buy', selectedTalent.id)"
        class="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#00FF66] hover:bg-[#00DD55] text-black text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.4)] transition-all cursor-pointer select-none active:scale-95 touch-manipulation"
      >
        <Sparkles class="w-4 h-4" />
        <span>DÉBLOQUER CE TALENT (-{{ selectedTalent?.cost }} AP)</span>
      </button>

      <button
        v-else-if="status === 'insufficient_ap'"
        type="button"
        disabled
        class="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/30 text-[#FFB800] text-xs font-bold flex items-center justify-center gap-2 opacity-80 cursor-not-allowed select-none"
      >
        <span>AP INSUFFISANTS (Manque {{ (selectedTalent?.cost ?? 0) - architecturePoints }} AP)</span>
      </button>

      <button
        v-else
        type="button"
        disabled
        class="w-full min-h-[48px] py-3 px-4 rounded-xl bg-[#161B22] border border-[#21262D] text-[#8B949E] text-xs font-bold flex items-center justify-center gap-2 cursor-not-allowed select-none"
      >
        <Lock class="w-4 h-4" />
        <span>PRÉREQUIS MANQUANTS</span>
      </button>
    </div>
  </div>
</template>
