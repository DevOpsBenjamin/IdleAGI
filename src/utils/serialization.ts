import Decimal from 'break_infinity.js'
import type {
  GameState,
  SerializedGameState,
  Resource,
  SerializedResource,
  HardwareNode,
  SerializedHardwareNode,
  SoftwareUpgrade,
  SerializedSoftwareUpgrade,
  PrestigeState,
  SerializedPrestigeState,
  TalentNode,
  CognitiveState,
  SerializedCognitiveState,
} from '@/types'
import { TALENT_TREE_NODES } from '@/domain/constants/talents'

export const SAVE_KEY = 'idleagi_singularity_save'
export const CURRENT_SAVE_VERSION = '0.1.0'

export function serializeResource(res: Resource): SerializedResource {
  return {
    current: res.current.toString(),
    max: res.max.toString(),
    ratePerSec: res.ratePerSec.toString(),
  }
}

export function deserializeResource(
  raw: Partial<SerializedResource> | undefined,
  defaultCurrent = 0,
  defaultMax = 1000
): Resource {
  return {
    current: new Decimal(raw?.current ?? defaultCurrent),
    max: new Decimal(raw?.max ?? defaultMax),
    ratePerSec: new Decimal(raw?.ratePerSec ?? 0),
  }
}

export function serializeHardwareNode(node: HardwareNode): SerializedHardwareNode {
  return {
    id: node.id,
    name: node.name,
    category: node.category,
    count: node.count,
    baseCost: node.baseCost.toString(),
    costMult: node.costMult,
    tflops: node.tflops.toString(),
    vram: node.vram.toString(),
    memoryBandwidthGBs: node.memoryBandwidthGBs.toString(),
    memoryType: node.memoryType,
    powerWatts: node.powerWatts.toString(),
    pcieSlotsProvided: node.pcieSlotsProvided,
    pcieSlotsRequired: node.pcieSlotsRequired,
    minHostTier: node.minHostTier,
    maxCount: node.maxCount,
    requiredUpgrades: node.requiredUpgrades,
    description: node.description,
    tier: node.tier ?? 1,
  }
}

export function deserializeHardwareNode(
  raw: Partial<SerializedHardwareNode> | undefined,
  fallback: HardwareNode
): HardwareNode {
  if (!raw) return fallback
  return {
    id: raw.id ?? fallback.id,
    name: raw.name ?? fallback.name,
    category: raw.category ?? fallback.category ?? 'host',
    count: typeof raw.count === 'number' ? raw.count : fallback.count,
    baseCost: new Decimal(raw.baseCost ?? fallback.baseCost),
    costMult: typeof raw.costMult === 'number' ? raw.costMult : fallback.costMult,
    tflops: new Decimal(raw.tflops ?? fallback.tflops),
    vram: new Decimal(raw.vram ?? fallback.vram),
    memoryBandwidthGBs: new Decimal(raw.memoryBandwidthGBs ?? fallback.memoryBandwidthGBs),
    memoryType: raw.memoryType ?? fallback.memoryType,
    powerWatts: new Decimal(raw.powerWatts ?? fallback.powerWatts),
    pcieSlotsProvided: raw.pcieSlotsProvided ?? fallback.pcieSlotsProvided,
    pcieSlotsRequired: raw.pcieSlotsRequired ?? fallback.pcieSlotsRequired,
    minHostTier: typeof raw.minHostTier === 'number' ? raw.minHostTier : fallback.minHostTier,
    maxCount: typeof raw.maxCount === 'number' ? raw.maxCount : fallback.maxCount,
    requiredUpgrades: Array.isArray(raw.requiredUpgrades) ? raw.requiredUpgrades : fallback.requiredUpgrades,
    description: raw.description ?? fallback.description,
    tier: raw.tier ?? fallback.tier ?? 1,
  }
}

export function serializeSoftwareUpgrade(upgrade: SoftwareUpgrade): SerializedSoftwareUpgrade {
  return {
    id: upgrade.id,
    name: upgrade.name,
    description: upgrade.description,
    cost: upgrade.cost.toString(),
    currency: upgrade.currency,
    purchased: Boolean(upgrade.purchased),
    category: upgrade.category,
  }
}

export function deserializeSoftwareUpgrade(
  raw: Partial<SerializedSoftwareUpgrade> | undefined,
  fallback: SoftwareUpgrade
): SoftwareUpgrade {
  if (!raw) return fallback
  return {
    id: raw.id ?? fallback.id,
    name: raw.name ?? fallback.name,
    description: raw.description ?? fallback.description,
    cost: new Decimal(raw.cost ?? fallback.cost),
    currency: raw.currency ?? fallback.currency,
    purchased: Boolean(raw.purchased ?? fallback.purchased),
    category: raw.category ?? fallback.category,
  }
}

export function serializePrestigeState(prestige: PrestigeState): SerializedPrestigeState {
  return {
    totalArchitecturePoints: prestige.totalArchitecturePoints,
    architecturePoints: prestige.architecturePoints,
    prestigeCount: prestige.prestigeCount,
    maxParametersReached: prestige.maxParametersReached.toString(),
    unlockedTalentIds: Object.values(prestige.talents)
      .filter((t) => t.purchased)
      .map((t) => t.id),
  }
}

export function deserializePrestigeState(
  raw: Partial<SerializedPrestigeState> | undefined,
  fallbackTalents: Record<string, TalentNode>
): PrestigeState {
  const talents: Record<string, TalentNode> = JSON.parse(JSON.stringify(fallbackTalents))
  if (raw?.unlockedTalentIds && Array.isArray(raw.unlockedTalentIds)) {
    for (const id of raw.unlockedTalentIds) {
      if (talents[id]) {
        talents[id].purchased = true
      }
    }
  }
  return {
    totalArchitecturePoints: raw?.totalArchitecturePoints ?? 0,
    architecturePoints: raw?.architecturePoints ?? 0,
    prestigeCount: raw?.prestigeCount ?? 0,
    maxParametersReached: new Decimal(raw?.maxParametersReached ?? 0),
    talents,
  }
}

export function serializeCognitiveState(cognitive: CognitiveState): SerializedCognitiveState {
  return {
    entropy: cognitive.entropy.toString(),
    alignment: cognitive.alignment.toString(),
    rlhfBatchCount: cognitive.rlhfBatchCount,
    totalRlhfConducted: cognitive.totalRlhfConducted.toString(),
  }
}

export function deserializeCognitiveState(
  raw: Partial<SerializedCognitiveState> | undefined
): CognitiveState {
  return {
    entropy: new Decimal(raw?.entropy ?? 0.0),
    alignment: new Decimal(raw?.alignment ?? 1.0),
    rlhfBatchCount: typeof raw?.rlhfBatchCount === 'number' ? raw.rlhfBatchCount : 0,
    totalRlhfConducted: new Decimal(raw?.totalRlhfConducted ?? 0),
  }
}

export function serializeGameState(state: GameState): string {
  const serialized: SerializedGameState = {
    version: CURRENT_SAVE_VERSION,
    lastTickTimestamp: state.lastTickTimestamp,
    gameStartTime: state.gameStartTime,
    currentPhase: state.currentPhase,
    totalCharsRead: state.totalCharsRead.toString(),
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
    upgrades: Object.fromEntries(
      Object.entries(state.upgrades || {}).map(([key, up]) => [
        key,
        serializeSoftwareUpgrade(up),
      ])
    ),
    allocations: { ...state.allocations },
    gridCapacityWatts: state.gridCapacityWatts.toString(),
    coolingCapacityWatts: state.coolingCapacityWatts.toString(),
    terminalLogs: (state.terminalLogs || []).slice(-100), // Max 100 logs persisted
    unlockedFeatures: { ...state.unlockedFeatures },
    prestige: state.prestige ? serializePrestigeState(state.prestige) : undefined,
    cognitive: state.cognitive ? serializeCognitiveState(state.cognitive) : undefined,
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
      const rawNode = raw.hardware ? raw.hardware[key] : undefined
      deserializedHardware[key] = deserializeHardwareNode(rawNode, fallbackNode)
    }

    const deserializedUpgrades: Record<string, SoftwareUpgrade> = {}
    for (const [key, fallbackUpgrade] of Object.entries(initialState.upgrades || {})) {
      const rawUpgrade = raw.upgrades ? raw.upgrades[key] : undefined
      deserializedUpgrades[key] = deserializeSoftwareUpgrade(rawUpgrade, fallbackUpgrade)
    }

    return {
      version: raw.version ?? CURRENT_SAVE_VERSION,
      lastTickTimestamp: raw.lastTickTimestamp ?? Date.now(),
      gameStartTime: raw.gameStartTime ?? Date.now(),
      currentPhase: raw.currentPhase ?? 0,
      totalCharsRead: new Decimal(raw.totalCharsRead ?? 0),
      rawText: deserializeResource(raw.rawText, 0, 200),
      tokens: deserializeResource(raw.tokens, 0, 100),
      funds: deserializeResource(raw.funds, 0, Infinity),
      parameters: new Decimal(raw.parameters ?? 0),
      researchPoints: deserializeResource(raw.researchPoints, 0, 10000),
      hardware: deserializedHardware,
      upgrades: deserializedUpgrades,
      allocations: {
        inferencePercent: raw.allocations?.inferencePercent ?? 100,
        trainingPercent: raw.allocations?.trainingPercent ?? 0,
        researchPercent: raw.allocations?.researchPercent ?? 0,
      },
      gridCapacityWatts: new Decimal(raw.gridCapacityWatts ?? 100),
      coolingCapacityWatts: new Decimal(raw.coolingCapacityWatts ?? 50),
      terminalLogs: Array.isArray(raw.terminalLogs) ? raw.terminalLogs : [],
      unlockedFeatures: {
        dashboardView: raw.unlockedFeatures?.dashboardView ?? true,
        humanReading: raw.unlockedFeatures?.humanReading ?? true,
        dataBroker: raw.unlockedFeatures?.dataBroker ?? false,
        hardwareSection: raw.unlockedFeatures?.hardwareSection ?? false,
        scriptsSection: raw.unlockedFeatures?.scriptsSection ?? false,
        autoBroker: raw.unlockedFeatures?.autoBroker ?? false,
        autoScraping: raw.unlockedFeatures?.autoScraping ?? false,
        tokenizerUnlocked: raw.unlockedFeatures?.tokenizerUnlocked ?? false,
        oscilloscope: raw.unlockedFeatures?.oscilloscope ?? false,
        trainingAllocation: raw.unlockedFeatures?.trainingAllocation ?? false,
        researchAllocation: raw.unlockedFeatures?.researchAllocation ?? false,
        syntheticData: raw.unlockedFeatures?.syntheticData ?? false,
        quantumLayer: raw.unlockedFeatures?.quantumLayer ?? false,
        prestigeT1: raw.unlockedFeatures?.prestigeT1 ?? false,
        prestigeT2: raw.unlockedFeatures?.prestigeT2 ?? false,
        prestigeT3: raw.unlockedFeatures?.prestigeT3 ?? false,
      },
      prestige: raw.prestige
        ? deserializePrestigeState(
            raw.prestige,
            initialState.prestige?.talents || TALENT_TREE_NODES
          )
        : undefined,
      cognitive: raw.cognitive
        ? deserializeCognitiveState(raw.cognitive)
        : undefined,
    }
  } catch (err) {
    console.error('[Serialization] Failed to parse savegame:', err)
    return null
  }
}
