<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Activity } from 'lucide-vue-next'
import { formatNumber } from '@/utils/format'

const props = defineProps<{
  tokenRate: number
  rawTextRate: number
  effectiveCompute: number
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const containerRef = ref<HTMLDivElement | null>(null)

const maxHistoryPoints = 80
const tokenHistory: number[] = new Array(maxHistoryPoints).fill(0)
const rawTextHistory: number[] = new Array(maxHistoryPoints).fill(0)

let animationFrameId: number | null = null
let resizeObserver: ResizeObserver | null = null
let width = 300
let height = 120

function updateHistory() {
  tokenHistory.push(props.tokenRate)
  if (tokenHistory.length > maxHistoryPoints) tokenHistory.shift()

  rawTextHistory.push(props.rawTextRate)
  if (rawTextHistory.length > maxHistoryPoints) rawTextHistory.shift()
}

// Sample on an interval to keep the graph moving smoothly
let sampleInterval: ReturnType<typeof setInterval> | null = null

function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = 'rgba(33, 38, 45, 0.6)'
  ctx.lineWidth = 1

  // Horizontal grid lines
  const gridYSteps = 4
  for (let i = 0; i <= gridYSteps; i++) {
    const y = (h / gridYSteps) * i
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }

  // Vertical grid lines
  const gridXSteps = 8
  for (let i = 0; i <= gridXSteps; i++) {
    const x = (w / gridXSteps) * i
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }

  // Center reference line
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'
  ctx.setLineDash([2, 4])
  ctx.beginPath()
  ctx.moveTo(0, h / 2)
  ctx.lineTo(w, h / 2)
  ctx.stroke()
  ctx.setLineDash([])
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  history: number[],
  color: string,
  glowColor: string,
  w: number,
  h: number,
  maxVal: number
) {
  if (history.length < 2) return

  ctx.save()
  ctx.strokeStyle = color
  ctx.shadowColor = glowColor
  ctx.shadowBlur = 6
  ctx.lineWidth = 1.75
  ctx.lineJoin = 'round'

  const stepX = w / (maxHistoryPoints - 1)
  const safeMax = Math.max(maxVal, 10)

  ctx.beginPath()
  history.forEach((val, idx) => {
    const x = idx * stepX
    // Map value to canvas height (0 at bottom, peak at top with padding)
    const normalized = Math.min(1, Math.max(0, val / safeMax))
    const y = h - 6 - normalized * (h - 12)
    if (idx === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw fill gradient under waveform
  ctx.lineTo((history.length - 1) * stepX, h)
  ctx.lineTo(0, h)
  ctx.closePath()
  const gradient = ctx.createLinearGradient(0, 0, 0, h)
  gradient.addColorStop(0, glowColor.replace('rgb', 'rgba').replace(')', ', 0.15)'))
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  ctx.fillStyle = gradient
  ctx.fill()

  ctx.restore()
}

function render() {
  if (!canvasRef.value) return
  const ctx = canvasRef.value.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, width, height)

  // Background
  ctx.fillStyle = '#05070A'
  ctx.fillRect(0, 0, width, height)

  // Grid
  drawGrid(ctx, width, height)

  // Calculate dynamic scale peak
  const maxTokenVal = Math.max(...tokenHistory, 10)
  const maxRawVal = Math.max(...rawTextHistory, 20)

  // Waveform 2: Raw Text (Cyan trace)
  drawWaveform(
    ctx,
    rawTextHistory,
    '#38BDF8',
    'rgb(56, 189, 248)',
    width,
    height,
    maxRawVal
  )

  // Waveform 1: Tokens Rate (Green Phosphor trace)
  drawWaveform(
    ctx,
    tokenHistory,
    '#00FF66',
    'rgb(0, 255, 102)',
    width,
    height,
    maxTokenVal
  )

  animationFrameId = requestAnimationFrame(render)
}

function handleResize() {
  if (!containerRef.value || !canvasRef.value) return
  const rect = containerRef.value.getBoundingClientRect()
  width = Math.floor(rect.width)
  height = Math.max(100, Math.floor(rect.height || 120))

  const dpr = window.devicePixelRatio || 1
  canvasRef.value.width = width * dpr
  canvasRef.value.height = height * dpr
  canvasRef.value.style.width = `${width}px`
  canvasRef.value.style.height = `${height}px`

  const ctx = canvasRef.value.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
}

onMounted(() => {
  handleResize()
  if (containerRef.value) {
    resizeObserver = new ResizeObserver(() => handleResize())
    resizeObserver.observe(containerRef.value)
  }

  sampleInterval = setInterval(() => {
    updateHistory()
  }, 100)

  render()
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
  if (sampleInterval) clearInterval(sampleInterval)
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<template>
  <div class="bg-[#0D1117] border border-[#21262D] rounded-lg p-4 flex flex-col gap-3 relative overflow-hidden">
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-[#21262D] pb-2.5">
      <div class="flex items-center gap-2">
        <Activity class="w-4 h-4 text-[#00FF66] animate-pulse" />
        <h3 class="text-xs font-bold uppercase tracking-wider text-[#F0F6FC]">
          Flux Scope // Real-Time Telemetry
        </h3>
      </div>
      <div class="flex items-center gap-3 text-[10px] font-mono">
        <span class="flex items-center gap-1 text-[#00FF66]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00FF66]"></span>
          CH1: Tokens ({{ formatNumber(tokenRate) }}/s)
        </span>
        <span class="flex items-center gap-1 text-[#38BDF8]">
          <span class="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
          CH2: Raw ({{ formatNumber(rawTextRate) }}/s)
        </span>
      </div>
    </div>

    <!-- Canvas viewport with CRT overlay -->
    <div ref="containerRef" class="w-full h-28 relative rounded overflow-hidden border border-[#21262D]">
      <canvas ref="canvasRef" class="w-full h-full block"></canvas>
      <div class="absolute inset-0 scanlines opacity-20 pointer-events-none"></div>
      
      <!-- Telemetry Watermark -->
      <div class="absolute top-1.5 left-2 text-[9px] font-mono text-[#8B949E]/70 pointer-events-none">
        SAMPLING: 10Hz • AUTO-SCALE
      </div>
    </div>
  </div>
</template>
