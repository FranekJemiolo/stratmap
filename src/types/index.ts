import type { Node, Edge } from '@xyflow/react'

export type EpicStatus = 'Done' | 'In Progress' | 'To Do'

export interface RawEpic {
  id: string
  label: string
  progress: number
  status: EpicStatus
  blocks: string[]
  accelerates: string[]
}

export type Owner = 'Us' | 'Competitor A' | 'Competitor B'
export type HexStatus = 'Captured' | 'In Progress'
export type Confidence = 'Confirmed' | 'Rumored'

export interface RawHexTile {
  hexId: string
  label: string
  q: number
  r: number
  clusterName: string
  associatedEpicId: string
  owner: Owner
  status: HexStatus
  confidence: Confidence
}

export interface EpicNodeData extends Record<string, unknown> {
  id: string
  label: string
  progress: number
  status: EpicStatus
  blocks: string[]
  accelerates: string[]
  isHighlighted?: boolean
  isDimmed?: boolean
  isSelected?: boolean
  linkedHexCount?: number
}

export type EpicFlowNode = Node<EpicNodeData, 'epic'>

export type DependencyRelation = 'blocks' | 'accelerates'

export interface EpicFlowEdgeData extends Record<string, unknown> {
  relation: DependencyRelation
}

export type EpicFlowEdge = Edge<EpicFlowEdgeData>

export interface HexLayoutPoint {
  x: number
  y: number
  polygonPoints: string
}

export interface CalculatedHexTile extends RawHexTile {
  x: number
  y: number
  polygonPoints: string
  isHighlighted?: boolean
  isDimmed?: boolean
  isSelected?: boolean
}

export type DatasetView = 'feature-parity' | 'user-segments'

export interface CycleCheckResult {
  hasCycle: boolean
  cyclePath?: string[]
}
