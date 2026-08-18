<script setup lang="ts">
import OfflineModal from '@/components/OfflineModal.vue'
import ArchitectureTalentTree from '@/components/ArchitectureTalentTree.vue'
import ParadigmModal from '@/components/ParadigmModal.vue'
import SingularityModal from '@/components/SingularityModal.vue'
import SaveManagerModal from '@/components/SaveManagerModal.vue'
import type { useGameStore } from '@/stores/gameStore'

defineProps<{
  store: ReturnType<typeof useGameStore>
  showTalentTree: boolean
  showParadigm: boolean
  showSingularity: boolean
  showSaveManager: boolean
}>()

const emit = defineEmits<{
  (e: 'close-talent-tree'): void
  (e: 'close-paradigm'): void
  (e: 'close-singularity'): void
  (e: 'close-save-manager'): void
}>()
</script>

<template>
  <div>
    <!-- Offline Catch-Up Modal -->
    <OfflineModal
      v-if="store.lastOfflineReport"
      :report="store.lastOfflineReport"
      @dismiss="store.dismissOfflineReport()"
    />

    <!-- Architecture Talent Tree Modal -->
    <ArchitectureTalentTree
      :is-open="showTalentTree"
      :architecture-points="store.prestige.architecturePoints"
      :total-architecture-points="store.prestige.totalArchitecturePoints"
      :checkpoint-multiplier="store.checkpointMultiplier"
      :talents="store.prestige.talents"
      :get-node-status="(id) => store.prestige.getNodeStatus(id)"
      @close="emit('close-talent-tree')"
      @buy-talent="(id) => store.buyTalent(id)"
    />

    <!-- Tier 2 Paradigm Shift Modal -->
    <ParadigmModal
      v-if="showParadigm"
      :insights="store.insights"
      :total-insights="store.totalInsights"
      :active-paradigm-id="store.activeParadigmId"
      :unlocked-paradigm-ids="store.unlockedParadigmIds"
      :parameters="store.parameters"
      :can-trigger-tier2="store.canTriggerTier2"
      :pending-insights="store.pendingInsights"
      @close="emit('close-paradigm')"
      @select-paradigm="(id) => store.selectParadigm(id)"
      @unlock-paradigm="(id) => store.unlockParadigm(id)"
      @trigger-tier2-prestige="store.triggerTier2Prestige()"
    />

    <!-- Tier 3 Singularity Modal -->
    <SingularityModal
      v-if="showSingularity"
      :parameters="store.parameters"
      :entropy="store.entropy.toNumber()"
      :alignment="store.alignment.toNumber()"
      :active-paradigm-id="store.activeParadigmId"
      :singularities-completed="store.singularitiesCompleted"
      :discovered-endings="store.discoveredEndings"
      :chrono-cores="store.chronoCores"
      :can-trigger-singularity="store.canTriggerSingularity"
      @close="emit('close-singularity')"
      @trigger-ascension="
        (endingId) => {
          store.triggerSingularityAscension(endingId)
          emit('close-singularity')
        }
      "
    />

    <!-- Save Manager (Export/Import Base64) Modal -->
    <SaveManagerModal
      v-if="showSaveManager"
      :game-state="store.getFullState()"
      @close="emit('close-save-manager')"
      @restore-save="
        (envelope) => {
          store.restoreSaveEnvelope(envelope)
          emit('close-save-manager')
        }
      "
    />
  </div>
</template>
