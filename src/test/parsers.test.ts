import { describe, it, expect } from 'vitest'
import { parseExecutionData, calculateHexLayout, getPointyHexPolygonPoints } from '../utils/parsers'
import { internalExecutionData, marketIntelData } from '../data'

describe('parseExecutionData', () => {
  it('parses internal execution epics into nodes and edges', () => {
    const { nodes, edges } = parseExecutionData(internalExecutionData)
    expect(nodes.length).toBe(internalExecutionData.length)
    expect(nodes.length).toBeGreaterThanOrEqual(15)
    expect(edges.length).toBeGreaterThan(0)
  })

  it('correctly maps blocks dependencies to solid red edges', () => {
    const { edges } = parseExecutionData(internalExecutionData)
    const blockEdges = edges.filter((e) => e.data?.relation === 'blocks')
    expect(blockEdges.length).toBeGreaterThan(0)

    blockEdges.forEach((edge) => {
      expect(edge.style?.stroke).toBe('#ef4444')
      expect(edge.style?.strokeDasharray).toBeUndefined()
    })
  })

  it('correctly maps accelerates dependencies to dotted green edges', () => {
    const { edges } = parseExecutionData(internalExecutionData)
    const accelEdges = edges.filter((e) => e.data?.relation === 'accelerates')
    expect(accelEdges.length).toBeGreaterThan(0)

    accelEdges.forEach((edge) => {
      expect(edge.style?.stroke).toBe('#10b981')
      expect(edge.style?.strokeDasharray).toBe('4 4')
    })
  })
})

describe('calculateHexLayout', () => {
  it('calculates 2D coordinates and polygon points for all hexes', () => {
    const { tiles, bounds } = calculateHexLayout(marketIntelData)
    expect(tiles.length).toBe(marketIntelData.length)
    expect(tiles.length).toBeGreaterThanOrEqual(20)

    // Center hex at q=0, r=0 must be at x=0, y=0
    const centerTile = tiles.find((t) => t.q === 0 && t.r === 0)
    expect(centerTile).toBeDefined()
    expect(centerTile?.x).toBe(0)
    expect(centerTile?.y).toBe(0)

    // Bounds must be valid
    expect(bounds.width).toBeGreaterThan(0)
    expect(bounds.height).toBeGreaterThan(0)
  })

  it('generates 6 polygon coordinates for pointy-topped hexagons', () => {
    const pointsStr = getPointyHexPolygonPoints(0, 0, 50)
    const coords = pointsStr.split(' ')
    expect(coords.length).toBe(6)
  })
})
