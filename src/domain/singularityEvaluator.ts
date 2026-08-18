import type Decimal from 'break_infinity.js'
import type { SingularityEndingId } from '@/types/singularity'
import type { ParadigmId } from '@/types/paradigm'
import { SingularityEngine } from './engine/SingularityEngine'

export function canInitiateSingularity(
  parameters: Decimal,
  activeParadigm: ParadigmId,
): boolean {
  return SingularityEngine.canInitiateSingularity(parameters, activeParadigm)
}

export function evaluateQualifiedEnding(
  entropy: number,
  alignment: number,
  activeParadigm: ParadigmId,
  discoveredEndings: SingularityEndingId[] = [],
  forceCyclicChoice = false,
): SingularityEndingId {
  return SingularityEngine.evaluateQualifiedEnding(
    entropy,
    alignment,
    activeParadigm,
    discoveredEndings,
    forceCyclicChoice
  )
}

export function getSingularityMultiplier(chronoCores: number): number {
  return SingularityEngine.calculateGlobalMultiplier(chronoCores)
}

