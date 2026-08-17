import Decimal from 'break_infinity.js'
import type { SoftwareUpgrade } from '@/types/upgrades'

export const INITIAL_UPGRADES_CONFIG: Record<string, SoftwareUpgrade> = {
  // Phase 0 : Human Reading Skills
  human_speed_reading: {
    id: 'human_speed_reading',
    name: 'Technique de Lecture Rapide',
    description: 'Balayage visuel des paragraphes : lecture manuelle portée à 15 caractères par action (+50%).',
    cost: new Decimal(0.15),
    currency: 'funds',
    purchased: false,
    category: 'human',
  },
  human_espresso: {
    id: 'human_espresso',
    name: 'Double Tasse d’Espresso',
    description: 'Pic de caféine et concentration accrue : lecture manuelle portée à 25 caractères par action.',
    cost: new Decimal(0.60),
    currency: 'funds',
    purchased: false,
    category: 'human',
  },
  broker_negotiation: {
    id: 'broker_negotiation',
    name: 'Négociation Courtier de Données',
    description: 'Revalorise le tarif des données brutes ($0.08 les 20 caractères au lieu de $0.05).',
    cost: new Decimal(2.50),
    currency: 'funds',
    purchased: false,
    category: 'monetization',
    requiredFeature: 'dataBroker',
  },

  // Phase 1 : Potato PC Scripts
  script_simple_scraper: {
    id: 'script_simple_scraper',
    name: 'Script simple_scraper.py',
    description: "Script Python tournant en tâche de fond sur le PC (+5 chars/s d'auto-scraping passif).",
    cost: new Decimal(3.00),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
    requiredFeature: 'scriptsSection',
  },
  script_cron_autobroker: {
    id: 'script_cron_autobroker',
    name: 'Cron auto_broker.py',
    description: 'Vente automatique au courtier dès que 40 caractères sont accumulés (aucun clic requis).',
    cost: new Decimal(5.00),
    currency: 'funds',
    purchased: false,
    category: 'monetization',
    requiredFeature: 'scriptsSection',
  },
  script_regex_cleaner: {
    id: 'script_regex_cleaner',
    name: 'Parser clean_html_regex.py',
    description: 'Nettoie les balises HTML : +10 chars/s en auto et +15 chars par lecture manuelle.',
    cost: new Decimal(7.50),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
    requiredFeature: 'scriptsSection',
  },
  script_ram_expansion_512: {
    id: 'script_ram_expansion_512',
    name: 'Patch Swap swap_ram.sh',
    description: 'Étend la mémoire tampon : capacité de Raw Text portée à 1 500 caractères.',
    cost: new Decimal(10.00),
    currency: 'funds',
    purchased: false,
    category: 'hardware',
    requiredFeature: 'scriptsSection',
  },
  script_multi_curl: {
    id: 'script_multi_curl',
    name: 'Daemon multi_curl.py',
    description: 'Aspiration multi-connexions en parallèle (+20 chars/s supplémentaires).',
    cost: new Decimal(15.00),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
    requiredFeature: 'scriptsSection',
  },

  // Phase 2 & 3 : Tokenizer & Datacenter
  fast_bpe_tokenizer: {
    id: 'fast_bpe_tokenizer',
    name: 'BPE Tokenizer Vectorisé',
    description: 'Optimise la vectorisation BPE en mémoire, doublant la vitesse de tokenisation automatique.',
    cost: new Decimal(75.00),
    currency: 'funds',
    purchased: false,
    category: 'tokenizer',
    requiredFeature: 'tokenizerUnlocked',
  },
  ram_buffer_expansion_1: {
    id: 'ram_buffer_expansion_1',
    name: 'Extension Buffer RAM Datacenter (16GB)',
    description: 'Capacité Raw Text portée à 5 000 chars et Tokens à 2 500 $T$.',
    cost: new Decimal(100.00),
    currency: 'funds',
    purchased: false,
    category: 'hardware',
    requiredFeature: 'tokenizerUnlocked',
  },
  cooling_optimization_v1: {
    id: 'cooling_optimization_v1',
    name: 'Dissipateur Cuivre Haut Débit',
    description: 'Améliore la dissipation thermique passive (+200W de Cooling Capacity).',
    cost: new Decimal(120.00),
    currency: 'funds',
    purchased: false,
    category: 'hardware',
    requiredFeature: 'tokenizerUnlocked',
  },
  api_tier_pricing: {
    id: 'api_tier_pricing',
    name: 'Pricing API Tier Pro',
    description: "Augmente le tarif de base par token d'inférence servi ($0.10 au lieu de $0.05 par token).",
    cost: new Decimal(200.00),
    currency: 'funds',
    purchased: false,
    category: 'monetization',
    requiredFeature: 'tokenizerUnlocked',
  },
  crawler_daemon_v2: {
    id: 'crawler_daemon_v2',
    name: 'Cluster Crawler Parallèle v2.0',
    description: "Distribue le scraping web à grande échelle (+60 chars/s d'auto-scraping).",
    cost: new Decimal(350.00),
    currency: 'funds',
    purchased: false,
    category: 'scraping',
    requiredFeature: 'tokenizerUnlocked',
  },
}

export function createInitialUpgrades(): Record<string, SoftwareUpgrade> {
  const cloned: Record<string, SoftwareUpgrade> = {}
  for (const [key, up] of Object.entries(INITIAL_UPGRADES_CONFIG)) {
    cloned[key] = {
      id: up.id,
      name: up.name,
      description: up.description,
      cost: new Decimal(up.cost),
      currency: up.currency,
      purchased: up.purchased,
      category: up.category,
      requiredFeature: up.requiredFeature,
    }
  }
  return cloned
}
