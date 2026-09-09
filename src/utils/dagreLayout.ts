import dagre from '@dagrejs/dagre'
import type { EpicFlowNode, EpicFlowEdge } from '../types'

export const NODE_WIDTH = 280
export const NODE_HEIGHT = 110

/**
 * Positions React Flow nodes in a hierarchical Top-to-Bottom DAG layout using Dagre
 */
export function layoutNodesAndEdges(
  nodes: EpicFlowNode[],
  edges: EpicFlowEdge[],
  direction: 'TB' | 'LR' = 'TB'
): { nodes: EpicFlowNode[]; edges: EpicFlowEdge[] } {
  const dagreGraph = new dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: 40,
    ranksep: 60,
    marginx: 30,
    marginy: 30,
  })

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  })

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  dagre.layout(dagreGraph)

  const layoutedNodes: EpicFlowNode[] = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id)
    // Dagre provides center coordinates, convert to top-left for React Flow
    const x = nodeWithPosition.x - NODE_WIDTH / 2
    const y = nodeWithPosition.y - NODE_HEIGHT / 2

    return {
      ...node,
      position: { x, y },
    }
  })

  return { nodes: layoutedNodes, edges }
}
