import { describe, it, expect, beforeEach, beforeAll } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import App from '@/App.vue'
import { useGameStore } from '@/stores/gameStore'
import Decimal from 'break_infinity.js'
import { nextTick } from 'vue'

describe('Functional Test (FT Mobile): Full Game in Mobile Smartphone Viewport (390x844)', () => {
  let memoryStorage: Record<string, string> = {}

  beforeAll(() => {
    // Set mobile smartphone window resolution (390x844, iPhone 14/15 size)
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 390 })
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 844 })

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

  it('Mobile Full Gameplay: Mounts App, verifies bottom navigation bar, tab switching, and mobile touch click flows', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const store = useGameStore()

    const wrapper = mount(App, {
      global: {
        plugins: [pinia],
      },
    })

    await nextTick()

    // 1. Verify Mobile Navigation is present
    const mobileNav = wrapper.find('nav[aria-label="Navigation Mobile"]')
    expect(mobileNav.exists()).toBe(true)

    const tabIngestion = wrapper.find('#mobile-tab-ingestion')
    const tabDatacenter = wrapper.find('#mobile-tab-datacenter')
    const tabUpgrades = wrapper.find('#mobile-tab-upgrades')
    const tabTerminal = wrapper.find('#mobile-tab-terminal')

    expect(tabIngestion.exists()).toBe(true)
    expect(tabDatacenter.exists()).toBe(true)
    expect(tabUpgrades.exists()).toBe(true)
    expect(tabTerminal.exists()).toBe(true)

    // 2. Mobile Ingestion Tab: Scribe & Scraping
    const scrapeBtn = wrapper.findAll('button').find((b) => b.text().includes('LIRE & TRANSCRIRE'))
    expect(scrapeBtn).toBeDefined()

    // Tap scrape button
    await scrapeBtn!.trigger('click')
    expect(store.totalCharsRead.toNumber()).toBeGreaterThanOrEqual(10)

    // Read to unlock data broker (80 chars)
    while (store.totalCharsRead.lt(80)) {
      store.manualScrape()
    }
    await nextTick()
    expect(store.unlockedFeatures.dataBroker).toBe(true)

    // Sell text on mobile
    const sellBtn = wrapper.findAll('button').find((b) => b.text().includes('TOUT VENDRE'))
    expect(sellBtn).toBeDefined()
    await sellBtn!.trigger('click')
    expect(store.funds.current.toNumber()).toBeGreaterThan(0)

    // 3. Switch to Mobile Upgrades Tab
    await tabUpgrades.trigger('click')
    await nextTick()

    // In Upgrades tab, Software Upgrades panel is active
    expect(wrapper.text()).toContain('4. Compétences & Scripts Logiciels')

    store.funds.current = new Decimal(5.0)
    await nextTick()

    // Tap upgrade buy button
    const upgradeButtons = wrapper.findAll('button').filter((b) => b.text().includes("Débloquer l'optimisation"))
    expect(upgradeButtons.length).toBeGreaterThan(0)
    await upgradeButtons[0].trigger('click')
    await nextTick()
    expect(store.upgrades.human_speed_reading.purchased).toBe(true)

    // 4. Switch to Mobile Datacenter Tab
    await tabDatacenter.trigger('click')
    await nextTick()

    // Check pre-hardware prompt on mobile
    expect(wrapper.text()).toContain('Datacenter non initialisé')

    // Acquire Potato PC
    store.funds.current = new Decimal(15.0)
    store.buyHardware('potato_pc')
    await nextTick()

    // Now HardwareCluster and Datacenter HUD are visible in Datacenter tab
    expect(wrapper.text()).toContain('3. Matériel, Énergie & Accélérateurs')

    // Test Hardware Cluster sub-tabs on mobile
    const ramSubTab = wrapper.findAll('button').find((b) => b.text().includes('RAM Kits'))
    if (ramSubTab) {
      await ramSubTab.trigger('click')
      await nextTick()
    }

    // 5. Switch to Mobile Terminal Tab
    await tabTerminal.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('Terminal STDOUT')

    // Test filter tabs in mobile terminal
    const filterThought = wrapper.findAll('button').find((b) => b.text() === 'Pensées')
    const filterSys = wrapper.findAll('button').find((b) => b.text() === 'Système')
    expect(filterThought).toBeDefined()
    expect(filterSys).toBeDefined()

    await filterThought!.trigger('click')
    await nextTick()

    // Submit command on mobile prompt
    const termInput = wrapper.find('input[placeholder*="Entrez une commande"]')
    expect(termInput.exists()).toBe(true)
    await termInput.setValue('scrape')
    await wrapper.find('form').trigger('submit.prevent')
    await nextTick()

    expect(store.terminalLogs.some((l) => l.message.includes('Scraping forcé'))).toBe(true)

    // 6. Phase 2 & 3 Mobile Gameplay Progression
    store.funds.current = new Decimal(1000)
    store.buyUpgrade('ram_sdram_256mb')
    store.buyUpgrade('ram_ddr2_8gb')
    store.buyUpgrade('ram_ddr3_16gb')
    store.buyHardware('core2_quad')
    store.buyHardware('gtx_750ti')
    store.totalTokensServed = new Decimal(50)
    store.unlockedFeatures.trainingAllocation = true

    // Switch back to Ingestion tab to test Tokenizer & Allocation on mobile
    await tabIngestion.trigger('click')
    await nextTick()

    expect(wrapper.text()).toContain('2. Tokenizer BPE & Buffer ($T$)')
    expect(wrapper.text()).toContain('Allocation du Compute')

    // Tap preset button on mobile
    const trainBtn = wrapper.findAll('button').find((b) => b.text().includes('Training'))
    expect(trainBtn).toBeDefined()
    await trainBtn!.trigger('click')
    expect(store.allocations.trainingPercent).toBeGreaterThan(0)

    const cashBtn = wrapper.findAll('button').find((b) => b.text().includes('Cash Rush'))
    expect(cashBtn).toBeDefined()
    await cashBtn!.trigger('click')
    expect(store.allocations.inferencePercent).toBe(100)

    wrapper.unmount()
  })
})
