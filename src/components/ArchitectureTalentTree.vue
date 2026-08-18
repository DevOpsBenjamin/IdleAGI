<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Zap,
  Cpu,
  Sparkles,
  X,
  Database,
  Flame,
  Binary,
  Layers,
} from 'lucide-vue-next'
import type { TalentNode, TalentBranch, TalentNodeStatus } from '@/types/prestige'
import TalentNodeCard from './talent/TalentNodeCard.vue'
import TalentInspector from './talent/TalentInspector.vue'

const props = defineProps<{
  isOpen: boolean
  architecturePoints: number
  totalArchitecturePoints: number
  checkpointMultiplier: number
  talents: Record<string, TalentNode>
  getNodeStatus: (id: string) => TalentNodeStatus
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'buy-talent', id: string): void
}>()

const activeBranchTab = ref<'all' | TalentBranch>('all')
const selectedTalentId = ref<string>('opt_bpe_fast_track')

const selectedTalent = computed<TalentNode | null>(() => {
  return props.talents[selectedTalentId.value] ?? null
})

const selectedTalentStatus = computed<TalentNodeStatus>(() => {
  if (!selectedTalent.value) return 'locked'
  return props.getNodeStatus(selectedTalent.value.id)
})

const branchesList: { id: 'all' | TalentBranch; label: string; icon: any; color: string }[] = [
  { id: 'all', label: 'Vue Globale', icon: Layers, color: '#F0F6FC' },
  { id: 'ingestion', label: 'Ingestion & Data', icon: Database, color: '#38BDF8' },
  { id: 'infrastructure', label: 'Électro-Thermique', icon: Flame, color: '#FFB800' },
  { id: 'compute', label: 'Calcul & Matrice', icon: Binary, color: '#A855F7' },
]

const filteredTalents = computed<TalentNode[]>(() => {
  const all = Object.values(props.talents)
  if (activeBranchTab.value === 'all') {
    return all
  }
  return all.filter((t) => t.branch === activeBranchTab.value)
})

const talentsByTier = computed(() => {
  return {
    tier1: filteredTalents.value.filter((t) => t.tier === 1),
    tier2: filteredTalents.value.filter((t) => t.tier === 2),
    tier3: filteredTalents.value.filter((t) => t.tier === 3),
  }
})

const globalComputeBonusPercent = computed(() => {
  return Math.round((props.checkpointMultiplier - 1.0) * 100)
})

const purchasedCount = computed(() => {
  return Object.values(props.talents).filter((t) => t.purchased).length
})

const totalTalentsCount = computed(() => {
  return Object.keys(props.talents).length
})

function selectTalent(id: string) {
  selectedTalentId.value = id
}

function handleBuy(id: string) {
  emit('buy-talent', id)
}

function handleKeyDown(e: KeyboardEvent) {
  if (!props.isOpen) return
  if (e.key === 'Escape') {
    emit('close')
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
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-hidden font-mono"
        @click.self="emit('close')"
      >
        <!-- Modal Container -->
        <div
          class="bg-[#0D1117] border border-[#38BDF8]/40 shadow-[0_0_50px_rgba(56,189,248,0.15)] rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden relative text-[#E2E8F0]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="talent-tree-title"
        >
          <!-- Background Cyber Grid Pattern -->
          <div
            class="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none"
          ></div>

          <!-- Top HUD Header -->
          <header class="shrink-0 bg-[#161B22]/90 border-b border-[#21262D] px-4 md:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 z-10">
            <div class="flex items-center gap-3">
              <div class="p-2 rounded-lg bg-[#38BDF8]/10 border border-[#38BDF8]/30 text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.2)]">
                <Zap class="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 id="talent-tree-title" class="text-sm md:text-base font-bold tracking-wider text-[#F0F6FC] flex items-center gap-2">
                  ARBRE DE TALENTS D'ARCHITECTURE
                  <span class="text-[10px] px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30">
                    TIER 1 CHECKPOINTS
                  </span>
                </h2>
                <p class="text-[11px] text-[#8B949E]">
                  Optimisations synaptiques permanentes et déblocages structurels
                </p>
              </div>
            </div>

            <!-- AP Metrics HUD Bar -->
            <div class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs">
              <!-- Available AP -->
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07090E] border border-[#00FF66]/40 shadow-inner">
                <Sparkles class="w-4 h-4 text-[#00FF66]" />
                <div class="flex flex-col">
                  <span class="text-[9px] text-[#8B949E] uppercase">Points d'Architecture</span>
                  <span class="font-bold text-[#00FF66] text-sm leading-tight">
                    {{ architecturePoints }} AP
                  </span>
                </div>
              </div>

              <!-- Checkpoint Compute Multiplier -->
              <div class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07090E] border border-[#38BDF8]/30 shadow-inner">
                <Cpu class="w-4 h-4 text-[#38BDF8]" />
                <div class="flex flex-col">
                  <span class="text-[9px] text-[#8B949E] uppercase">Bonus Passif Total</span>
                  <span class="font-bold text-[#38BDF8] text-sm leading-tight">
                    +{{ globalComputeBonusPercent }}% TFLOPS
                  </span>
                </div>
              </div>

              <!-- Unlocked Talents Ratio -->
              <div class="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#07090E] border border-[#21262D]">
                <div class="flex flex-col">
                  <span class="text-[9px] text-[#8B949E] uppercase">Talents Acquis</span>
                  <span class="font-bold text-[#F0F6FC] text-sm leading-tight">
                    {{ purchasedCount }} / {{ totalTalentsCount }}
                  </span>
                </div>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                @click="emit('close')"
                class="p-2 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] hover:text-[#F0F6FC] transition-colors cursor-pointer active:scale-95 ml-1"
                aria-label="Fermer la modale"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </header>

          <!-- Branch Filter Tabs Bar -->
          <div class="shrink-0 bg-[#07090E]/80 border-b border-[#21262D] px-4 md:px-6 py-2 flex items-center gap-2 overflow-x-auto z-10">
            <button
              v-for="branch in branchesList"
              :key="branch.id"
              type="button"
              @click="activeBranchTab = branch.id"
              class="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer touch-manipulation active:scale-95"
              :class="
                activeBranchTab === branch.id
                  ? 'bg-[#161B22] text-[#F0F6FC] border border-[#38BDF8]/60 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : 'text-[#8B949E] hover:text-[#C9D1D9] hover:bg-[#161B22]/50 border border-transparent'
              "
            >
              <component :is="branch.icon" class="w-3.5 h-3.5" :style="{ color: branch.color }" />
              <span>{{ branch.label }}</span>
            </button>
          </div>

          <!-- Main Interactive Body (Graph View + Node Inspector) -->
          <div class="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0 z-10">
            <!-- Left Area: Tiered Visual Node Matrix (8 cols on lg) -->
            <div class="lg:col-span-8 overflow-y-auto p-4 md:p-6 flex flex-col gap-6 border-b lg:border-b-0 lg:border-r border-[#21262D]">
              <!-- Tier Columns Container -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <!-- TIER 1 -->
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between pb-2 border-b border-[#21262D]">
                    <span class="text-xs font-bold uppercase text-[#38BDF8] tracking-wider flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-[#38BDF8]"></span>
                      Tier 1 // Fondations
                    </span>
                    <span class="text-[10px] text-[#8B949E]">1 AP</span>
                  </div>

                  <div class="flex flex-col gap-3">
                    <TalentNodeCard
                      v-for="talent in talentsByTier.tier1"
                      :key="talent.id"
                      :talent="talent"
                      :is-selected="selectedTalentId === talent.id"
                      :status="getNodeStatus(talent.id)"
                      @select="selectTalent"
                    />
                  </div>
                </div>

                <!-- TIER 2 -->
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between pb-2 border-b border-[#21262D]">
                    <span class="text-xs font-bold uppercase text-[#FFB800] tracking-wider flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-[#FFB800]"></span>
                      Tier 2 // Spécialisation
                    </span>
                    <span class="text-[10px] text-[#8B949E]">2 AP</span>
                  </div>

                  <div class="flex flex-col gap-3">
                    <TalentNodeCard
                      v-for="talent in talentsByTier.tier2"
                      :key="talent.id"
                      :talent="talent"
                      :is-selected="selectedTalentId === talent.id"
                      :status="getNodeStatus(talent.id)"
                      @select="selectTalent"
                    />
                  </div>
                </div>

                <!-- TIER 3 -->
                <div class="flex flex-col gap-3">
                  <div class="flex items-center justify-between pb-2 border-b border-[#21262D]">
                    <span class="text-xs font-bold uppercase text-[#A855F7] tracking-wider flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-[#A855F7]"></span>
                      Tier 3 // Maîtrise
                    </span>
                    <span class="text-[10px] text-[#8B949E]">3 AP</span>
                  </div>

                  <div class="flex flex-col gap-3">
                    <TalentNodeCard
                      v-for="talent in talentsByTier.tier3"
                      :key="talent.id"
                      :talent="talent"
                      :is-selected="selectedTalentId === talent.id"
                      :status="getNodeStatus(talent.id)"
                      @select="selectTalent"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Area: Inspector & Buy Panel (4 cols on lg) -->
            <TalentInspector
              :selected-talent="selectedTalent"
              :status="selectedTalentStatus"
              :talents="talents"
              :architecture-points="architecturePoints"
              @buy="handleBuy"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.97);
}
</style>
