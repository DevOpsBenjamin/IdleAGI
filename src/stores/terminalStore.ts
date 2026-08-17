import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LogEntry, LogType } from '@/types'

export const useTerminalStore = defineStore('terminal', () => {
  const terminalLogs = ref<LogEntry[]>([
    {
      id: 'init-1',
      timestamp: Date.now(),
      message: 'Vous êtes assis devant un flux de données textuelles brutes. Commencez à transcrire le texte manuellement...',
      type: 'info',
    },
  ])

  function addLog(message: string, type: LogType = 'info') {
    terminalLogs.value.push({
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
      message,
      type,
    })
    if (terminalLogs.value.length > 200) {
      terminalLogs.value.shift()
    }
  }

  function clearLogs() {
    terminalLogs.value = []
  }

  function setLogs(logs: LogEntry[]) {
    terminalLogs.value = Array.isArray(logs) ? logs : []
  }

  return {
    terminalLogs,
    addLog,
    clearLogs,
    setLogs,
  }
})
