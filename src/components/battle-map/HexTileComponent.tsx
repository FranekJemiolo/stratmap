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

function getHexGradientFill(
  primaryOwner: Owner,
  overlappingOwners?: Owner[]
): string | null {
  if (!overlappingOwners || overlappingOwners.length === 0) return null
  const allOwners = new Set([primaryOwner, ...overlappingOwners])
  if (allOwners.has('Us') && allOwners.has('Competitor A') && allOwners.has('Competitor B')) {
    return 'url(#overlap-all)'
  }
  if (allOwners.has('Us') && allOwners.has('Competitor A')) {
    return 'url(#overlap-us-compa)'
  }
  if (allOwners.has('Us') && allOwners.has('Competitor B')) {
    return 'url(#overlap-us-compb)'
  }
  if (allOwners.has('Competitor A') && allOwners.has('Competitor B')) {
    return 'url(#overlap-compa-compb)'
  }
  return null
}

export const HexTileComponent: React.FC<HexTileComponentProps> = memo(
  ({ hex, isSelected, isHighlighted, isDimmed, onClick, onHover, onLeave }) => {
    const ownerStyle = OWNER_COLORS[hex.owner] || {
      fill: '#64748b',
      stroke: '#475569',
      text: '#ffffff',
    }

    const isRumored = hex.confidence === 'Rumored'
    const isOverlapped = Boolean(hex.overlappingOwners && hex.overlappingOwners.length > 0)
    const gradientFill = getHexGradientFill(hex.owner, hex.overlappingOwners)
    const hexFill = gradientFill || ownerStyle.fill

    // Compute stroke, fill-opacity, and classes according to Fog of War & Selection
    let strokeColor = isOverlapped ? '#38bdf8' : ownerStyle.stroke
    let strokeWidth = isOverlapped ? 2 : 1.5
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
          fill={hexFill}
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
        <g transform="translate(0, 7)" className="pointer-events-none">
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

        {/* Feature Overlap Indicator (when shared between Us and competitors) */}
        {isOverlapped && (
          <g transform="translate(0, 22)" className="pointer-events-none">
            <rect
              x={-28}
              y={-5}
              width={56}
              height={10}
              rx={2}
              fill="#0284c7"
              fillOpacity={0.8}
            />
            <text
              y={3}
              textAnchor="middle"
              fill="#e0f2fe"
              fontSize={7}
              fontWeight={700}
              className="tracking-wider uppercase font-mono"
            >
              OVERLAP
            </text>
          </g>
        )}

        {/* Rumored Fog of War Indicator */}
        {isRumored && !isOverlapped && (
          <text
            y={23}
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
