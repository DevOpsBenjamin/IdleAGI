<script setup lang="ts">
import { computed } from 'vue'
import { Cpu, Zap, MemoryStick, Check, AlertCircle, Plus } from 'lucide-vue-next'
import { formatMoney, formatFlops, formatWatts, formatVram } from '@/utils/format'
import type { HardwareNode, SoftwareUpgrade } from '@/types/game'
import type Decimal from 'break_infinity.js'

const props = defineProps<{
  currentHost: HardwareNode | null
  nextHost: HardwareNode | null
  purchasedUpgradeIds?: string[]
  ramUpgradesList?: SoftwareUpgrade[]
  fundsCurrent: Decimal
  getHardwareCost: (id: string) => Decimal
}>()

const emit = defineEmits<{
  (e: 'buy-hardware', id: string): void
}>()

const purchasedSet = computed(() => new Set(props.purchasedUpgradeIds ?? []))

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
</script>

<template>
  <div class="space-y-3 max-h-[480px] overflow-y-auto pr-1">
    <!-- Current Host Node -->
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
</template>
