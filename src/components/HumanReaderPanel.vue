<script setup lang="ts">
import { computed, ref, onUnmounted } from 'vue'
import { BookOpen, Sparkles, DollarSign, Cpu, UserCheck, HardDrive } from 'lucide-vue-next'
import { formatNumber, formatMoney } from '@/utils/format'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  rawTextCurrent: Decimal
  rawTextMax: Decimal
  rawTextRate: Decimal
  rawTextSellPrice: number
  totalCharsRead: Decimal
  currentSnippet: string
  manualScrapePower: number
  dataBrokerUnlocked: boolean
  hasPotatoPc: boolean
  hasWorkstation: boolean
  tokenizerUnlocked: boolean
  fundsCurrent: Decimal
}>()

const emit = defineEmits<{
  (e: 'manual-scrape'): void
  (e: 'sell-all-raw-text'): void
}>()

const isCooldownActive = ref(false)
const COOLDOWN_MS = 120
let cooldownTimeoutId: number | undefined

function triggerScrape(): boolean {
  if (isCooldownActive.value) return false

  isCooldownActive.value = true
  emit('manual-scrape')

  if (cooldownTimeoutId) clearTimeout(cooldownTimeoutId)
  cooldownTimeoutId = window.setTimeout(() => {
    isCooldownActive.value = false
  }, COOLDOWN_MS)

  return true
}

onUnmounted(() => {
  if (cooldownTimeoutId) clearTimeout(cooldownTimeoutId)
})

defineExpose({
  triggerScrape,
})

const rawPercent = computed(() => {
  if (props.rawTextMax.lte(0)) return 0
  return Math.min(100, (props.rawTextCurrent.toNumber() / props.rawTextMax.toNumber()) * 100)
})

const canSellRawText = computed(() => {
  return props.rawTextCurrent.gte(20)
})

const totalSellValue = computed(() => {
  const batches = Math.floor(props.rawTextCurrent.toNumber() / 20)
  return batches * props.rawTextSellPrice
})

// Early game discovery progress towards data broker
const brokerDiscoveryProgress = computed(() => {
  const chars = props.totalCharsRead.toNumber()
  return Math.min(100, Math.round((chars / 80) * 100))
})
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-4 shadow-lg transition-all duration-300">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20">
          <BookOpen class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider font-mono">
            1. Transcription & Scribe Humain
          </h3>
          <p class="text-[10px] text-[#8B949E] font-mono">
            Saisie manuelle & flux de texte brut
          </p>
        </div>
      </div>
      <span
        v-if="!tokenizerUnlocked"
        class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 flex items-center gap-1"
      >
        <UserCheck class="w-3 h-3" /> Scribe Actif
      </span>
      <span
        v-else
        class="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 flex items-center gap-1"
      >
        <Cpu class="w-3 h-3" /> Pipeline Automatisé
      </span>
    </div>

    <!-- Interactive Text Stream Preview -->
    <div class="bg-[#05070A] border border-[#21262D] rounded-lg p-3 relative overflow-hidden flex flex-col gap-2">
      <div class="flex justify-between items-center text-[10px] font-mono text-[#8B949E]">
        <span class="flex items-center gap-1.5 text-[#38BDF8]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#38BDF8] animate-pulse"></span>
          Flux Source Web [RAW STREAM]
        </span>
        <span>Total transcrit : <strong class="text-[#F0F6FC]">{{ formatNumber(totalCharsRead) }}</strong> chars</span>
      </div>

      <div
        class="p-2.5 rounded bg-[#161B22]/60 border border-[#21262D]/60 font-mono text-xs text-[#E2E8F0] leading-relaxed transition-all duration-150 relative min-h-[58px]"
        :class="{ 'border-[#38BDF8]/60 bg-[#38BDF8]/5 text-[#38BDF8]': isCooldownActive }"
      >
        <p class="italic text-[11px] select-none">
          "{{ currentSnippet }}"
        </p>
      </div>
    </div>

    <!-- Buffer Gauge & Capacity -->
    <div class="space-y-2 bg-[#161B22]/60 border border-[#21262D] rounded-lg p-3">
      <div class="flex justify-between items-center text-xs font-mono">
        <span class="text-[#8B949E] flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
          Presse-papiers / Buffer Mémoire
        </span>
        <span class="font-bold text-[#F0F6FC]">
          {{ formatNumber(rawTextCurrent) }} / {{ formatNumber(rawTextMax) }} chars
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
        <span>Remplissage : {{ rawPercent.toFixed(1) }}%</span>
        <span v-if="rawTextRate.gt(0)" class="text-[#38BDF8]">
          Auto : +{{ formatNumber(rawTextRate) }}/s
        </span>
        <span v-else class="text-[#8B949E]/70">Scripts inactifs</span>
      </div>

      <!-- Primary Action Button: Manual Read & Scrape with Cooldown Animation -->
      <button
        @click="triggerScrape"
        :disabled="isCooldownActive"
        class="w-full mt-1 py-2.5 px-3 rounded bg-[#161B22] hover:bg-[#21262D] text-[#38BDF8] border border-[#38BDF8]/40 hover:border-[#38BDF8] transition-all text-xs font-bold font-mono flex items-center justify-between cursor-pointer active:scale-98 shadow-sm relative overflow-hidden select-none"
      >
        <!-- Dynamic Cooldown Progress Fill Bar -->
        <div
          v-if="isCooldownActive"
          class="absolute inset-0 bg-[#38BDF8]/20 pointer-events-none origin-left"
          :style="{ animation: `scrapeProgress ${COOLDOWN_MS}ms linear forwards` }"
        ></div>

        <!-- Button Content -->
        <span class="flex items-center gap-2 relative z-10">
          <Sparkles class="w-4 h-4 text-[#38BDF8]" :class="{ 'animate-spin': isCooldownActive }" />
          LIRE & TRANSCRIRE (+{{ manualScrapePower }} Chars)
        </span>
        <span class="text-[9px] px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] border border-[#30363D] relative z-10">
          [Espace]
        </span>
      </button>
    </div>

    <!-- Data Broker Section (Discovered after 80 chars read) -->
    <div
      v-if="dataBrokerUnlocked"
      class="bg-[#161B22]/70 border border-[#00FF66]/30 rounded-lg p-3 flex flex-col gap-2.5 animate-fadeIn"
    >
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-1.5 text-xs font-mono text-[#00FF66] font-bold">
          <DollarSign class="w-4 h-4" />
          Vente au Courtier de Données (Labos LLM)
        </div>
        <span class="text-[9px] font-mono text-[#8B949E]">
          Tarif : {{ formatMoney(rawTextSellPrice) }} / 20 chars
        </span>
      </div>

      <!-- Single Dynamic Sell-All Button -->
      <button
        @click="emit('sell-all-raw-text')"
        :disabled="!canSellRawText"
        class="w-full py-2.5 px-3 rounded bg-[#21262D]/80 hover:bg-[#21262D] disabled:opacity-30 disabled:cursor-not-allowed text-[#00FF66] border border-[#00FF66]/40 hover:border-[#00FF66] text-xs font-mono flex items-center justify-between cursor-pointer transition-all active:scale-98 font-bold shadow-sm"
        title="Vendre tout le texte brut disponible au courtier"
      >
        <span class="flex items-center gap-1.5">
          <DollarSign class="w-4 h-4 text-[#00FF66]" />
          TOUT VENDRE ({{ formatMoney(totalSellValue) }})
        </span>
        <span class="text-[9px] text-[#8B949E] px-1.5 py-0.5 rounded bg-[#161B22] border border-[#30363D]">[V]</span>
      </button>

      <!-- Potato PC Purchase Reminder Prompt (If available and not owned) -->
      <div
        v-if="!hasPotatoPc"
        class="text-[10px] font-mono text-[#FFB800] bg-[#FFB800]/10 border border-[#FFB800]/20 rounded p-2 flex items-center justify-between"
      >
        <span class="flex items-center gap-1.5">
          <HardDrive class="w-3.5 h-3.5 shrink-0" />
          Objectif : $10.00 pour acheter un vieux PC d'occasion
        </span>
        <span class="text-[10px] font-bold text-[#F0F6FC]">
          {{ formatMoney(fundsCurrent) }} / $10.00
        </span>
      </div>
    </div>

    <!-- Discovery Progress Banner (When broker is still locked) -->
    <div
      v-else
      class="bg-[#161B22]/40 border border-[#21262D] rounded-lg p-3 flex flex-col gap-1.5 font-mono text-xs"
    >
      <div class="flex justify-between items-center text-[11px] text-[#8B949E]">
        <span class="flex items-center gap-1">
          <Sparkles class="w-3 h-3 text-[#FFB800]" />
          Découverte de débouchés commerciaux...
        </span>
        <span class="text-[#FFB800] font-bold">{{ brokerDiscoveryProgress }}%</span>
      </div>
      <div class="w-full bg-[#0D1117] h-1.5 rounded-full overflow-hidden border border-[#21262D]">
        <div
          class="bg-[#FFB800] h-full transition-all duration-200"
          :style="{ width: `${brokerDiscoveryProgress}%` }"
        ></div>
      </div>
      <p class="text-[10px] text-[#8B949E]/70 pt-0.5">
        Continuez à transcrire du texte brut pour attirer l'attention des courtiers de données d'IA.
      </p>
    </div>
  </div>
</template>

<style scoped>
@keyframes scrapeProgress {
  0% {
    width: 0%;
    opacity: 0.9;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    width: 100%;
    opacity: 0.1;
  }
}
</style>
