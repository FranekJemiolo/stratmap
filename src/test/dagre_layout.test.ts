import { describe, it, expect } from 'vitest'
import { layoutNodesAndEdges } from '../utils/dagreLayout'
import { parseExecutionData } from '../utils/parsers'
import { internalExecutionData } from '../data'

describe('layoutNodesAndEdges', () => {
  it('positions nodes with valid Cartesian coordinates', () => {
    const { nodes, edges } = parseExecutionData(internalExecutionData)
    const { nodes: layoutedNodes } = layoutNodesAndEdges(nodes, edges, 'TB')

    expect(layoutedNodes.length).toBe(nodes.length)
    layoutedNodes.forEach((node) => {
      expect(typeof node.position.x).toBe('number')
      expect(typeof node.position.y).toBe('number')
      expect(isNaN(node.position.x)).toBe(false)
      expect(isNaN(node.position.y)).toBe(false)
    })
  })

  it('respects top-to-bottom hierarchy where root node has lower Y than blocked children', () => {
    const { nodes, edges } = parseExecutionData(internalExecutionData)
    const { nodes: layoutedNodes } = layoutNodesAndEdges(nodes, edges, 'TB')

    const node101 = layoutedNodes.find((n) => n.id === 'PROJ-101')
    const node102 = layoutedNodes.find((n) => n.id === 'PROJ-102')
    const node105 = layoutedNodes.find((n) => n.id === 'PROJ-105')

    expect(node101).toBeDefined()
    expect(node102).toBeDefined()
    expect(node105).toBeDefined()

    // Since PROJ-101 blocks PROJ-102, and PROJ-102 blocks PROJ-105,
    // in TB hierarchy: Y(101) < Y(102) < Y(105)
    expect(node101!.position.y).toBeLessThan(node102!.position.y)
    expect(node102!.position.y).toBeLessThan(node105!.position.y)
  })
})
