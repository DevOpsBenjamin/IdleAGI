import Decimal from 'break_infinity.js'
import type { HardwareNode } from '@/types/hardware'

export const INITIAL_HARDWARE_CONFIG: Record<string, HardwareNode> = {
  potato_pc: {
    id: 'potato_pc',
    name: "Relique du Grenier (Pentium II 450 MHz, 64 Mo SDRAM)",
    count: 0,
    baseCost: new Decimal(10), // $10.00
    costMult: 1.25,
    tflops: new Decimal(0.001), // 1 GFLOPS (authentique relique an 1999)
    vram: new Decimal(0.064),   // 64 Mo SDRAM
    powerWatts: new Decimal(35),
    description: "Tour beige jaunie trouvée à la brocante. Disque dur IDE 5400 RPM crémeux et lecteur disquette 3.5\". Une antiquité, mais suffisante pour faire tourner vos scripts Python.",
    tier: 0,
  },
  used_cpu: {
    id: 'used_cpu',
    name: "Station Tour d'Occasion (Core 2 Quad, 4 Go RAM)",
    count: 0,
    baseCost: new Decimal(25), // $25.00
    costMult: 1.15,
    tflops: new Decimal(0.05), // 50 GFLOPS
    vram: new Decimal(4),      // 4 GB
    powerWatts: new Decimal(65),
    description: "Station de travail solide capable d'exécuter le Tokenizer BPE automatique et d'amorcer l'inférence.",
    tier: 1,
  },
  gtx_gpu: {
    id: 'gtx_gpu',
    name: 'GPU Grand Public (GTX 1060 6 Go)',
    count: 0,
    baseCost: new Decimal(120),
    costMult: 1.18,
    tflops: new Decimal(0.5),  // 500 GFLOPS
    vram: new Decimal(6),      // 6 GB
    powerWatts: new Decimal(150),
    description: "Carte graphique grand public accélérant grandement la tokenisation et l'inférence.",
    tier: 1,
  },
  server_blade: {
    id: 'server_blade',
    name: 'Lame de Serveur Datacenter (A100 80 Go)',
    count: 0,
    baseCost: new Decimal(2000),
    costMult: 1.22,
    tflops: new Decimal(19.5), // 19.5 TFLOPS
    vram: new Decimal(80),     // 80 GB
    powerWatts: new Decimal(400),
    description: "Accélérateur IA de classe entreprise pour modèles à grande échelle.",
    tier: 2,
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
      powerWatts: new Decimal(node.powerWatts),
      description: node.description,
      tier: node.tier,
    }
  }
  return cloned
}
