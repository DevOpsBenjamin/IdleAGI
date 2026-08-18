<script setup lang="ts">
import { ref } from 'vue'
import { useGameStore } from '@/stores/gameStore'
import { useGameLoop } from '@/composables/useGameLoop'
import { useGlobalShortcuts } from '@/composables/useGlobalShortcuts'
import { useAppLayout } from '@/composables/useAppLayout'
import AppHeader from '@/components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'
import MobileNavigation, { type MobileTab } from '@/components/MobileNavigation.vue'
import GameColumnsLayout from '@/components/layout/GameColumnsLayout.vue'
import GameModalsContainer from '@/components/layout/GameModalsContainer.vue'

const store = useGameStore()
const { fps, currentTps } = useGameLoop()
const {
  hardwareArray,
  upgradesArray,
  ramUpgradesArray,
  coolingUpgradesArray,
  powerUpgradesArray,
  purchasedUpgradeIds,
  hasHardware,
  hasCpu,
  affordableUpgradesCount,
  hasThermalOrPowerWarning,
  unreadErrorsCount,
} = useAppLayout(store)

const activeMobileTab = ref<MobileTab>('ingestion')
const showTalentTreeModal = ref(false)
const showParadigmModal = ref(false)
const showSingularityModal = ref(false)
const showSaveManagerModal = ref(false)

const columnsLayoutRef = ref<InstanceType<typeof GameColumnsLayout> | null>(null)

useGlobalShortcuts({
  onManualScrape: () => {
    if (columnsLayoutRef.value?.humanReaderRef) {
      columnsLayoutRef.value.humanReaderRef.triggerScrape()
    } else {
      store.manualScrape()
    }
  },
  onSellAllRawText: () => {
    store.sellAllRawText()
  },
})
</script>

<template>
  <div class="h-screen bg-[#07090E] text-[#E2E8F0] font-mono flex flex-col overflow-hidden relative selection:bg-[#00FF66]/30 selection:text-[#00FF66]">
    <!-- Scanline effect overlay -->
    <div class="fixed inset-0 scanlines opacity-30 pointer-events-none z-40"></div>

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

    <!-- Main 3-Column / Mobile Tab Layout -->
    <GameColumnsLayout
      ref="columnsLayoutRef"
      :active-mobile-tab="activeMobileTab"
      :store="store"
      :has-hardware="hasHardware"
      :has-cpu="hasCpu"
      :hardware-array="hardwareArray"
      :upgrades-array="upgradesArray"
      :ram-upgrades-array="ramUpgradesArray"
      :cooling-upgrades-array="coolingUpgradesArray"
      :power-upgrades-array="powerUpgradesArray"
      :purchased-upgrade-ids="purchasedUpgradeIds"
      @open-talent-tree="showTalentTreeModal = true"
      @open-paradigm-modal="showParadigmModal = true"
      @open-singularity-modal="showSingularityModal = true"
      @select-tab="(tab) => (activeMobileTab = tab)"
    />

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

    <!-- Orchestrator for All Game Modals -->
    <GameModalsContainer
      :store="store"
      :show-talent-tree="showTalentTreeModal"
      :show-paradigm="showParadigmModal"
      :show-singularity="showSingularityModal"
      :show-save-manager="showSaveManagerModal"
      @close-talent-tree="showTalentTreeModal = false"
      @close-paradigm="showParadigmModal = false"
      @close-singularity="showSingularityModal = false"
      @close-save-manager="showSaveManagerModal = false"
    />
  </div>
</template>
