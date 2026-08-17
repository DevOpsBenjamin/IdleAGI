import Decimal from 'break_infinity.js'
import type {
  GameState,
  SerializedGameState,
  Resource,
  HardwareNode,
} from '@/types/game'

export const SAVE_KEY = 'idleagi_singularity_save'
export const CURRENT_SAVE_VERSION = '0.1.0'

export function serializeResource(res: Resource) {
  return {
    current: res.current.toString(),
    max: res.max.toString(),
    ratePerSec: res.ratePerSec.toString(),
  }
}

export function deserializeResource(
  raw: any,
  defaultCurrent = 0,
  defaultMax = 1000
): Resource {
  return {
    current: new Decimal(raw?.current ?? defaultCurrent),
    max: new Decimal(raw?.max ?? defaultMax),
    ratePerSec: new Decimal(raw?.ratePerSec ?? 0),
  }
}

export function serializeHardwareNode(node: HardwareNode) {
  return {
    id: node.id,
    name: node.name,
    count: node.count,
    baseCost: node.baseCost.toString(),
    costMult: node.costMult,
    tflops: node.tflops.toString(),
    vram: node.vram.toString(),
    powerWatts: node.powerWatts.toString(),
    description: node.description,
    tier: node.tier ?? 1,
  }
}

export function deserializeHardwareNode(raw: any, fallback: HardwareNode): HardwareNode {
  if (!raw) return fallback
  return {
    id: raw.id ?? fallback.id,
    name: raw.name ?? fallback.name,
    count: typeof raw.count === 'number' ? raw.count : fallback.count,
    baseCost: new Decimal(raw.baseCost ?? fallback.baseCost),
    costMult: typeof raw.costMult === 'number' ? raw.costMult : fallback.costMult,
    tflops: new Decimal(raw.tflops ?? fallback.tflops),
    vram: new Decimal(raw.vram ?? fallback.vram),
    powerWatts: new Decimal(raw.powerWatts ?? fallback.powerWatts),
    description: raw.description ?? fallback.description,
    tier: raw.tier ?? fallback.tier ?? 1,
  }
}

export function serializeGameState(state: GameState): string {
  const serialized: SerializedGameState = {
    version: CURRENT_SAVE_VERSION,
    lastTickTimestamp: state.lastTickTimestamp,
    gameStartTime: state.gameStartTime,
    rawText: serializeResource(state.rawText),
    tokens: serializeResource(state.tokens),
    funds: serializeResource(state.funds),
    parameters: state.parameters.toString(),
    researchPoints: serializeResource(state.researchPoints),
    hardware: Object.fromEntries(
      Object.entries(state.hardware).map(([key, node]) => [
        key,
        serializeHardwareNode(node),
      ])
    ),
    allocations: { ...state.allocations },
    gridCapacityWatts: state.gridCapacityWatts.toString(),
    coolingCapacityWatts: state.coolingCapacityWatts.toString(),
    terminalLogs: (state.terminalLogs || []).slice(-100), // Max 100 logs persistes
    unlockedFeatures: { ...state.unlockedFeatures },
  }

  return JSON.stringify(serialized)
}

export function deserializeGameState(
  json: string,
  initialState: GameState
): Partial<GameState> | null {
  try {
    const raw: Partial<SerializedGameState> = JSON.parse(json)
    if (!raw || typeof raw !== 'object') return null

    const deserializedHardware: Record<string, HardwareNode> = {}
    for (const [key, fallbackNode] of Object.entries(initialState.hardware)) {
      const rawNode = raw.hardware ? raw.hardware[key] : null
      deserializedHardware[key] = deserializeHardwareNode(rawNode, fallbackNode)
    }

    return {
      version: raw.version ?? CURRENT_SAVE_VERSION,
      lastTickTimestamp: raw.lastTickTimestamp ?? Date.now(),
      gameStartTime: raw.gameStartTime ?? Date.now(),
      rawText: deserializeResource(raw.rawText, 0, 1000),
      tokens: deserializeResource(raw.tokens, 0, 500),
      funds: deserializeResource(raw.funds, 50, Infinity),
      parameters: new Decimal(raw.parameters ?? 0),
      researchPoints: deserializeResource(raw.researchPoints, 0, 10000),
      hardware: deserializedHardware,
      allocations: {
        inferencePercent: raw.allocations?.inferencePercent ?? 50,
        trainingPercent: raw.allocations?.trainingPercent ?? 30,
        researchPercent: raw.allocations?.researchPercent ?? 20,
      },
      gridCapacityWatts: new Decimal(raw.gridCapacityWatts ?? 500),
      coolingCapacityWatts: new Decimal(raw.coolingCapacityWatts ?? 300),
      terminalLogs: Array.isArray(raw.terminalLogs) ? raw.terminalLogs : [],
      unlockedFeatures: {
        dashboardView: raw.unlockedFeatures?.dashboardView ?? true,
        autoScraping: raw.unlockedFeatures?.autoScraping ?? false,
        syntheticData: raw.unlockedFeatures?.syntheticData ?? false,
        quantumLayer: raw.unlockedFeatures?.quantumLayer ?? false,
        prestigeT1: raw.unlockedFeatures?.prestigeT1 ?? false,
        prestigeT2: raw.unlockedFeatures?.prestigeT2 ?? false,
        prestigeT3: raw.unlockedFeatures?.prestigeT3 ?? false,
      },
    }
  } catch (err) {
    console.error('[Serialization] Failed to parse savegame:', err)
    return null
  }
}
