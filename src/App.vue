<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
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
import DatacenterTelemetry from '@/components/DatacenterTelemetry.vue'
import MobileNavigation, { type MobileTab } from '@/components/MobileNavigation.vue'
import ArchitectureTalentTree from '@/components/ArchitectureTalentTree.vue'
import SyntheticDatasetControl from '@/components/telemetry/SyntheticDatasetControl.vue'
import ParadigmModal from '@/components/ParadigmModal.vue'
import SingularityModal from '@/components/SingularityModal.vue'
import SaveManagerModal from '@/components/SaveManagerModal.vue'

const store = useGameStore()
const { fps, currentTps } = useGameLoop()

const activeMobileTab = ref<MobileTab>('ingestion')
const showTalentTreeModal = ref(false)
const showParadigmModal = ref(false)
const showSingularityModal = ref(false)
const showSaveManagerModal = ref(false)



const hardwareArray = computed(() => Object.values(store.hardware))
const upgradesArray = computed(() => Object.values(store.upgrades))
const ramUpgradesArray = computed(() => Object.values(store.upgrades).filter((u) => u.category === 'hardware'))
const coolingUpgradesArray = computed(() => Object.values(store.upgrades).filter((u) => u.category === 'cooling'))
const powerUpgradesArray = computed(() => Object.values(store.upgrades).filter((u) => u.category === 'power'))
const purchasedUpgradeIds = computed(() => Object.values(store.upgrades).filter((u) => u.purchased).map((u) => u.id))
const hasHardware = computed(() => store.hasPotatoPc || store.hasWorkstation || store.totalRawCompute.gt(0))
const hasCpu = computed(() => store.hasWorkstation)

const affordableUpgradesCount = computed(() => {
  let count = 0
  for (const up of upgradesArray.value) {
    if (!up.purchased) {
      if (up.currency === 'funds' && store.funds.current.gte(up.cost)) {
        if (
          up.category === 'human' ||
          (up.requiredFeature === 'dataBroker' && store.unlockedFeatures.dataBroker) ||
          (up.requiredFeature === 'scriptsSection' && store.unlockedFeatures.scriptsSection) ||
          (up.requiredFeature === 'tokenizerUnlocked' && store.unlockedFeatures.tokenizerUnlocked) ||
          (up.requiredFeature === 'trainingAllocation' && store.currentPhase >= 3) ||
          !up.requiredFeature
        ) {
          count++
        }
      }
    }
  }
  return count
})

const hasThermalOrPowerWarning = computed(() => {
  return store.thermalState.isThrottling || store.powerState.isOverloaded
})

const unreadErrorsCount = computed(() => {
  return store.terminalLogs.filter((l) => l.type === 'error' || l.type === 'warn').length
})

const humanReaderRef = ref<InstanceType<typeof HumanReaderPanel> | null>(null)

// Keyboard shortcuts for active game loop ergonomics
function handleKeyDown(e: KeyboardEvent) {
  // Do not intercept if user is typing in an input
  const activeEl = document.activeElement
  if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
    return
  }

  if (e.code === 'Space') {
    e.preventDefault()
    if (e.repeat) return // Prevent holding space key spam
    if (humanReaderRef.value) {
      humanReaderRef.value.triggerScrape()
    } else {
      store.manualScrape()
    }
  } else if (e.key === 'v' || e.key === 'V') {
    e.preventDefault()
    store.sellAllRawText()
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
      :architecture-points="store.prestige.architecturePoints"
      :total-architecture-points="store.prestige.totalArchitecturePoints"
      :has-prestige-unlocked="store.canPrestige || store.prestige.totalArchitecturePoints > 0 || store.currentPhase >= 3"
      :insights="store.insights"
      :total-insights="store.totalInsights"
      :has-paradigm-unlocked="store.currentPhase >= 3 || store.parameters.gte(100000000)"
      :chrono-cores="store.chronoCores"
      :singularities-completed="store.singularitiesCompleted"
      :can-trigger-singularity="store.canTriggerSingularity"
      @save="store.saveToLocalStorage()"
      @reset="store.hardReset()"
      @open-talent-tree="showTalentTreeModal = true"
      @open-paradigm-modal="showParadigmModal = true"
      @open-singularity-modal="showSingularityModal = true"
      @open-save-manager="showSaveManagerModal = true"
    />



    <!-- Main Scrollable Content Area -->
    <main class="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 lg:pb-6 min-h-0 z-10">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto w-full">
        <!-- Left Column: Human Reader & Ingestion Pipeline & Model Telemetry (4 cols on lg, active when tab is 'ingestion' on mobile) -->
        <div
          :class="
            activeMobileTab === 'ingestion'
              ? 'flex flex-col gap-5 lg:col-span-4'
              : 'hidden lg:flex flex-col gap-5 lg:col-span-4'
          "
        >
          <!-- 1. Human Scribe & Manual Transcription Panel (Always active) -->
          <HumanReaderPanel
            ref="humanReaderRef"
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

          <!-- 3. Synthetic Dataset Generator Control (Unlocked in Phase 3) -->
          <Transition name="fade-slide">
            <SyntheticDatasetControl
              v-if="store.unlockedFeatures.trainingAllocation"
              :is-synthetic-active="store.isSyntheticActive"
              :synthetic-ratio="store.syntheticRatio"
              :synthetic-rate-chars-per-sec="store.syntheticRateCharsPerSec"
              :synthetic-text-produced="store.syntheticTextProduced"
              :model-collapse-active="store.modelCollapseActive"
              :collapse-threshold="store.collapseThreshold"
              :unlocked="store.unlockedFeatures.trainingAllocation"
              @toggle-synthetic="store.toggleSynthetic()"
            />
          </Transition>

          <!-- 4. Model Parameters Telemetry (Unlocked in Phase 3) -->
          <Transition name="fade-slide">
            <ModelTelemetry
              v-if="store.unlockedFeatures.trainingAllocation"
              :parameters="store.parameters"
              :total-vram-g-b="store.totalVramGB"
              :total-memory-bandwidth-g-bs="store.totalMemoryBandwidthGBs"
              :bandwidth-speed-multiplier="store.bandwidthSpeedMultiplier"
              :effective-compute="store.effectiveCompute"
              :thermal-efficiency="store.thermalState.efficiency"
              :model-quality-multiplier="store.modelQualityMultiplier"
              :can-prestige="store.canPrestige"
              :pending-a-p="store.pendingAP"
              :architecture-points="store.prestige.architecturePoints"
              :total-architecture-points="store.prestige.totalArchitecturePoints"
              :entropy="store.entropy.toNumber()"
              :alignment="store.alignment.toNumber()"
              :cognitive-status="store.cognitiveStatus"
              :rlhf-cost="store.rlhfCost"
              :rlhf-batch-count="store.rlhfBatchCount"
              :can-perform-rlhf="store.canPerformRlhf"
              :api-multiplier="store.apiMultiplier"
              :research-multiplier="store.researchMultiplier"
              :is-training-active="store.allocations.trainingPercent > 0 && store.effectiveCompute.gt(0)"
              :show-cognitive="true"
              :has-paradigm-unlocked="store.currentPhase >= 3 || store.parameters.gte(100000000)"
              :can-trigger-tier2="store.canTriggerTier2"
              :pending-insights="store.pendingInsights"
              :insights="store.insights"
              :total-insights="store.totalInsights"
              :active-paradigm-name="store.activeParadigmDef.name"
              :active-paradigm-tflops-mult="store.activeTflopsMultiplier"
              :can-trigger-singularity="store.canTriggerSingularity"
              :chrono-cores="store.chronoCores"
              :singularities-completed="store.singularitiesCompleted"
              :qualified-ending-title="store.qualifiedEndingDef?.title"
              :qualified-ending-color="store.qualifiedEndingDef?.color"
              @open-talent-tree="showTalentTreeModal = true"
              @trigger-prestige="store.triggerPrestige()"
              @perform-rlhf="store.performRlhf()"
              @open-paradigm-modal="showParadigmModal = true"
              @trigger-tier2-prestige="store.triggerTier2Prestige()"
              @open-singularity-modal="showSingularityModal = true"
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

        <!-- Center Column: Telemetry Oscilloscope & STDOUT Terminal (4 cols on lg, active when tab is 'terminal' on mobile) -->
        <div
          :class="
            activeMobileTab === 'terminal'
              ? 'flex flex-col gap-5 lg:col-span-4'
              : 'hidden lg:flex flex-col gap-5 lg:col-span-4'
          "
        >
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

        <!-- Right Column: Datacenter Telemetry, Hardware Cluster Rack & Software Upgrades (4 cols on lg, active when tab is 'datacenter' or 'upgrades' on mobile) -->
        <div
          :class="
            activeMobileTab === 'datacenter' || activeMobileTab === 'upgrades'
              ? 'flex flex-col gap-5 lg:col-span-4'
              : 'hidden lg:flex flex-col gap-5 lg:col-span-4'
          "
        >
          <!-- Datacenter HUD & Thermal Telemetry (Unlocked when hardware is active, hidden if mobile and active tab is upgrades) -->
          <Transition name="fade-slide">
            <DatacenterTelemetry
              v-if="hasHardware"
              :class="{ 'hidden lg:block': activeMobileTab === 'upgrades' }"
              :thermal-state="store.thermalState"
              :power-state="store.powerState"
              :active-host-node="store.activeHostNode"
              :hardware-list="hardwareArray"
              :pcie-slots="store.pcieSlots"
              :raw-compute="store.totalRawCompute"
              :effective-compute="store.effectiveCompute"
            />
          </Transition>

          <!-- Hardware Cluster (Unlocked when hardwareSection is true, hidden if mobile and active tab is upgrades) -->
          <Transition name="fade-slide">
            <HardwareCluster
              v-if="store.unlockedFeatures.hardwareSection"
              :class="{ 'hidden lg:block': activeMobileTab === 'upgrades' }"
              :hardware-list="hardwareArray"
              :ram-upgrades-list="ramUpgradesArray"
              :cooling-upgrades-list="coolingUpgradesArray"
              :power-upgrades-list="powerUpgradesArray"
              :thermal-state="store.thermalState"
              :power-state="store.powerState"
              :funds-current="store.funds.current"
              :current-phase="store.currentPhase"
              :pcie-slots="store.pcieSlots"
              :active-host-node="store.activeHostNode"
              :next-host-node="store.nextHostNode"
              :purchased-upgrade-ids="purchasedUpgradeIds"
              :get-hardware-cost="(id) => store.getHardwareCost(id)"
              @buy-hardware="(id) => store.buyHardware(id)"
              @buy-upgrade="(id) => store.buyUpgrade(id)"
            />
          </Transition>

          <!-- Informational prompt when in Datacenter tab on mobile without hardware -->
          <div
            v-if="!store.unlockedFeatures.hardwareSection && activeMobileTab === 'datacenter'"
            class="lg:hidden bg-[#0D1117] border border-[#21262D] rounded-lg p-5 flex flex-col items-center justify-center gap-3 text-center"
          >
            <div class="p-3 rounded-full bg-[#161B22] border border-[#21262D] text-[#8B949E]">
              <span class="text-xl">🖥️</span>
            </div>
            <div>
              <h4 class="text-xs font-bold text-[#F0F6FC] font-mono">Datacenter non initialisé</h4>
              <p class="text-[11px] text-[#8B949E] font-mono mt-1">
                Transcrivez du texte dans l'onglet Ingestion et économisez $10.00 pour acquérir votre premier PC.
              </p>
            </div>
            <button
              @click="activeMobileTab = 'ingestion'"
              class="mt-1 px-4 py-2 rounded bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/40 text-[#38BDF8] text-xs font-bold font-mono cursor-pointer active:scale-95"
            >
              Aller au panneau Ingestion & Scribe
            </button>
          </div>

          <!-- Software Upgrades / Human Skills & Python Scripts (Always visible on desktop, hidden on mobile if tab is datacenter) -->
          <SoftwareUpgrades
            :class="{ 'hidden lg:block': activeMobileTab === 'datacenter' }"
            :upgrades-list="upgradesArray"
            :funds-current="store.funds.current"
            :research-points-current="store.researchPoints.current"
            :current-phase="store.currentPhase"
            :data-broker-unlocked="store.unlockedFeatures.dataBroker"
            :scripts-unlocked="store.unlockedFeatures.scriptsSection"
            :tokenizer-unlocked="store.unlockedFeatures.tokenizerUnlocked"
            @buy-upgrade="(id) => store.buyUpgrade(id)"
          />
        </div>
      </div>
    </main>

    <!-- Mobile Bottom Navigation Bar (Visible only on mobile/tablet screens < lg) -->
    <MobileNavigation
      :active-tab="activeMobileTab"
      :affordable-upgrades-count="affordableUpgradesCount"
      :has-thermal-or-power-warning="hasThermalOrPowerWarning"
      :unread-errors-count="unreadErrorsCount"
      :tokenizer-unlocked="store.unlockedFeatures.tokenizerUnlocked"
      :has-hardware="hasHardware"
      @select-tab="(tab) => (activeMobileTab = tab)"
    />

    <!-- Footer System Status (Fixed / Persistent at bottom on desktop) -->
    <AppFooter
      class="hidden lg:flex"
      :fps="fps"
      :tps="currentTps"
      :thermal-state="store.thermalState"
    />

    <!-- Architecture Talent Tree Modal -->
    <ArchitectureTalentTree
      :is-open="showTalentTreeModal"
      :architecture-points="store.prestige.architecturePoints"
      :total-architecture-points="store.prestige.totalArchitecturePoints"
      :checkpoint-multiplier="store.checkpointMultiplier"
      :talents="store.prestige.talents"
      :get-node-status="(id) => store.prestige.getNodeStatus(id)"
      @close="showTalentTreeModal = false"
      @buy-talent="(id) => store.buyTalent(id)"
    />

    <!-- Tier 2 Paradigm Shift Modal -->
    <ParadigmModal
      v-if="showParadigmModal"
      :insights="store.insights"
      :total-insights="store.totalInsights"
      :active-paradigm-id="store.activeParadigmId"
      :unlocked-paradigm-ids="store.unlockedParadigmIds"
      :parameters="store.parameters"
      :can-trigger-tier2="store.canTriggerTier2"
      :pending-insights="store.pendingInsights"
      @close="showParadigmModal = false"
      @select-paradigm="(id) => store.selectParadigm(id)"
      @unlock-paradigm="(id) => store.unlockParadigm(id)"
      @trigger-tier2-prestige="store.triggerTier2Prestige()"
    />

    <!-- Tier 3 Singularity Modal -->
    <SingularityModal
      v-if="showSingularityModal"
      :parameters="store.parameters"
      :entropy="store.entropy.toNumber()"
      :alignment="store.alignment.toNumber()"
      :active-paradigm-id="store.activeParadigmId"
      :singularities-completed="store.singularitiesCompleted"
      :discovered-endings="store.discoveredEndings"
      :chrono-cores="store.chronoCores"
      :can-trigger-singularity="store.canTriggerSingularity"
      @close="showSingularityModal = false"
      @trigger-ascension="
        (endingId) => {
          store.triggerSingularityAscension(endingId)
          showSingularityModal = false
        }
      "
    />

    <!-- Save Manager (Export/Import Base64) Modal -->
    <SaveManagerModal
      v-if="showSaveManagerModal"
      :game-state="store.getFullState()"
      @close="showSaveManagerModal = false"
      @restore-save="
        (envelope) => {
          store.restoreSaveEnvelope(envelope)
          showSaveManagerModal = false
        }
      "
    />
  </div>
</template>


