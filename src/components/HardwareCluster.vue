<script setup lang="ts">
import { ref, computed } from 'vue'
import { HardDrive, Zap, MemoryStick, Layers, Server, Flame, Wind } from 'lucide-vue-next'
import type { HardwareNode, SoftwareUpgrade, ThermalState, PowerState } from '@/types/game'
import type Decimal from 'break_infinity.js'
import type { PcieSlotsState } from '@/domain/engine/ComputeEngine'
import HostStationTab from './hardware/HostStationTab.vue'
import RamUpgradesTab from './hardware/RamUpgradesTab.vue'
import CoolingTab from './hardware/CoolingTab.vue'
import PowerGridTab from './hardware/PowerGridTab.vue'
import GpuAcceleratorsTab from './hardware/GpuAcceleratorsTab.vue'

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

const currentHost = computed(() => props.activeHostNode ?? null)
const nextHost = computed(() => props.nextHostNode ?? null)
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
    <HostStationTab
      v-if="activeTab === 'host'"
      :current-host="currentHost"
      :next-host="nextHost"
      :purchased-upgrade-ids="purchasedUpgradeIds"
      :ram-upgrades-list="ramUpgradesList"
      :funds-current="fundsCurrent"
      :get-hardware-cost="getHardwareCost"
      @buy-hardware="emit('buy-hardware', $event)"
    />

    <!-- TAB 2: RAM UPGRADES -->
    <RamUpgradesTab
      v-else-if="activeTab === 'ram'"
      :current-host="currentHost"
      :ram-upgrades-list="ramUpgradesList"
      :funds-current="fundsCurrent"
      @buy-upgrade="emit('buy-upgrade', $event)"
    />

    <!-- TAB 3: COOLING SOLUTIONS -->
    <CoolingTab
      v-else-if="activeTab === 'cooling'"
      :current-host="currentHost"
      :cooling-upgrades-list="coolingUpgradesList"
      :thermal-state="thermalState"
      :current-phase="currentPhase"
      :funds-current="fundsCurrent"
      @buy-upgrade="emit('buy-upgrade', $event)"
    />

    <!-- TAB 4: POWER GRID INFRASTRUCTURE -->
    <PowerGridTab
      v-else-if="activeTab === 'power'"
      :current-host="currentHost"
      :power-upgrades-list="powerUpgradesList"
      :power-state="powerState"
      :current-phase="currentPhase"
      :funds-current="fundsCurrent"
      @buy-upgrade="emit('buy-upgrade', $event)"
    />

    <!-- TAB 5: GPU ACCELERATORS -->
    <GpuAcceleratorsTab
      v-else
      :current-host="currentHost"
      :hardware-list="hardwareList"
      :hardware-record="hardwareRecord"
      :funds-current="fundsCurrent"
      :get-hardware-cost="getHardwareCost"
      @buy-hardware="emit('buy-hardware', $event)"
    />
  </div>
</template>
