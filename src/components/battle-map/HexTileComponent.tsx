import React, { memo } from 'react'
import type { CalculatedHexTile, Owner } from '../../types'

interface HexTileComponentProps {
  hex: CalculatedHexTile
  isSelected: boolean
  isHighlighted: boolean
  isDimmed: boolean
  onClick: (hex: CalculatedHexTile) => void
  onHover: (hex: CalculatedHexTile, e: React.MouseEvent) => void
  onLeave: () => void
}

const OWNER_COLORS: Record<Owner, { fill: string; stroke: string; text: string }> = {
  Us: {
    fill: '#2563eb', // Blue-600
    stroke: '#1d4ed8', // Blue-700
    text: '#ffffff',
  },
  'Competitor A': {
    fill: '#ea580c', // Orange-600
    stroke: '#c2410c', // Orange-700
    text: '#ffffff',
  },
  'Competitor B': {
    fill: '#7c3aed', // Violet-600
    stroke: '#6d28d9', // Violet-700
    text: '#ffffff',
  },
}

export const HexTileComponent: React.FC<HexTileComponentProps> = memo(
  ({ hex, isSelected, isHighlighted, isDimmed, onClick, onHover, onLeave }) => {
    const ownerStyle = OWNER_COLORS[hex.owner] || {
      fill: '#64748b',
      stroke: '#475569',
      text: '#ffffff',
    }

    const isRumored = hex.confidence === 'Rumored'

    // Compute stroke, fill-opacity, and classes according to Fog of War & Selection
    let strokeColor = ownerStyle.stroke
    let strokeWidth = 1.5
    let strokeDasharray = isRumored ? '4 3' : 'none'
    let fillOpacity = isRumored ? 0.5 : 0.85
    let groupOpacity = 1

    if (isSelected) {
      strokeColor = '#facc15' // Amber-400 vivid halo
      strokeWidth = 3.5
      fillOpacity = isRumored ? 0.65 : 1
    } else if (isHighlighted) {
      strokeColor = '#38bdf8' // Sky-400 highlight
      strokeWidth = 3
      fillOpacity = isRumored ? 0.6 : 0.95
    } else if (isDimmed) {
      groupOpacity = 0.22
    }

    return (
      <g
        data-testid={`hex-tile-${hex.hexId}`}
        transform={`translate(${hex.x}, ${hex.y})`}
        className="cursor-pointer transition-opacity duration-200 select-none group"
        opacity={groupOpacity}
        onClick={(e) => {
          e.stopPropagation()
          onClick(hex)
        }}
        onMouseEnter={(e) => onHover(hex, e)}
        onMouseMove={(e) => onHover(hex, e)}
        onMouseLeave={onLeave}
      >
        {/* Outer selection glow ring */}
        {isSelected && (
          <polygon
            points={hex.polygonPoints}
            transform={`translate(${-hex.x}, ${-hex.y})`}
            fill="none"
            stroke="#fbbf24"
            strokeWidth={6}
            opacity={0.5}
          />
        )}

        {/* Main Hexagon Polygon */}
        <polygon
          points={hex.polygonPoints}
          transform={`translate(${-hex.x}, ${-hex.y})`}
          fill={ownerStyle.fill}
          fillOpacity={fillOpacity}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          className="transition-all duration-150 group-hover:brightness-110"
        />

        {/* Territory Label & Associated Epic Tag inside Hexagon */}
        <text
          y={-10}
          textAnchor="middle"
          fill={ownerStyle.text}
          fontSize={10}
          fontWeight={600}
          className="pointer-events-none drop-shadow-sm font-sans"
        >
          {hex.label.length > 14 ? `${hex.label.slice(0, 13)}…` : hex.label}
        </text>

        {/* Associated Epic Pill inside Hexagon */}
        <g transform="translate(0, 8)" className="pointer-events-none">
          <rect
            x={-30}
            y={-7}
            width={60}
            height={14}
            rx={4}
            fill="#0f172a"
            fillOpacity={0.65}
          />
          <text
            y={3}
            textAnchor="middle"
            fill="#f8fafc"
            fontSize={8.5}
            fontWeight={600}
            fontFamily="monospace"
          >
            {hex.associatedEpicId}
          </text>
        </g>

        {/* Rumored Fog of War Indicator Icon (small radar / eye indicator) */}
        {isRumored && (
          <text
            y={24}
            textAnchor="middle"
            fill="#fef08a"
            fontSize={8}
            fontWeight={600}
            className="pointer-events-none tracking-wide uppercase font-mono"
          >
            [RUMORED]
          </text>
        )}
      </g>
    )
  }
)

HexTileComponent.displayName = 'HexTileComponent'
