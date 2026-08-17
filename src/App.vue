<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameLoop } from '@/composables/useGameLoop'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import OfflineModal from '@/components/OfflineModal.vue'
import IngestionPanel from '@/components/IngestionPanel.vue'
import ModelTelemetry from '@/components/ModelTelemetry.vue'
import AllocationPanel from '@/components/AllocationPanel.vue'
import HardwareCluster from '@/components/HardwareCluster.vue'
import SoftwareUpgrades from '@/components/SoftwareUpgrades.vue'
import TerminalStdout from '@/components/TerminalStdout.vue'
import OscilloscopeCanvas from '@/components/OscilloscopeCanvas.vue'

const store = useGameStore()
const { fps, currentTps } = useGameLoop()

const hardwareArray = computed(() => Object.values(store.hardware))
const upgradesArray = computed(() => Object.values(store.upgrades))

// Keyboard shortcuts for active game loop ergonomics
function handleKeyDown(e: KeyboardEvent) {
  // Do not intercept if user is typing in an input
  const activeEl = document.activeElement
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    return
  }

  if (e.code === 'Space') {
    e.preventDefault()
    store.manualScrape()
  } else if (e.key === 't' || e.key === 'T') {
    e.preventDefault()
    store.manualTokenize(1)
  } else if (e.key === 'm' || e.key === 'M') {
    e.preventDefault()
    store.manualTokenizeMax()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
})
</script>

<template>
  <div class="min-h-screen bg-[#07090E] text-[#E2E8F0] font-mono flex flex-col relative overflow-hidden selection:bg-[#00FF66]/30 selection:text-[#00FF66]">
    <!-- Scanline effect overlay -->
    <div class="fixed inset-0 scanlines opacity-30 pointer-events-none z-40"></div>

    <!-- Offline Catch-Up Modal -->
    <OfflineModal
      v-if="store.lastOfflineReport"
      :report="store.lastOfflineReport"
      @dismiss="store.dismissOfflineReport()"
    />

    <!-- Header Navigation Bar -->
    <AppHeader
      :version="store.version"
      :power-state="store.powerState"
      :effective-compute="store.effectiveCompute"
      :funds-current="store.funds.current"
      :funds-rate="store.funds.ratePerSec"
      @save="store.saveToLocalStorage()"
      @reset="store.hardReset()"
    />

    <!-- Main Cyber-Terminal Grid -->
    <main class="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto w-full z-10">
      
      <!-- Left Column: Data Ingestion & Model Telemetry & Allocations (4 cols) -->
      <div class="lg:col-span-4 flex flex-col gap-5">
        <IngestionPanel
          :raw-text-current="store.rawText.current"
          :raw-text-max="store.rawText.max"
          :raw-text-rate="store.rawText.ratePerSec"
          :tokens-current="store.tokens.current"
          :tokens-max="store.tokens.max"
          :tokens-rate="store.tokens.ratePerSec"
          :auto-scraping-unlocked="store.unlockedFeatures.autoScraping"
          :manual-scrape-power="store.manualScrapePower"
          @manual-scrape="store.manualScrape()"
          @manual-tokenize="(amt) => store.manualTokenize(amt)"
          @manual-tokenize-max="store.manualTokenizeMax()"
        />

        <ModelTelemetry
          :parameters="store.parameters"
          :total-vram-g-b="store.totalVramGB"
          :effective-compute="store.effectiveCompute"
          :thermal-efficiency="store.thermalState.efficiency"
        />

        <AllocationPanel
          :allocations="store.allocations"
          @update-allocations="(val) => store.updateAllocations(val)"
          @set-preset="(p) => store.setAllocationPreset(p)"
        />
      </div>

      <!-- Center Column: Telemetry Oscilloscope & STDOUT Terminal (4 cols) -->
      <div class="lg:col-span-4 flex flex-col gap-5">
        <!-- Live Real-Time Flow Oscilloscope -->
        <OscilloscopeCanvas
          :token-rate="store.tokens.ratePerSec.toNumber()"
          :raw-text-rate="store.rawText.ratePerSec.toNumber()"
          :effective-compute="store.effectiveCompute.toNumber()"
        />

        <!-- Cyber Terminal STDOUT -->
        <TerminalStdout
          :logs="store.terminalLogs"
          :parameters-count="store.parameters.toNumber()"
          @add-log="(msg, type) => store.addLog(msg, type)"
          @clear-logs="store.clearLogs()"
          @manual-scrape="store.manualScrape()"
          @manual-tokenize="store.manualTokenize(1)"
        />
      </div>

      <!-- Right Column: Hardware Cluster Rack & Software Upgrades (4 cols) -->
      <div class="lg:col-span-4 flex flex-col gap-5">
        <HardwareCluster
          :hardware-list="hardwareArray"
          :funds-current="store.funds.current"
          :get-hardware-cost="(id) => store.getHardwareCost(id)"
          @buy-hardware="(id) => store.buyHardware(id)"
        />

        <SoftwareUpgrades
          :upgrades-list="upgradesArray"
          :funds-current="store.funds.current"
          :research-points-current="store.researchPoints.current"
          @buy-upgrade="(id) => store.buyUpgrade(id)"
        />
      </div>

    </main>

    <!-- Footer System Status -->
    <AppFooter
      :fps="fps"
      :tps="currentTps"
      :thermal-state="store.thermalState"
    />
  </div>
</template>
