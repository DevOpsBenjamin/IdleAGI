<script setup lang="ts">
import { computed } from 'vue'
import { Layers, Sparkles, Play, ArrowRight, Zap } from 'lucide-vue-next'
import { formatNumber } from '@/utils/format'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  rawTextCurrent: Decimal
  rawTextMax: Decimal
  rawTextRate: Decimal
  tokensCurrent: Decimal
  tokensMax: Decimal
  tokensRate: Decimal
  autoScrapingUnlocked: boolean
  manualScrapePower?: number
}>()

const emit = defineEmits<{
  (e: 'manual-scrape'): void
  (e: 'manual-tokenize', amount: number): void
  (e: 'manual-tokenize-max'): void
}>()

const rawPercent = computed(() => {
  if (props.rawTextMax.lte(0)) return 0
  return Math.min(100, (props.rawTextCurrent.toNumber() / props.rawTextMax.toNumber()) * 100)
})

const tokenPercent = computed(() => {
  if (props.tokensMax.lte(0)) return 0
  return Math.min(100, (props.tokensCurrent.toNumber() / props.tokensMax.toNumber()) * 100)
})

const canTokenize = computed(() => {
  return props.rawTextCurrent.gte(4) && props.tokensCurrent.lt(props.tokensMax)
})

const scrapePowerDisplay = computed(() => props.manualScrapePower ?? 10)
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded bg-[#38BDF8]/10 text-[#38BDF8]">
          <Layers class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider">
          1. Ingestion & Tokenizer
        </h3>
      </div>
      <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
        Phase 1
      </span>
    </div>

    <!-- Section A: Raw Text Ingestion Buffer -->
    <div class="space-y-2 bg-[#161B22]/60 border border-[#21262D] rounded-lg p-3">
      <div class="flex justify-between items-center text-xs font-mono">
        <span class="text-[#8B949E] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
          Raw Text Buffer
        </span>
        <span class="font-bold text-[#F0F6FC]">
          {{ formatNumber(rawTextCurrent) }} / {{ formatNumber(rawTextMax) }}
        </span>
      </div>

      <!-- Meter -->
      <div class="w-full bg-[#0D1117] h-2.5 rounded-full overflow-hidden border border-[#21262D] relative">
        <div
          class="bg-gradient-to-r from-[#0284C7] to-[#38BDF8] h-full transition-all duration-150"
          :style="{ width: `${rawPercent}%` }"
        ></div>
      </div>

      <div class="flex justify-between items-center text-[10px] font-mono text-[#8B949E]">
        <span>Capacité : {{ rawPercent.toFixed(1) }}%</span>
        <span v-if="autoScrapingUnlocked || rawTextRate.gt(0)" class="text-[#38BDF8]">
          Auto : +{{ formatNumber(rawTextRate) }}/s
        </span>
        <span v-else class="text-[#8B949E]/70">Auto-scraping inactif</span>
      </div>

      <!-- Action Button -->
      <button
        @click="emit('manual-scrape')"
        class="w-full mt-1 py-2 px-3 rounded bg-[#161B22] hover:bg-[#21262D] text-[#38BDF8] border border-[#38BDF8]/30 hover:border-[#38BDF8] transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer active:scale-98 shadow-sm"
      >
        <span class="flex items-center gap-2">
          <Sparkles class="w-3.5 h-3.5 text-[#38BDF8]" />
          SCRAPER RAW DATA (+{{ scrapePowerDisplay }} Chars)
        </span>
        <span class="text-[9px] px-1.5 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
          [Espace]
        </span>
      </button>
    </div>

    <!-- Transition indicator -->
    <div class="flex items-center justify-center -my-1 text-[#8B949E]/60 text-[10px] font-mono gap-1">
      <span>Ratio : 4 Caractères</span>
      <ArrowRight class="w-3 h-3" />
      <span>1 Token</span>
    </div>

    <!-- Section B: Tokenizer Output Buffer -->
    <div class="space-y-2 bg-[#161B22]/60 border border-[#21262D] rounded-lg p-3">
      <div class="flex justify-between items-center text-xs font-mono">
        <span class="text-[#8B949E] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00FF66]"></span>
          Processed Tokens ($T$)
        </span>
        <span class="font-bold text-[#00FF66]">
          {{ formatNumber(tokensCurrent) }} / {{ formatNumber(tokensMax) }}
        </span>
      </div>

      <!-- Meter -->
      <div class="w-full bg-[#0D1117] h-2.5 rounded-full overflow-hidden border border-[#21262D] relative">
        <div
          class="bg-gradient-to-r from-[#059669] to-[#00FF66] h-full transition-all duration-150"
          :style="{ width: `${tokenPercent}%` }"
        ></div>
      </div>

      <div class="flex justify-between items-center text-[10px] font-mono text-[#8B949E]">
        <span>Stock : {{ tokenPercent.toFixed(1) }}%</span>
        <span class="text-[#00FF66]">Flux net : {{ formatNumber(tokensRate) }}/s</span>
      </div>

      <!-- Tokenize Action Buttons -->
      <div class="grid grid-cols-2 gap-2 mt-1">
        <button
          @click="emit('manual-tokenize', 1)"
          :disabled="!canTokenize"
          class="py-2 px-2.5 rounded bg-[#161B22] hover:bg-[#21262D] disabled:opacity-40 disabled:cursor-not-allowed text-[#00FF66] border border-[#00FF66]/30 hover:border-[#00FF66] transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer active:scale-98 shadow-sm"
        >
          <span class="flex items-center gap-1.5 text-[11px]">
            <Play class="w-3 h-3 text-[#00FF66]" />
            1 BATCH
          </span>
          <span class="text-[9px] px-1 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
            [T]
          </span>
        </button>

        <button
          @click="emit('manual-tokenize-max')"
          :disabled="!canTokenize"
          class="py-2 px-2.5 rounded bg-[#161B22] hover:bg-[#21262D] disabled:opacity-40 disabled:cursor-not-allowed text-[#00FF66] border border-[#00FF66]/30 hover:border-[#00FF66] transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer active:scale-98 shadow-sm"
        >
          <span class="flex items-center gap-1.5 text-[11px]">
            <Zap class="w-3 h-3 text-[#00FF66]" />
            MAX
          </span>
          <span class="text-[9px] px-1 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D]">
            [M]
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
