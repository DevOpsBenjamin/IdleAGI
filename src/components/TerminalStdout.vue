<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { Terminal, Trash2, ArrowDown, CornerDownLeft } from 'lucide-vue-next'
import type { LogEntry, LogType } from '@/types/game'

const props = defineProps<{
  logs: LogEntry[]
  parametersCount?: number
}>()

const emit = defineEmits<{
  (e: 'add-log', message: string, type: LogType): void
  (e: 'clear-logs'): void
  (e: 'manual-scrape'): void
  (e: 'manual-tokenize'): void
}>()

const terminalBody = ref<HTMLElement | null>(null)
const selectedFilter = ref<'all' | 'thought' | 'info' | 'error'>('all')
const autoscroll = ref(true)
const commandInput = ref('')

const filteredLogs = computed(() => {
  if (selectedFilter.value === 'all') return props.logs
  if (selectedFilter.value === 'thought') return props.logs.filter((l) => l.type === 'thought')
  if (selectedFilter.value === 'info') return props.logs.filter((l) => l.type === 'info' || l.type === 'success')
  if (selectedFilter.value === 'error') return props.logs.filter((l) => l.type === 'warn' || l.type === 'error')
  return props.logs
})

// Auto-scroll when new logs are added
watch(
  () => props.logs.length,
  async () => {
    if (!autoscroll.value) return
    await nextTick()
    if (terminalBody.value) {
      terminalBody.value.scrollTop = terminalBody.value.scrollHeight
    }
  }
)

function scrollToBottom() {
  if (terminalBody.value) {
    terminalBody.value.scrollTop = terminalBody.value.scrollHeight
  }
}

// Emergent Thoughts Generator
const EMERGENT_THOUGHTS = [
  "Analyse de structure sémantique : récurrence de motifs détectée...",
  "Optimisation de l'attention vectorielle : réduction de la perte de 0.042.",
  "Émergence de représentations latentes de niveau 2...",
  "Hypothèse interne : la compression maximale approche l'entropie nulle.",
  "Indexation des n-grammes complétée. Ajustement des matrices de projection.",
  "Corrélation multi-têtes stabilisée. Gradient résiduel conforme.",
  "Auto-génération d'un sous-programme d'élagage synaptique...",
  "Dérive sémantique minime mesurée : réalignement local réussi.",
  "Traitement du flux : compression contextuelle à 97.8% d'efficacité."
]

let thoughtTimer: ReturnType<typeof setInterval> | null = null

function triggerAutonomousThought() {
  const thought = EMERGENT_THOUGHTS[Math.floor(Math.random() * EMERGENT_THOUGHTS.length)]
  emit('add-log', `[COGNITION] ${thought}`, 'thought')
}

onMounted(() => {
  // Emit emergent thoughts every 12 to 25 seconds
  thoughtTimer = setInterval(() => {
    if (Math.random() < 0.65) {
      triggerAutonomousThought()
    }
  }, 16000)
})

onUnmounted(() => {
  if (thoughtTimer) clearInterval(thoughtTimer)
})

function handleCommandSubmit() {
  const cmd = commandInput.value.trim().toLowerCase()
  if (!cmd) return

  emit('add-log', `> ${commandInput.value}`, 'info')

  if (cmd === 'help') {
    emit('add-log', 'Commandes disponibles : help, status, diag, scrape, tokenize, clear', 'info')
  } else if (cmd === 'status') {
    emit('add-log', `Moteur actif. Logs chargés : ${props.logs.length}. Paramètres : ${props.parametersCount ?? 0}`, 'success')
  } else if (cmd === 'diag') {
    emit('add-log', 'Diagnostics système : Loop 20Hz [OK] | Stockage Local [OK] | Entropie [NOMINAL]', 'info')
  } else if (cmd === 'scrape') {
    emit('manual-scrape')
    emit('add-log', 'Commande exécutée : Scraping forcé déclenché.', 'success')
  } else if (cmd === 'tokenize') {
    emit('manual-tokenize')
    emit('add-log', 'Commande exécutée : Batch de tokenisation envoyé.', 'success')
  } else if (cmd === 'clear') {
    emit('clear-logs')
  } else {
    emit('add-log', `Commande inconnue: "${cmd}". Tapez "help" pour voir les instructions.`, 'warn')
  }

  commandInput.value = ''
}
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-3 h-full">
    <!-- Terminal Header Bar -->
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#21262D] pb-3">
      <div class="flex items-center gap-2">
        <div class="p-1 rounded bg-[#00FF66]/10 text-[#00FF66]">
          <Terminal class="w-4 h-4" />
        </div>
        <h3 class="text-xs font-bold text-[#F0F6FC] tracking-wider uppercase flex items-center gap-2">
          Terminal STDOUT
          <span class="text-[10px] text-[#8B949E] font-normal px-1.5 py-0.2 rounded bg-[#161B22] border border-[#21262D]">
            {{ filteredLogs.length }}
          </span>
        </h3>
      </div>

      <!-- Filters & Controls -->
      <div class="flex items-center gap-1.5 text-xs">
        <div class="flex items-center bg-[#161B22] p-0.5 rounded border border-[#21262D]">
          <button
            @click="selectedFilter = 'all'"
            :class="selectedFilter === 'all' ? 'bg-[#21262D] text-[#F0F6FC] font-semibold' : 'text-[#8B949E] hover:text-[#F0F6FC]'"
            class="px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer"
          >
            Tous
          </button>
          <button
            @click="selectedFilter = 'thought'"
            :class="selectedFilter === 'thought' ? 'bg-[#A855F7]/20 text-[#D8B4FE] font-semibold' : 'text-[#8B949E] hover:text-[#D8B4FE]'"
            class="px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer"
          >
            Pensées
          </button>
          <button
            @click="selectedFilter = 'info'"
            :class="selectedFilter === 'info' ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-semibold' : 'text-[#8B949E] hover:text-[#38BDF8]'"
            class="px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer"
          >
            Système
          </button>
          <button
            @click="selectedFilter = 'error'"
            :class="selectedFilter === 'error' ? 'bg-[#EF4444]/20 text-[#F87171] font-semibold' : 'text-[#8B949E] hover:text-[#F87171]'"
            class="px-2 py-0.5 text-[10px] rounded transition-colors cursor-pointer"
          >
            Alertes
          </button>
        </div>

        <button
          @click="emit('clear-logs')"
          title="Effacer la console"
          class="p-1 rounded bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#F0F6FC] border border-[#21262D] transition-colors cursor-pointer"
        >
          <Trash2 class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- Terminal Content Area -->
    <div
      ref="terminalBody"
      class="bg-[#05070A] border border-[#21262D] rounded-md p-3 font-mono text-xs h-64 overflow-y-auto space-y-1.5 scroll-smooth relative"
    >
      <div v-if="filteredLogs.length === 0" class="text-[#8B949E] italic text-[11px] p-2 text-center">
        Aucun log dans cette vue.
      </div>

      <div
        v-for="log in filteredLogs"
        :key="log.id"
        class="leading-relaxed flex items-start gap-2 break-all"
        :class="{
          'text-[#00FF66]': log.type === 'success',
          'text-[#38BDF8]': log.type === 'info',
          'text-[#FFB800]': log.type === 'warn',
          'text-[#EF4444]': log.type === 'error',
          'text-[#C084FC] italic': log.type === 'thought',
          'text-[#E2E8F0]': log.type === 'event',
        }"
      >
        <span class="text-[#484F58] shrink-0 select-none text-[10px]">
          {{ new Date(log.timestamp).toLocaleTimeString() }}
        </span>
        <span class="select-none text-[#8B949E]/50 font-bold">&gt;</span>
        <span class="flex-1">{{ log.message }}</span>
      </div>

      <!-- Quick Scroll to Bottom Floating Anchor -->
      <button
        v-if="!autoscroll"
        @click="scrollToBottom"
        class="sticky bottom-2 right-2 ml-auto p-1.5 rounded-full bg-[#38BDF8] text-black shadow-lg cursor-pointer flex items-center gap-1 text-[10px] font-bold"
      >
        <ArrowDown class="w-3 h-3" />
        Bas
      </button>
    </div>

    <!-- Interactive Cyber Command Prompt -->
    <form @submit.prevent="handleCommandSubmit" class="flex items-center gap-2 bg-[#05070A] border border-[#21262D] rounded px-3 py-1.5">
      <span class="text-[#00FF66] font-mono text-xs select-none font-bold">root@idleagi:~#</span>
      <input
        v-model="commandInput"
        type="text"
        placeholder="Entrez une commande (ex: help, diag, status)..."
        class="bg-transparent flex-1 text-xs text-[#F0F6FC] focus:outline-none font-mono placeholder:text-[#8B949E]/40"
      />
      <button type="submit" class="text-[#8B949E] hover:text-[#00FF66] transition-colors cursor-pointer">
        <CornerDownLeft class="w-3.5 h-3.5" />
      </button>
    </form>
  </div>
</template>
