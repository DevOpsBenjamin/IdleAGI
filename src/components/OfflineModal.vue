<script setup lang="ts">
import { Clock, AlertTriangle, CheckCircle } from 'lucide-vue-next'
import { formatNumber, formatMoney } from '@/utils/format'
import type { OfflineProgressSummary } from '@/types/game'

defineProps<{
  report: OfflineProgressSummary
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
}>()

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}h ${m}m ${s}s`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-[#0D1117] border border-[#38BDF8]/40 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 font-mono animate-in fade-in zoom-in-95 duration-200">
      <!-- Header -->
      <div class="flex items-center gap-3 border-b border-[#21262D] pb-4">
        <div class="p-2.5 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
          <Clock class="w-6 h-6 animate-spin" style="animation-duration: 8s;" />
        </div>
        <div>
          <h2 class="text-base font-bold text-[#F0F6FC]">
            RAPPORT DE SIMULATION HORS-LIGNE
          </h2>
          <p class="text-xs text-[#8B949E]">
            Temps réel écoulé : {{ formatDuration(report.elapsedSeconds) }}
          </p>
        </div>
      </div>

      <!-- Pacing Philosophy Notice -->
      <div class="bg-[#161B22] border border-[#38BDF8]/30 rounded-lg p-3.5 text-xs text-[#8B949E] leading-relaxed flex gap-3">
        <AlertTriangle class="w-5 h-5 text-[#FFB800] shrink-0 mt-0.5" />
        <div>
          <p class="text-[#E2E8F0] font-medium mb-1">Philosophie de Conception :</p>
          <p>{{ report.welcomeMessage }}</p>
          <p v-if="report.cappedAt24h" class="text-[#FFB800] mt-1 font-semibold">
            ⚠️ Plafond de 24h atteint. Les gains ont été calculés sur les premières 24 heures.
          </p>
        </div>
      </div>

      <!-- Resource Gains Grid -->
      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="bg-[#161B22] p-3 rounded-lg border border-[#21262D]">
          <div class="text-[#8B949E]">Tokens Produits</div>
          <div class="text-sm font-bold text-[#00FF66] mt-0.5">
            +{{ formatNumber(report.tokensGained) }}
          </div>
        </div>
        <div class="bg-[#161B22] p-3 rounded-lg border border-[#21262D]">
          <div class="text-[#8B949E]">Fonds Générés</div>
          <div class="text-sm font-bold text-[#00FF66] mt-0.5">
            +{{ formatMoney(report.fundsGained) }}
          </div>
        </div>
        <div class="bg-[#161B22] p-3 rounded-lg border border-[#21262D]">
          <div class="text-[#8B949E]">Paramètres Acquis</div>
          <div class="text-sm font-bold text-[#38BDF8] mt-0.5">
            +{{ formatNumber(report.parametersGained) }}
          </div>
        </div>
        <div class="bg-[#161B22] p-3 rounded-lg border border-[#21262D]">
          <div class="text-[#8B949E]">Temps Simulé</div>
          <div class="text-sm font-bold text-[#F0F6FC] mt-0.5">
            {{ formatDuration(report.simulatedSeconds) }}
          </div>
        </div>
      </div>

      <!-- Action Button -->
      <button
        @click="emit('dismiss')"
        class="w-full py-2.5 px-4 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:shadow-[#38BDF8]/20"
      >
        <CheckCircle class="w-4 h-4" />
        REPRENDRE LA SESSION ACTIVE
      </button>
    </div>
  </div>
</template>
