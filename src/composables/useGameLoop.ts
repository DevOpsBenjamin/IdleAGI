import { ref, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '@/stores/gameStore'

export const TICK_RATE_HZ = 20
export const TICK_DELTA_SEC = 1 / TICK_RATE_HZ // 0.05s = 50ms
export const MAX_FRAME_DELTA_SEC = 1.0 // Anti spiral of death

export function useGameLoop() {
  const store = useGameStore()
  const isRunning = ref(false)
  const fps = ref(0)
  const currentTps = ref(0)

  let animationFrameId: number | null = null
  let backgroundIntervalId: ReturnType<typeof setInterval> | null = null
  let lastTimestamp = performance.now()
  let accumulator = 0
  let framesCount = 0
  let ticksCount = 0
  let lastFpsUpdate = performance.now()

  function tickEngine(dt: number) {
    store.processTick(dt)
    ticksCount++
  }

  function loop(currentTime: number) {
    if (!isRunning.value) return

    const rawDelta = (currentTime - lastTimestamp) / 1000
    lastTimestamp = currentTime

    // Clamp frame delta to avoid spiral of death on lag spikes
    const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SEC)
    accumulator += delta
    framesCount++

    // Process fixed 50ms ticks
    while (accumulator >= TICK_DELTA_SEC) {
      tickEngine(TICK_DELTA_SEC)
      accumulator -= TICK_DELTA_SEC
    }

    // Update FPS & TPS counters every second
    if (currentTime - lastFpsUpdate >= 1000) {
      fps.value = framesCount
      currentTps.value = ticksCount
      framesCount = 0
      ticksCount = 0
      lastFpsUpdate = currentTime
    }

    animationFrameId = requestAnimationFrame(loop)
  }

  function startBackgroundLoop() {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (backgroundIntervalId === null) {
      lastTimestamp = performance.now()
      backgroundIntervalId = setInterval(() => {
        const now = performance.now()
        const rawDelta = (now - lastTimestamp) / 1000
        lastTimestamp = now
        const delta = Math.min(rawDelta, MAX_FRAME_DELTA_SEC)
        accumulator += delta

        while (accumulator >= TICK_DELTA_SEC) {
          tickEngine(TICK_DELTA_SEC)
          accumulator -= TICK_DELTA_SEC
        }
      }, 50)
    }
  }

  function resumeForegroundLoop() {
    if (backgroundIntervalId !== null) {
      clearInterval(backgroundIntervalId)
      backgroundIntervalId = null
    }

    lastTimestamp = performance.now()
    accumulator = 0
    if (isRunning.value && animationFrameId === null) {
      animationFrameId = requestAnimationFrame(loop)
    }
  }

  function handleVisibilityChange() {
    if (document.hidden) {
      startBackgroundLoop()
    } else {
      resumeForegroundLoop()
    }
  }

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    lastTimestamp = performance.now()
    accumulator = 0
    lastFpsUpdate = performance.now()

    if (document.hidden) {
      startBackgroundLoop()
    } else {
      animationFrameId = requestAnimationFrame(loop)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
  }

  function stop() {
    isRunning.value = false
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
    if (backgroundIntervalId !== null) {
      clearInterval(backgroundIntervalId)
      backgroundIntervalId = null
    }
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }

  onMounted(() => {
    start()
  })

  onUnmounted(() => {
    stop()
  })

  return {
    isRunning,
    fps,
    currentTps,
    start,
    stop,
  }
}
