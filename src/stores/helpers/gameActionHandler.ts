import Decimal from 'break_infinity.js'
import type { LogType } from '@/types'
import {
  MilestoneTracker,
  HardwareUnlockEngine,
  UpgradeEffectEngine,
  TickEngine,
} from '@/domain/engine'
import type { StoreCollection } from './gameStateHydrator'

export class GameActionHandler {
  public static checkEarlyGameProgress(stores: StoreCollection): void {
    const chars = stores.resources.totalCharsRead.toNumber()
    const events = MilestoneTracker.checkEarlyGameProgress(
      chars,
      stores.features.reachedMilestones,
      stores.features.unlockedFeatures
    )
    for (const evt of events) {
      stores.terminal.addLog(evt.message, evt.type)
    }

    const hwEvents = MilestoneTracker.checkHardwareUnlock(
      stores.resources.funds.current,
      chars,
      stores.features.unlockedFeatures,
      stores.features.reachedMilestones
    )
    for (const evt of hwEvents) {
      stores.terminal.addLog(evt.message, evt.type)
    }
  }

  public static manualScrape(stores: StoreCollection, power: number): void {
    const added = stores.resources.manualScrape(power)
    this.checkEarlyGameProgress(stores)

    if (added.gt(0) && Math.random() < 0.2) {
      stores.terminal.addLog(
        `Lecture & transcription manuelle : +${added.toFixed(0)} caractères transcrits.`,
        'info'
      )
    }
  }

  public static sellRawText(
    stores: StoreCollection,
    charsToSell: number,
    pricePer20: number,
    silent = false
  ): boolean {
    const { success, earned } = stores.resources.sellRawText(charsToSell, pricePer20)
    if (success) {
      if (!silent) {
        stores.terminal.addLog(
          `Données brutes vendues au courtier : +$${earned.toFixed(2)} (${charsToSell} chars).`,
          'info'
        )
      }
      this.checkEarlyGameProgress(stores)
      return true
    }
    return false
  }

  public static sellAllRawText(stores: StoreCollection, pricePer20: number): boolean {
    const { success, earned, charsSold } = stores.resources.sellAllRawText(pricePer20)
    if (success) {
      stores.terminal.addLog(
        `Lot complet de données brutes vendu : +$${earned.toFixed(2)} (${charsSold} chars).`,
        'info'
      )
      return true
    }
    return false
  }

  public static buyHardware(stores: StoreCollection, id: string): boolean {
    const purchasedUpgrades = new Set(
      Object.values(stores.upgradesStore.upgrades)
        .filter((u) => u.purchased)
        .map((u) => u.id)
    )
    const discount = stores.prestigeStore.talentMultipliers.hardwareDiscountMultiplier
    const result = stores.hardwareStore.buyHardware(
      id,
      stores.resources.funds.current,
      purchasedUpgrades,
      discount
    )
    if (result.success && result.node) {
      stores.resources.funds.current = stores.resources.funds.current.sub(result.cost)

      stores.terminal.addLog(
        `Achat matériel effectué : ${result.node.name} pour $${result.cost.toFixed(2)}.`,
        'success'
      )

      HardwareUnlockEngine.handlePurchase(id, result.node, {
        unlockFeature: (feat) => stores.features.unlockFeature(feat),
        setPhase: (p) => stores.features.setPhase(p),
        setMaxRawText: (v) => { stores.resources.setMaxRawText(v) },
        setMaxTokens: (v) => { stores.resources.setMaxTokens(v) },
        setMaxGridCapacity: (w) => { stores.hardwareStore.gridCapacityWatts = Decimal.max(stores.hardwareStore.gridCapacityWatts, w) },
        setMaxCoolingCapacity: (w) => { stores.hardwareStore.coolingCapacityWatts = Decimal.max(stores.hardwareStore.coolingCapacityWatts, w) },
        milestones: stores.features.reachedMilestones,
        addLog: (msg, type) => stores.terminal.addLog(msg, type),
      })
      return true
    }

    if (result.reason === 'missing_ram_upgrade') {
      stores.terminal.addLog('Impossible d’acquérir cette tour : installez tous les kits de RAM requis !', 'warn')
    } else if (result.reason === 'max_count_reached') {
      stores.terminal.addLog('Cette machine est déjà installée et active !', 'warn')
    } else if (result.reason === 'host_tier_too_low') {
      const node = stores.hardwareStore.hardware[id]
      stores.terminal.addLog(`Impossible d’installer ce GPU : nécessite une station hôte Tier ${node?.minHostTier ?? 1}+ !`, 'warn')
    } else if (result.reason === 'no_pcie_slots') {
      stores.terminal.addLog('Impossible d’installer ce GPU : aucun slot PCIe disponible !', 'warn')
    }
    return false
  }

  public static buyUpgrade(stores: StoreCollection, id: string): boolean {
    const result = stores.upgradesStore.buyUpgrade(
      id,
      stores.resources.funds.current,
      stores.resources.researchPoints.current,
      stores.features.unlockedFeatures
    )

    if (result.success && result.upgrade) {
      if (result.currency === 'funds') {
        stores.resources.funds.current = stores.resources.funds.current.sub(result.cost)
        stores.terminal.addLog(`Module activé : ${result.upgrade.name} pour $${result.cost.toFixed(2)}.`, 'success')
      } else {
        stores.resources.researchPoints.current = stores.resources.researchPoints.current.sub(result.cost)
        stores.terminal.addLog(`Recherche complétée : ${result.upgrade.name}.`, 'success')
      }

      UpgradeEffectEngine.apply(id, {
        unlockFeature: (feat) => stores.features.unlockFeature(feat),
        setMaxRawText: (v) => { stores.resources.setMaxRawText(v) },
        setMaxTokens: (v) => { stores.resources.setMaxTokens(v) },
        addCoolingCapacity: (w) => { stores.hardwareStore.coolingCapacityWatts = stores.hardwareStore.coolingCapacityWatts.add(w) },
        addGridCapacity: (w) => { stores.hardwareStore.gridCapacityWatts = stores.hardwareStore.gridCapacityWatts.add(w) },
      })
      return true
    }
    return false
  }

  public static processTick(
    stores: StoreCollection,
    dt: number,
    effectiveCompute: Decimal,
    modelQualityMultiplier: number,
    autoBrokerAccumulator: number
  ): { newAutoBrokerAccumulator: number } {
    const cognitiveState = stores.cognitiveStore.getCognitiveState()
    const tickResult = TickEngine.processTick(
      {
        rawText: stores.resources.rawText,
        tokens: stores.resources.tokens,
        funds: stores.resources.funds,
        parameters: stores.resources.parameters,
        researchPoints: stores.resources.researchPoints,
        upgrades: stores.upgradesStore.upgrades,
        allocations: stores.allocation.allocations,
        unlockedFeatures: stores.features.unlockedFeatures,
        milestones: stores.features.reachedMilestones,
        effectiveCompute,
        modelQualityMultiplier,
        bandwidthSpeedMultiplier: stores.hardwareStore.bandwidthSpeedMultiplier,
        tokenGenerationMultiplier: stores.prestigeStore.talentMultipliers.tokenGenerationMultiplier,
        scrapeMultiplier: stores.prestigeStore.talentMultipliers.scrapePowerMultiplier,
        isThrottling: stores.hardwareStore.thermalState.isThrottling,
        isOverloaded: stores.hardwareStore.powerState.isOverloaded,
        totalTokensServed: stores.resources.totalTokensServed,
        autoBrokerAccumulator,
        cognitive: cognitiveState,
        onSellRawTextQuiet: (amount: number) => this.sellRawText(stores, amount, stores.upgradesStore.rawTextSellPrice * stores.prestigeStore.talentMultipliers.rawTextPriceMultiplier, true),
        onAddLog: (msg: string, type?: LogType) => stores.terminal.addLog(msg, type ?? 'info'),
      },
      dt
    )

    stores.resources.totalTokensServed = tickResult.updatedTotalTokensServed
    stores.resources.parameters = tickResult.updatedParameters

    if (tickResult.cognitiveTickResult) {
      stores.cognitiveStore.updateFromTick(tickResult.cognitiveTickResult)
    }

    if (stores.features.unlockedFeatures.trainingAllocation && stores.features.currentPhase < 3) {
      stores.features.setPhase(3)
    }

    return { newAutoBrokerAccumulator: tickResult.newAutoBrokerAccumulator }
  }
}
