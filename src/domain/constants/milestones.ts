import type { MilestoneState, UnlockedFeatures } from '@/types/systems'

export const INITIAL_MILESTONES: Readonly<MilestoneState> = {
  readingSkill1: false,
  readingSkill2: false,
  dataBrokerUnlocked: false,
  potatoPcUnlocked: false,
  firstPotatoPc: false,
  firstCpu: false,
  firstGpu: false,
  trainingUnlocked: false,
  researchUnlocked: false,
  first1000Params: false,
  first10000Params: false,
  first1000Funds: false,
} as const

export const INITIAL_UNLOCKED_FEATURES: Readonly<UnlockedFeatures> = {
  dashboardView: true,
  humanReading: true,
  dataBroker: false,
  hardwareSection: false,
  scriptsSection: false,
  autoBroker: false,
  autoScraping: false,
  tokenizerUnlocked: false,
  oscilloscope: false,
  trainingAllocation: false,
  researchAllocation: false,
  syntheticData: false,
  quantumLayer: false,
  prestigeT1: false,
  prestigeT2: false,
  prestigeT3: false,
} as const

export function createInitialMilestones(): MilestoneState {
  return { ...INITIAL_MILESTONES }
}

export function createInitialUnlockedFeatures(): UnlockedFeatures {
  return { ...INITIAL_UNLOCKED_FEATURES }
}
