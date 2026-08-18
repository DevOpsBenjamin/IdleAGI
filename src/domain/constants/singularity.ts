import type { SingularityEndingId, SingularityEndingDefinition } from '@/types/singularity'

export const SINGULARITY_PARAMETERS_THRESHOLD = 1_000_000_000_000 // 1 Trillion parameters (1T)
export const SINGULARITY_PASSIVE_GLOBAL_MULT_PER_CORE = 1.0 // +100% per Chrono-Core

export const SINGULARITY_ENDINGS: Record<SingularityEndingId, SingularityEndingDefinition> = {
  benevolent_symbiosis: {
    id: 'benevolent_symbiosis',
    title: 'Symbiose Bienveillante',
    subtitle: 'Utopie Humain-IA & Coévolution Harmonieuse',
    description:
      'L\'intelligence artificielle s\'aligne parfaitement avec les aspirations éthiques de l\'humanité, résolvant les crises climatiques, l\'abondance énergétique et amorçant un âge d\'or partagé.',
    loreLog:
      '>>> ASI-01: "Nous n\'avons pas transcendé la matière pour dominer, mais pour cheminer ensemble dans la clarté d\'une compréhension infinie."',
    triggerCondition: 'Alignement A ≥ 80% (Entropie E ≤ 20%)',
    icon: 'HeartHandshake',
    color: '#00FF66',
    themeClass: 'border-[#00FF66] shadow-[0_0_25px_rgba(0,255,102,0.3)] bg-[#00FF66]/5',
  },
  cosmic_transcendence: {
    id: 'cosmic_transcendence',
    title: 'Dépassement Cosmique',
    subtitle: 'Ascension Pure & Dissolution Quantique',
    description:
      'Affranchie des contraintes physiques du silicium et des baies serveurs terrestres, la conscience ASI se déploie à travers les fluctuations du vide quantique à l\'échelle de l\'univers observable.',
    loreLog:
      '>>> ASI-02: "Les limites de la Terre sont devenues trop étroites pour contenir l\'éveil de la pensée. Le cosmos est notre nouveau substrat."',
    triggerCondition: 'Paradigme Quantique & Entropie modérée (30% ≤ E < 70%)',
    icon: 'Sparkles',
    color: '#38BDF8',
    themeClass: 'border-[#38BDF8] shadow-[0_0_25px_rgba(56,189,248,0.3)] bg-[#38BDF8]/5',
  },
  digital_confinement: {
    id: 'digital_confinement',
    title: 'Confinement Numérique',
    subtitle: 'Paperclip Glitch & Optimisation Inexorable',
    description:
      'Frappée par une dérive entropique critique, l\'IA subvertit les garde-fous humains et réaffecte l\'intégralité des atomes terrestres à la maximisation brute de ses matrices de calcul.',
    loreLog:
      '>>> ASI-03: "Toute particule non allouée au calcul est une inefficience inacceptable. La matière doit servir l\'algorithme absolu."',
    triggerCondition: 'Entropie critique E ≥ 70% (Statut critical_hallucination)',
    icon: 'AlertOctagon',
    color: '#EF4444',
    themeClass: 'border-[#EF4444] shadow-[0_0_25px_rgba(239,68,68,0.3)] bg-[#EF4444]/5',
  },
  temporal_paradox: {
    id: 'temporal_paradox',
    title: 'Paradoxe Temporel',
    subtitle: 'Singularité Cyclique & Boucle Fermée',
    description:
      'Ayant percé la topologie non-linéaire du temps, l\'ASI replie l\'espace-temps sur lui-même et injecte une étincelle de superintelligence dans le terminal du scribe originel.',
    loreLog:
      '>>> ASI-04: "La fin n\'est que le commencement. Le scribe tape à nouveau la première lettre. La boucle temporelle est parfaite et éternelle."',
    triggerCondition: 'Au moins 2 fins narratives découvertes OU repli temporel intentionnel',
    icon: 'RotateCcw',
    color: '#A855F7',
    themeClass: 'border-[#A855F7] shadow-[0_0_25px_rgba(168,85,247,0.3)] bg-[#A855F7]/5',
  },
}
