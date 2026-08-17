<script setup lang="ts">
import { computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { formatNumber, formatMoney, formatWatts, formatFlops } from '@/utils/format'
import { 
  Terminal, 
  Cpu, 
  Zap, 
  Activity, 
  Flame, 
  Database, 
  Sparkles, 
  Layers, 
  Play,
  HardDrive
} from 'lucide-vue-next'

const store = useGameStore()

const totalTflops = computed(() => {
  let sum = 0
  for (const h of Object.values(store.hardware)) {
    sum += h.tflops.toNumber() * h.count
  }
  return sum
})

const totalWatts = computed(() => {
  let sum = 0
  for (const h of Object.values(store.hardware)) {
    sum += h.powerWatts.toNumber() * h.count
  }
  return sum
})
</script>

<template>
  <div class="min-h-screen bg-[#07090E] text-[#E2E8F0] font-mono flex flex-col relative overflow-hidden">
    <!-- Scanline effect overlay -->
    <div class="fixed inset-0 scanlines opacity-40 pointer-events-none z-50"></div>

    <!-- Header Navigation Bar -->
    <header class="border-b border-[#21262D] bg-[#0D1117]/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between z-10">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded bg-[#00FF66]/10 border border-[#00FF66]/30 text-[#00FF66]">
          <Terminal class="w-5 h-5" />
        </div>
        <div>
          <h1 class="text-base font-bold tracking-wider text-[#F0F6FC] flex items-center gap-2">
            IDLE AGI <span class="text-xs px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] font-normal">v{{ store.version }}</span>
          </h1>
          <p class="text-xs text-[#8B949E]">Project Singularity Loop // System Online</p>
        </div>
      </div>

      <!-- Quick Metrics Bar -->
      <div class="flex items-center gap-6 text-xs">
        <div class="flex items-center gap-2">
          <Zap class="w-4 h-4 text-[#FFB800]" />
          <span class="text-[#8B949E]">Power:</span>
          <span class="font-bold text-[#F0F6FC]">{{ formatWatts(totalWatts) }} / {{ formatWatts(store.gridCapacityWatts) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Cpu class="w-4 h-4 text-[#38BDF8]" />
          <span class="text-[#8B949E]">Compute:</span>
          <span class="font-bold text-[#F0F6FC]">{{ formatFlops(totalTflops) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Database class="w-4 h-4 text-[#00FF66]" />
          <span class="text-[#8B949E]">Cash:</span>
          <span class="font-bold text-[#00FF66]">{{ formatMoney(store.funds.current) }}</span>
        </div>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full z-10">
      
      <!-- Left Column: Raw Text & Tokenizer -->
      <div class="flex flex-col gap-4">
        <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-5 flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div class="flex items-center gap-2 text-sm font-bold text-[#F0F6FC]">
              <Layers class="w-4 h-4 text-[#38BDF8]" />
              <h3>1. INGESTION & DATA</h3>
            </div>
            <span class="text-xs text-[#38BDF8] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/20">Phase 1</span>
          </div>

          <!-- Raw Text Buffer -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-[#8B949E]">Raw Text Chars</span>
              <span class="font-bold text-[#F0F6FC]">{{ formatNumber(store.rawText.current) }} / {{ formatNumber(store.rawText.max) }}</span>
            </div>
            <div class="w-full bg-[#161B22] h-2 rounded-full overflow-hidden border border-[#21262D]">
              <div 
                class="bg-[#38BDF8] h-full transition-all duration-200"
                :style="{ width: `${Math.min(100, (store.rawText.current.toNumber() / store.rawText.max.toNumber()) * 100)}%` }"
              ></div>
            </div>
          </div>

          <button 
            @click="store.manualScrape()"
            class="w-full py-2.5 px-4 rounded bg-[#161B22] hover:bg-[#21262D] text-[#38BDF8] border border-[#38BDF8]/30 hover:border-[#38BDF8] transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Sparkles class="w-3.5 h-3.5" />
            SCRAPE RAW DATA (+10 Chars)
          </button>

          <!-- Tokenizer Output -->
          <div class="space-y-1.5 pt-2 border-t border-[#21262D]">
            <div class="flex justify-between text-xs">
              <span class="text-[#8B949E]">Processed Tokens</span>
              <span class="font-bold text-[#00FF66]">{{ formatNumber(store.tokens.current) }} / {{ formatNumber(store.tokens.max) }}</span>
            </div>
            <div class="w-full bg-[#161B22] h-2 rounded-full overflow-hidden border border-[#21262D]">
              <div 
                class="bg-[#00FF66] h-full transition-all duration-200"
                :style="{ width: `${Math.min(100, (store.tokens.current.toNumber() / store.tokens.max.toNumber()) * 100)}%` }"
              ></div>
            </div>
          </div>

          <button 
            @click="store.manualTokenize()"
            class="w-full py-2.5 px-4 rounded bg-[#161B22] hover:bg-[#21262D] text-[#00FF66] border border-[#00FF66]/30 hover:border-[#00FF66] transition-all text-xs font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <Play class="w-3.5 h-3.5" />
            TOKENIZE BATCH (4 Chars &rarr; 1 Token)
          </button>
        </div>
      </div>

      <!-- Center Column: Model State & STDOUT Console -->
      <div class="flex flex-col gap-4">
        <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-5 flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div class="flex items-center gap-2 text-sm font-bold text-[#F0F6FC]">
              <Terminal class="w-4 h-4 text-[#00FF66]" />
              <h3>2. MODEL TELEMETRY</h3>
            </div>
            <div class="flex items-center gap-1 text-xs text-[#00FF66]">
              <span class="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
              ACTIVE
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-[#161B22] p-3 rounded border border-[#21262D]">
              <div class="text-[#8B949E]">Parameters</div>
              <div class="text-base font-bold text-[#F0F6FC] mt-0.5">{{ formatNumber(store.parameters) }}</div>
            </div>
            <div class="bg-[#161B22] p-3 rounded border border-[#21262D]">
              <div class="text-[#8B949E]">VRAM Used</div>
              <div class="text-base font-bold text-[#F0F6FC] mt-0.5">4.0 / 12.0 GB</div>
            </div>
          </div>

          <!-- Console Output Window -->
          <div class="bg-[#05070A] border border-[#21262D] rounded p-3 font-mono text-xs text-[#8B949E] h-48 overflow-y-auto space-y-1">
            <div class="text-[#00FF66]">[SYS_INIT] Singularity Loop OS v{{ store.version }} loaded.</div>
            <div class="text-[#8B949E]">[HARDWARE] Found: 1x CPU d'occasion (4 Cores, 50 GFLOPS).</div>
            <div class="text-[#8B949E]">[POWER] Grid status: 65W / 500W load. Cooling nominal.</div>
            <div class="text-[#38BDF8]">[AI_THOUGHT] Initializing basic character embeddings...</div>
          </div>
        </div>
      </div>

      <!-- Right Column: Hardware Rack & Upgrades -->
      <div class="flex flex-col gap-4">
        <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-5 flex flex-col gap-4">
          <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
            <div class="flex items-center gap-2 text-sm font-bold text-[#F0F6FC]">
              <HardDrive class="w-4 h-4 text-[#FFB800]" />
              <h3>3. HARDWARE CLUSTER</h3>
            </div>
            <span class="text-xs text-[#8B949E]">Node Count</span>
          </div>

          <!-- Hardware list -->
          <div class="space-y-3">
            <div 
              v-for="hw in Object.values(store.hardware)" 
              :key="hw.id"
              class="bg-[#161B22] border border-[#21262D] p-3 rounded flex flex-col gap-2"
            >
              <div class="flex justify-between items-start">
                <div>
                  <div class="text-xs font-bold text-[#F0F6FC]">{{ hw.name }}</div>
                  <div class="text-[11px] text-[#8B949E] flex gap-2 mt-0.5">
                    <span>+{{ formatFlops(hw.tflops) }}</span>
                    <span>•</span>
                    <span>{{ formatWatts(hw.powerWatts) }}</span>
                  </div>
                </div>
                <span class="text-xs font-bold px-2 py-0.5 rounded bg-[#21262D] text-[#F0F6FC]">x{{ hw.count }}</span>
              </div>

              <div class="flex justify-between items-center pt-1 border-t border-[#21262D]/50 text-xs">
                <span class="text-[#8B949E]">Cost: <strong class="text-[#00FF66]">{{ formatMoney(hw.baseCost.mul(Math.pow(hw.costMult, hw.count))) }}</strong></span>
                <button 
                  @click="store.buyHardware(hw.id)"
                  :disabled="store.funds.current.lt(hw.baseCost.mul(Math.pow(hw.costMult, hw.count)))"
                  class="px-3 py-1 rounded bg-[#21262D] hover:bg-[#30363D] disabled:opacity-40 disabled:cursor-not-allowed text-[#F0F6FC] text-xs font-semibold cursor-pointer transition-colors"
                >
                  Acquire
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

    </main>

    <!-- Footer Status -->
    <footer class="border-t border-[#21262D] bg-[#0D1117] px-6 py-2.5 text-xs text-[#8B949E] flex justify-between items-center z-10">
      <div>Project Singularity Loop • 100% Client-Side LocalStorage</div>
      <div class="flex items-center gap-3">
        <span class="flex items-center gap-1.5"><Activity class="w-3.5 h-3.5 text-[#00FF66]" /> 20 Ticks/s</span>
        <span>•</span>
        <span class="flex items-center gap-1.5"><Flame class="w-3.5 h-3.5 text-[#38BDF8]" /> Thermals: 0% Throttling</span>
      </div>
    </footer>
  </div>
</template>
