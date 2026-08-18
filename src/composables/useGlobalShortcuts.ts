import { onMounted, onUnmounted } from 'vue'

export interface ShortcutHandlers {
  onManualScrape: () => void
  onSellAllRawText: () => void
}

export function useGlobalShortcuts(handlers: ShortcutHandlers) {
  function handleKeyDown(e: KeyboardEvent) {
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return
    }

    if (e.code === 'Space') {
      e.preventDefault()
      if (e.repeat) return
      handlers.onManualScrape()
    } else if (e.key === 'v' || e.key === 'V') {
      e.preventDefault()
      handlers.onSellAllRawText()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
