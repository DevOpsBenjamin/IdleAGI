import Decimal from 'break_infinity.js'
import type { SoftwareUpgrade } from '@/types/upgrades'

export class EconomyEngine {
  /**
   * Base manual scrape power (characters per click/action) according to purchased upgrades.
   */
  public static calculateManualScrapePower(upgrades: Record<string, SoftwareUpgrade>): number {
    let power = 10
    if (upgrades.human_speed_reading?.purchased) power += 5
    if (upgrades.human_espresso?.purchased) power += 10
    if (upgrades.script_regex_cleaner?.purchased) power += 15
    return power
  }

  /**
   * Price per 20 characters of raw text sold to data broker.
   */
  public static calculateRawTextSellPrice(upgrades: Record<string, SoftwareUpgrade>): number {
    return upgrades.broker_negotiation?.purchased ? 0.08 : 0.05
  }

  /**
   * Automatic scraping rate in characters per second from python scripts & crawler daemons.
   */
  public static calculateAutoScrapeRate(
    upgrades: Record<string, SoftwareUpgrade>,
    scrapeMultiplier = 1.0
  ): number {
    let rate = 0
    if (upgrades.script_simple_scraper?.purchased) rate += 5
    if (upgrades.script_regex_cleaner?.purchased) rate += 10
    if (upgrades.script_multi_curl?.purchased) rate += 20
    if (upgrades.crawler_daemon_v2?.purchased) rate += 60
    return rate * scrapeMultiplier
  }

  /**
   * Multiplier on API token value based on neural model parameter size and speculative decoding talents.
   * Model quality: (1.0 + 0.25 * log10(parameters)) * talentQualityMultiplier
   */
  public static calculateModelQualityMultiplier(
    parameters: Decimal | number,
    talentQualityMultiplier = 1.0
  ): number {
    const p = parameters instanceof Decimal ? parameters.toNumber() : parameters
    if (p <= 0) return 1.0 * talentQualityMultiplier
    return (1.0 + 0.25 * Math.log10(Math.max(1, p))) * talentQualityMultiplier
  }

  /**
   * Base price per token served through inference API.
   */
  public static calculateBaseTokenPrice(upgrades: Record<string, SoftwareUpgrade>): number {
    return upgrades.api_tier_pricing?.purchased ? 0.10 : 0.05
  }

  /**
   * Actual price per token including model quality multiplier.
   */
  public static calculateActualTokenPrice(
    upgrades: Record<string, SoftwareUpgrade>,
    qualityMultiplier: number
  ): number {
    return this.calculateBaseTokenPrice(upgrades) * qualityMultiplier
  }

  /**
   * Maximum tokens that can be vectorized from raw text given compute, dt, and talent multiplier.
   */
  public static calculateTokenizingCapacity(
    compute: Decimal,
    upgrades: Record<string, SoftwareUpgrade>,
    dt: number,
    tokenGenerationMultiplier = 1.0
  ): Decimal {
    const bpeMultiplier = upgrades.fast_bpe_tokenizer?.purchased ? 2.0 : 1.0
    return compute.mul(50 * bpeMultiplier * tokenGenerationMultiplier).mul(dt)
  }
}
