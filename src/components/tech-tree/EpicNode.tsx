import React, { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import type { NodeProps } from '@xyflow/react'
import type { EpicFlowNode } from '../../types'
import { CheckCircle2, Clock, Lock, Layers } from 'lucide-react'

export const EpicNode: React.FC<NodeProps<EpicFlowNode>> = memo(({ data }) => {
  const isUnlocked = data.progress === 100
  const isPending = data.progress > 0 && data.progress < 100

  // Interaction classes
  let stateClasses = 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
  if (data.isSelected) {
    stateClasses = 'border-blue-600 ring-2 ring-blue-500/30 shadow-lg scale-[1.02] z-20'
  } else if (data.isHighlighted) {
    stateClasses = 'border-indigo-500 ring-2 ring-indigo-400/40 shadow-md scale-[1.01] z-10'
  } else if (data.isDimmed) {
    stateClasses = 'opacity-35 grayscale-[50%] border-slate-200 bg-slate-50/70'
  }

  // Unlocked / progress styles
  const badgeBorder = isUnlocked
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : isPending
      ? 'bg-sky-50 text-sky-700 border-sky-200'
      : 'bg-slate-100 text-slate-600 border-slate-200'

  const progressBarColor = isUnlocked
    ? 'bg-emerald-500'
    : isPending
      ? 'bg-blue-600'
      : 'bg-slate-300'

  return (
    <div
      data-testid={`epic-node-${data.id}`}
      className={`relative w-[280px] rounded-lg border p-3.5 text-left transition-all duration-200 cursor-pointer ${stateClasses}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !w-2.5 !h-2.5 !border-2 !border-white transition-colors hover:!bg-blue-600"
      />

      {/* Header with Epic ID and Status badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200/80">
          {data.id}
        </span>

        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${badgeBorder}`}
        >
          {isUnlocked ? (
            <>
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Unlocked</span>
            </>
          ) : isPending ? (
            <>
              <Clock className="w-3 h-3 text-sky-600 animate-pulse" />
              <span>In Progress</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3 text-slate-500" />
              <span>Locked</span>
            </>
          )}
        </span>
      </div>

      {/* Epic Title */}
      <h4
        className="text-xs font-semibold text-slate-900 line-clamp-2 leading-snug mb-3"
        title={data.label}
      >
        {data.label}
      </h4>

      {/* Progress Bar and % */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="font-medium">Completion</span>
          <span className="font-mono font-semibold text-slate-700">{data.progress}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
          <div
            className={`h-full rounded-full transition-all duration-300 ${progressBarColor}`}
            style={{ width: `${data.progress}%` }}
          />
        </div>
      </div>

      {/* Footer metadata: linked battle map hexes & dependencies */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500">
        <div className="flex items-center gap-1 text-slate-600">
          <Layers className="w-3 h-3 text-slate-400" />
          <span>
            {data.linkedHexCount !== undefined
              ? `${data.linkedHexCount} ${data.linkedHexCount === 1 ? 'territory' : 'territories'}`
              : 'Linked'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {data.blocks && data.blocks.length > 0 && (
            <span className="text-red-600 font-medium" title={`Blocks: ${data.blocks.join(', ')}`}>
              Blocks {data.blocks.length}
            </span>
          )}
          {data.accelerates && data.accelerates.length > 0 && (
            <span
              className="text-emerald-600 font-medium"
              title={`Accelerates: ${data.accelerates.join(', ')}`}
            >
              Accelerates {data.accelerates.length}
            </span>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !w-2.5 !h-2.5 !border-2 !border-white transition-colors hover:!bg-blue-600"
      />
    </div>
  )
})

EpicNode.displayName = 'EpicNode'
