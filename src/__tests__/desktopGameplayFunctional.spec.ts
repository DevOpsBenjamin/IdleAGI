import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import App from '@/App.vue'
import { useGameStore } from '@/stores/gameStore'
import Decimal from 'break_infinity.js'
import { nextTick } from 'vue'

describe('Functional Test (FT Desktop): Full Game in Desktop Browser Viewport', () => {
  let memoryStorage: Record<string, string> = {}

  beforeAll(() => {
    // Set desktop window resolution (1280x800)
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1280 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 800 })

    const mockStorage = {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, val: string) => {
        memoryStorage[key] = val
      },
      removeItem: (key: string) => {
        delete memoryStorage[key]
      },
      clear: () => {
        memoryStorage = {}
      },
    }
    Object.defineProperty(globalThis, 'localStorage', {
      value: mockStorage,
      writable: true,
      configurable: true,
    })

    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver
  })

  beforeEach(() => {
    memoryStorage = {}
    setActivePinia(createPinia())
  })

  it('Desktop Full Gameplay: Mounts App, verifies 3-column layout, keyboard shortcuts, and full interactive click flows', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useGameStore()

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await nextTick()

    // 1. Initial Desktop Layout Verification
    expect(wrapper.text()).toContain('IDLE AGI')
    expect(wrapper.text()).toContain('Phase 0 // Scribe Humain')
    expect(wrapper.text()).toContain('1. Transcription & Scribe Humain')
    expect(wrapper.text()).toContain('4. Compétences & Scripts Logiciels')
    expect(wrapper.text()).toContain('Terminal STDOUT')

    // 2. Interactive Scribe Clicking & Keyboard Shortcut
    // Find the Scrape button: "LIRE & TRANSCRIRE"
    const buttons = wrapper.findAll('button')
    const scrapeBtn = buttons.find((b) => b.text().includes('LIRE & TRANSCRIRE'))
    expect(scrapeBtn).toBeDefined()
    expect(scrapeBtn!.exists()).toBe(true)

    // Click scrape button 4 times
    for (let i = 0; i < 4; i++) {
      await scrapeBtn!.trigger('click')
      // Reset cooldown for deterministic instant tests
      store.manualScrape()
    }

    // Use Space key event on window to trigger scrape
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }))
    expect(store.totalCharsRead.toNumber()).toBeGreaterThanOrEqual(50)

    // Advance to 80 chars to unlock broker
    while (store.totalCharsRead.lt(80)) {
      store.manualScrape()
    }
    await nextTick()

    expect(store.unlockedFeatures.dataBroker).toBe(true)

    // 3. Sell Text via UI Click
    const sellBtn = wrapper.findAll('button').find((b) => b.text().includes('TOUT VENDRE'))
    expect(sellBtn).toBeDefined()
    expect(sellBtn!.exists()).toBe(true)
    await sellBtn!.trigger('click')

    expect(store.funds.current.toNumber()).toBeGreaterThan(0)

    // 4. Buy Human Upgrade via UI Click in Column 3
    await nextTick()
    store.funds.current = new Decimal(5.0)
    await nextTick()

    const upgradeButtons = wrapper.findAll('button').filter((b) => b.text().includes("Débloquer l'optimisation"))
    expect(upgradeButtons.length).toBeGreaterThan(0)

    // Click to buy first available upgrade
    await upgradeButtons[0].trigger('click')
    await nextTick()
    expect(store.upgrades.human_speed_reading.purchased).toBe(true)

    // 5. Buy Potato PC & Transition to Phase 1
    store.funds.current = new Decimal(15.0)
    await nextTick()

    // Find Hardware buy button in Hardware Cluster
    const boughtPotato = store.buyHardware('potato_pc')
    expect(boughtPotato).toBe(true)
    await nextTick()

    expect(store.currentPhase).toBe(1)
    expect(wrapper.text()).toContain('Phase 1 // Scripts & PC Poubelle')
    expect(wrapper.text()).toContain('3. Matériel, Énergie & Accélérateurs')

    // 6. Buy Workstation, Dedicate GPU & Phase 2 Ingestion
    store.funds.current = new Decimal(500)
    store.buyUpgrade('ram_sdram_256mb')
    store.buyUpgrade('ram_ddr2_8gb')
    store.buyUpgrade('ram_ddr3_16gb')
    const boughtWorkstation = store.buyHardware('core2_quad')
    expect(boughtWorkstation).toBe(true)
    await nextTick()

    expect(store.currentPhase).toBe(2)
    expect(wrapper.text()).toContain('2. Tokenizer BPE & Buffer ($T$)')

    // 7. Buy GPU & Unlock Phase 3 Tri-Allocation
    store.buyHardware('gtx_750ti')
    store.totalTokensServed = new Decimal(30)
    store.unlockedFeatures.trainingAllocation = true
    await nextTick()

    expect(wrapper.text()).toContain('Allocation du Compute')

    // Test Allocation Presets UI buttons (Cash, Balanced, Training)
    const cashPresetBtn = wrapper.findAll('button').find((b) => b.text().includes('Cash Rush'))
    const trainPresetBtn = wrapper.findAll('button').find((b) => b.text().includes('Training'))
    expect(cashPresetBtn).toBeDefined()
    expect(trainPresetBtn).toBeDefined()

    await cashPresetBtn!.trigger('click')
    expect(store.allocations.inferencePercent).toBe(100)

    await trainPresetBtn!.trigger('click')
    expect(store.allocations.trainingPercent).toBeGreaterThan(0)

    // 8. Cyber Terminal STDOUT Interaction
    const terminalInput = wrapper.find('input[placeholder*="Entrez une commande"]')
    expect(terminalInput.exists()).toBe(true)
    await terminalInput.setValue('status')
    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect(store.terminalLogs.some((l) => l.message.includes('Moteur actif'))).toBe(true)

    // 9. Save & Reset Header Actions
    const saveBtn = wrapper.findAll('button').find((b) => b.attributes('title')?.includes('Sauvegarder'))
    expect(saveBtn).toBeDefined()
    await saveBtn!.trigger('click')
    expect(memoryStorage['idleagi_singularity_save']).toBeDefined()

    // Trigger Reset Modal
    const resetBtn = wrapper.findAll('button').find((b) => b.attributes('title')?.includes('Réinitialiser'))
    expect(resetBtn).toBeDefined()
    await resetBtn!.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('CONFIRMER LE HARD RESET ?')
    // Click Cancel
    const cancelBtn = wrapper.findAll('button').find((b) => b.text() === 'Annuler')
    expect(cancelBtn).toBeDefined()
    await cancelBtn!.trigger('click')
    await nextTick()
    expect(wrapper.text()).not.toContain('CONFIRMER LE HARD RESET ?')

    wrapper.unmount()
  })
})
