import Decimal from 'break_infinity.js'
import type { OfflineProgressSummary } from '@/types/systems'

export const MAX_OFFLINE_SECONDS = 86400 // 24 hours

export interface OfflineCatchupOptions {
  now: number
  lastTickTimestamp: number
  rawTextCurrent: Decimal
  tokensCurrent: Decimal
  fundsCurrent: Decimal
  parametersCurrent: Decimal
  runStep: (stepDt: number) => void
}

export class OfflineEngine {
  /**
   * Run offline catchup progression up to MAX_OFFLINE_SECONDS (24h).
   */
  public static calculateOfflineProgress(
    options: OfflineCatchupOptions
  ): OfflineProgressSummary | null {
    const {
      now,
      lastTickTimestamp,
      rawTextCurrent,
      tokensCurrent,
      fundsCurrent,
      parametersCurrent,
      runStep,
    } = options

    const elapsedSeconds = Math.max(0, (now - lastTickTimestamp) / 1000)

    if (elapsedSeconds < 10) {
      return null
    }

    const cappedAt24h = elapsedSeconds > MAX_OFFLINE_SECONDS
    const simulatedSeconds = Math.min(elapsedSeconds, MAX_OFFLINE_SECONDS)

    const initialRaw = new Decimal(rawTextCurrent)
    const initialTokens = new Decimal(tokensCurrent)
    const initialFunds = new Decimal(fundsCurrent)
    const initialParams = new Decimal(parametersCurrent)

    const step = 1.0
    const stepsCount = Math.floor(simulatedSeconds / step)
    for (let i = 0; i < stepsCount; i++) {
      runStep(step)
    }
    const remainder = simulatedSeconds - stepsCount * step
    if (remainder > 0) {
      runStep(remainder)
    }

    return {
      elapsedSeconds,
      simulatedSeconds,
      cappedAt24h,
      rawTextGained: new Decimal(rawTextCurrent).sub(initialRaw),
      tokensGained: new Decimal(tokensCurrent).sub(initialTokens),
      fundsGained: new Decimal(fundsCurrent).sub(initialFunds),
      parametersGained: new Decimal(parametersCurrent).sub(initialParams),
      welcomeMessage:
        "Project Singularity Loop est un jeu incrémental à flux continu conçu pour des sessions actives et stratégiques. Votre progression a été simulée fidèlement.",
    }
  }
}
