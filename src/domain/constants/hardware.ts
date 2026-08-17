import Decimal from 'break_infinity.js'
import type { HardwareNode } from '@/types/hardware'

export const INITIAL_HARDWARE_CONFIG: Record<string, HardwareNode> = {
  // ==========================================
  // STATIONS HÔTES (CPU & RAM SYSTÈME & SLOTS PCIE)
  // ==========================================
  potato_pc: {
    id: 'potato_pc',
    name: "Grille-Pain du Grenier (Pentium II 450 MHz Deschutes)",
    category: 'host',
    count: 0,
    baseCost: new Decimal(10), // $10.00
    costMult: 1.25,
    tflops: new Decimal(0.001), // 1 GFLOPS
    vram: new Decimal(0.064),   // 64 Mo SDRAM
    memoryBandwidthGBs: new Decimal(0.8), // 0.8 Go/s
    memoryType: 'SDRAM',
    powerWatts: new Decimal(35),
    pcieSlotsProvided: 0,
    description: "Tour beige jaunie avec bouton TURBO inactif et lecteur disquette 3.5\". Disque dur IDE 5400 RPM crémeux pour lancer vos scripts Python.",
    tier: 0,
  },
  core2_quad: {
    id: 'core2_quad',
    name: "Chauffage d'Appoint (Core 2 Quad Q6600 @ 2.4 GHz)",
    category: 'host',
    count: 0,
    baseCost: new Decimal(45), // $45.00
    costMult: 1.20,
    tflops: new Decimal(0.04), // 40 GFLOPS
    vram: new Decimal(4),      // 4 Go DDR2
    memoryBandwidthGBs: new Decimal(6.4), // 6.4 Go/s
    memoryType: 'DDR2',
    powerWatts: new Decimal(65),
    pcieSlotsProvided: 1,      // 1 slot PCIe x16
    description: "Le légendaire radiateur d'entreprise des années 2008. 4 cœurs à 65°C, avec 1 port PCIe x16 pour amorcer le Tokenizer BPE et accueillir votre 1er GPU.",
    tier: 0,
  },
  gaming_pc: {
    id: 'gaming_pc',
    name: "Tour Tuning RGB du BonCoin (i7-6700K Skylake Décapsulé)",
    category: 'host',
    count: 0,
    baseCost: new Decimal(220), // $220.00
    costMult: 1.16,
    tflops: new Decimal(0.15), // 150 GFLOPS
    vram: new Decimal(16),     // 16 Go DDR4
    memoryBandwidthGBs: new Decimal(25.6), // 25.6 Go/s
    memoryType: 'DDR4',
    powerWatts: new Decimal(120),
    pcieSlotsProvided: 2,      // 2 slots PCIe x16
    description: "Vitre en plexiglas rayée, néons bleus qui clignotent et 16 Go DDR4. Offre 2 slots PCIe x16 pour empiler des GPU modernes.",
    tier: 1,
  },
  workstation_pro: {
    id: 'workstation_pro',
    name: "Centrale Turbine d'Avion (Threadripper 3990X 64 Cœurs)",
    category: 'host',
    count: 0,
    baseCost: new Decimal(1200), // $1,200.00
    costMult: 1.18,
    tflops: new Decimal(1.2),   // 1.2 TFLOPS CPU
    vram: new Decimal(64),      // 64 Go DDR5
    memoryBandwidthGBs: new Decimal(64), // 64 Go/s
    memoryType: 'DDR5',
    powerWatts: new Decimal(300),
    pcieSlotsProvided: 4,       // 4 slots PCIe x16
    description: "Un monstre prosumer dont les ventilateurs décollent à chaque tick. 4 slots PCIe espacés et 64 Go DDR5 pour piloter un rig multi-GPU.",
    tier: 2,
  },
  datacenter_chassis: {
    id: 'datacenter_chassis',
    name: "Armoire Climatysée 4U (Double AMD EPYC 9654 192 Cœurs)",
    category: 'host',
    count: 0,
    baseCost: new Decimal(6500), // $6,500.00
    costMult: 1.25,
    tflops: new Decimal(4.5),    // 4.5 TFLOPS CPU
    vram: new Decimal(256),      // 256 Go DDR5 ECC
    memoryBandwidthGBs: new Decimal(200), // 200 Go/s
    memoryType: 'DDR5 ECC',
    powerWatts: new Decimal(800),
    pcieSlotsProvided: 8,        // 8 slots PCIe / SXM
    description: "Châssis rack de 45 kg branché en triphasé dans une salle blanche à 18°C. 8 baies SXM/PCIe Gen 5 prêtes pour les accélérateurs hyperscale.",
    tier: 3,
  },

  // ==========================================
  // ACCÉLÉRATEURS DÉDIÉS (GPU & VRAM & BANDWIDTH)
  // ==========================================
  gtx_750ti: {
    id: 'gtx_750ti',
    name: "GPU d'Occasion Récupéré (GTX 750 Ti 2 Go)",
    category: 'gpu',
    count: 0,
    baseCost: new Decimal(35), // $35.00
    costMult: 1.18,
    tflops: new Decimal(1.3),  // 1.3 TFLOPS
    vram: new Decimal(2),      // 2 Go GDDR5
    memoryBandwidthGBs: new Decimal(86.4), // 86.4 Go/s
    memoryType: 'GDDR5',
    powerWatts: new Decimal(60),
    pcieSlotsRequired: 1,
    minHostTier: 0,
    description: "Carte graphique budget légendaire. Faible consommation et premier accélérateur parallèle compatible avec n'importe quelle vieille tour.",
    tier: 1,
  },
  gtx_1060: {
    id: 'gtx_1060',
    name: "GPU Populaire d'Occasion (GTX 1060 6 Go)",
    category: 'gpu',
    count: 0,
    baseCost: new Decimal(85), // $85.00
    costMult: 1.18,
    tflops: new Decimal(4.4),  // 4.4 TFLOPS
    vram: new Decimal(6),      // 6 Go GDDR5
    memoryBandwidthGBs: new Decimal(192), // 192 Go/s
    memoryType: 'GDDR5',
    powerWatts: new Decimal(120),
    pcieSlotsRequired: 1,
    minHostTier: 0,
    description: "Excellente carte budget pour amorcer l'inférence neuronale locale avec 6 Go de VRAM. Compatible avec les vieilles tours Core 2 Quad.",
    tier: 1,
  },
  rtx_3060: {
    id: 'rtx_3060',
    name: "GPU VRAM Optimisé (RTX 3060 12 Go)",
    category: 'gpu',
    count: 0,
    baseCost: new Decimal(260), // $260.00
    costMult: 1.18,
    tflops: new Decimal(12.7), // 12.7 TFLOPS
    vram: new Decimal(12),     // 12 Go GDDR6
    memoryBandwidthGBs: new Decimal(360), // 360 Go/s
    memoryType: 'GDDR6',
    powerWatts: new Decimal(170),
    pcieSlotsRequired: 1,
    minHostTier: 1,
    description: "Le champion de l'IA amateur avec ses 12 Go de VRAM GDDR6. Nécessite une Tour Gaming moderne (Tier 1+) avec UEFI et alim solide.",
    tier: 1,
  },
  rtx_3090: {
    id: 'rtx_3090',
    name: "GPU Flagship Prosumer (RTX 3090 24 Go)",
    category: 'gpu',
    count: 0,
    baseCost: new Decimal(850), // $850.00
    costMult: 1.20,
    tflops: new Decimal(35.6), // 35.6 TFLOPS
    vram: new Decimal(24),     // 24 Go GDDR6X
    memoryBandwidthGBs: new Decimal(936), // 936 Go/s
    memoryType: 'GDDR6X',
    powerWatts: new Decimal(350),
    pcieSlotsRequired: 1,
    minHostTier: 1,
    description: "24 Go de GDDR6X ultra-rapide (936 Go/s) pour modèles denses. Nécessite une tour moderne (Tier 1+) et une alimentation 750W+.",
    tier: 2,
  },
  a100_sxm4: {
    id: 'a100_sxm4',
    name: "Accélérateur Datacenter (NVIDIA A100 80 Go SXM4)",
    category: 'gpu',
    count: 0,
    baseCost: new Decimal(10000), // $10,000.00
    costMult: 1.25,
    tflops: new Decimal(312),     // 312 TFLOPS Tensor
    vram: new Decimal(80),        // 80 Go HBM2e
    memoryBandwidthGBs: new Decimal(2039), // 2 039 Go/s
    memoryType: 'HBM2e',
    powerWatts: new Decimal(400),
    pcieSlotsRequired: 1,
    minHostTier: 2,
    description: "Puce Tensor Core professionnelle dotée de 2 To/s de bande passante HBM2e. Nécessite une Station Prosumer (Tier 2+) ou châssis rack.",
    tier: 3,
  },
  h100_sxm5: {
    id: 'h100_sxm5',
    name: "Accélérateur Hyperscale (NVIDIA H100 80 Go SXM5)",
    category: 'gpu',
    count: 0,
    baseCost: new Decimal(32000), // $32,000.00
    costMult: 1.30,
    tflops: new Decimal(2000),    // 2 000 TFLOPS FP8/Tensor
    vram: new Decimal(80),        // 80 Go HBM3
    memoryBandwidthGBs: new Decimal(3350), // 3 350 Go/s
    memoryType: 'HBM3',
    powerWatts: new Decimal(700),
    pcieSlotsRequired: 1,
    minHostTier: 3,
    description: "Monstre absolu de calcul Transformer Engine. Nécessite impérativement un Châssis Serveur Rack 4U Datacenter (Tier 3).",
    tier: 3,
  },
}

export function createInitialHardware(): Record<string, HardwareNode> {
  const cloned: Record<string, HardwareNode> = {}
  for (const [key, node] of Object.entries(INITIAL_HARDWARE_CONFIG)) {
    cloned[key] = {
      id: node.id,
      name: node.name,
      category: node.category,
      count: node.count,
      baseCost: new Decimal(node.baseCost),
      costMult: node.costMult,
      tflops: new Decimal(node.tflops),
      vram: new Decimal(node.vram),
      memoryBandwidthGBs: new Decimal(node.memoryBandwidthGBs),
      memoryType: node.memoryType,
      powerWatts: new Decimal(node.powerWatts),
      pcieSlotsProvided: node.pcieSlotsProvided,
      pcieSlotsRequired: node.pcieSlotsRequired,
      minHostTier: node.minHostTier,
      description: node.description,
      tier: node.tier,
    }
  }
  return cloned
}
