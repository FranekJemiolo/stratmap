import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HexTileComponent } from '../components/battle-map/HexTileComponent'
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
