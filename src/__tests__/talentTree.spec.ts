import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ArchitectureTalentTree from '@/components/ArchitectureTalentTree.vue'
import { usePrestigeStore } from '@/stores/prestigeStore'
import { TALENT_TREE_NODES } from '@/domain/constants/talents'
import { PrestigeEngine } from '@/domain/engine/PrestigeEngine'

describe('ArchitectureTalentTree Component & Talent Tree System', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('correctly maps talent node statuses (available, locked, insufficient_ap, purchased)', () => {
    const talents = JSON.parse(JSON.stringify(TALENT_TREE_NODES))

    // With 0 AP:
    // opt_bpe_fast_track has no prereqs, cost 1 -> insufficient_ap
    expect(PrestigeEngine.getNodeStatus('opt_bpe_fast_track', talents, 0)).toBe('insufficient_ap')

    // opt_syntactic_indexing has prereq opt_bpe_fast_track (not purchased) -> locked
    expect(PrestigeEngine.getNodeStatus('opt_syntactic_indexing', talents, 10)).toBe('locked')

    // With 1 AP: opt_bpe_fast_track -> available
    expect(PrestigeEngine.getNodeStatus('opt_bpe_fast_track', talents, 1)).toBe('available')

    // After purchasing opt_bpe_fast_track:
    talents.opt_bpe_fast_track.purchased = true
    expect(PrestigeEngine.getNodeStatus('opt_bpe_fast_track', talents, 5)).toBe('purchased')

    // Now opt_syntactic_indexing with 2 AP -> available
    expect(PrestigeEngine.getNodeStatus('opt_syntactic_indexing', talents, 2)).toBe('available')
    // opt_syntactic_indexing with 1 AP -> insufficient_ap
    expect(PrestigeEngine.getNodeStatus('opt_syntactic_indexing', talents, 1)).toBe('insufficient_ap')
  })

  it('organizes talents across 3 distinct branches and 3 tiers', () => {
    const talents = TALENT_TREE_NODES
    const ingestion = PrestigeEngine.getTalentsByBranch(talents, 'ingestion')
    const infrastructure = PrestigeEngine.getTalentsByBranch(talents, 'infrastructure')
    const compute = PrestigeEngine.getTalentsByBranch(talents, 'compute')

    expect(ingestion.length).toBe(4)
    expect(infrastructure.length).toBe(4)
    expect(compute.length).toBe(4)

    const tier1 = PrestigeEngine.getTalentsByTier(talents, 1)
    const tier2 = PrestigeEngine.getTalentsByTier(talents, 2)
    const tier3 = PrestigeEngine.getTalentsByTier(talents, 3)

    expect(tier1.length).toBe(3)
    expect(tier2.length).toBe(6)
    expect(tier3.length).toBe(3)
  })

  it('renders ArchitectureTalentTree modal when isOpen is true and displays AP metrics', async () => {
    const store = usePrestigeStore()
    store.architecturePoints = 3
    store.totalArchitecturePoints = 5

    const wrapper = mount(ArchitectureTalentTree, {
      props: {
        isOpen: true,
        architecturePoints: store.architecturePoints,
        totalArchitecturePoints: store.totalArchitecturePoints,
        checkpointMultiplier: store.checkpointMultiplier,
        talents: store.talents,
        getNodeStatus: (id: string) => store.getNodeStatus(id),
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    expect(wrapper.text()).toContain("ARBRE DE TALENTS D'ARCHITECTURE")
    expect(wrapper.text()).toContain('3 AP')
    expect(wrapper.text()).toContain('BPE Byte-Pair Fast-Track')
    expect(wrapper.text()).toContain('OEM Direct Sourcing')
    expect(wrapper.text()).toContain('GEMM Matrix Acceleration')

    // Click on a talent node to select it
    const buttons = wrapper.findAll('button')
    const matrixBtn = buttons.find((b) => b.text().includes('GEMM Matrix'))
    expect(matrixBtn).toBeDefined()
    if (matrixBtn) {
      await matrixBtn.trigger('click')
      expect(wrapper.text()).toContain('Microcode custom exploitant les instructions Tensor Cores')
    }

    // Emits buy-talent when action button clicked
    const unlockBtn = buttons.find((b) => b.text().includes('DÉBLOQUER CE TALENT'))
    expect(unlockBtn).toBeDefined()
    if (unlockBtn) {
      await unlockBtn.trigger('click')
      expect(wrapper.emitted('buy-talent')).toBeTruthy()
    }
  })

  it('emits close event on close button click and escape key', async () => {
    const store = usePrestigeStore()

    const wrapper = mount(ArchitectureTalentTree, {
      props: {
        isOpen: true,
        architecturePoints: 0,
        totalArchitecturePoints: 0,
        checkpointMultiplier: 1.0,
        talents: store.talents,
        getNodeStatus: (id: string) => store.getNodeStatus(id),
      },
      global: {
        stubs: {
          Teleport: true,
        },
      },
    })

    const closeBtn = wrapper.find('button[aria-label="Fermer la modale"]')
    expect(closeBtn.exists()).toBe(true)
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()

    // Test Escape key
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(wrapper.emitted('close')?.length).toBe(2)
  })
})
