import React, { useState, useRef, useCallback, useEffect } from 'react'
import type { CalculatedHexTile, Owner } from '../../types'
import { HexTileComponent } from './HexTileComponent'
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Info,
  Shield,
  Eye,
  CheckCircle,
  HelpCircle,
  Layers,
  Sparkles,
} from 'lucide-react'

interface BattleMapPaneProps {
  tiles: CalculatedHexTile[]
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number }
  selectedHexId: string | null
  selectedEpicId: string | null
  showOverlapOnly?: boolean
  onToggleOverlapOnly?: () => void
  onSelectHex: (hexId: string, associatedEpicId: string) => void
  onClearSelection: () => void
}

interface TooltipState {
  hex: CalculatedHexTile | null
  x: number
  y: number
}

export const BattleMapPane: React.FC<BattleMapPaneProps> = ({
  tiles,
  bounds,
  selectedHexId,
  selectedEpicId,
  showOverlapOnly = false,
  onToggleOverlapOnly,
  onSelectHex,
  onClearSelection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)

  // Pan and zoom transformation state
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Floating hover tooltip state
  const [tooltip, setTooltip] = useState<TooltipState>({ hex: null, x: 0, y: 0 })

  // Center the grid on initial mount or when bounds change
  const resetView = useCallback(() => {
    if (!containerRef.current) return
    const { clientWidth, clientHeight } = containerRef.current
    const centerX = (bounds.minX + bounds.maxX) / 2
    const centerY = (bounds.minY + bounds.maxY) / 2

    const scaleX = (clientWidth * 0.85) / bounds.width
    const scaleY = (clientHeight * 0.85) / bounds.height
    const initialScale = Math.min(Math.max(Math.min(scaleX, scaleY), 0.5), 1.2)

    setTransform({
      x: clientWidth / 2 - centerX * initialScale,
      y: clientHeight / 2 - centerY * initialScale,
      scale: initialScale,
    })
  }, [bounds])

  useEffect(() => {
    resetView()
  }, [resetView])

  // Mouse pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    setIsDragging(true)
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setTransform((prev) => ({
      ...prev,
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9
    const newScale = Math.min(Math.max(transform.scale * zoomFactor, 0.35), 2.5)

    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    setTransform((prev) => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * (newScale / prev.scale),
      y: mouseY - (mouseY - prev.y) * (newScale / prev.scale),
    }))
  }

  // Zoom button triggers
  const zoomIn = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 2.5),
    }))
  }

  const zoomOut = () => {
    setTransform((prev) => ({
      ...prev,
      scale: Math.max(prev.scale * 0.8, 0.35),
    }))
  }

  // Hover handlers for tooltips
  const handleHexHover = useCallback((hex: CalculatedHexTile, e: React.MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const rawX = e.clientX - rect.left + 14
    const rawY = e.clientY - rect.top + 14
    const maxX = Math.max(10, rect.width - 275)
    const maxY = Math.max(10, rect.height - 180)

    setTooltip({
      hex,
      x: Math.min(rawX, maxX),
      y: Math.min(rawY, maxY),
    })
  }, [])

  const handleHexLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, hex: null }))
  }, [])

  // Territory breakdown summary
  const territoryCounts = React.useMemo(() => {
    const counts: Record<Owner, number> = { Us: 0, 'Competitor A': 0, 'Competitor B': 0 }
    let rumored = 0
    let overlapped = 0
    tiles.forEach((t) => {
      if (counts[t.owner] !== undefined) counts[t.owner]++
      if (t.confidence === 'Rumored') rumored++
      if (t.overlappingOwners && t.overlappingOwners.length > 0) overlapped++
    })
    return { ...counts, rumored, overlapped, total: tiles.length }
  }, [tiles])

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 select-none overflow-hidden relative">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 backdrop-blur-sm border-b border-slate-800 z-10">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">Competitive Battle Map</h2>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-mono">
                Axial (Q, R)
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {territoryCounts.total} Market Sectors · {territoryCounts.overlapped} Overlapped ·{' '}
              {territoryCounts.rumored} in Fog of War
            </p>
          </div>
        </div>

        {/* Legend & Overlap Spotlight Toggle */}
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          {onToggleOverlapOnly && (
            <button
              type="button"
              aria-label="Toggle Feature Overlap"
              onClick={(e) => {
                e.stopPropagation()
                onToggleOverlapOnly()
              }}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-all cursor-pointer ${
                showOverlapOnly
                  ? 'bg-sky-600 text-white border-sky-400 shadow-sm shadow-sky-500/30 ring-1 ring-sky-400'
                  : 'bg-slate-800/90 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
              }`}
              title="Filter to spotlight features overlapped by both Us and competitors"
            >
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span>Feature Overlap ({territoryCounts.overlapped})</span>
            </button>
          )}

          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm" />
            <span>Us ({territoryCounts.Us})</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block shadow-sm" />
            <span>Competitor A ({territoryCounts['Competitor A']})</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block shadow-sm" />
            <span>Competitor B ({territoryCounts['Competitor B']})</span>
          </span>
          <span className="flex items-center gap-1.5 text-amber-300/90 pl-1 border-l border-slate-700">
            <span className="w-3 h-2 border border-dashed border-amber-400 bg-amber-400/30 rounded-xs inline-block" />
            <span>Fog of War</span>
          </span>
        </div>
      </div>

      {/* Main Interactive Map Canvas */}
      <div
        ref={containerRef}
        data-testid="battle-map-container"
        className="relative flex-1 w-full h-full bg-[#0a0f1d] cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onClick={onClearSelection}
      >
        {/* Subtle grid backdrop */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#334155" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-grid)" />
        </svg>

        {/* Primary Hex Grid SVG */}
        <svg
          className="w-full h-full"
          style={{
            touchAction: 'none',
          }}
        >
          <defs>
            {/* Split diagonal gradient: Us (Blue) + Competitor A (Orange) */}
            <linearGradient id="overlap-us-compa" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="49%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#ea580c" />
            </linearGradient>

            {/* Split diagonal gradient: Us (Blue) + Competitor B (Violet) */}
            <linearGradient id="overlap-us-compb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="49%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#7c3aed" />
            </linearGradient>

            {/* Split diagonal gradient: Competitor A + Competitor B */}
            <linearGradient id="overlap-compa-compb" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="49%" stopColor="#ea580c" />
              <stop offset="50%" stopColor="#7c3aed" />
            </linearGradient>

            {/* Tri-split gradient: Us + Competitor A + Competitor B */}
            <linearGradient id="overlap-all" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="32%" stopColor="#2563eb" />
              <stop offset="33%" stopColor="#ea580c" />
              <stop offset="66%" stopColor="#ea580c" />
              <stop offset="67%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>

          <g
            transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}
            className="transition-transform duration-75 ease-out"
          >
            {tiles.map((hex) => {
              const isSelected = selectedHexId === hex.hexId
              const isHighlighted =
                Boolean(selectedEpicId) && hex.associatedEpicId === selectedEpicId && !isSelected
              const isOverlapped = Boolean(hex.overlappingOwners && hex.overlappingOwners.length > 0)
              const hasActiveSelection = Boolean(selectedHexId || selectedEpicId)
              const isDimmed =
                (hasActiveSelection && !isSelected && !isHighlighted) ||
                (showOverlapOnly && !isOverlapped)

              return (
                <HexTileComponent
                  key={hex.hexId}
                  hex={hex}
                  isSelected={isSelected}
                  isHighlighted={isHighlighted}
                  isDimmed={isDimmed}
                  onClick={(h) => onSelectHex(h.hexId, h.associatedEpicId)}
                  onHover={handleHexHover}
                  onLeave={handleHexLeave}
                />
              )
            })}
          </g>
        </svg>

        {/* Floating Zoom & Controls Overlay */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute bottom-4 right-4 flex flex-col gap-1.5 bg-slate-800/90 backdrop-blur-md p-1.5 rounded-lg border border-slate-700/80 shadow-lg z-20"
        >
          <button
            type="button"
            onClick={zoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded transition-colors"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded transition-colors"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700/70 rounded transition-colors"
            title="Reset View"
            aria-label="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Floating Interactive Hover Tooltip */}
        {tooltip.hex && (
          <div
            className="absolute pointer-events-none z-30 w-64 bg-slate-900/95 backdrop-blur-md text-white rounded-lg border border-slate-700 p-3 shadow-2xl transition-all duration-75 text-left"
            style={{
              left: tooltip.x,
              top: tooltip.y,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-1 mb-1.5 pb-1.5 border-b border-slate-800">
              <span className="font-mono text-[10px] text-slate-400 font-semibold">
                {tooltip.hex.hexId} · ({tooltip.hex.q}, {tooltip.hex.r})
              </span>
              <span className="text-[10px] font-medium text-slate-400">
                {tooltip.hex.clusterName}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-xs font-bold text-slate-100 mb-2 leading-snug">
              {tooltip.hex.label}
            </h4>

            {/* Details Grid */}
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-slate-500" /> Owner:
                </span>
                <span
                  className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                    tooltip.hex.owner === 'Us'
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      : tooltip.hex.owner === 'Competitor A'
                        ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}
                >
                  {tooltip.hex.owner}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-500" /> Intel Confidence:
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-medium px-1.5 py-0.5 rounded text-[10px] ${
                    tooltip.hex.confidence === 'Confirmed'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {tooltip.hex.confidence === 'Confirmed' ? (
                    <CheckCircle className="w-2.5 h-2.5" />
                  ) : (
                    <HelpCircle className="w-2.5 h-2.5" />
                  )}
                  {tooltip.hex.confidence}
                </span>
              </div>

              {/* Overlap & Parity Analysis */}
              {tooltip.hex.overlappingOwners && tooltip.hex.overlappingOwners.length > 0 && (
                <div className="flex items-start justify-between gap-1 pt-1.5 border-t border-slate-800/80 bg-sky-950/40 p-1.5 rounded border border-sky-500/20">
                  <span className="text-sky-400 font-semibold flex items-center gap-1 shrink-0">
                    <Sparkles className="w-3 h-3 text-sky-400" /> Market Overlap:
                  </span>
                  <span className="text-sky-200 font-medium text-right">
                    Shared with {tooltip.hex.overlappingOwners.join(', ')}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Associated Jira Epic:</span>
                <span className="font-mono font-bold text-blue-400 text-[11px]">
                  {tooltip.hex.associatedEpicId}
                </span>
              </div>
            </div>

            <p className="mt-2 text-[10px] text-slate-400 italic">
              Click to navigate to Epic in Tech Tree →
            </p>
          </div>
        )}

        {/* Quick Hint bar at bottom left */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-slate-800">
          <Info className="w-3.5 h-3.5 text-blue-400" />
          <span>Click any hex to center and highlight associated Epic</span>
        </div>
      </div>
    </div>
  )
}
