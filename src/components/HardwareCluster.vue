<script setup lang="ts">
import { ref, computed } from 'vue'
import { HardDrive, Plus, Zap, Cpu, MemoryStick, Activity, Layers, Server, Check, AlertCircle, Flame, Wind } from 'lucide-vue-next'
import { formatMoney, formatFlops, formatWatts, formatVram, formatBandwidth } from '@/utils/format'
import type { HardwareNode, SoftwareUpgrade, ThermalState, PowerState } from '@/types/game'
import type Decimal from 'break_infinity.js'
import { ComputeEngine, type PcieSlotsState } from '@/domain/engine/ComputeEngine'

const props = defineProps<{
  hardwareList: HardwareNode[]
  ramUpgradesList?: SoftwareUpgrade[]
  coolingUpgradesList?: SoftwareUpgrade[]
  powerUpgradesList?: SoftwareUpgrade[]
  thermalState?: ThermalState
  powerState?: PowerState
  fundsCurrent: Decimal
  currentPhase: number
  pcieSlots?: PcieSlotsState
  activeHostNode?: HardwareNode | null
  nextHostNode?: HardwareNode | null
  purchasedUpgradeIds?: string[]
  getHardwareCost: (id: string) => Decimal
}>()

const emit = defineEmits<{
  (e: 'buy-hardware', id: string): void
  (e: 'buy-upgrade', id: string): void
}>()

const activeTab = ref<'host' | 'ram' | 'cooling' | 'power' | 'gpu'>('host')

const hardwareRecord = computed(() => {
  const map: Record<string, HardwareNode> = {}
  for (const node of props.hardwareList) {
    map[node.id] = node
  }
  return map
})

const purchasedSet = computed(() => new Set(props.purchasedUpgradeIds ?? []))

// ==========================================
// 1. HOST STATION TAB COMPUTEDS
// ==========================================
const currentHost = computed(() => props.activeHostNode ?? null)
const nextHost = computed(() => props.nextHostNode ?? null)

function isHostRamRequirementsMet(node: HardwareNode | null): boolean {
  if (!node || !node.requiredUpgrades || node.requiredUpgrades.length === 0) return true
  return node.requiredUpgrades.every((req) => purchasedSet.value.has(req))
}

function getMissingRamUpgradeNames(node: HardwareNode | null): string[] {
  if (!node || !node.requiredUpgrades) return []
  const missingIds = node.requiredUpgrades.filter((req) => !purchasedSet.value.has(req))
  return missingIds.map((id) => {
    const up = props.ramUpgradesList?.find((u) => u.id === id)
    return up ? up.name : id
  })
}

function canBuyHost(node: HardwareNode | null): boolean {
  if (!node) return false
  if (node.maxCount && node.count >= node.maxCount) return false
  if (!isHostRamRequirementsMet(node)) return false
  const cost = props.getHardwareCost(node.id)
  return props.fundsCurrent.gte(cost)
}

function getHostButtonLabel(node: HardwareNode | null): string {
  if (!node) return 'Max'
  if (node.maxCount && node.count >= node.maxCount) return 'Actif (Actuel)'
  if (!isHostRamRequirementsMet(node)) return 'RAM max requise'
  return 'Mettre à niveau'
}

// ==========================================
// 2. RAM UPGRADES TAB COMPUTEDS
// ==========================================
const visibleRamUpgrades = computed(() => {
  if (!props.ramUpgradesList) return []
  const currentTier = currentHost.value?.tier ?? -1

  return props.ramUpgradesList.filter((up) => {
    if (up.purchased) return true
    if (!currentHost.value) return false

    if (currentTier === 0) {
      return (
        up.id === 'ram_sdram_256mb' ||
        up.id === 'script_ram_expansion_512' ||
        up.id === 'ram_ddr2_8gb' ||
        up.id === 'ram_ddr3_16gb'
      )
    } else if (currentTier === 1) {
      return up.id === 'ram_ddr4_32gb' || up.id === 'ram_ddr4_64gb'
    } else if (currentTier === 2) {
      return up.id === 'ram_ddr5_128gb' || up.id === 'ram_ddr5_256gb'
    } else {
      return true
    }
  })
})

function canAffordUpgrade(up: SoftwareUpgrade): boolean {
  if (up.purchased) return false
  return props.fundsCurrent.gte(up.cost)
}

// ==========================================
// 3. COOLING SOLUTIONS TAB COMPUTEDS
// ==========================================
const visibleCoolingUpgrades = computed(() => {
  if (!props.coolingUpgradesList) return []
  const currentTier = currentHost.value?.tier ?? -1

  return props.coolingUpgradesList.filter((up) => {
    if (up.purchased) return true
    if (!currentHost.value) return false

    if (up.requiredFeature === 'scriptsSection') {
      return props.currentPhase >= 1
    }
    if (up.requiredFeature === 'tokenizerUnlocked') {
      return props.currentPhase >= 2
    }
    if (up.requiredFeature === 'trainingAllocation') {
      return props.currentPhase >= 3 || currentTier >= 2
    }
    return true
  })
})

const thermalLoadPercent = computed(() => {
  if (!props.thermalState) return 0
  const heat = props.thermalState.heatGeneratedWatts.toNumber()
  const cooling = props.thermalState.coolingCapacityWatts.toNumber()
  if (cooling <= 0) return 100
  return Math.min(150, Math.round((heat / cooling) * 100))
})

// ==========================================
// 4. POWER GRID INFRASTRUCTURE COMPUTEDS
// ==========================================
const visiblePowerUpgrades = computed(() => {
  if (!props.powerUpgradesList) return []
  const currentTier = currentHost.value?.tier ?? -1

  return props.powerUpgradesList.filter((up) => {
    if (up.purchased) return true
    if (!currentHost.value) return false

    if (up.requiredFeature === 'scriptsSection') {
      return props.currentPhase >= 1
    }
    if (up.requiredFeature === 'tokenizerUnlocked') {
      return props.currentPhase >= 2
    }
    if (up.requiredFeature === 'trainingAllocation') {
      return props.currentPhase >= 3 || currentTier >= 2
    }
    return true
  })
})

// ==========================================
// 5. GPU ACCELERATORS TAB COMPUTEDS
// ==========================================
const visibleGpus = computed(() => {
  const currentTier = currentHost.value?.tier ?? -1

  return props.hardwareList.filter((hw) => {
    if (hw.category !== 'gpu') return false
    if (hw.count > 0) return true
    const minTier = hw.minHostTier ?? 0
    return minTier <= Math.max(0, currentTier)
  })
})

function canBuyGpu(hw: HardwareNode): boolean {
  const cost = props.getHardwareCost(hw.id)
  if (props.fundsCurrent.lt(cost)) return false
  const check = ComputeEngine.canInstallGpu(hardwareRecord.value, hw)
  return check.canInstall
}

function getGpuButtonLabel(hw: HardwareNode): string {
  const check = ComputeEngine.canInstallGpu(hardwareRecord.value, hw)
  if (!check.canInstall) {
    if (check.reason === 'host_tier_too_low') {
      return `Hôte T${hw.minHostTier ?? 0}+ requis`
    }
    if (check.reason === 'no_pcie_slots') {
      return 'Slot PCIe requis'
    }
  }
  return 'Acquérir'
}
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-3 shadow-lg animate-fadeIn">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1.5 rounded bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20">
          <HardDrive class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-bold text-[#F0F6FC] uppercase tracking-wider font-mono">
            3. Matériel, Énergie & Accélérateurs
          </h3>
          <p class="text-[10px] text-[#8B949E] font-mono">
            Hôtes, RAM, dissipation thermique, réseau électrique et cartes GPU
          </p>
        </div>
      </div>

      <!-- Power Grid, Thermal & PCIe Badges -->
      <div class="flex items-center gap-2">
        <div v-if="powerState" class="flex items-center gap-1 px-2 py-1 rounded bg-[#161B22] border border-[#21262D] text-[10px] font-mono">
          <Zap
            class="w-3 h-3 transition-colors"
            :class="powerState.isOverloaded ? 'text-[#EF4444] animate-bounce' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
          />
          <span :class="powerState.isOverloaded ? 'text-[#EF4444] font-bold' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#8B949E]'">
            {{ powerState.gridLoadPercent.toFixed(0) }}%
          </span>
        </div>

        <div v-if="thermalState" class="flex items-center gap-1 px-2 py-1 rounded bg-[#161B22] border border-[#21262D] text-[10px] font-mono">
          <Flame
            class="w-3 h-3 transition-colors"
            :class="thermalState.isThrottling ? 'text-[#EF4444] animate-pulse' : thermalState.status === 'warm' ? 'text-[#FFB800]' : 'text-[#38BDF8]'"
          />
          <span :class="thermalState.isThrottling ? 'text-[#EF4444] font-bold' : 'text-[#8B949E]'">
            {{ thermalState.temperatureCelsius.toFixed(1) }}°C
          </span>
        </div>

        <div v-if="pcieSlots" class="flex items-center gap-1.5 px-2 py-1 rounded bg-[#161B22] border border-[#21262D] text-[10px] font-mono">
          <Layers class="w-3 h-3 text-[#38BDF8]" />
          <span class="text-[#8B949E]">PCIe :</span>
          <span :class="pcieSlots.freeSlots > 0 ? 'text-[#00FF66] font-bold' : pcieSlots.totalSlots > 0 ? 'text-[#FFB800] font-bold' : 'text-[#8B949E]'">
            {{ pcieSlots.usedSlots }} / {{ pcieSlots.totalSlots }}
          </span>
        </div>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="flex items-center gap-1 bg-[#161B22] p-1 rounded-md border border-[#21262D] text-xs font-mono">
      <button
        @click="activeTab = 'host'"
        :class="activeTab === 'host' ? 'bg-[#21262D] text-[#38BDF8] font-bold shadow-sm' : 'text-[#8B949E] hover:text-[#38BDF8]'"
        class="flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
      >
        <Server class="w-3 h-3" />
        Hôte
      </button>
      <button
        @click="activeTab = 'ram'"
        :class="activeTab === 'ram' ? 'bg-[#21262D] text-[#FFB800] font-bold shadow-sm' : 'text-[#8B949E] hover:text-[#FFB800]'"
        class="flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
      >
        <MemoryStick class="w-3 h-3" />
        RAM
      </button>
      <button
        @click="activeTab = 'cooling'"
        :class="activeTab === 'cooling' ? 'bg-[#21262D] text-[#38BDF8] font-bold shadow-sm' : thermalState?.isThrottling ? 'text-[#EF4444] animate-pulse font-bold' : 'text-[#8B949E] hover:text-[#38BDF8]'"
        class="flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer relative"
      >
        <Wind class="w-3 h-3" />
        Refroidissement
        <span
          v-if="thermalState?.isThrottling"
          class="w-1.5 h-1.5 rounded-full bg-[#EF4444] absolute -top-0.5 -right-0.5"
        ></span>
      </button>
      <button
        @click="activeTab = 'power'"
        :class="activeTab === 'power' ? 'bg-[#21262D] text-[#FFB800] font-bold shadow-sm' : powerState?.isOverloaded ? 'text-[#EF4444] animate-pulse font-bold' : 'text-[#8B949E] hover:text-[#FFB800]'"
        class="flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer relative"
      >
        <Zap class="w-3 h-3" />
        Énergie
        <span
          v-if="powerState?.isOverloaded"
          class="w-1.5 h-1.5 rounded-full bg-[#EF4444] absolute -top-0.5 -right-0.5 animate-ping"
        ></span>
      </button>
      <button
        @click="activeTab = 'gpu'"
        :class="activeTab === 'gpu' ? 'bg-[#21262D] text-[#00FF66] font-bold shadow-sm' : 'text-[#8B949E] hover:text-[#00FF66]'"
        class="flex-1 py-1 rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
      >
        <Zap class="w-3 h-3" />
        GPU
      </button>
    </div>

    <!-- TAB 1: HOST STATION PROGRESSION -->
    <div v-if="activeTab === 'host'" class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
      <div
        v-if="currentHost"
        class="bg-[#161B22]/90 border border-[#38BDF8]/40 rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-bold text-[#F0F6FC] font-mono flex items-center gap-2">
              {{ currentHost.name }}
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 font-bold uppercase">
                Station Active • T{{ currentHost.tier }}
              </span>
            </div>
            <div class="text-[10px] text-[#8B949E] font-mono flex flex-wrap items-center gap-2 mt-1">
              <span class="flex items-center gap-1 text-[#38BDF8]">
                <Cpu class="w-3 h-3" /> +{{ formatFlops(currentHost.tflops) }} CPU
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-[#FFB800]">
                <Zap class="w-3 h-3" /> {{ formatWatts(currentHost.powerWatts) }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-[#00FF66]">
                <MemoryStick class="w-3 h-3" /> {{ formatVram(currentHost.vram) }}
              </span>
              <span>•</span>
              <span class="text-[#38BDF8] font-bold">
                {{ (currentHost.pcieSlotsProvided ?? 0) > 0 ? `+${currentHost.pcieSlotsProvided} Slot PCIe` : '0 slot PCIe' }}
              </span>
            </div>
          </div>

          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1">
            <Check class="w-3 h-3" /> En Ligne
          </span>
        </div>

        <p v-if="currentHost.description" class="text-[10px] text-[#8B949E] leading-relaxed">
          {{ currentHost.description }}
        </p>
      </div>

      <!-- Next Target Host Card -->
      <div
        v-if="nextHost"
        class="bg-[#161B22]/60 border border-[#21262D] hover:border-[#38BDF8]/40 transition-all rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-bold text-[#F0F6FC] font-mono flex items-center gap-2">
              {{ nextHost.name }}
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/30 uppercase font-mono">
                Prochain Palier • T{{ nextHost.tier }}
              </span>
            </div>
            <div class="text-[10px] text-[#8B949E] font-mono flex flex-wrap items-center gap-2 mt-1">
              <span class="flex items-center gap-1 text-[#38BDF8]">
                <Cpu class="w-3 h-3" /> +{{ formatFlops(nextHost.tflops) }} CPU
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-[#FFB800]">
                <Zap class="w-3 h-3" /> {{ formatWatts(nextHost.powerWatts) }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-[#00FF66]">
                <MemoryStick class="w-3 h-3" /> {{ formatVram(nextHost.vram) }}
              </span>
              <span v-if="(nextHost.pcieSlotsProvided ?? 0) > 0" class="text-[#38BDF8] font-bold">
                • +{{ nextHost.pcieSlotsProvided }} Slots PCIe
              </span>
            </div>
          </div>
        </div>

        <p v-if="nextHost.description" class="text-[10px] text-[#8B949E] leading-relaxed">
          {{ nextHost.description }}
        </p>

        <!-- RAM Gating Requirements Banner -->
        <div
          v-if="!isHostRamRequirementsMet(nextHost)"
          class="p-2 rounded bg-[#FFB800]/10 border border-[#FFB800]/20 flex items-start gap-2 text-[10px] font-mono text-[#FFB800]"
        >
          <AlertCircle class="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <div>
            <span class="font-bold">Prérequis RAM non satisfait :</span>
            <p class="text-[#8B949E] text-[9px] mt-0.5">
              Installez d'abord les extensions requises : <span class="text-[#F0F6FC] font-bold">{{ getMissingRamUpgradeNames(nextHost).join(', ') }}</span> dans l'onglet <strong>RAM</strong>.
            </p>
          </div>
        </div>

        <div
          v-else-if="nextHost.requiredUpgrades && nextHost.requiredUpgrades.length > 0"
          class="p-1.5 rounded bg-[#00FF66]/10 border border-[#00FF66]/20 flex items-center gap-1.5 text-[10px] font-mono text-[#00FF66]"
        >
          <Check class="w-3.5 h-3.5" />
          <span>Tous les kits de RAM requis sont installés ! Prêt pour la mise à niveau.</span>
        </div>

        <!-- Upgrade Cost & Action Button -->
        <div class="flex justify-between items-center pt-2 border-t border-[#21262D]/60 text-xs font-mono">
          <div class="flex flex-col">
            <span class="text-[9px] text-[#8B949E] uppercase">Coût de mise à niveau</span>
            <span class="font-bold text-[#00FF66]">
              {{ formatMoney(getHardwareCost(nextHost.id)) }}
            </span>
          </div>

          <button
            @click="emit('buy-hardware', nextHost.id)"
            :disabled="!canBuyHost(nextHost)"
            :class="canBuyHost(nextHost) ? 'hover:bg-[#30363D] hover:text-[#00FF66] text-[#F0F6FC]' : 'opacity-40 cursor-not-allowed text-[#8B949E]'"
            class="px-3.5 py-1.5 rounded bg-[#21262D] active:scale-95 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
          >
            <Plus class="w-3.5 h-3.5" />
            {{ getHostButtonLabel(nextHost) }}
          </button>
        </div>
      </div>

      <div v-if="!nextHost && currentHost" class="text-center p-4 bg-[#161B22]/40 rounded-lg border border-[#21262D] text-xs font-mono text-[#8B949E]">
        🏆 Félicitations ! Votre cluster fonctionne sur l'infrastructure serveur ultime.
      </div>
    </div>

    <!-- TAB 2: RAM UPGRADES -->
    <div v-else-if="activeTab === 'ram'" class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
      <div v-if="visibleRamUpgrades.length === 0" class="p-4 text-center text-xs font-mono text-[#8B949E]">
        Aucune extension de RAM disponible pour le moment.
      </div>

      <div
        v-for="up in visibleRamUpgrades"
        :key="up.id"
        :class="[
          'border rounded-lg p-3 flex flex-col gap-2 transition-all shadow-sm',
          up.purchased
            ? 'bg-[#161B22]/40 border-[#21262D]/60 opacity-70'
            : 'bg-[#161B22]/80 border-[#21262D] hover:border-[#FFB800]/40'
        ]"
      >
        <div class="flex justify-between items-start gap-2">
          <div class="flex items-center gap-1.5">
            <MemoryStick class="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
            <span class="text-xs font-bold text-[#F0F6FC] font-mono">
              {{ up.name }}
            </span>
          </div>

          <span
            v-if="up.purchased"
            class="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1 shrink-0"
          >
            <Check class="w-3 h-3" /> Installé
          </span>
          <span
            v-else
            class="text-xs font-mono font-bold text-[#00FF66] shrink-0"
          >
            {{ formatMoney(up.cost) }}
          </span>
        </div>

        <p class="text-[10px] text-[#8B949E] leading-relaxed">
          {{ up.description }}
        </p>

        <div v-if="!up.purchased" class="flex justify-end pt-1">
          <button
            @click="emit('buy-upgrade', up.id)"
            :disabled="!canAffordUpgrade(up)"
            class="w-full py-1.5 px-3 rounded bg-[#21262D] hover:bg-[#30363D] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F6FC] hover:text-[#FFB800] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
          >
            Installer la barrette
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 3: COOLING SOLUTIONS -->
    <div v-else-if="activeTab === 'cooling'" class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
      <!-- Thermodynamic Live Telemetry Box -->
      <div
        v-if="thermalState"
        class="bg-[#161B22]/90 border rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm transition-all"
        :class="thermalState.isThrottling ? 'border-[#EF4444]/60 bg-[#EF4444]/5' : thermalState.status === 'warm' ? 'border-[#FFB800]/40' : 'border-[#38BDF8]/30'"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <Flame
              class="w-4 h-4 transition-colors"
              :class="thermalState.isThrottling ? 'text-[#EF4444] animate-pulse' : thermalState.status === 'warm' ? 'text-[#FFB800]' : 'text-[#38BDF8]'"
            />
            <span class="text-xs font-bold text-[#F0F6FC] font-mono uppercase">
              Bilan Thermodynamique Actif
            </span>
          </div>

          <span
            class="text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1"
            :class="thermalState.isThrottling ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40 animate-pulse' : thermalState.status === 'warm' ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40' : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'"
          >
            {{ thermalState.isThrottling ? `Throttling (-${Math.round((1 - thermalState.efficiency) * 100)}%)` : thermalState.status === 'warm' ? 'Chaud (100%)' : 'Nominal (100%)' }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
          <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
            <span class="text-[#8B949E]">Chaleur (Q = 0.9·P)</span>
            <span class="font-bold text-[#FFB800] text-xs mt-0.5">
              {{ formatWatts(thermalState.heatGeneratedWatts) }}
            </span>
          </div>
          <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
            <span class="text-[#8B949E]">Dissipation Active</span>
            <span class="font-bold text-[#38BDF8] text-xs mt-0.5">
              {{ formatWatts(thermalState.coolingCapacityWatts) }}
            </span>
          </div>
          <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
            <span class="text-[#8B949E]">Température Cœur</span>
            <span
              class="font-bold text-xs mt-0.5"
              :class="thermalState.isThrottling ? 'text-[#EF4444]' : thermalState.status === 'warm' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
            >
              {{ thermalState.temperatureCelsius.toFixed(1) }} °C
            </span>
          </div>
        </div>

        <!-- Thermal Load Progress Bar -->
        <div class="flex flex-col gap-1 pt-1">
          <div class="flex justify-between text-[9px] text-[#8B949E] font-mono">
            <span>Charge Thermique Cluster</span>
            <span :class="thermalLoadPercent > 100 ? 'text-[#EF4444] font-bold' : 'text-[#8B949E]'">
              {{ thermalLoadPercent }}%
            </span>
          </div>
          <div class="h-1.5 w-full bg-[#0D1117] rounded-full overflow-hidden border border-[#21262D]">
            <div
              class="h-full transition-all duration-300 rounded-full"
              :class="thermalLoadPercent > 100 ? 'bg-[#EF4444]' : thermalLoadPercent > 80 ? 'bg-[#FFB800]' : 'bg-[#38BDF8]'"
              :style="{ width: `${Math.min(100, thermalLoadPercent)}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Cooling Units List -->
      <div
        v-for="up in visibleCoolingUpgrades"
        :key="up.id"
        :class="[
          'border rounded-lg p-3 flex flex-col gap-2 transition-all shadow-sm',
          up.purchased
            ? 'bg-[#161B22]/40 border-[#21262D]/60 opacity-70'
            : 'bg-[#161B22]/80 border-[#21262D] hover:border-[#38BDF8]/40'
        ]"
      >
        <div class="flex justify-between items-start gap-2">
          <div class="flex items-center gap-1.5">
            <Wind class="w-3.5 h-3.5 text-[#38BDF8] shrink-0" />
            <span class="text-xs font-bold text-[#F0F6FC] font-mono">
              {{ up.name }}
            </span>
          </div>

          <span
            v-if="up.purchased"
            class="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1 shrink-0"
          >
            <Check class="w-3 h-3" /> Installé
          </span>
          <span
            v-else
            class="text-xs font-mono font-bold text-[#00FF66] shrink-0"
          >
            {{ formatMoney(up.cost) }}
          </span>
        </div>

        <p class="text-[10px] text-[#8B949E] leading-relaxed">
          {{ up.description }}
        </p>

        <div v-if="!up.purchased" class="flex justify-end pt-1">
          <button
            @click="emit('buy-upgrade', up.id)"
            :disabled="!canAffordUpgrade(up)"
            class="w-full py-1.5 px-3 rounded bg-[#21262D] hover:bg-[#30363D] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F6FC] hover:text-[#38BDF8] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
          >
            Installer le module de dissipation
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 4: POWER GRID INFRASTRUCTURE -->
    <div v-else-if="activeTab === 'power'" class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
      <!-- Power Grid Status Card -->
      <div
        v-if="powerState"
        class="bg-[#161B22]/90 border rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm transition-all"
        :class="powerState.isOverloaded ? 'border-[#EF4444]/60 bg-[#EF4444]/5' : powerState.status === 'strained' ? 'border-[#FFB800]/40' : 'border-[#00FF66]/30'"
      >
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <Zap
              class="w-4 h-4 transition-colors"
              :class="powerState.isOverloaded ? 'text-[#EF4444] animate-bounce' : powerState.status === 'strained' ? 'text-[#FFB800]' : 'text-[#00FF66]'"
            />
            <span class="text-xs font-bold text-[#F0F6FC] font-mono uppercase">
              Bilan du Réseau Électrique
            </span>
          </div>

          <span
            class="text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase flex items-center gap-1"
            :class="powerState.isOverloaded ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/40 animate-pulse' : powerState.status === 'strained' ? 'bg-[#FFB800]/20 text-[#FFB800] border-[#FFB800]/40' : 'bg-[#00FF66]/10 text-[#00FF66] border-[#00FF66]/30'"
          >
            {{ powerState.isOverloaded ? 'Surcharge (-50% Compute)' : powerState.status === 'strained' ? 'En Charge (100%)' : 'Nominal (100%)' }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-2 text-[10px] font-mono pt-1">
          <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
            <span class="text-[#8B949E]">Puissance Appelée</span>
            <span class="font-bold text-[#FFB800] text-xs mt-0.5">
              {{ formatWatts(powerState.totalDrawWatts) }}
            </span>
          </div>
          <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
            <span class="text-[#8B949E]">Capacité Réseau</span>
            <span class="font-bold text-[#00FF66] text-xs mt-0.5">
              {{ formatWatts(powerState.gridCapacityWatts) }}
            </span>
          </div>
          <div class="flex flex-col bg-[#0D1117] p-2 rounded border border-[#21262D]">
            <span class="text-[#8B949E]">Multiplicateur Compute</span>
            <span
              class="font-bold text-xs mt-0.5"
              :class="powerState.isOverloaded ? 'text-[#EF4444]' : 'text-[#00FF66]'"
            >
              {{ Math.round(powerState.effectiveMultiplier * 100) }}%
            </span>
          </div>
        </div>

        <!-- Power Load Progress Bar -->
        <div class="flex flex-col gap-1 pt-1">
          <div class="flex justify-between text-[9px] text-[#8B949E] font-mono">
            <span>Charge du Réseau Électrique</span>
            <span :class="powerState.isOverloaded ? 'text-[#EF4444] font-bold' : powerState.status === 'strained' ? 'text-[#FFB800] font-bold' : 'text-[#8B949E]'">
              {{ powerState.gridLoadPercent.toFixed(1) }}%
            </span>
          </div>
          <div class="h-1.5 w-full bg-[#0D1117] rounded-full overflow-hidden border border-[#21262D]">
            <div
              class="h-full transition-all duration-300 rounded-full"
              :class="powerState.isOverloaded ? 'bg-[#EF4444]' : powerState.status === 'strained' ? 'bg-[#FFB800]' : 'bg-[#00FF66]'"
              :style="{ width: `${Math.min(100, powerState.gridLoadPercent)}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Power Upgrades List -->
      <div
        v-for="up in visiblePowerUpgrades"
        :key="up.id"
        :class="[
          'border rounded-lg p-3 flex flex-col gap-2 transition-all shadow-sm',
          up.purchased
            ? 'bg-[#161B22]/40 border-[#21262D]/60 opacity-70'
            : 'bg-[#161B22]/80 border-[#21262D] hover:border-[#FFB800]/40'
        ]"
      >
        <div class="flex justify-between items-start gap-2">
          <div class="flex items-center gap-1.5">
            <Zap class="w-3.5 h-3.5 text-[#FFB800] shrink-0" />
            <span class="text-xs font-bold text-[#F0F6FC] font-mono">
              {{ up.name }}
            </span>
          </div>

          <span
            v-if="up.purchased"
            class="text-[9px] font-mono px-2 py-0.5 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/30 flex items-center gap-1 shrink-0"
          >
            <Check class="w-3 h-3" /> Connecté
          </span>
          <span
            v-else
            class="text-xs font-mono font-bold text-[#00FF66] shrink-0"
          >
            {{ formatMoney(up.cost) }}
          </span>
        </div>

        <p class="text-[10px] text-[#8B949E] leading-relaxed">
          {{ up.description }}
        </p>

        <div v-if="!up.purchased" class="flex justify-end pt-1">
          <button
            @click="emit('buy-upgrade', up.id)"
            :disabled="!canAffordUpgrade(up)"
            class="w-full py-1.5 px-3 rounded bg-[#21262D] hover:bg-[#30363D] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed text-[#F0F6FC] hover:text-[#FFB800] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
          >
            Mettre à niveau l’infrastructure électrique
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 5: GPU ACCELERATORS -->
    <div v-else class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
      <div
        v-if="!currentHost || (currentHost.pcieSlotsProvided ?? 0) <= 0"
        class="p-4 rounded-lg bg-[#161B22]/60 border border-[#21262D] text-center text-xs font-mono text-[#8B949E] flex flex-col items-center gap-2"
      >
        <Layers class="w-6 h-6 text-[#38BDF8]/60" />
        <p>
          Votre machine actuelle ne possède aucun port d'extension PCIe x16.
        </p>
        <p class="text-[10px] text-[#38BDF8]">
          Améliorez votre station hôte vers un <strong>Chauffage d'Appoint (Core 2 Quad)</strong> ou supérieur pour installer un GPU dédié.
        </p>
      </div>

      <div
        v-for="hw in visibleGpus"
        :key="hw.id"
        class="bg-[#161B22]/80 border border-[#21262D] hover:border-[#00FF66]/40 transition-all rounded-lg p-3.5 flex flex-col gap-2.5 shadow-sm"
      >
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs font-bold text-[#F0F6FC] font-mono flex items-center gap-2">
              {{ hw.name }}
              <span class="text-[9px] px-1.5 py-0.2 rounded bg-[#00FF66]/10 text-[#00FF66] border border-[#00FF66]/20 font-normal uppercase">
                GPU • T{{ hw.tier }}
              </span>
            </div>
            <div class="text-[10px] text-[#8B949E] font-mono flex flex-wrap items-center gap-2 mt-1">
              <span class="flex items-center gap-1 text-[#38BDF8]">
                <Cpu class="w-3 h-3" /> +{{ formatFlops(hw.tflops) }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-[#FFB800]">
                <Zap class="w-3 h-3" /> {{ formatWatts(hw.powerWatts) }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-[#00FF66]">
                <MemoryStick class="w-3 h-3" /> {{ formatVram(hw.vram) }}
              </span>
              <span>•</span>
              <span class="flex items-center gap-1 text-[#E2E8F0]">
                <Activity class="w-3 h-3 text-[#38BDF8]" /> {{ formatBandwidth(hw.memoryBandwidthGBs) }} ({{ hw.memoryType }})
              </span>
              <span class="text-[#FFB800] font-bold">
                • {{ hw.pcieSlotsRequired ?? 1 }} Slot requis
              </span>
            </div>
          </div>

          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#21262D] text-[#F0F6FC] border border-[#30363D]">
            x{{ hw.count }}
          </span>
        </div>

        <p v-if="hw.description" class="text-[10px] text-[#8B949E] leading-relaxed">
          {{ hw.description }}
        </p>

        <div class="flex justify-between items-center pt-2 border-t border-[#21262D]/60 text-xs font-mono">
          <div class="flex flex-col">
            <span class="text-[9px] text-[#8B949E] uppercase">Coût unitaire</span>
            <span class="font-bold text-[#00FF66]">
              {{ formatMoney(getHardwareCost(hw.id)) }}
            </span>
          </div>

          <button
            @click="emit('buy-hardware', hw.id)"
            :disabled="!canBuyGpu(hw)"
            :class="canBuyGpu(hw) ? 'hover:bg-[#30363D] hover:text-[#00FF66] text-[#F0F6FC]' : 'opacity-40 cursor-not-allowed text-[#8B949E]'"
            class="px-3.5 py-1.5 rounded bg-[#21262D] active:scale-95 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer border border-[#30363D]"
          >
            <Plus class="w-3.5 h-3.5" />
            {{ getGpuButtonLabel(hw) }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
