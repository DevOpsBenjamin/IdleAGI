<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Sparkles,
  Cpu,
  RotateCcw,
  X,
  Check,
  Layers,
  Lock,
  AlertTriangle,
} from 'lucide-vue-next'
import { PARADIGMS, PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT } from '@/domain/constants/paradigms'
import type { ParadigmId, ParadigmDefinition } from '@/types/paradigm'
import type Decimal from 'break_infinity.js'


const props = withDefaults(
  defineProps<{
    insights?: number
    totalInsights?: number
    activeParadigmId?: ParadigmId
    unlockedParadigmIds?: ParadigmId[]
    parameters?: Decimal
    canTriggerTier2?: boolean
    pendingInsights?: number
  }>(),
  {
    insights: 0,
    totalInsights: 0,
    activeParadigmId: 'dense_transformer',
    unlockedParadigmIds: () => ['dense_transformer'],
    canTriggerTier2: false,
    pendingInsights: 0,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'select-paradigm', paradigmId: ParadigmId): void
  (e: 'unlock-paradigm', paradigmId: ParadigmId): void
  (e: 'trigger-tier2-prestige'): void
}>()

const paradigmList = computed<ParadigmDefinition[]>(() => Object.values(PARADIGMS))
const showResetConfirmation = ref(false)

const passiveTflopsBonusPercent = computed(() => {
  return Math.round((props.totalInsights ?? 0) * PARADIGM_PASSIVE_TFLOPS_BONUS_PER_INSIGHT * 100)
})

function isUnlocked(id: ParadigmId): boolean {
  return props.unlockedParadigmIds?.includes(id) ?? id === 'dense_transformer'
}

function isActive(id: ParadigmId): boolean {
  return (props.activeParadigmId ?? 'dense_transformer') === id
}

function canUnlock(paradigm: ParadigmDefinition): boolean {
  if (isUnlocked(paradigm.id)) return false
  return (props.insights ?? 0) >= paradigm.cost
}

function handleParadigmAction(paradigm: ParadigmDefinition) {
  if (isActive(paradigm.id)) return

  if (isUnlocked(paradigm.id)) {
    emit('select-paradigm', paradigm.id)
  } else if (canUnlock(paradigm)) {
    emit('unlock-paradigm', paradigm.id)
  }
}

function confirmPrestige() {
  showResetConfirmation.value = false
  emit('trigger-tier2-prestige')
}
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 z-50 overflow-y-auto animate-fade-in font-mono">
    <div class="bg-[#0D1117] border border-[#A855F7]/50 rounded-xl max-w-4xl w-full p-4 sm:p-6 flex flex-col gap-5 shadow-[0_0_40px_rgba(168,85,247,0.2)] max-h-[92vh] overflow-y-auto">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-[#21262D] pb-4">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-lg bg-[#A855F7]/15 border border-[#A855F7]/40 text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Layers class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base sm:text-lg font-bold text-[#F0F6FC] tracking-wider uppercase">
                Paradigmes Architecturaux // Tier 2
              </h2>
              <span class="text-xs px-2 py-0.5 rounded bg-[#A855F7]/20 border border-[#A855F7]/40 text-[#A855F7] font-bold">
                Prestige Hard Reset
              </span>
            </div>
            <p class="text-xs text-[#8B949E]">
              Refonte fondamentale des réseaux neuronaux & Découvertes Fondamentales ($\Phi$)
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-2 rounded-lg text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] border border-transparent hover:border-[#21262D] transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
          @click="emit('close')"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- Insights Summary HUD -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="bg-[#161B22]/80 border border-[#A855F7]/30 p-3 rounded-lg flex flex-col gap-1">
          <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
            <Sparkles class="w-3.5 h-3.5 text-[#A855F7]" />
            <span>Insights Disponibles</span>
          </span>
          <div class="text-xl font-bold text-[#A855F7]">
            {{ insights }} <span class="text-xs text-[#8B949E] font-normal">$\Phi$</span>
          </div>
        </div>

        <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
          <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
            <Layers class="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Total Insights Découverts</span>
          </span>
          <div class="text-xl font-bold text-[#38BDF8]">
            {{ totalInsights }} <span class="text-xs text-[#8B949E] font-normal">$\Phi$ cumulés</span>
          </div>
        </div>

        <div class="bg-[#161B22]/80 border border-[#21262D] p-3 rounded-lg flex flex-col gap-1">
          <span class="text-[11px] text-[#8B949E] flex items-center gap-1.5">
            <Cpu class="w-3.5 h-3.5 text-[#00FF66]" />
            <span>Bonus Passif Universel</span>
          </span>
          <div class="text-xl font-bold text-[#00FF66]">
            +{{ passiveTflopsBonusPercent }}% <span class="text-xs text-[#8B949E] font-normal">TFLOPS brut</span>
          </div>
        </div>
      </div>

      <!-- Paradigms Catalog Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="p in paradigmList"
          :key="p.id"
          class="bg-[#161B22]/90 border rounded-xl p-4 flex flex-col justify-between gap-3 transition-all duration-200"
          :class="
            isActive(p.id)
              ? 'border-[#00FF66] shadow-[0_0_20px_rgba(0,255,102,0.15)] bg-[#00FF66]/5'
              : isUnlocked(p.id)
                ? 'border-[#A855F7]/40 hover:border-[#A855F7]'
                : canUnlock(p)
                  ? 'border-[#FFB800]/50 hover:border-[#FFB800] bg-[#FFB800]/5'
                  : 'border-[#21262D] opacity-60'
          "
        >
          <!-- Paradigm Top Info -->
          <div class="flex flex-col gap-2">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h3 class="text-sm font-bold text-[#F0F6FC]">{{ p.name }}</h3>
                <p class="text-[10px] text-[#A855F7]">{{ p.subtitle }}</p>
              </div>

              <!-- Status Badge -->
              <span
                v-if="isActive(p.id)"
                class="text-[10px] px-2 py-0.5 rounded border bg-[#00FF66]/20 border-[#00FF66]/50 text-[#00FF66] font-bold"
              >
                ACTIVE
              </span>
              <span
                v-else-if="isUnlocked(p.id)"
                class="text-[10px] px-2 py-0.5 rounded border bg-[#38BDF8]/20 border-[#38BDF8]/40 text-[#38BDF8] font-bold"
              >
                DÉBLOQUÉE
              </span>
              <span
                v-else
                class="text-[10px] px-2 py-0.5 rounded border bg-[#161B22] border-[#21262D] text-[#8B949E] font-bold"
              >
                {{ p.cost }} $\Phi$
              </span>
            </div>

            <p class="text-xs text-[#8B949E] leading-relaxed">{{ p.description }}</p>

            <!-- Multipliers Pill Matrix -->
            <div class="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
              <div class="p-1.5 rounded bg-[#0D1117] border border-[#21262D] flex items-center justify-between">
                <span class="text-[#8B949E]">Calcul brut :</span>
                <span class="font-bold text-[#38BDF8]">x{{ p.tflopsMultiplier.toFixed(1) }}</span>
              </div>
              <div class="p-1.5 rounded bg-[#0D1117] border border-[#21262D] flex items-center justify-between">
                <span class="text-[#8B949E]">Conso Watts :</span>
                <span class="font-bold" :class="p.powerReduction > 0 ? 'text-[#00FF66]' : 'text-[#8B949E]'">
                  {{ p.powerReduction > 0 ? `-${Math.round(p.powerReduction * 100)}%` : 'Standard' }}
                </span>
              </div>
              <div class="p-1.5 rounded bg-[#0D1117] border border-[#21262D] flex items-center justify-between">
                <span class="text-[#8B949E]">Efficacité VRAM :</span>
                <span class="font-bold text-[#FFB800]">x{{ p.vramEfficiency.toFixed(1) }}</span>
              </div>
              <div class="p-1.5 rounded bg-[#0D1117] border border-[#21262D] flex items-center justify-between">
                <span class="text-[#8B949E]">Auto-Synthèse :</span>
                <span class="font-bold text-[#A855F7]">x{{ p.syntheticSpeedBonus.toFixed(1) }}</span>
              </div>
            </div>

            <blockquote class="text-[10px] italic text-[#8B949E]/80 border-l-2 border-[#A855F7]/30 pl-2 pt-0.5">
              {{ p.quote }}
            </blockquote>
          </div>

          <!-- Action Button -->
          <button
            type="button"
            class="w-full py-2.5 px-4 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer active:scale-95"
            :disabled="isActive(p.id) || (!isUnlocked(p.id) && !canUnlock(p))"
            :class="
              isActive(p.id)
                ? 'bg-[#00FF66]/10 border border-[#00FF66]/40 text-[#00FF66] cursor-default'
                : isUnlocked(p.id)
                  ? 'bg-[#38BDF8]/20 border border-[#38BDF8] text-[#38BDF8] hover:bg-[#38BDF8]/30 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                  : canUnlock(p)
                    ? 'bg-[#FFB800]/20 border border-[#FFB800] text-[#FFB800] hover:bg-[#FFB800]/30 shadow-[0_0_12px_rgba(255,184,0,0.3)]'
                    : 'bg-[#161B22] border border-[#21262D] text-[#8B949E] cursor-not-allowed opacity-50'
            "
            @click="handleParadigmAction(p)"
          >
            <span v-if="isActive(p.id)" class="flex items-center gap-1.5">
              <Check class="w-4 h-4" /> Architecture Active
            </span>
            <span v-else-if="isUnlocked(p.id)" class="flex items-center gap-1.5">
              <Layers class="w-4 h-4" /> Activer cette Architecture
            </span>
            <span v-else-if="canUnlock(p)" class="flex items-center gap-1.5">
              <Sparkles class="w-4 h-4" /> Débloquer pour {{ p.cost }} $\Phi$
            </span>
            <span v-else class="flex items-center gap-1.5">
              <Lock class="w-4 h-4" /> Verrouillé (Requis {{ p.cost }} $\Phi$)
            </span>
          </button>
        </div>
      </div>

      <!-- Tier 2 Prestige Trigger Section -->
      <div class="border-t border-[#21262D] pt-4 flex flex-col gap-3">
        <div class="bg-[#161B22]/90 border border-[#A855F7]/40 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 text-sm font-bold text-[#F0F6FC]">
              <Sparkles class="w-4 h-4 text-[#A855F7] animate-pulse" />
              <span>Changement de Paradigme (Tier 2 Prestige)</span>
            </div>
            <p class="text-xs text-[#8B949E]">
              Réinitialise le hardware et les devises tout en conservant les Points d'Architecture ($AP$), l'Arbre de Talents et les Insights Fondamentaux ($\Phi$).
            </p>
            <div v-if="pendingInsights > 0" class="text-xs text-[#00FF66] font-bold mt-1">
              Gain potentiel : +{{ pendingInsights }} Insights Fondamentaux ($\Phi$)
            </div>
            <div v-else class="text-xs text-[#8B949E] mt-1">
              Seuil requis : 1.00B de Paramètres (1 milliard)
            </div>
          </div>

          <button
            type="button"
            class="shrink-0 px-5 py-3 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-2 min-h-[48px] cursor-pointer active:scale-95"
            :disabled="!canTriggerTier2 && pendingInsights <= 0"
            :class="
              canTriggerTier2 || pendingInsights > 0
                ? 'bg-gradient-to-r from-[#A855F7] to-[#EC4899] text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:brightness-110'
                : 'bg-[#161B22] border border-[#21262D] text-[#8B949E] cursor-not-allowed opacity-50'
            "
            @click="showResetConfirmation = true"
          >
            <RotateCcw class="w-4 h-4" />
            <span>Initier le Changement Tier 2 (+{{ pendingInsights }} $\Phi$)</span>
          </button>
        </div>
      </div>

      <!-- Prestige Confirmation Dialog Overlay -->
      <div
        v-if="showResetConfirmation"
        class="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-60 animate-fade-in"
      >
        <div class="bg-[#0D1117] border border-[#FF0055]/70 rounded-xl p-5 sm:p-6 max-w-md w-full flex flex-col gap-4 shadow-[0_0_40px_rgba(255,0,85,0.3)]">
          <div class="flex items-center gap-3 text-[#FF0055]">
            <AlertTriangle class="w-6 h-6 shrink-0" />
            <h3 class="text-base font-bold uppercase tracking-wider">Confirmer le Changement de Paradigme</h3>
          </div>

          <p class="text-xs text-[#E2E8F0] leading-relaxed">
            Vous êtes sur le point de déclencher un <strong>Hard Reset Tier 2</strong>.
          </p>

          <div class="bg-[#161B22] border border-[#21262D] p-3 rounded-lg text-xs flex flex-col gap-2 font-mono">
            <div class="text-[#00FF66] font-bold flex items-center gap-1.5">
              <Check class="w-3.5 h-3.5" /> Éléments conservés :
            </div>
            <ul class="text-[11px] text-[#8B949E] list-disc list-inside space-y-0.5">
              <li>Points d'Architecture ($AP$) et Arbre de Talents T1</li>
              <li>Insights Fondamentaux ($\Phi$) et Paradigmes débloqués</li>
              <li>Statistiques de progression globales</li>
            </ul>

            <div class="text-[#FF0055] font-bold flex items-center gap-1.5 pt-1">
              <RotateCcw class="w-3.5 h-3.5" /> Éléments réinitialisés :
            </div>
            <ul class="text-[11px] text-[#8B949E] list-disc list-inside space-y-0.5">
              <li>Raw Text, Tokens, Funds ($) et Paramètres non-figés</li>
              <li>Hardware actif (retour à la station initiale)</li>
              <li>Upgrades logicielles courantes</li>
            </ul>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              class="px-4 py-2 rounded-lg text-xs font-mono text-[#8B949E] hover:text-[#F0F6FC] hover:bg-[#161B22] cursor-pointer min-h-[44px]"
              @click="showResetConfirmation = false"
            >
              Annuler
            </button>
            <button
              type="button"
              class="px-5 py-2.5 rounded-lg text-xs font-bold font-mono bg-[#FF0055] text-white hover:bg-[#FF0055]/90 shadow-[0_0_15px_rgba(255,0,85,0.4)] cursor-pointer min-h-[44px] active:scale-95"
              @click="confirmPrestige"
            >
              Confirmer la Transition
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
