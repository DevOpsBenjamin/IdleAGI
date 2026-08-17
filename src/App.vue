<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameLoop } from '@/composables/useGameLoop'
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
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-vue-next'

const store = useGameStore()
const { fps, currentTps } = useGameLoop()

const terminalContainer = ref<HTMLElement | null>(null)

// Auto-scroll terminal to bottom when new logs arrive
watch(() => store.terminalLogs.length, async () => {
  await nextTick()
  if (terminalContainer.value) {
    terminalContainer.value.scrollTop = terminalContainer.value.scrollHeight
  }
})

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
  <div class="min-h-screen bg-[#07090E] text-[#E2E8F0] font-mono flex flex-col relative overflow-hidden">
    <!-- Scanline effect overlay -->
    <div class="fixed inset-0 scanlines opacity-40 pointer-events-none z-50"></div>

    <!-- Offline Catch-Up Modal -->
    <div 
      v-if="store.lastOfflineReport" 
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <div class="bg-[#0D1117] border border-[#38BDF8]/40 rounded-xl max-w-lg w-full p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        <div class="flex items-center gap-3 border-b border-[#21262D] pb-4">
          <div class="p-2.5 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8]">
            <Clock class="w-6 h-6 animate-spin" style="animation-duration: 8s;" />
          </div>
          <div>
            <h2 class="text-base font-bold text-[#F0F6FC] flex items-center gap-2">
              RAPPORT DE SIMULATION HORS-LIGNE
            </h2>
            <p class="text-xs text-[#8B949E]">Temps écoulé : {{ formatDuration(store.lastOfflineReport.elapsedSeconds) }}</p>
          </div>
        </div>

        <!-- Pacing Philosophy Notice -->
        <div class="bg-[#161B22] border border-[#38BDF8]/30 rounded-lg p-3.5 text-xs text-[#8B949E] leading-relaxed flex gap-3">
          <AlertTriangle class="w-5 h-5 text-[#FFB800] shrink-0 mt-0.5" />
          <div>
            <p class="text-[#E2E8F0] font-medium mb-1">Philosophie de Conception :</p>
            <p>{{ store.lastOfflineReport.welcomeMessage }}</p>
            <p v-if="store.lastOfflineReport.cappedAt24h" class="text-[#FFB800] mt-1 font-semibold">
              ⚠️ Plafond de 24h atteint. Les gains ont été calculés sur les premières 24 heures.
            </p>
          </div>
        </div>

        <!-- Resource Gains Summary -->
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div class="bg-[#161B22] p-3 rounded-lg border border-[#21262D]">
            <div class="text-[#8B949E]">Tokens Produits</div>
            <div class="text-sm font-bold text-[#00FF66] mt-0.5">+{{ formatNumber(store.lastOfflineReport.tokensGained) }}</div>
          </div>
          <div class="bg-[#161B22] p-3 rounded-lg border border-[#21262D]">
            <div class="text-[#8B949E]">Fonds Générés</div>
            <div class="text-sm font-bold text-[#00FF66] mt-0.5">+{{ formatMoney(store.lastOfflineReport.fundsGained) }}</div>
          </div>
          <div class="bg-[#161B22] p-3 rounded-lg border border-[#21262D]">
            <div class="text-[#8B949E]">Paramètres Acquis</div>
            <div class="text-sm font-bold text-[#38BDF8] mt-0.5">+{{ formatNumber(store.lastOfflineReport.parametersGained) }}</div>
          </div>
          <div class="bg-[#161B22] p-3 rounded-lg border border-[#21262D]">
            <div class="text-[#8B949E]">Temps Simulé</div>
            <div class="text-sm font-bold text-[#F0F6FC] mt-0.5">{{ formatDuration(store.lastOfflineReport.simulatedSeconds) }}</div>
          </div>
        </div>

        <button 
          @click="store.dismissOfflineReport()"
          class="w-full py-2.5 px-4 rounded-lg bg-[#38BDF8] hover:bg-[#0284C7] text-black font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg hover:shadow-[#38BDF8]/20"
        >
          <CheckCircle class="w-4 h-4" />
          REPRENDRE LA SESSION ACTIVE
        </button>
      </div>
    </div>

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
          <span class="font-bold text-[#F0F6FC]">{{ formatWatts(store.totalPowerDrawWatts) }} / {{ formatWatts(store.gridCapacityWatts) }}</span>
        </div>
        <div class="flex items-center gap-2">
          <Cpu class="w-4 h-4 text-[#38BDF8]" />
          <span class="text-[#8B949E]">Compute:</span>
          <span class="font-bold text-[#F0F6FC]">{{ formatFlops(store.effectiveCompute) }}</span>
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
              <h3>2. MODEL TELEMETRY & STDOUT</h3>
            </div>
            <div class="flex items-center gap-1 text-xs text-[#00FF66]">
              <span class="w-2 h-2 rounded-full bg-[#00FF66] animate-pulse"></span>
              20 HZ LOOP
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs">
            <div class="bg-[#161B22] p-3 rounded border border-[#21262D]">
              <div class="text-[#8B949E]">Parameters</div>
              <div class="text-base font-bold text-[#F0F6FC] mt-0.5">{{ formatNumber(store.parameters) }}</div>
            </div>
            <div class="bg-[#161B22] p-3 rounded border border-[#21262D]">
              <div class="text-[#8B949E]">VRAM Allouée</div>
              <div class="text-base font-bold text-[#F0F6FC] mt-0.5">{{ formatNumber(store.totalVramGB) }} GB</div>
            </div>
          </div>

          <!-- Console Output Window -->
          <div 
            ref="terminalContainer"
            class="bg-[#05070A] border border-[#21262D] rounded p-3 font-mono text-xs h-56 overflow-y-auto space-y-1 scroll-smooth"
          >
            <div 
              v-for="log in store.terminalLogs" 
              :key="log.id" 
              :class="{
                'text-[#00FF66]': log.type === 'success',
                'text-[#38BDF8]': log.type === 'info',
                'text-[#FFB800]': log.type === 'warn',
                'text-[#EF4444]': log.type === 'error',
                'text-[#8B949E]': log.type === 'thought',
              }"
            >
              <span class="text-[#484F58]">[{{ new Date(log.timestamp).toLocaleTimeString() }}]</span> {{ log.message }}
            </div>
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
                <span class="text-[#8B949E]">Cost: <strong class="text-[#00FF66]">{{ formatMoney(store.getHardwareCost(hw.id)) }}</strong></span>
                <button 
                  @click="store.buyHardware(hw.id)"
                  :disabled="store.funds.current.lt(store.getHardwareCost(hw.id))"
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
        <span class="flex items-center gap-1.5"><Activity class="w-3.5 h-3.5 text-[#00FF66]" /> {{ currentTps }} Ticks/s ({{ fps }} FPS)</span>
        <span>•</span>
        <span class="flex items-center gap-1.5">
          <Flame class="w-3.5 h-3.5" :class="store.thermalState.isThrottling ? 'text-[#FFB800]' : 'text-[#38BDF8]'" />
          Thermals: {{ store.thermalState.isThrottling ? `${Math.round((1 - store.thermalState.efficiency) * 100)}% Throttling` : 'Nominal' }}
        </span>
      </div>
    </footer>
  </div>
</template>
