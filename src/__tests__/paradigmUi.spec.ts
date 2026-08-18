import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SyntheticDatasetControl from '@/components/telemetry/SyntheticDatasetControl.vue'
import ParadigmModal from '@/components/ParadigmModal.vue'
import ModelTelemetry from '@/components/ModelTelemetry.vue'
import Decimal from 'break_infinity.js'

describe('SyntheticDatasetControl.vue', () => {
  it('renders synthetic dataset generator status and telemetry metrics', () => {
    const wrapper = mount(SyntheticDatasetControl, {
      props: {
        isSyntheticActive: true,
        syntheticRatio: 0.35,
        syntheticRateCharsPerSec: new Decimal(12500),
        syntheticTextProduced: new Decimal(500000),
        modelCollapseActive: false,
        collapseThreshold: 0.70,
        unlocked: true,
      },
    })

    expect(wrapper.text()).toContain('Générateur de Datasets Synthétiques')
    expect(wrapper.text()).toContain('Génération Optimale')
    expect(wrapper.text()).toContain('+12.50 K chars/s')
    expect(wrapper.text()).toContain('35% / Seuil 70%')
    expect(wrapper.text()).toContain('ACTIF')
    expect(wrapper.text()).not.toContain('Effondrement de Modèle en Cours')
  })

  it('renders model collapse warning banner when modelCollapseActive is true', () => {
    const wrapper = mount(SyntheticDatasetControl, {
      props: {
        isSyntheticActive: true,
        syntheticRatio: 0.88,
        syntheticRateCharsPerSec: new Decimal(25000),
        modelCollapseActive: true,
        collapseThreshold: 0.70,
        unlocked: true,
      },
    })

    expect(wrapper.text()).toContain('Model Collapse Détecté')
    expect(wrapper.text()).toContain('Effondrement de Modèle en Cours')
    expect(wrapper.text()).toContain('88% / Seuil 70%')
  })

  it('emits toggle-synthetic when toggle button is clicked', async () => {
    const wrapper = mount(SyntheticDatasetControl, {
      props: {
        isSyntheticActive: false,
        syntheticRatio: 0.0,
      },
    })

    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.emitted('toggle-synthetic')).toHaveLength(1)
  })
})

describe('ParadigmModal.vue', () => {
  it('renders insights HUD and all 4 architectural paradigms', () => {
    const wrapper = mount(ParadigmModal, {
      props: {
        insights: 3,
        totalInsights: 5,
        activeParadigmId: 'dense_transformer',
        unlockedParadigmIds: ['dense_transformer', 'mixture_of_experts'],
        parameters: new Decimal(2_000_000_000),
        canTriggerTier2: true,
        pendingInsights: 1,
      },
    })

    expect(wrapper.text()).toContain('Paradigmes Architecturaux // Tier 2')
    expect(wrapper.text()).toContain('3 $\\Phi$')
    expect(wrapper.text()).toContain('5 $\\Phi$ cumulés')
    expect(wrapper.text()).toContain('+50% TFLOPS brut')

    // Paradigms check
    expect(wrapper.text()).toContain('Dense Monolithic Transformer')
    expect(wrapper.text()).toContain('Mixture of Experts (MoE)')
    expect(wrapper.text()).toContain('Neuromorphic Spiking Matrix')
    expect(wrapper.text()).toContain('Quantum-Annealed Matrix Core')

    expect(wrapper.text()).toContain('Architecture Active')
    expect(wrapper.text()).toContain('Activer cette Architecture')
  })

  it('emits select-paradigm when clicking an unlocked inactive paradigm', async () => {
    const wrapper = mount(ParadigmModal, {
      props: {
        insights: 0,
        totalInsights: 1,
        activeParadigmId: 'dense_transformer',
        unlockedParadigmIds: ['dense_transformer', 'mixture_of_experts'],
      },
    })

    // Find the button for MoE (unlocked)
    const buttons = wrapper.findAll('button').filter((b) => b.text().includes('Activer cette Architecture'))
    expect(buttons.length).toBeGreaterThan(0)
    await buttons[0].trigger('click')

    expect(wrapper.emitted('select-paradigm')).toEqual([['mixture_of_experts']])
  })

  it('emits unlock-paradigm when clicking an affordable locked paradigm', async () => {
    const wrapper = mount(ParadigmModal, {
      props: {
        insights: 5,
        totalInsights: 5,
        activeParadigmId: 'dense_transformer',
        unlockedParadigmIds: ['dense_transformer'],
      },
    })

    // Neuromorphic costs 5 Insights
    const unlockButtons = wrapper.findAll('button').filter((b) => b.text().includes('Débloquer pour 5 $\\Phi$'))
    expect(unlockButtons.length).toBeGreaterThan(0)
    await unlockButtons[0].trigger('click')

    expect(wrapper.emitted('unlock-paradigm')).toEqual([['neuromorphic_spiking']])
  })

  it('opens confirmation modal and emits trigger-tier2-prestige on confirmation', async () => {
    const wrapper = mount(ParadigmModal, {
      props: {
        insights: 2,
        totalInsights: 2,
        parameters: new Decimal(4_000_000_000),
        canTriggerTier2: true,
        pendingInsights: 2,
      },
    })

    // Click trigger Tier 2 prestige button
    const prestigeBtn = wrapper.findAll('button').find((b) => b.text().includes('Initier le Changement Tier 2'))
    expect(prestigeBtn).toBeDefined()
    await prestigeBtn?.trigger('click')

    expect(wrapper.text()).toContain('Confirmer le Changement de Paradigme')
    expect(wrapper.text()).toContain('Hard Reset Tier 2')

    // Confirm
    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('Confirmer la Transition'))
    expect(confirmBtn).toBeDefined()
    await confirmBtn?.trigger('click')

    expect(wrapper.emitted('trigger-tier2-prestige')).toHaveLength(1)
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(ParadigmModal, {
      props: {
        insights: 0,
      },
    })

    const closeBtn = wrapper.find('button')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})

describe('ModelTelemetry.vue Tier 2 Integration', () => {
  it('renders Tier 2 Paradigm banner when parameters reach 100M or hasParadigmUnlocked is true', async () => {
    const wrapper = mount(ModelTelemetry, {
      props: {
        parameters: new Decimal(150_000_000),
        totalVramGB: new Decimal(128),
        totalMemoryBandwidthGBs: new Decimal(2000),
        effectiveCompute: new Decimal(500),
        thermalEfficiency: 1.0,
        hasParadigmUnlocked: true,
        insights: 2,
        totalInsights: 2,
        activeParadigmName: 'Mixture of Experts',
        activeParadigmTflopsMult: 2.5,
        canTriggerTier2: false,
        pendingInsights: 0,
      },
    })

    expect(wrapper.text()).toContain('Paradigmes IA // Tier 2')
    expect(wrapper.text()).toContain('Mixture of Experts')
    expect(wrapper.text()).toContain('x2.5 TFLOPS')
    expect(wrapper.text()).toContain('Paradigmes (2 $\\Phi$)')

    // Click open paradigm modal
    const paradigmBtn = wrapper.findAll('button').find((b) => b.text().includes('Paradigmes (2 $\\Phi$)'))
    await paradigmBtn?.trigger('click')
    expect(wrapper.emitted('open-paradigm-modal')).toHaveLength(1)
  })
})
