<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, HardDrive, Sparkles, Gauge } from 'lucide-vue-next'
import { formatNumber, formatFlops } from '@/utils/format'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  parameters: Decimal
  totalVramGB: Decimal
  effectiveCompute: Decimal
  thermalEfficiency: number
  modelQualityMultiplier?: number
}>()

const paramsFormatted = computed(() => formatNumber(props.parameters))
const vramFormatted = computed(() => formatNumber(props.totalVramGB))
const qualityDisplay = computed(() => {
  const mult = props.modelQualityMultiplier ?? 1.0
  return `x${mult.toFixed(2)}`
})
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-3">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded bg-[#00FF66]/10 text-[#00FF66]">
          <Cpu class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
          2. Métriques Modèle & Télémétrie
        </h3>
      </div>
      <div class="flex items-center gap-1.5 text-[10px] font-mono text-[#00FF66]">
        <span class="w-1.5 h-1.5 rounded-full bg-[#00FF66] animate-pulse"></span>
        Actif
      </div>
    </div>

    <!-- Telemetry Cards Grid -->
    <div class="grid grid-cols-2 gap-2.5">
      <!-- Parameters -->
      <div class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
        <div class="text-[11px] text-[#8B949E] flex items-center justify-between">
          <span>Poids / Paramètres</span>
          <Gauge class="w-3 h-3 text-[#38BDF8]" />
        </div>
        <div class="text-base font-bold text-[#F0F6FC] font-mono tracking-wide">
          {{ paramsFormatted }}
        </div>
        <div class="text-[9px] text-[#8B949E] font-mono">Complexité cognitive</div>
      </div>

      <!-- Quality Multiplier on API Pricing -->
      <div class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
        <div class="text-[11px] text-[#8B949E] flex items-center justify-between">
          <span>Valeur Requête API</span>
          <Sparkles class="w-3 h-3 text-[#00FF66]" />
        </div>
        <div class="text-base font-bold text-[#00FF66] font-mono tracking-wide">
          {{ qualityDisplay }}
        </div>
        <div class="text-[9px] text-[#00FF66]/80 font-mono">Bonus intelligence IA</div>
      </div>

      <!-- Effective Compute -->
      <div class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
        <div class="text-[11px] text-[#8B949E] flex items-center justify-between">
          <span>Puissance Réelle</span>
          <Cpu class="w-3 h-3 text-[#38BDF8]" />
        </div>
        <div class="text-base font-bold text-[#38BDF8] font-mono tracking-wide">
          {{ formatFlops(effectiveCompute) }}
        </div>
        <div class="text-[9px] text-[#8B949E] font-mono">
          Efficacité thermique : {{ Math.round(thermalEfficiency * 100) }}%
        </div>
      </div>

      <!-- VRAM -->
      <div class="bg-[#161B22]/70 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
        <div class="text-[11px] text-[#8B949E] flex items-center justify-between">
          <span>VRAM Déployée</span>
          <HardDrive class="w-3 h-3 text-[#FFB800]" />
        </div>
        <div class="text-base font-bold text-[#F0F6FC] font-mono tracking-wide">
          {{ vramFormatted }} GB
        </div>
        <div class="text-[9px] text-[#8B949E] font-mono">Plafond de contexte</div>
      </div>
    </div>
  </div>
</template>
