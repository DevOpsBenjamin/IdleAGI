import {
  SAVE_KEY,
  serializeGameState,
  deserializeGameState,
} from '@/utils/serialization'
import type { GameState } from '@/types'

export class GameSaveManager {
  private static isAvailable(): boolean {
    return typeof localStorage !== 'undefined' && localStorage !== null
  }

  public static save(state: GameState): void {
    if (!this.isAvailable()) return
    try {
      const json = serializeGameState(state)
      localStorage.setItem(SAVE_KEY, json)
    } catch (err) {
      console.error('[Save] Erreur lors de la sauvegarde :', err)
    }
  }

  public static load(defaultState: GameState): Partial<GameState> | null {
    if (!this.isAvailable()) return null
    try {
      const json = localStorage.getItem(SAVE_KEY)
      if (!json) return null

      return deserializeGameState(json, defaultState)
    } catch (err) {
      console.error('[Load] Erreur lors du chargement de la sauvegarde :', err)
      return null
    }
  }

  public static hardReset(): void {
    if (this.isAvailable()) {
      localStorage.removeItem(SAVE_KEY)
    }
    if (typeof location !== 'undefined') {
      location.reload()
    }
  }
}
