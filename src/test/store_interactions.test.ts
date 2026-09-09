import { describe, it, expect, beforeEach } from 'vitest'
import { useStratMapStore } from '../store/useStratMapStore'

describe('useStratMapStore & Cross-Pane State Management', () => {
  beforeEach(() => {
    useStratMapStore.getState().clearSelection()
    useStratMapStore.getState().setDataset('feature-parity')
  })

  it('selectHex sets selectedHexId and syncs associatedEpicId', () => {
    const store = useStratMapStore.getState()
    store.selectHex('HEX-01', 'PROJ-101')

    const updated = useStratMapStore.getState()
    expect(updated.selectedHexId).toBe('HEX-01')
    expect(updated.selectedEpicId).toBe('PROJ-101')
    expect(updated.highlightedEpicId).toBe('PROJ-101')
  })

  it('selectHex toggles off when clicking the same hex again', () => {
    const store = useStratMapStore.getState()
    store.selectHex('HEX-01', 'PROJ-101')
    expect(useStratMapStore.getState().selectedHexId).toBe('HEX-01')

    store.selectHex('HEX-01', 'PROJ-101')
    expect(useStratMapStore.getState().selectedHexId).toBeNull()
    expect(useStratMapStore.getState().selectedEpicId).toBeNull()
  })

  it('selectEpic sets selectedEpicId and clears individual selectedHexId so all matching hexes highlight', () => {
    const store = useStratMapStore.getState()
    store.selectHex('HEX-01', 'PROJ-101')
    expect(useStratMapStore.getState().selectedHexId).toBe('HEX-01')

    store.selectEpic('PROJ-104')
    const updated = useStratMapStore.getState()
    expect(updated.selectedEpicId).toBe('PROJ-104')
    expect(updated.selectedHexId).toBeNull()
    expect(updated.highlightedEpicId).toBe('PROJ-104')
  })

  it('setDataset switches intelligence dataset and resets selections', () => {
    const store = useStratMapStore.getState()
    store.selectHex('HEX-01', 'PROJ-101')

    store.setDataset('user-segments')
    const updated = useStratMapStore.getState()
    expect(updated.activeDataset).toBe('user-segments')
    expect(updated.selectedHexId).toBeNull()
    expect(updated.selectedEpicId).toBeNull()
  })

  it('clearSelection resets all selection parameters', () => {
    const store = useStratMapStore.getState()
    store.selectHex('HEX-03', 'PROJ-102')
    store.clearSelection()

    const updated = useStratMapStore.getState()
    expect(updated.selectedHexId).toBeNull()
    expect(updated.selectedEpicId).toBeNull()
    expect(updated.highlightedEpicId).toBeNull()
  })

  it('toggleOverlapOnly toggles showOverlapOnly boolean flag', () => {
    const store = useStratMapStore.getState()
    expect(store.showOverlapOnly).toBe(false)

    store.toggleOverlapOnly()
    expect(useStratMapStore.getState().showOverlapOnly).toBe(true)

    store.toggleOverlapOnly()
    expect(useStratMapStore.getState().showOverlapOnly).toBe(false)
  })
})

