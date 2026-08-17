import type Decimal from 'break_infinity.js'
import type { LogType } from '@/types/logs'
import type { MilestoneState, UnlockedFeatures } from '@/types/systems'

export interface MilestoneEvent {
  message: string
  type: LogType
}

export class MilestoneTracker {
  /**
   * Check early game character transcription milestones.
   */
  public static checkEarlyGameProgress(
    charsRead: number,
    milestones: MilestoneState,
    unlockedFeatures: UnlockedFeatures
  ): MilestoneEvent[] {
    const events: MilestoneEvent[] = []

    // 1. First reading skill unlock (30 chars)
    if (!milestones.readingSkill1 && charsRead >= 30) {
      milestones.readingSkill1 = true
      events.push({
        message: 'Nouvelle compétence : Vous commencez à lire plus vite ! Une technique de lecture rapide est disponible.',
        type: 'event',
      })
    }

    // 2. Data broker contact (80 chars)
    if (!unlockedFeatures.dataBroker && charsRead >= 80) {
      unlockedFeatures.dataBroker = true
      milestones.dataBrokerUnlocked = true
      events.push({
        message: 'Contact établi ! Un courtier de données d’un labo d’IA vous propose d’acheter votre texte transcrit ($0.05 les 20 chars).',
        type: 'event',
      })
    }

    return events
  }

  /**
   * Check hardware store unlock condition (funds >= $5 or chars >= 150).
   */
  public static checkHardwareUnlock(
    funds: Decimal,
    charsRead: number,
    unlockedFeatures: UnlockedFeatures,
    milestones: MilestoneState
  ): MilestoneEvent[] {
    const events: MilestoneEvent[] = []
    if (!unlockedFeatures.hardwareSection && (funds.gte(5) || charsRead >= 150)) {
      unlockedFeatures.hardwareSection = true
      milestones.potatoPcUnlocked = true
      events.push({
        message: 'Petites annonces repérées : Une tour Pentium II de 1999 (64 Mo SDRAM) est en vente pour $10.00.',
        type: 'event',
      })
    }
    return events
  }

  /**
   * Check training unlock milestone (tokens served >= 25).
   */
  public static checkTrainingUnlock(
    tokensServed: Decimal,
    unlockedFeatures: UnlockedFeatures,
    milestones: MilestoneState
  ): MilestoneEvent[] {
    const events: MilestoneEvent[] = []
    if (!unlockedFeatures.trainingAllocation && tokensServed.gte(25)) {
      unlockedFeatures.trainingAllocation = true
      if (!milestones.trainingUnlocked) {
        milestones.trainingUnlocked = true
        events.push({
          message: 'Architecture débloquée : Entraînement Neuronal actif ! Vous pouvez maintenant allouer du compute pour accroître les Paramètres du modèle.',
          type: 'event',
        })
      }
    }
    return events
  }

  /**
   * Check research unlock milestone (parameters >= 500).
   */
  public static checkResearchUnlock(
    parameters: Decimal,
    unlockedFeatures: UnlockedFeatures,
    milestones: MilestoneState
  ): MilestoneEvent[] {
    const events: MilestoneEvent[] = []
    if (!unlockedFeatures.researchAllocation && parameters.gte(500)) {
      unlockedFeatures.researchAllocation = true
      if (!milestones.researchUnlocked) {
        milestones.researchUnlocked = true
        events.push({
          message: 'Pôle Scientifique débloqué : R&D active ! Vous pouvez allouer du compute pour générer des points de recherche.',
          type: 'event',
        })
      }
    }
    return events
  }

  /**
   * Check parameter and funds milestone alerts.
   */
  public static checkGlobalMilestones(
    parameters: Decimal,
    funds: Decimal,
    milestones: MilestoneState
  ): MilestoneEvent[] {
    const events: MilestoneEvent[] = []

    if (!milestones.first1000Params && parameters.gte(1000)) {
      milestones.first1000Params = true
      events.push({
        message: 'Palier atteint : 1 000 Paramètres intégrés au modèle de neurones (Valeur des requêtes accrue).',
        type: 'event',
      })
    }

    if (!milestones.first10000Params && parameters.gte(10000)) {
      milestones.first10000Params = true
      events.push({
        message: 'Capacités émergentes : 10 000 Paramètres. Le modèle commence à générer du sens cohérent.',
        type: 'event',
      })
    }

    if (!milestones.first1000Funds && funds.gte(1000)) {
      milestones.first1000Funds = true
      events.push({
        message: 'Cap financier franchi : 1 000 $ accumulés dans la trésorerie.',
        type: 'success',
      })
    }

    return events
  }

  /**
   * Check thermal throttling milestone alert.
   */
  public static checkThermalMilestones(
    isThrottling: boolean,
    milestones: MilestoneState
  ): MilestoneEvent[] {
    const events: MilestoneEvent[] = []
    if (isThrottling && !milestones.firstThrottling) {
      milestones.firstThrottling = true
      events.push({
        message: 'ALERTE THERMIQUE : Surchauffe matérielle détectée ! Les puces entrent en throttling et perdent en efficacité. Installez des systèmes de refroidissement dans le panneau Matériel.',
        type: 'warn',
      })
    }
    return events
  }
}
