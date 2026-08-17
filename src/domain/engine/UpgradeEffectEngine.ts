import Decimal from 'break_infinity.js'
import type { UnlockedFeatures } from '@/types/game'

export interface UpgradeEffectContext {
  unlockFeature: (feature: keyof UnlockedFeatures) => void
  setMaxRawText: (amount: Decimal | number) => void
  setMaxTokens: (amount: Decimal | number) => void
  addCoolingCapacity: (watts: Decimal | number) => void
  addGridCapacity: (watts: Decimal | number) => void
}

export class UpgradeEffectEngine {
  public static apply(id: string, ctx: UpgradeEffectContext): void {
    if (id === 'script_simple_scraper' || id === 'crawler_daemon_v2') {
      ctx.unlockFeature('autoScraping')
    } else if (id === 'script_cron_autobroker') {
      ctx.unlockFeature('autoBroker')
    } else if (id === 'ram_sdram_256mb') {
      ctx.setMaxRawText(1500)
    } else if (id === 'script_ram_expansion_512') {
      ctx.setMaxRawText(2500)
    } else if (id === 'ram_ddr2_8gb') {
      ctx.setMaxRawText(6000)
      ctx.setMaxTokens(3000)
    } else if (id === 'ram_ddr3_16gb') {
      ctx.setMaxRawText(15000)
      ctx.setMaxTokens(8000)
    } else if (id === 'ram_ddr4_32gb') {
      ctx.setMaxRawText(40000)
      ctx.setMaxTokens(25000)
    } else if (id === 'ram_ddr4_64gb') {
      ctx.setMaxRawText(100000)
      ctx.setMaxTokens(75000)
    } else if (id === 'ram_ddr5_128gb') {
      ctx.setMaxRawText(300000)
      ctx.setMaxTokens(250000)
    } else if (id === 'ram_ddr5_256gb') {
      ctx.setMaxRawText(1000000)
      ctx.setMaxTokens(1000000)
    } else if (id === 'cooling_case_fans_120mm') {
      ctx.addCoolingCapacity(70)
    } else if (id === 'cooling_tower_heatsink') {
      ctx.addCoolingCapacity(180)
    } else if (id === 'cooling_optimization_v1') {
      ctx.addCoolingCapacity(200)
    } else if (id === 'cooling_aio_watercooling_360') {
      ctx.addCoolingCapacity(450)
    } else if (id === 'cooling_custom_loop_d5') {
      ctx.addCoolingCapacity(1200)
    } else if (id === 'cooling_inrow_datacenter_ac') {
      ctx.addCoolingCapacity(4000)
    } else if (id === 'cooling_immersion_cryo') {
      ctx.addCoolingCapacity(15000)
    } else if (id === 'power_psu_500w') {
      ctx.addGridCapacity(400)
    } else if (id === 'power_psu_850w_gold') {
      ctx.addGridCapacity(750)
    } else if (id === 'power_dedicated_circuit_16a') {
      ctx.addGridCapacity(2500)
    } else if (id === 'power_triphase_industrial') {
      ctx.addGridCapacity(8000)
    } else if (id === 'power_substation_transformer') {
      ctx.addGridCapacity(35000)
    }
  }
}
