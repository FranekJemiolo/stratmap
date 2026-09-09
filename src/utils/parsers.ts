import type {
  RawEpic,
  RawHexTile,
  EpicFlowNode,
  EpicFlowEdge,
  CalculatedHexTile,
  CycleCheckResult,
} from '../types'

/**
 * Builds React Flow nodes and edges from raw Jira execution data.
 * - blocks: Solid red line
 * - accelerates: Dotted green line
 */
export function parseExecutionData(epics: RawEpic[]): {
  nodes: EpicFlowNode[]
  edges: EpicFlowEdge[]
} {
  const nodes: EpicFlowNode[] = epics.map((epic) => ({
    id: epic.id,
    type: 'epic',
    position: { x: 0, y: 0 }, // Position calculated by Dagre layout
    data: {
      id: epic.id,
      label: epic.label,
      progress: epic.progress,
      status: epic.status,
      blocks: epic.blocks,
      accelerates: epic.accelerates,
      isHighlighted: false,
      isDimmed: false,
      isSelected: false,
    },
  }))

  const edges: EpicFlowEdge[] = []

  epics.forEach((sourceEpic) => {
    // 1. "blocks" dependencies: solid red edge
    sourceEpic.blocks.forEach((targetId) => {
      edges.push({
        id: `blocks-${sourceEpic.id}->${targetId}`,
        source: sourceEpic.id,
        target: targetId,
        type: 'smoothstep',
        animated: false,
        data: {
          relation: 'blocks',
        },
        style: {
          stroke: '#ef4444',
          strokeWidth: 2,
        },
      })
    })

    // 2. "accelerates" dependencies: dotted green edge
    sourceEpic.accelerates.forEach((targetId) => {
      edges.push({
        id: `accelerates-${sourceEpic.id}->${targetId}`,
        source: sourceEpic.id,
        target: targetId,
        type: 'smoothstep',
        animated: true,
        data: {
          relation: 'accelerates',
        },
        style: {
          stroke: '#10b981',
          strokeWidth: 2,
          strokeDasharray: '4 4',
        },
      })
    })
  })

  return { nodes, edges }
}

/**
 * Cycle detection utility using Depth First Search (DFS) with three-color node marking:
 * 0 = unvisited (white), 1 = visiting/in-stack (gray), 2 = completed (black)
 */
export function detectGraphCycles(
  epics: RawEpic[],
  dependencyType: 'all' | 'blocks' | 'accelerates' = 'all'
): CycleCheckResult {
  const adj = new Map<string, string[]>()
  epics.forEach((epic) => {
    const neighbors: string[] = []
    if (dependencyType === 'all' || dependencyType === 'blocks') {
      neighbors.push(...epic.blocks)
    }
    if (dependencyType === 'all' || dependencyType === 'accelerates') {
      neighbors.push(...epic.accelerates)
    }
    adj.set(epic.id, neighbors)
  })

  const visited = new Map<string, number>() // 0: unvisited, 1: visiting, 2: visited
  const parentMap = new Map<string, string>()
  const cyclePath: string[] = []

  function dfs(node: string): boolean {
    visited.set(node, 1)

    const neighbors = adj.get(node) || []
    for (const neighbor of neighbors) {
      // If neighbor is currently on recursion stack, cycle found
      if (visited.get(neighbor) === 1) {
        cyclePath.push(neighbor, node)
        let curr = node
        while (curr && parentMap.has(curr) && parentMap.get(curr) !== neighbor) {
          curr = parentMap.get(curr)!
          cyclePath.push(curr)
        }
        cyclePath.reverse()
        return true
      }

      if (!visited.has(neighbor) || visited.get(neighbor) === 0) {
        parentMap.set(neighbor, node)
        if (dfs(neighbor)) return true
      }
    }

    visited.set(node, 2)
    return false
  }

  for (const epic of epics) {
    if (!visited.has(epic.id) || visited.get(epic.id) === 0) {
      if (dfs(epic.id)) {
        return {
          hasCycle: true,
          cyclePath,
        }
      }
    }
  }

  return {
    hasCycle: false,
  }
}

/**
 * Generates 6 polygon points for a regular pointy-topped hexagon
 */
export function getPointyHexPolygonPoints(cx: number, cy: number, radius: number): string {
  const points: string[] = []
  for (let i = 0; i < 6; i++) {
    const angleDeg = 60 * i - 30
    const angleRad = (Math.PI / 180) * angleDeg
    const x = cx + radius * Math.cos(angleRad)
    const y = cy + radius * Math.sin(angleRad)
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`)
  }
  return points.join(' ')
}

/**
 * Calculates Cartesian (x, y) coordinates and SVG polygon points from axial (q, r)
 */
export function calculateHexLayout(
  hexes: RawHexTile[],
  radius = 54
): {
  tiles: CalculatedHexTile[]
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number }
} {
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  const tiles: CalculatedHexTile[] = hexes.map((hex) => {
    // Pointy-topped hex axial to cartesian formulas:
    // x = radius * sqrt(3) * (q + r / 2)
    // y = radius * (3 / 2) * r
    const x = radius * Math.sqrt(3) * (hex.q + hex.r / 2)
    const y = radius * (3 / 2) * hex.r
    const polygonPoints = getPointyHexPolygonPoints(x, y, radius - 2) // slight margin for crisp borders

    minX = Math.min(minX, x - radius)
    maxX = Math.max(maxX, x + radius)
    minY = Math.min(minY, y - radius)
    maxY = Math.max(maxY, y + radius)

    return {
      ...hex,
      x,
      y,
      polygonPoints,
      isHighlighted: false,
      isDimmed: false,
      isSelected: false,
    }
  })

  const width = Math.max(100, maxX - minX + radius * 2)
  const height = Math.max(100, maxY - minY + radius * 2)

  return {
    tiles,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width,
      height,
    },
  }
}
