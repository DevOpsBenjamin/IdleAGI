import type Decimal from 'break_infinity.js'
import type { UnlockedFeatures, MilestoneState, HardwareNode, LogType } from '@/types/game'

export interface HardwareUnlockContext {
  unlockFeature: (feature: keyof UnlockedFeatures) => void
  setPhase: (phase: number) => void
  setMaxRawText: (amount: Decimal | number) => void
  setMaxTokens: (amount: Decimal | number) => void
  setMaxGridCapacity: (watts: Decimal | number) => void
  setMaxCoolingCapacity: (watts: Decimal | number) => void
  milestones: MilestoneState
  addLog: (message: string, type: LogType) => void
}

export class HardwareUnlockEngine {
  public static handlePurchase(id: string, node: HardwareNode, ctx: HardwareUnlockContext): void {
    // Phase 1 trigger: First Potato PC
    if (id === 'potato_pc' && node.count === 1) {
      ctx.unlockFeature('scriptsSection')
      ctx.unlockFeature('hardwareSection')
      ctx.unlockFeature('autoScraping')
      ctx.setMaxRawText(500)
      ctx.setMaxGridCapacity(150)
      ctx.setMaxCoolingCapacity(100)
      ctx.setPhase(1)

      if (!ctx.milestones.firstPotatoPc) {
        ctx.milestones.firstPotatoPc = true
        ctx.addLog(
          'Relique allumée ! Le disque dur IDE 5400 RPM crépite et le ventilateur hurle. Vous pouvez maintenant exécuter vos premiers scripts Python.',
          'event'
        )
      }
    }

    // Phase 2 trigger: First Workstation CPU or GPU
    if ((id === 'core2_quad' || id === 'gtx_750ti' || id === 'used_cpu') && node.count === 1) {
      ctx.unlockFeature('tokenizerUnlocked')
      ctx.unlockFeature('oscilloscope')
      ctx.setMaxRawText(2000)
      ctx.setMaxTokens(1000)
      ctx.setMaxGridCapacity(500)
      ctx.setMaxCoolingCapacity(300)
      ctx.setPhase(2)

      if (!ctx.milestones.firstCpu) {
        ctx.milestones.firstCpu = true
        ctx.addLog(
          'Station Tour en ligne ! Tokenizer BPE activé : conversion automatique du Raw Text en Tokens ($T$) et requêtes d’inférence démarrées.',
          'event'
        )
      }
    }

    if (id === 'gaming_pc' && node.count === 1) {
      ctx.setMaxGridCapacity(650)
    }

    if (id === 'workstation_pro' && node.count === 1) {
      ctx.setMaxGridCapacity(1500)
    }

    if (id === 'datacenter_chassis' && node.count === 1) {
      ctx.setMaxGridCapacity(8000)
    }

    if (
      (id === 'rtx_3060' || id === 'gtx_750ti' || id === 'gtx_1060' || id === 'gtx_gpu') &&
      !ctx.milestones.firstGpu
    ) {
      ctx.milestones.firstGpu = true
      ctx.addLog(
        'GPU dédié déployé avec succès. Accélération massive de la bande passante mémoire et tokenisation !',
        'event'
      )
    }

    if (id === 'a100_sxm4' || id === 'a100_blade') {
      ctx.addLog(
        'Lame Datacenter NVIDIA A100 en ligne ! Mémoire HBM2e 2 To/s connectée.',
        'success'
      )
    }
  }
}
