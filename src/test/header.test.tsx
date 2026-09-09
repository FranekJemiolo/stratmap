import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Header } from '../components/layout/Header'

describe('Header Component', () => {
  it('renders title, sync status, and counters', () => {
    render(
      <Header
        activeDataset="feature-parity"
        onDatasetChange={vi.fn()}
        totalEpics={18}
        totalHexes={24}
      />
    )

    expect(screen.getByText('StratMap')).toBeInTheDocument()
    expect(screen.getByText('Strategic Cockpit')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()
    expect(screen.getByText('24 Hexes · 18 Epics')).toBeInTheDocument()
  })

  it('triggers onDatasetChange when user toggles view', () => {
    const handleDatasetChange = vi.fn()
    render(
      <Header
        activeDataset="feature-parity"
        onDatasetChange={handleDatasetChange}
        totalEpics={18}
        totalHexes={24}
      />
    )

    const select = screen.getByLabelText(/Select Intelligence View/i)
    fireEvent.change(select, { target: { value: 'user-segments' } })

    expect(handleDatasetChange).toHaveBeenCalledTimes(1)
    expect(handleDatasetChange).toHaveBeenCalledWith('user-segments')
  })
})
