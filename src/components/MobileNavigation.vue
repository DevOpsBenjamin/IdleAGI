<script setup lang="ts">
import { BookOpen, Server, Sparkles, Terminal as TerminalIcon } from 'lucide-vue-next'

export type MobileTab = 'ingestion' | 'datacenter' | 'upgrades' | 'terminal'

defineProps<{
  activeTab: MobileTab
  affordableUpgradesCount: number
  hasThermalOrPowerWarning: boolean
  unreadErrorsCount: number
  tokenizerUnlocked: boolean
  hasHardware: boolean
}>()

const emit = defineEmits<{
  (e: 'select-tab', tab: MobileTab): void
}>()
</script>

<template>
  <nav
    class="fixed bottom-0 inset-x-0 bg-[#0D1117]/95 backdrop-blur-xl border-t border-[#21262D] z-30 lg:hidden px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] transition-all"
    aria-label="Navigation Mobile"
  >
    <div class="grid grid-cols-4 gap-1 max-w-md mx-auto">
      <!-- Tab 1: Ingestion & Scribe -->
      <button
        id="mobile-tab-ingestion"
        type="button"
        @click="emit('select-tab', 'ingestion')"
        class="flex flex-col items-center justify-center min-h-[48px] py-1 px-1.5 rounded-lg font-mono text-[10px] transition-all cursor-pointer select-none active:scale-95 touch-manipulation relative"
        :class="
          activeTab === 'ingestion'
            ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/40 shadow-[0_0_10px_rgba(56,189,248,0.15)] font-bold'
            : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/60 border border-transparent'
        "
      >
        <BookOpen class="w-4 h-4 mb-0.5" />
        <span class="truncate">Ingestion</span>
      </button>

      <!-- Tab 2: Datacenter & Hardware -->
      <button
        id="mobile-tab-datacenter"
        type="button"
        @click="emit('select-tab', 'datacenter')"
        class="flex flex-col items-center justify-center min-h-[48px] py-1 px-1.5 rounded-lg font-mono text-[10px] transition-all cursor-pointer select-none active:scale-95 touch-manipulation relative"
        :class="
          activeTab === 'datacenter'
            ? 'bg-[#FFB800]/15 text-[#FFB800] border border-[#FFB800]/40 shadow-[0_0_10px_rgba(255,184,0,0.15)] font-bold'
            : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/60 border border-transparent'
        "
      >
        <div class="relative">
          <Server class="w-4 h-4 mb-0.5" />
          <!-- Thermal or Power Warning Alert Dot -->
          <span
            v-if="hasThermalOrPowerWarning"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping"
          ></span>
          <span
            v-if="hasThermalOrPowerWarning"
            class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EF4444] border border-[#0D1117] flex items-center justify-center"
          ></span>
        </div>
        <span class="truncate">Datacenter</span>
      </button>

      <!-- Tab 3: R&D & Software Upgrades -->
      <button
        id="mobile-tab-upgrades"
        type="button"
        @click="emit('select-tab', 'upgrades')"
        class="flex flex-col items-center justify-center min-h-[48px] py-1 px-1.5 rounded-lg font-mono text-[10px] transition-all cursor-pointer select-none active:scale-95 touch-manipulation relative"
        :class="
          activeTab === 'upgrades'
            ? 'bg-[#00FF66]/15 text-[#00FF66] border border-[#00FF66]/40 shadow-[0_0_10px_rgba(0,255,102,0.15)] font-bold'
            : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/60 border border-transparent'
        "
      >
        <div class="relative">
          <Sparkles class="w-4 h-4 mb-0.5" />
          <!-- Affordable Upgrades Count Badge -->
          <span
            v-if="affordableUpgradesCount > 0"
            class="absolute -top-1 -right-2 px-1 py-0.2 rounded-full bg-[#00FF66] text-black font-bold text-[8px] leading-tight shadow-sm"
          >
            {{ affordableUpgradesCount > 9 ? '9+' : affordableUpgradesCount }}
          </span>
        </div>
        <span class="truncate">R&D / Up</span>
      </button>

      <!-- Tab 4: Cyber Terminal STDOUT -->
      <button
        id="mobile-tab-terminal"
        type="button"
        @click="emit('select-tab', 'terminal')"
        class="flex flex-col items-center justify-center min-h-[48px] py-1 px-1.5 rounded-lg font-mono text-[10px] transition-all cursor-pointer select-none active:scale-95 touch-manipulation relative"
        :class="
          activeTab === 'terminal'
            ? 'bg-[#A855F7]/15 text-[#C084FC] border border-[#A855F7]/40 shadow-[0_0_10px_rgba(168,85,247,0.15)] font-bold'
            : 'text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22]/60 border border-transparent'
        "
      >
        <div class="relative">
          <TerminalIcon class="w-4 h-4 mb-0.5" />
          <!-- Warning/Error indicator badge -->
          <span
            v-if="unreadErrorsCount > 0"
            class="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-[#EF4444]"
          ></span>
        </div>
        <span class="truncate">Terminal</span>
      </button>
    </div>
  </nav>
</template>
