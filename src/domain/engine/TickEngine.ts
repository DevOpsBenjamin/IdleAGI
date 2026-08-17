import Decimal from 'break_infinity.js'
import type { Resource } from '@/types/resources'
import type { SoftwareUpgrade } from '@/types/upgrades'
import type { AllocationState, MilestoneState, UnlockedFeatures } from '@/types/systems'
import type { LogType } from '@/types/logs'
import { EconomyEngine } from './EconomyEngine'
import { MilestoneTracker } from './MilestoneTracker'

export interface TickContext {
  rawText: Resource
  tokens: Resource
  funds: Resource
  parameters: Decimal
  researchPoints: Resource
  upgrades: Record<string, SoftwareUpgrade>
  allocations: AllocationState
  unlockedFeatures: UnlockedFeatures
  milestones: MilestoneState
  effectiveCompute: Decimal
  modelQualityMultiplier: number
  bandwidthSpeedMultiplier?: number
  isThrottling?: boolean
  isOverloaded?: boolean
  totalTokensServed: Decimal
  autoBrokerAccumulator: number
  onSellRawTextQuiet: (amount: number) => void
  onAddLog: (message: string, type?: LogType) => void
}

export interface TickResult {
  tokensCreated: Decimal
  tokensServed: Decimal
  tokensTrained: Decimal
  researchGained: Decimal
  fundsGained: Decimal
  paramsGained: Decimal
  newAutoBrokerAccumulator: number
  updatedTotalTokensServed: Decimal
  updatedParameters: Decimal
}

export class TickEngine {
  /**
   * Run a simulation step of delta time `dt` in seconds.
   */
  public static processTick(context: TickContext, dt: number): TickResult {
    const {
      rawText,
      tokens,
      funds,
      researchPoints,
      upgrades,
      allocations,
      unlockedFeatures,
      milestones,
      effectiveCompute,
      modelQualityMultiplier,
      onSellRawTextQuiet,
      onAddLog,
    } = context

    let autoBrokerAcc = context.autoBrokerAccumulator
    let totalTokensServed = context.totalTokensServed
    let parameters = context.parameters

    // 1. Automatic scraping
    const baseAutoScrapePerSec = EconomyEngine.calculateAutoScrapeRate(upgrades)
    if (baseAutoScrapePerSec > 0) {
      const charsGained = new Decimal(baseAutoScrapePerSec * dt)
      rawText.current = Decimal.min(rawText.max, rawText.current.add(charsGained))
      rawText.ratePerSec = new Decimal(baseAutoScrapePerSec)
    } else {
      rawText.ratePerSec = new Decimal(0)
    }

    // 1.5. Cron Auto-Broker (Passive data selling)
    if (upgrades.script_cron_autobroker?.purchased) {
      autoBrokerAcc += dt
      if (autoBrokerAcc >= 0.5) {
        autoBrokerAcc = 0
        if (rawText.current.gte(40)) {
          onSellRawTextQuiet(40)
        }
      }
    }

    // 2. Automatic tokenization via compute
    const isTokenizerActive = unlockedFeatures.tokenizerUnlocked && effectiveCompute.gt(0)
    const bwMultiplier = context.bandwidthSpeedMultiplier ?? 1.0
    let tokensToCreate = new Decimal(0)

    if (isTokenizerActive) {
      const tokenizingCap = EconomyEngine.calculateTokenizingCapacity(
        effectiveCompute,
        upgrades,
        dt
      ).mul(bwMultiplier)
      const charsAvailable = rawText.current
      const tokensPossibleFromText = charsAvailable.div(4)
      tokensToCreate = Decimal.min(tokenizingCap, tokensPossibleFromText)

      if (tokensToCreate.gt(0)) {
        const spaceInTokens = tokens.max.sub(tokens.current)
        const actualCreated = Decimal.min(tokensToCreate, spaceInTokens)
        if (actualCreated.gt(0)) {
          rawText.current = rawText.current.sub(actualCreated.mul(4))
          tokens.current = tokens.current.add(actualCreated)
        }
      }
    }

    // 3. Compute Tri-Allocation
    const infRatio = allocations.inferencePercent / 100
    const trainRatio = allocations.trainingPercent / 100
    const resRatio = allocations.researchPercent / 100

    let tokensServed = new Decimal(0)
    let tokensTrained = new Decimal(0)
    let fundsGained = new Decimal(0)
    let paramsGained = new Decimal(0)
    let researchGained = new Decimal(0)

    if (isTokenizerActive) {
      // A. Inference: Consumes Tokens to earn Funds ($)
      const infCompute = effectiveCompute.mul(infRatio)
      const maxTokensToServe = infCompute.mul(20 * bwMultiplier).mul(dt)
      tokensServed = Decimal.min(maxTokensToServe, tokens.current)

      const actualPricePerToken = EconomyEngine.calculateActualTokenPrice(
        upgrades,
        modelQualityMultiplier
      )

      if (tokensServed.gt(0)) {
        tokens.current = tokens.current.sub(tokensServed)
        totalTokensServed = totalTokensServed.add(tokensServed)
        fundsGained = tokensServed.mul(actualPricePerToken)
        funds.current = funds.current.add(fundsGained)
        funds.ratePerSec = dt > 0 ? fundsGained.div(dt) : new Decimal(0)

        // Check training unlock milestone
        const trainingEvents = MilestoneTracker.checkTrainingUnlock(
          totalTokensServed,
          unlockedFeatures,
          milestones
        )
        for (const evt of trainingEvents) {
          onAddLog(evt.message, evt.type)
        }
      } else {
        funds.ratePerSec = new Decimal(0)
      }

      // B. Neural Training: Consumes Tokens and Compute to increase Parameters
      if (unlockedFeatures.trainingAllocation) {
        const trainCompute = effectiveCompute.mul(trainRatio)
        const maxTokensToTrain = trainCompute.mul(10).mul(dt)
        tokensTrained = Decimal.min(maxTokensToTrain, tokens.current)

        if (tokensTrained.gt(0)) {
          tokens.current = tokens.current.sub(tokensTrained)
          paramsGained = tokensTrained.mul(100)
          parameters = parameters.add(paramsGained)

          // Check research unlock milestone
          const resEvents = MilestoneTracker.checkResearchUnlock(
            parameters,
            unlockedFeatures,
            milestones
          )
          for (const evt of resEvents) {
            onAddLog(evt.message, evt.type)
          }
        }
      }

      // C. Research: Generates Research Points
      if (unlockedFeatures.researchAllocation) {
        const resCompute = effectiveCompute.mul(resRatio)
        researchGained = resCompute.mul(2).mul(dt)
        if (researchGained.gt(0)) {
          researchPoints.current = Decimal.min(
            researchPoints.max,
            researchPoints.current.add(researchGained)
          )
          researchPoints.ratePerSec = dt > 0 ? researchGained.div(dt) : new Decimal(0)
        }
      }
    }

    // Net token rate calculation
    const netTokensPerSec = tokensToCreate
      .sub(tokensServed)
      .sub(tokensTrained)
      .div(dt > 0 ? dt : 1)
    tokens.ratePerSec = netTokensPerSec

    // Global Milestones
    const globalEvents = MilestoneTracker.checkGlobalMilestones(
      parameters,
      funds.current,
      milestones
    )
    for (const evt of globalEvents) {
      onAddLog(evt.message, evt.type)
    }

    // Thermal Throttling Milestones
    if (context.isThrottling) {
      const thermalEvents = MilestoneTracker.checkThermalMilestones(
        true,
        milestones
      )
      for (const evt of thermalEvents) {
        onAddLog(evt.message, evt.type)
      }
    }

    // Power Grid Overload Milestones
    if (context.isOverloaded) {
      const powerEvents = MilestoneTracker.checkPowerMilestones(
        true,
        milestones
      )
      for (const evt of powerEvents) {
        onAddLog(evt.message, evt.type)
      }
    }

    return {
      tokensCreated: tokensToCreate,
      tokensServed,
      tokensTrained,
      researchGained,
      fundsGained,
      paramsGained,
      newAutoBrokerAccumulator: autoBrokerAcc,
      updatedTotalTokensServed: totalTokensServed,
      updatedParameters: parameters,
    }
  }
}
