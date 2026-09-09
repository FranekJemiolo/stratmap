import { describe, it, expect } from 'vitest'
import { detectGraphCycles } from '../utils/parsers'
import { internalExecutionData } from '../data'
import type { RawEpic } from '../types'

describe('detectGraphCycles', () => {
  it('confirms the production mock dataset is acyclic', () => {
    const result = detectGraphCycles(internalExecutionData)
    expect(result.hasCycle).toBe(false)
    expect(result.cyclePath).toBeUndefined()
  })

  it('accurately identifies simple direct cycle A -> B -> A', () => {
    const cyclicDataset: RawEpic[] = [
      {
        id: 'A',
        label: 'Epic A',
        progress: 0,
        status: 'To Do',
        blocks: ['B'],
        accelerates: [],
      },
      {
        id: 'B',
        label: 'Epic B',
        progress: 0,
        status: 'To Do',
        blocks: ['A'],
        accelerates: [],
      },
    ]

    const result = detectGraphCycles(cyclicDataset)
    expect(result.hasCycle).toBe(true)
    expect(result.cyclePath).toBeDefined()
  })

  it('accurately identifies indirect multi-step cycle A -> B -> C -> A', () => {
    const cyclicDataset: RawEpic[] = [
      {
        id: 'A',
        label: 'Epic A',
        progress: 0,
        status: 'To Do',
        blocks: ['B'],
        accelerates: [],
      },
      {
        id: 'B',
        label: 'Epic B',
        progress: 0,
        status: 'To Do',
        blocks: ['C'],
        accelerates: [],
      },
      {
        id: 'C',
        label: 'Epic C',
        progress: 0,
        status: 'To Do',
        blocks: ['A'],
        accelerates: [],
      },
    ]

    const result = detectGraphCycles(cyclicDataset)
    expect(result.hasCycle).toBe(true)
    expect(result.cyclePath).toBeDefined()
  })

  it('handles disconnected DAGs without false positives', () => {
    const acyclicDataset: RawEpic[] = [
      {
        id: 'A',
        label: 'Epic A',
        progress: 100,
        status: 'Done',
        blocks: ['B', 'C'],
        accelerates: [],
      },
      {
        id: 'B',
        label: 'Epic B',
        progress: 50,
        status: 'In Progress',
        blocks: ['D'],
        accelerates: [],
      },
      {
        id: 'C',
        label: 'Epic C',
        progress: 0,
        status: 'To Do',
        blocks: ['D'],
        accelerates: [],
      },
      {
        id: 'D',
        label: 'Epic D',
        progress: 0,
        status: 'To Do',
        blocks: [],
        accelerates: [],
      },
      {
        id: 'E',
        label: 'Unconnected Epic',
        progress: 0,
        status: 'To Do',
        blocks: [],
        accelerates: [],
      },
    ]

    const result = detectGraphCycles(acyclicDataset)
    expect(result.hasCycle).toBe(false)
  })
})
