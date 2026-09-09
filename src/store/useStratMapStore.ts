import { create } from 'zustand'
import type { DatasetView } from '../types'

interface StratMapState {
  activeDataset: DatasetView
  selectedEpicId: string | null
  selectedHexId: string | null
  highlightedEpicId: string | null

  // Actions
  setDataset: (dataset: DatasetView) => void
  selectHex: (hexId: string, associatedEpicId: string) => void
  selectEpic: (epicId: string | null) => void
  clearSelection: () => void
}

export const useStratMapStore = create<StratMapState>((set) => ({
  activeDataset: 'feature-parity',
  selectedEpicId: null,
  selectedHexId: null,
  highlightedEpicId: null,

  setDataset: (dataset: DatasetView) =>
    set({
      activeDataset: dataset,
      selectedEpicId: null,
      selectedHexId: null,
      highlightedEpicId: null,
    }),

  selectHex: (hexId: string, associatedEpicId: string) =>
    set((state) => {
      // Toggle off if clicking the already selected hex
      if (state.selectedHexId === hexId) {
        return {
          selectedHexId: null,
          selectedEpicId: null,
          highlightedEpicId: null,
        }
      }
      return {
        selectedHexId: hexId,
        selectedEpicId: associatedEpicId,
        highlightedEpicId: associatedEpicId,
      }
    }),

  selectEpic: (epicId: string | null) =>
    set((state) => {
      if (!epicId || state.selectedEpicId === epicId) {
        return {
          selectedEpicId: null,
          selectedHexId: null,
          highlightedEpicId: null,
        }
      }
      return {
        selectedEpicId: epicId,
        selectedHexId: null, // Clear single hex so all linked hexes highlight
        highlightedEpicId: epicId,
      }
    }),

  clearSelection: () =>
    set({
      selectedEpicId: null,
      selectedHexId: null,
      highlightedEpicId: null,
    }),
}))
