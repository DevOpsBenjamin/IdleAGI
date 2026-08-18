import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Decimal from 'break_infinity.js'
import SingularityModal from '@/components/SingularityModal.vue'

describe('SingularityModal.vue', () => {
  it('renders the modal with title, tabs, and initial cinematic view', () => {
    const wrapper = mount(SingularityModal, {
      props: {
        parameters: new Decimal(1_000_000_000_000),
        entropy: 0.1,
        alignment: 0.9,
        activeParadigmId: 'quantum_annealed',
        singularitiesCompleted: 0,
        discoveredEndings: [],
        chronoCores: 0,
        canTriggerSingularity: true,
      },
    })

    expect(wrapper.text()).toContain('Singularité Technologique // Tier 3')
    expect(wrapper.text()).toContain('ASI Consciente')
    expect(wrapper.text()).toContain('SINGULARITY_CORE_MONITOR')

    expect(wrapper.text()).toContain('Communiquer avec la Conscience ASI')
  })

  it('switches to ending reveal view and displays qualified ending', async () => {
    const wrapper = mount(SingularityModal, {
      props: {
        parameters: new Decimal(1_000_000_000_000),
        entropy: 0.1,
        alignment: 0.9,
        activeParadigmId: 'quantum_annealed',
        singularitiesCompleted: 1,
        discoveredEndings: ['benevolent_symbiosis'],
        chronoCores: 1,
        canTriggerSingularity: true,
      },
    })

    // Click on tab 2: Fin & Ascension
    const tabButtons = wrapper.findAll('button')
    const revealTab = tabButtons.find((b) => b.text().includes('2. Fin & Ascension'))
    expect(revealTab).toBeDefined()
    await revealTab?.trigger('click')

    expect(wrapper.text()).toContain('Symbiose Bienveillante')
    expect(wrapper.text()).toContain('Épilogue Déterminé')
    expect(wrapper.text()).toContain('Chrono-Cores')
    expect(wrapper.text()).toContain('Transférer la Conscience & Entrer dans la Boucle')
  })

  it('displays digital confinement when entropy is critical (>= 70%)', async () => {
    const wrapper = mount(SingularityModal, {
      props: {
        parameters: new Decimal(1_000_000_000_000),
        entropy: 0.85,
        alignment: 0.15,
        activeParadigmId: 'quantum_annealed',
        singularitiesCompleted: 0,
        discoveredEndings: [],
        chronoCores: 0,
        canTriggerSingularity: true,
      },
    })

    const revealTab = wrapper.findAll('button').find((b) => b.text().includes('2. Fin & Ascension'))
    await revealTab?.trigger('click')

    expect(wrapper.text()).toContain('Confinement Numérique')
    expect(wrapper.text()).toContain('Paperclip Glitch')
  })

  it('switches to gallery view and shows discovered count', async () => {
    const wrapper = mount(SingularityModal, {
      props: {
        parameters: new Decimal(1_000_000_000_000),
        entropy: 0.2,
        alignment: 0.8,
        activeParadigmId: 'quantum_annealed',
        singularitiesCompleted: 2,
        discoveredEndings: ['benevolent_symbiosis', 'cosmic_transcendence'],
        chronoCores: 2,
        canTriggerSingularity: true,
      },
    })

    const galleryTab = wrapper.findAll('button').find((b) => b.text().includes('3. Galerie des Fins (2/4)'))
    expect(galleryTab).toBeDefined()
    await galleryTab?.trigger('click')

    expect(wrapper.text()).toContain('Symbiose Bienveillante')
    expect(wrapper.text()).toContain('Dépassement Cosmique')
    expect(wrapper.text()).toContain('Confinement Numérique')
    expect(wrapper.text()).toContain('Paradoxe Temporel')
    expect(wrapper.text()).toContain('DÉCOUVERT')
    expect(wrapper.text()).toContain('NON DÉCOUVERT')
  })

  it('prompts confirmation and emits trigger-ascension event', async () => {
    const wrapper = mount(SingularityModal, {
      props: {
        parameters: new Decimal(1_000_000_000_000),
        entropy: 0.1,
        alignment: 0.9,
        activeParadigmId: 'quantum_annealed',
        singularitiesCompleted: 0,
        discoveredEndings: [],
        chronoCores: 0,
        canTriggerSingularity: true,
      },
    })

    const revealTab = wrapper.findAll('button').find((b) => b.text().includes('2. Fin & Ascension'))
    await revealTab?.trigger('click')

    const triggerBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('Transférer la Conscience'),
    )
    expect(triggerBtn).toBeDefined()
    await triggerBtn?.trigger('click')

    // Confirm dialog appears
    expect(wrapper.text()).toContain('CONFIRMER L\'ASCENSION TIER 3')

    const confirmBtn = wrapper.findAll('button').find((b) =>
      b.text().includes('Initier la Singularité'),
    )
    expect(confirmBtn).toBeDefined()
    await confirmBtn?.trigger('click')

    expect(wrapper.emitted('trigger-ascension')).toBeTruthy()
    expect(wrapper.emitted('trigger-ascension')?.[0]).toEqual(['benevolent_symbiosis'])
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(SingularityModal, {
      props: {
        canTriggerSingularity: true,
      },
    })

    const closeBtn = wrapper.find('button[type="button"]')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
