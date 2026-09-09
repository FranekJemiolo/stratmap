import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HexTileComponent } from '../components/battle-map/HexTileComponent'
import { BattleMapPane } from '../components/battle-map/BattleMapPane'
import { calculateHexLayout } from '../utils/parsers'
import type { RawHexTile } from '../types'

const mockConfirmedHex: RawHexTile = {
  hexId: 'HEX-01',
  label: 'Identity Federation',
  q: 0,
  r: 0,
  clusterName: 'Identity & Access',
  associatedEpicId: 'PROJ-101',
  owner: 'Us',
  status: 'Captured',
  confidence: 'Confirmed',
}

const mockRumoredHex: RawHexTile = {
  hexId: 'HEX-08',
  label: 'Stream Deduplication',
  q: 3,
  r: -1,
  clusterName: 'Data Infrastructure',
  associatedEpicId: 'PROJ-110',
  owner: 'Competitor A',
  status: 'In Progress',
  confidence: 'Rumored',
}

describe('HexTileComponent & Battle Map Logic', () => {
  it('renders confirmed hex tile with solid stroke and high fill opacity', () => {
    const { tiles } = calculateHexLayout([mockConfirmedHex])
    const hex = tiles[0]

    const handleClick = vi.fn()
    const handleHover = vi.fn()
    const handleLeave = vi.fn()

    const { container } = render(
      <svg>
        <HexTileComponent
          hex={hex}
          isSelected={false}
          isHighlighted={false}
          isDimmed={false}
          onClick={handleClick}
          onHover={handleHover}
          onLeave={handleLeave}
        />
      </svg>
    )

    expect(screen.getByText('Identity Fede…')).toBeInTheDocument()
    expect(screen.getByText('PROJ-101')).toBeInTheDocument()

    const polygon = container.querySelector('polygon')
    expect(polygon).toBeInTheDocument()
    expect(polygon?.getAttribute('stroke-dasharray')).toBe('none')
    expect(polygon?.getAttribute('fill-opacity')).toBe('0.85')
  })

  it('renders rumored hex with dashed border and 50% opacity (Fog of War rule)', () => {
    const { tiles } = calculateHexLayout([mockRumoredHex])
    const hex = tiles[0]

    const { container } = render(
      <svg>
        <HexTileComponent
          hex={hex}
          isSelected={false}
          isHighlighted={false}
          isDimmed={false}
          onClick={vi.fn()}
          onHover={vi.fn()}
          onLeave={vi.fn()}
        />
      </svg>
    )

    expect(screen.getByText('[RUMORED]')).toBeInTheDocument()

    const polygon = container.querySelector('polygon')
    expect(polygon).toBeInTheDocument()
    expect(polygon?.getAttribute('stroke-dasharray')).toBe('4 3')
    expect(polygon?.getAttribute('fill-opacity')).toBe('0.5')
  })

  it('triggers onClick callback with the selected hex when clicked', () => {
    const { tiles } = calculateHexLayout([mockConfirmedHex])
    const hex = tiles[0]
    const handleClick = vi.fn()

    render(
      <svg>
        <HexTileComponent
          hex={hex}
          isSelected={false}
          isHighlighted={false}
          isDimmed={false}
          onClick={handleClick}
          onHover={vi.fn()}
          onLeave={vi.fn()}
        />
      </svg>
    )

    const group = screen.getByTestId('hex-tile-HEX-01')
    fireEvent.click(group)

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(hex)
  })

  it('applies dimmed opacity when isDimmed is true', () => {
    const { tiles } = calculateHexLayout([mockConfirmedHex])
    const hex = tiles[0]

    render(
      <svg>
        <HexTileComponent
          hex={hex}
          isSelected={false}
          isHighlighted={false}
          isDimmed={true}
          onClick={vi.fn()}
          onHover={vi.fn()}
          onLeave={vi.fn()}
        />
      </svg>
    )

    const group = screen.getByTestId('hex-tile-HEX-01')
    expect(group.getAttribute('opacity')).toBe('0.22')
  })
})

describe('BattleMapPane Component', () => {
  it('renders battle map container, controls, and breakdown counts', () => {
    const { tiles, bounds } = calculateHexLayout([mockConfirmedHex, mockRumoredHex])
    const handleSelectHex = vi.fn()
    const handleClearSelection = vi.fn()

    render(
      <BattleMapPane
        tiles={tiles}
        bounds={bounds}
        selectedHexId={null}
        selectedEpicId={null}
        onSelectHex={handleSelectHex}
        onClearSelection={handleClearSelection}
      />
    )

    expect(screen.getByText('Competitive Battle Map')).toBeInTheDocument()
    expect(screen.getByText(/2 Market Sectors/i)).toBeInTheDocument()
    expect(screen.getByText(/1 in Fog of War/i)).toBeInTheDocument()

    // Test Zoom controls
    const zoomInBtn = screen.getByLabelText('Zoom In')
    const zoomOutBtn = screen.getByLabelText('Zoom Out')
    const resetBtn = screen.getByLabelText('Reset View')

    expect(zoomInBtn).toBeInTheDocument()
    expect(zoomOutBtn).toBeInTheDocument()
    expect(resetBtn).toBeInTheDocument()

    fireEvent.click(zoomInBtn)
    fireEvent.click(zoomOutBtn)
    fireEvent.click(resetBtn)

    // Test Hex Click
    const hexTile = screen.getByTestId('hex-tile-HEX-01')
    fireEvent.click(hexTile)
    expect(handleSelectHex).toHaveBeenCalledWith('HEX-01', 'PROJ-101')

    // Test Canvas background click to clear
    const container = screen.getByTestId('battle-map-container')
    fireEvent.click(container)
    expect(handleClearSelection).toHaveBeenCalledTimes(1)
  })

  it('renders overlapping hex with split gradient fill and OVERLAP badge', () => {
    const overlappingHex: RawHexTile = {
      hexId: 'HEX-01',
      label: 'Identity Federation',
      q: 0,
      r: 0,
      clusterName: 'Identity & Access',
      associatedEpicId: 'PROJ-101',
      owner: 'Us',
      status: 'Captured',
      confidence: 'Confirmed',
      overlappingOwners: ['Competitor A'],
    }

    const { tiles } = calculateHexLayout([overlappingHex])
    const hex = tiles[0]

    const { container } = render(
      <svg>
        <HexTileComponent
          hex={hex}
          isSelected={false}
          isHighlighted={false}
          isDimmed={false}
          onClick={vi.fn()}
          onHover={vi.fn()}
          onLeave={vi.fn()}
        />
      </svg>
    )

    expect(screen.getByText('OVERLAP')).toBeInTheDocument()
    const polygon = container.querySelector('polygon')
    expect(polygon?.getAttribute('fill')).toBe('url(#overlap-us-compa)')
  })

  it('dims non-overlapping hexes when showOverlapOnly is active', () => {
    const overlappingHex: RawHexTile = {
      hexId: 'HEX-01',
      label: 'Identity Federation',
      q: 0,
      r: 0,
      clusterName: 'Identity & Access',
      associatedEpicId: 'PROJ-101',
      owner: 'Us',
      status: 'Captured',
      confidence: 'Confirmed',
      overlappingOwners: ['Competitor A'],
    }

    const exclusiveHex: RawHexTile = {
      hexId: 'HEX-02',
      label: 'MFA & Passwordless',
      q: 1,
      r: -1,
      clusterName: 'Identity & Access',
      associatedEpicId: 'PROJ-101',
      owner: 'Us',
      status: 'Captured',
      confidence: 'Confirmed',
    }

    const { tiles, bounds } = calculateHexLayout([overlappingHex, exclusiveHex])
    const handleToggle = vi.fn()

    render(
      <BattleMapPane
        tiles={tiles}
        bounds={bounds}
        selectedHexId={null}
        selectedEpicId={null}
        showOverlapOnly={true}
        onToggleOverlapOnly={handleToggle}
        onSelectHex={vi.fn()}
        onClearSelection={vi.fn()}
      />
    )

    // Overlapping hex should NOT be dimmed
    const overlapTile = screen.getByTestId('hex-tile-HEX-01')
    expect(overlapTile.getAttribute('opacity')).toBe('1')

    // Exclusive hex SHOULD be dimmed
    const exclusiveTile = screen.getByTestId('hex-tile-HEX-02')
    expect(exclusiveTile.getAttribute('opacity')).toBe('0.22')

    // Test toggle button click
    const toggleBtn = screen.getByLabelText('Toggle Feature Overlap')
    fireEvent.click(toggleBtn)
    expect(handleToggle).toHaveBeenCalledTimes(1)
  })
})


