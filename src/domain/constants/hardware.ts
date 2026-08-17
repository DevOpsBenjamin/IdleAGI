import Decimal from 'break_infinity.js'
import type { HardwareNode } from '@/types/hardware'

export const INITIAL_HARDWARE_CONFIG: Record<string, HardwareNode> = {
  // Tier 0 : Brocante & Récupération
  potato_pc: {
    id: 'potato_pc',
    name: "Relique du Grenier (Pentium II 450 MHz)",
    count: 0,
    baseCost: new Decimal(10), // $10.00
    costMult: 1.25,
    tflops: new Decimal(0.001), // 1 GFLOPS
    vram: new Decimal(0.064),   // 64 Mo SDRAM
    memoryBandwidthGBs: new Decimal(0.8), // 0.8 Go/s
    memoryType: 'SDRAM',
    powerWatts: new Decimal(35),
    description: "Tour beige jaunie trouvée à la brocante. Disque dur IDE 5400 RPM crémeux et lecteur disquette 3.5\". Une relique pour lancer vos scripts Python.",
    tier: 0,
  },
  core2_quad: {
    id: 'core2_quad',
    name: "Tour Bureautique Déclassée (Core 2 Quad Q6600)",
    count: 0,
    baseCost: new Decimal(45), // $45.00
    costMult: 1.20,
    tflops: new Decimal(0.04), // 40 GFLOPS
    vram: new Decimal(4),      // 4 Go DDR2
    memoryBandwidthGBs: new Decimal(6.4), // 6.4 Go/s
    memoryType: 'DDR2',
    powerWatts: new Decimal(65),
    description: "Ancienne station d'entreprise 4 cœurs. Permet d'exécuter le Tokenizer BPE CPU sans saturer la machine.",
    tier: 0,
  },

  // Tier 1 : Gaming & ML d'Occasion
  gtx_750ti: {
    id: 'gtx_750ti',
    name: "GPU d'Occasion Récupéré (GTX 750 Ti 2 Go)",
    count: 0,
    baseCost: new Decimal(35), // $35.00
    costMult: 1.18,
    tflops: new Decimal(1.3),  // 1.3 TFLOPS
    vram: new Decimal(2),      // 2 Go GDDR5
    memoryBandwidthGBs: new Decimal(86.4), // 86.4 Go/s
    memoryType: 'GDDR5',
    powerWatts: new Decimal(60),
    description: "Carte graphique budget légendaire. Faible consommation et premier bond de bande passante pour la tokenisation.",
    tier: 1,
  },
  gaming_pc: {
    id: 'gaming_pc',
    name: "Tour Gaming Reconditionnée (Core i7 6700K / 16 Go)",
    count: 0,
    baseCost: new Decimal(220), // $220.00
    costMult: 1.16,
    tflops: new Decimal(0.15), // 150 GFLOPS
    vram: new Decimal(16),     // 16 Go DDR4
    memoryBandwidthGBs: new Decimal(25.6), // 25.6 Go/s
    memoryType: 'DDR4',
    powerWatts: new Decimal(120),
    description: "Station hôte solide avec 16 Go de RAM DDR4, idéale pour orchestrer plusieurs pipelines d'aspiration.",
    tier: 1,
  },
  rtx_3060: {
    id: 'rtx_3060',
    name: "GPU Moyen de Gamme (RTX 3060 12 Go)",
    count: 0,
    baseCost: new Decimal(260), // $260.00
    costMult: 1.18,
    tflops: new Decimal(12.7), // 12.7 TFLOPS
    vram: new Decimal(12),     // 12 Go GDDR6
    memoryBandwidthGBs: new Decimal(360), // 360 Go/s
    memoryType: 'GDDR6',
    powerWatts: new Decimal(170),
    description: "Le champion du Machine Learning amateur avec ses 12 Go de VRAM. Permet d'amorcer l'inférence neuronale à bon débit.",
    tier: 1,
  },

  // Tier 2 : Prosumer & Rigs Multi-GPU
  rtx_3090: {
    id: 'rtx_3090',
    name: "GPU Flagship Prosumer (RTX 3090 24 Go)",
    count: 0,
    baseCost: new Decimal(850), // $850.00
    costMult: 1.20,
    tflops: new Decimal(35.6), // 35.6 TFLOPS
    vram: new Decimal(24),     // 24 Go GDDR6X
    memoryBandwidthGBs: new Decimal(936), // 936 Go/s
    memoryType: 'GDDR6X',
    powerWatts: new Decimal(350),
    description: "Monstre de 24 Go de GDDR6X capable de charger des modèles denses et d'entraîner des réseaux profonds.",
    tier: 2,
  },
  rig_4x3090: {
    id: 'rig_4x3090',
    name: "Rig Multi-GPU Reconverti (4x RTX 3090 96 Go)",
    count: 0,
    baseCost: new Decimal(3800), // $3,800.00
    costMult: 1.22,
    tflops: new Decimal(142.4), // 142.4 TFLOPS
    vram: new Decimal(96),      // 96 Go GDDR6X
    memoryBandwidthGBs: new Decimal(3744), // 3 744 Go/s
    memoryType: 'GDDR6X Multi',
    powerWatts: new Decimal(1400),
    description: "Châssis ouvert de minage reconverti pour l'IA avec alimentation 1600W. 96 Go de VRAM brute combinée.",
    tier: 2,
  },

  // Tier 3 : Datacenter Enterprise & Hyperscale
  a100_blade: {
    id: 'a100_blade',
    name: "Lame Datacenter Enterprise (NVIDIA A100 80 Go SXM4)",
    count: 0,
    baseCost: new Decimal(12000), // $12,000.00
    costMult: 1.25,
    tflops: new Decimal(312),     // 312 TFLOPS Tensor
    vram: new Decimal(80),        // 80 Go HBM2e
    memoryBandwidthGBs: new Decimal(2039), // 2 039 Go/s
    memoryType: 'HBM2e',
    powerWatts: new Decimal(400),
    description: "Accélérateur professionnel d'entreprise équipé de mémoire HBM2e ultra-rapide (2 To/s) pour clusters de serveurs.",
    tier: 3,
  },
  h100_server: {
    id: 'h100_server',
    name: "Serveur Rack Hyperscale (8x H100 NVLink 640 Go)",
    count: 0,
    baseCost: new Decimal(250000), // $250,000.00
    costMult: 1.30,
    tflops: new Decimal(32000),    // 32 PFLOPS FP8/Tensor
    vram: new Decimal(640),        // 640 Go HBM3
    memoryBandwidthGBs: new Decimal(26800), // 26 800 Go/s
    memoryType: 'HBM3 NVLink',
    powerWatts: new Decimal(5600),
    description: "Système IA de classe mondiale connecté en NVLink bidirectionnel à 900 Go/s. L'infrastructure des géants de la tech.",
    tier: 3,
  },
}

export function createInitialHardware(): Record<string, HardwareNode> {
  const cloned: Record<string, HardwareNode> = {}
  for (const [key, node] of Object.entries(INITIAL_HARDWARE_CONFIG)) {
    cloned[key] = {
      id: node.id,
      name: node.name,
      count: node.count,
      baseCost: new Decimal(node.baseCost),
      costMult: node.costMult,
      tflops: new Decimal(node.tflops),
      vram: new Decimal(node.vram),
      memoryBandwidthGBs: new Decimal(node.memoryBandwidthGBs),
      memoryType: node.memoryType,
      powerWatts: new Decimal(node.powerWatts),
      description: node.description,
      tier: node.tier,
    }
  }
  return cloned
}
