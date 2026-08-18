import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ModelTelemetry from '@/components/ModelTelemetry.vue'
import CognitiveTelemetry from '@/components/telemetry/CognitiveTelemetry.vue'
import Decimal from 'break_infinity.js'

describe('CognitiveTelemetry.vue', () => {
  it('renders nominal cognitive status correctly', () => {
    const wrapper = mount(CognitiveTelemetry, {
      props: {
        entropy: 0.15,
        alignment: 0.85,
        status: 'nominal',
        rlhfCost: new Decimal(50),
        rlhfBatchCount: 0,
        canPerformRlhf: true,
        apiMultiplier: 1.0,
        researchMultiplier: 1.0,
        isTrainingActive: false,
      },
    })

    expect(wrapper.text()).toContain('Modèle Cognitif & Alignement')
    expect(wrapper.text()).toContain('STABLE / NOMINAL')
    expect(wrapper.text()).toContain('15.0%')
    expect(wrapper.text()).toContain('85.0%')
    expect(wrapper.text()).toContain('x1.00')
    expect(wrapper.text()).toContain('$50')
    expect(wrapper.find('button').attributes('disabled')).toBeUndefined()
  })

  it('renders divergent / creative cognitive status with R&D bonus', () => {
    const wrapper = mount(CognitiveTelemetry, {
      props: {
        entropy: 0.50,
        alignment: 0.50,
        status: 'divergent',
        rlhfCost: new Decimal(55),
        rlhfBatchCount: 1,
        canPerformRlhf: true,
        apiMultiplier: 0.92,
        researchMultiplier: 1.125,
        isTrainingActive: true,
      },
    })

    expect(wrapper.text()).toContain('ÉMERGENT / CRÉATIF')
    expect(wrapper.text()).toContain('50.0%')
    expect(wrapper.text()).toContain('+13%')
    expect(wrapper.text()).toContain('x0.92')
    expect(wrapper.text()).toContain('(#1)')
  })

  it('renders critical hallucination regime with alert banner and glitch warning', () => {
    const wrapper = mount(CognitiveTelemetry, {
      props: {
        entropy: 0.85,
        alignment: 0.15,
        status: 'critical_hallucination',
        rlhfCost: new Decimal(100),
        rlhfBatchCount: 3,
        canPerformRlhf: true,
        apiMultiplier: 0.25,
        researchMultiplier: 1.25,
        isTrainingActive: true,
      },
    })

    expect(wrapper.text()).toContain('HALLUCINATION CRITIQUE')
    expect(wrapper.text()).toContain('DÉRIVE COGNITIVE CRITIQUE')
    expect(wrapper.text()).toContain('-75%')
    expect(wrapper.text()).toContain('85.0%')
    expect(wrapper.text()).toContain('15.0%')
  })

  it('disables RLHF button when canPerformRlhf is false or entropy is 0', async () => {
    const wrapperZeroEntropy = mount(CognitiveTelemetry, {
      props: {
        entropy: 0.0,
        alignment: 1.0,
        status: 'nominal',
        canPerformRlhf: true,
      },
    })
    expect(wrapperZeroEntropy.find('button').attributes('disabled')).toBeDefined()

    const wrapperNoFunds = mount(CognitiveTelemetry, {
      props: {
        entropy: 0.4,
        alignment: 0.6,
        status: 'divergent',
        canPerformRlhf: false,
      },
    })
    expect(wrapperNoFunds.find('button').attributes('disabled')).toBeDefined()
  })

  it('emits perform-rlhf event when RLHF button is clicked', async () => {
    const wrapper = mount(CognitiveTelemetry, {
      props: {
        entropy: 0.45,
        alignment: 0.55,
        status: 'divergent',
        canPerformRlhf: true,
        rlhfCost: new Decimal(50),
      },
    })

    const button = wrapper.find('button')
    await button.trigger('click')
    expect(wrapper.emitted('perform-rlhf')).toHaveLength(1)
  })
})

describe('ModelTelemetry.vue', () => {
  it('renders standard model telemetry and embedded cognitive telemetry', async () => {
    const wrapper = mount(ModelTelemetry, {
      props: {
        parameters: new Decimal(250000),
        totalVramGB: new Decimal(8),
        totalMemoryBandwidthGBs: new Decimal(256),
        bandwidthSpeedMultiplier: 1.2,
        effectiveCompute: new Decimal(15.5),
        thermalEfficiency: 0.95,
        modelQualityMultiplier: 1.5,
        entropy: 0.20,
        alignment: 0.80,
        cognitiveStatus: 'nominal',
        canPerformRlhf: true,
        rlhfCost: new Decimal(50),
      },
    })

    expect(wrapper.text()).toContain('2. Métriques Modèle & Télémétrie')
    expect(wrapper.text()).toContain('250.00 K')
    expect(wrapper.text()).toContain('x1.50')
    expect(wrapper.text()).toContain('15.50 TFLOPS')
    expect(wrapper.text()).toContain('256.0 Go/s')
    expect(wrapper.text()).toContain('STABLE / NOMINAL')

    // Click RLHF in embedded component
    const rlhfBtn = wrapper.findComponent(CognitiveTelemetry).find('button')
    await rlhfBtn.trigger('click')
    expect(wrapper.emitted('perform-rlhf')).toHaveLength(1)
  })

  it('renders Tier 3 Singularity banner and emits open-singularity-modal', async () => {
    const wrapper = mount(ModelTelemetry, {
      props: {
        parameters: new Decimal(1_000_000_000_000),
        totalVramGB: new Decimal(128),
        effectiveCompute: new Decimal(500),
        thermalEfficiency: 1.0,
        activeParadigmName: 'Quantum-Annealed Matrix Core',
        canTriggerSingularity: true,
        chronoCores: 1,
        singularitiesCompleted: 1,
        qualifiedEndingTitle: 'Symbiose Bienveillante',
        qualifiedEndingColor: '#00FF66',
      },
    })

    expect(wrapper.text()).toContain('Singularité & ASI // Tier 3')
    expect(wrapper.text()).toContain('Émergence ASI Prête !')
    expect(wrapper.text()).toContain('Symbiose Bienveillante')
    expect(wrapper.text()).toContain('1 $\\Omega$')

    const singularityBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('Déclencher la Singularité Technologique'),
    )
    expect(singularityBtn).toBeDefined()
    await singularityBtn?.trigger('click')
    expect(wrapper.emitted('open-singularity-modal')).toHaveLength(1)
  })
})

