<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameLoop } from '@/composables/useGameLoop'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import OfflineModal from '@/components/OfflineModal.vue'
import HumanReaderPanel from '@/components/HumanReaderPanel.vue'
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
const hasHardware = computed(() => store.hasPotatoPc || store.hasWorkstation || store.totalRawCompute.gt(0))
const hasCpu = computed(() => store.hardware.used_cpu.count > 0 || store.hardware.gtx_gpu.count > 0)

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
  } else if (e.key === 'v' || e.key === 'V') {
    e.preventDefault()
    store.sellRawText(20)
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
  <div class="h-screen bg-[#07090E] text-[#E2E8F0] font-mono flex flex-col overflow-hidden relative selection:bg-[#00FF66]/30 selection:text-[#00FF66]">
    <!-- Scanline effect overlay -->
    <div class="fixed inset-0 scanlines opacity-30 pointer-events-none z-40"></div>

    <!-- Offline Catch-Up Modal -->
    <OfflineModal
      v-if="store.lastOfflineReport"
      :report="store.lastOfflineReport"
      @dismiss="store.dismissOfflineReport()"
    />

    <!-- Header Navigation Bar (Fixed / Persistent at top) -->
    <AppHeader
      :version="store.version"
      :current-phase="store.currentPhase"
      :power-state="store.powerState"
      :effective-compute="store.effectiveCompute"
      :funds-current="store.funds.current"
      :funds-rate="store.funds.ratePerSec"
      :data-broker-unlocked="store.unlockedFeatures.dataBroker"
      :has-hardware="hasHardware"
      @save="store.saveToLocalStorage()"
      @reset="store.hardReset()"
    />

    <!-- Main Scrollable Content Area -->
    <main class="flex-1 overflow-y-auto p-4 md:p-6 min-h-0 z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto w-full">
        <!-- Left Column: Human Reader & Ingestion Pipeline & Model Telemetry (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-5">
          <!-- 1. Human Scribe & Manual Transcription Panel (Always active) -->
          <HumanReaderPanel
            :raw-text-current="store.rawText.current"
            :raw-text-max="store.rawText.max"
            :raw-text-rate="store.rawText.ratePerSec"
            :raw-text-sell-price="store.rawTextSellPrice"
            :total-chars-read="store.totalCharsRead"
            :current-snippet="store.currentSnippet"
            :manual-scrape-power="store.manualScrapePower"
            :data-broker-unlocked="store.unlockedFeatures.dataBroker"
            :has-potato-pc="store.hasPotatoPc"
            :has-workstation="store.hasWorkstation"
            :tokenizer-unlocked="store.unlockedFeatures.tokenizerUnlocked"
            :funds-current="store.funds.current"
            @manual-scrape="store.manualScrape()"
            @sell-raw-text="(amt) => store.sellRawText(amt)"
            @sell-all-raw-text="store.sellAllRawText()"
          />

          <!-- 2. Tokenizer BPE & Token Output Buffer (Unlocked in Phase 2) -->
          <Transition name="fade-slide">
            <IngestionPanel
              v-if="store.unlockedFeatures.tokenizerUnlocked"
              :raw-text-current="store.rawText.current"
              :raw-text-max="store.rawText.max"
              :raw-text-rate="store.rawText.ratePerSec"
              :tokens-current="store.tokens.current"
              :tokens-max="store.tokens.max"
              :tokens-rate="store.tokens.ratePerSec"
              :has-cpu="hasCpu"
              :effective-compute="store.effectiveCompute"
            />
          </Transition>

          <!-- 3. Model Parameters Telemetry (Unlocked in Phase 3) -->
          <Transition name="fade-slide">
            <ModelTelemetry
              v-if="store.unlockedFeatures.trainingAllocation"
              :parameters="store.parameters"
              :total-vram-g-b="store.totalVramGB"
              :effective-compute="store.effectiveCompute"
              :thermal-efficiency="store.thermalState.efficiency"
              :model-quality-multiplier="store.modelQualityMultiplier"
            />
          </Transition>

          <!-- 4. Tri-Allocation Panel (Unlocked in Phase 3) -->
          <Transition name="fade-slide">
            <AllocationPanel
              v-if="store.unlockedFeatures.trainingAllocation"
              :allocations="store.allocations"
              :training-unlocked="store.unlockedFeatures.trainingAllocation"
              :research-unlocked="store.unlockedFeatures.researchAllocation"
              :has-cpu="hasCpu"
              @update-allocations="(val) => store.updateAllocations(val)"
              @set-preset="(p) => store.setAllocationPreset(p)"
            />
          </Transition>
        </div>

        <!-- Center Column: Telemetry Oscilloscope & STDOUT Terminal (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-5">
          <!-- Live Real-Time Flow Oscilloscope (Unlocked in Phase 2) -->
          <Transition name="fade-slide">
            <OscilloscopeCanvas
              v-if="store.unlockedFeatures.oscilloscope"
              :token-rate="store.tokens.ratePerSec.toNumber()"
              :raw-text-rate="store.rawText.ratePerSec.toNumber()"
              :effective-compute="store.effectiveCompute.toNumber()"
            />
          </Transition>

          <!-- Cyber Terminal STDOUT (Always active) -->
          <TerminalStdout
            :logs="store.terminalLogs"
            :parameters-count="store.parameters.toNumber()"
            @add-log="(msg, type) => store.addLog(msg, type)"
            @clear-logs="store.clearLogs()"
            @manual-scrape="store.manualScrape()"
            @manual-tokenize="store.manualScrape()"
          />
        </div>

        <!-- Right Column: Hardware Cluster Rack & Software Upgrades (4 cols) -->
        <div class="lg:col-span-4 flex flex-col gap-5">
          <!-- Hardware Cluster (Unlocked when hardwareSection is true) -->
          <Transition name="fade-slide">
            <HardwareCluster
              v-if="store.unlockedFeatures.hardwareSection"
              :hardware-list="hardwareArray"
              :funds-current="store.funds.current"
              :current-phase="store.currentPhase"
              :get-hardware-cost="(id) => store.getHardwareCost(id)"
              @buy-hardware="(id) => store.buyHardware(id)"
            />
          </Transition>

          <!-- Software Upgrades / Human Skills & Python Scripts (Always visible, filtered by phase) -->
          <SoftwareUpgrades
            :upgrades-list="upgradesArray"
            :funds-current="store.funds.current"
            :research-points-current="store.researchPoints.current"
            :current-phase="store.currentPhase"
            :scripts-unlocked="store.unlockedFeatures.scriptsSection"
            :tokenizer-unlocked="store.unlockedFeatures.tokenizerUnlocked"
            @buy-upgrade="(id) => store.buyUpgrade(id)"
          />
        </div>
      </div>
    </main>

    <!-- Footer System Status (Fixed / Persistent at bottom) -->
    <AppFooter
      :fps="fps"
      :tps="currentTps"
      :thermal-state="store.thermalState"
    />
  </div>
</template>
