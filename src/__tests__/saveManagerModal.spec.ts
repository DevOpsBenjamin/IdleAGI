import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Decimal from 'break_infinity.js'
import SaveManagerModal from '@/components/SaveManagerModal.vue'
import type { GameState } from '@/types/game'
import { createInitialHardware } from '@/domain/constants/hardware'
import { createInitialUpgrades } from '@/domain/constants/upgrades'
import { encodeSaveEnvelope } from '@/utils/saveCodec'

function createTestGameState(): GameState {
  return {
    version: '0.1.0',
    lastTickTimestamp: Date.now(),
    gameStartTime: Date.now() - 3600000,
    currentPhase: 2,
    totalCharsRead: new Decimal(2000),
    rawText: { current: new Decimal(50), max: new Decimal(200), ratePerSec: new Decimal(1) },
    tokens: { current: new Decimal(10), max: new Decimal(100), ratePerSec: new Decimal(0.5) },
    funds: { current: new Decimal(350), max: new Decimal(Infinity), ratePerSec: new Decimal(5) },
    parameters: new Decimal(500000),
    researchPoints: { current: new Decimal(0), max: new Decimal(10000), ratePerSec: new Decimal(0) },
    hardware: createInitialHardware(),
    upgrades: createInitialUpgrades(),
    allocations: { inferencePercent: 100, trainingPercent: 0, researchPercent: 0 },
    gridCapacityWatts: new Decimal(100),
    coolingCapacityWatts: new Decimal(50),
    terminalLogs: [],
    unlockedFeatures: {
      dashboardView: true,
      humanReading: true,
      dataBroker: true,
      hardwareSection: true,
      scriptsSection: true,
      autoBroker: false,
      autoScraping: false,
      tokenizerUnlocked: true,
      oscilloscope: true,
      trainingAllocation: false,
      researchAllocation: false,
      syntheticData: false,
      quantumLayer: false,
      prestigeT1: false,
      prestigeT2: false,
      prestigeT3: false,
    },
    lastOfflineReport: null,
  }
}

describe('SaveManagerModal.vue', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the export tab by default with formatted save string', () => {
    const gameState = createTestGameState()
    const wrapper = mount(SaveManagerModal, {
      props: {
        gameState,
      },
    })

    expect(wrapper.text()).toContain('Gestionnaire de Sauvegardes')
    expect(wrapper.text()).toContain('Base64 + FNV-1a')
    expect(wrapper.text()).toContain('Exporter une Sauvegarde')

    expect(wrapper.text()).toContain('Copier dans le Presse-Papier')
    expect(wrapper.text()).toContain('Télécharger le Fichier (.save)')

    const textarea = wrapper.find('textarea')
    expect(textarea.element.value).toContain('IDLEAGI_SAVE_V1:')
  })

  it('handles clipboard copy on export tab', async () => {
    const gameState = createTestGameState()
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    })

    const wrapper = mount(SaveManagerModal, {
      props: {
        gameState,
      },
    })

    const copyBtn = wrapper.findAll('button').find((b) => b.text().includes('Copier'))
    expect(copyBtn).toBeDefined()
    await copyBtn?.trigger('click')

    expect(writeTextMock).toHaveBeenCalled()
    expect(wrapper.text()).toContain('Copié')
  })

  it('switches to import tab and validates invalid vs valid input', async () => {
    const gameState = createTestGameState()
    const wrapper = mount(SaveManagerModal, {
      props: {
        gameState,
      },
    })

    const importTab = wrapper.findAll('button').find((b) => b.text().includes('Importer'))
    expect(importTab).toBeDefined()
    await importTab?.trigger('click')

    const textarea = wrapper.find('textarea')
    expect(textarea.exists()).toBe(true)

    // 1. Invalid input
    await textarea.setValue('INVALID_DATA')
    expect(wrapper.text()).toContain('Sauvegarde Invalide ou Corrompue')

    // 2. Valid encoded save envelope
    const validSaveString = encodeSaveEnvelope(gameState)
    await textarea.setValue(validSaveString)
    expect(wrapper.text()).toContain('Sauvegarde Reconnue & Intègre (Checksum FNV-1a Valide)')
    expect(wrapper.text()).toContain('Phase 2')
  })

  it('confirms and emits restore-save event when restoring valid save', async () => {
    const gameState = createTestGameState()
    const validSaveString = encodeSaveEnvelope(gameState)

    const wrapper = mount(SaveManagerModal, {
      props: {
        gameState,
      },
    })

    // Switch to import tab
    const importTab = wrapper.findAll('button').find((b) => b.text().includes('Importer'))
    await importTab?.trigger('click')

    const textarea = wrapper.find('textarea')
    await textarea.setValue(validSaveString)

    // Click "Restaurer cette Sauvegarde"
    const restoreBtn = wrapper.findAll('button').find((b) => b.text().includes('Restaurer'))
    expect(restoreBtn).toBeDefined()
    await restoreBtn?.trigger('click')

    // Confirm dialog appears
    expect(wrapper.text()).toContain('CONFIRMER L\'IMPORTATION')
    const confirmBtn = wrapper.findAll('button').find((b) => b.text().includes('Écraser & Charger'))
    expect(confirmBtn).toBeDefined()
    await confirmBtn?.trigger('click')

    expect(wrapper.emitted('restore-save')).toBeTruthy()
    expect(wrapper.emitted('restore-save')?.[0]).toBeDefined()
  })

  it('emits close event when X is clicked', async () => {
    const gameState = createTestGameState()
    const wrapper = mount(SaveManagerModal, {
      props: {
        gameState,
      },
    })

    const closeBtn = wrapper.find('button[type="button"]')
    await closeBtn.trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
