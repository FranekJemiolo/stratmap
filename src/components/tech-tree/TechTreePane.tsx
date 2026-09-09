import React, { useMemo, useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { EpicNode } from './EpicNode'
import type { EpicFlowNode, EpicFlowEdge } from '../../types'
import { GitBranch } from 'lucide-react'

const nodeTypes = {
  epic: EpicNode,
}

interface TechTreePaneProps {
  initialNodes: EpicFlowNode[]
  initialEdges: EpicFlowEdge[]
  selectedEpicId: string | null
  highlightedEpicId: string | null
  onSelectEpic: (epicId: string | null) => void
  linkedHexCounts?: Record<string, number>
}

const TechTreeContent: React.FC<TechTreePaneProps> = ({
  initialNodes,
  initialEdges,
  selectedEpicId,
  highlightedEpicId,
  onSelectEpic,
  linkedHexCounts = {},
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)
  const { setCenter, getNode } = useReactFlow()

  // Update nodes with selection, highlight, dim, and linked count states
  useEffect(() => {
    const activeTargetId = selectedEpicId || highlightedEpicId

    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        const isSelected = selectedEpicId === node.id
        const isHighlighted = highlightedEpicId === node.id
        const isDimmed = activeTargetId !== null && !isSelected && !isHighlighted
        const count = linkedHexCounts[node.id] ?? 0

        return {
          ...node,
          data: {
            ...node.data,
            isSelected,
            isHighlighted,
            isDimmed,
            linkedHexCount: count,
          },
        }
      })
    )
  }, [selectedEpicId, highlightedEpicId, linkedHexCounts, setNodes])

  // Center on selected epic when selectedEpicId changes
  useEffect(() => {
    if (!selectedEpicId) return

    const node = getNode(selectedEpicId)
    if (node && node.position) {
      // Smoothly pan and center on node
      setCenter(node.position.x + 140, node.position.y + 55, {
        zoom: 1.05,
        duration: 800,
      })
    }
  }, [selectedEpicId, getNode, setCenter])

  // Click node handler
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: EpicFlowNode) => {
      if (selectedEpicId === node.id) {
        onSelectEpic(null) // toggle off
      } else {
        onSelectEpic(node.id)
      }
    },
    [selectedEpicId, onSelectEpic]
  )

  // Click pane (empty space) handler
  const handlePaneClick = useCallback(() => {
    onSelectEpic(null)
  }, [onSelectEpic])

  const completionStats = useMemo(() => {
    const total = nodes.length
    const done = nodes.filter((n) => n.data.status === 'Done').length
    const inProgress = nodes.filter((n) => n.data.status === 'In Progress').length
    const todo = nodes.filter((n) => n.data.status === 'To Do').length
    return { total, done, inProgress, todo }
  }, [nodes])

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 border-l border-slate-200">
      {/* Pane Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white border-b border-slate-200 shadow-xs select-none">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-100">
            <GitBranch className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Tech Tree (Jira Epics)</h2>
            <p className="text-[11px] text-slate-500">
              {completionStats.done} Unlocked · {completionStats.inProgress} In Progress ·{' '}
              {completionStats.todo} Locked
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] text-slate-600">
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-red-500 inline-block" />
            <span>Blocks</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 border-t-2 border-dotted border-emerald-500 inline-block" />
            <span>Accelerates</span>
          </span>
        </div>
      </div>

      {/* React Flow Container */}
      <div className="relative flex-1 w-full h-full bg-slate-50/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={handleNodeClick}
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          minZoom={0.2}
          maxZoom={1.8}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#cbd5e1" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <Controls position="bottom-right" className="!bg-white !border-slate-200 !shadow-sm" />
          <MiniMap
            position="bottom-left"
            className="!bg-white/90 !border !border-slate-200 !rounded-md !shadow-sm !w-32 !h-24"
            nodeStrokeColor="#94a3b8"
            nodeColor={(n) => {
              const node = n as EpicFlowNode
              if (node.data.status === 'Done') return '#10b981'
              if (node.data.status === 'In Progress') return '#3b82f6'
              return '#cbd5e1'
            }}
          />
        </ReactFlow>
      </div>
    </div>
  )
}

export const TechTreePane: React.FC<TechTreePaneProps> = (props) => {
  return (
    <ReactFlowProvider>
      <TechTreeContent {...props} />
    </ReactFlowProvider>
  )
}
