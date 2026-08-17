import Decimal from 'break_infinity.js'
import type { HardwareNode } from '@/types/hardware'

export const INITIAL_HARDWARE_CONFIG: Record<string, HardwareNode> = {
  // ==========================================
  // STATIONS HÔTES (CPU & RAM SYSTÈME & SLOTS PCIE)
  // ==========================================
  potato_pc: {
    id: 'potato_pc',
    name: "Relique du Grenier (Pentium II 450 MHz)",
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
    description: "Tour beige jaunie trouvée à la brocante. Disque dur IDE 5400 RPM crémeux et lecteur disquette 3.5\". Une relique pour lancer vos scripts Python.",
    tier: 0,
  },
  core2_quad: {
    id: 'core2_quad',
    name: "Tour Bureautique Déclassée (Core 2 Quad Q6600)",
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
    description: "Ancienne station d'entreprise 4 cœurs avec 1 port PCIe x16. Permet d'exécuter le Tokenizer BPE CPU et d'accueillir votre 1er GPU.",
    tier: 0,
  },
  gaming_pc: {
    id: 'gaming_pc',
    name: "Tour Gaming Reconditionnée (Core i7 6700K / 16 Go)",
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
    description: "Station hôte solide avec 16 Go de RAM DDR4 et 2 slots PCIe pour brancher deux cartes graphiques en parallèle.",
    tier: 1,
  },
  workstation_pro: {
    id: 'workstation_pro',
    name: "Station Prosumer (Threadripper / 64 Go DDR5)",
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
    description: "Station de travail haute performance dotée de 4 slots PCIe x16 espacés et 64 Go de RAM pour piloter un rig multi-GPU.",
    tier: 2,
  },
  datacenter_chassis: {
    id: 'datacenter_chassis',
    name: "Châssis Serveur Rack 4U (AMD EPYC / 256 Go ECC)",
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
    description: "Châssis rack de datacenter avec double alimentation redondante et 8 baies pour accélérateurs IA haute densité.",
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
    description: "Carte graphique budget légendaire. Faible consommation et premier accélérateur parallèle pour la tokenisation.",
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
    description: "Excellente carte budget pour amorcer l'inférence neuronale locale avec 6 Go de VRAM.",
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
    description: "Le champion de l'IA amateur avec ses 12 Go de VRAM GDDR6. Rapport VRAM/prix imbattable.",
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
    description: "24 Go de GDDR6X ultra-rapide (936 Go/s) pour charger des modèles LLM conséquents et entraîner en local.",
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
    description: "Puce Tensor Core professionnelle dotée de 2 To/s de bande passante HBM2e pour gros volume d'inférence.",
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
    description: "Monstre absolu de calcul avec Transformer Engine pour les modèles d'IA les plus avancés au monde.",
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
      description: node.description,
      tier: node.tier,
    }
  }
  return cloned
}
