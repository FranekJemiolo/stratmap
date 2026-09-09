import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { App } from '../App'

describe('StratMap Full Dashboard App', () => {
  it('renders header, battle map section, and tech tree section', () => {
    render(<App />)

    // Check Header
    expect(screen.getByText('StratMap')).toBeInTheDocument()
    expect(screen.getByText('Today')).toBeInTheDocument()

    // Check Dual-Pane Sections
    expect(screen.getByRole('region', { name: /Competitive Battle Map/i })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: /Jira Tech Tree Execution/i })).toBeInTheDocument()

    // Check Dataset View Switcher
    const select = screen.getByLabelText(/Select Intelligence View/i)
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('feature-parity')
  })

  it('switches dataset views and updates active hex counts', () => {
    render(<App />)

    const select = screen.getByLabelText(/Select Intelligence View/i)
    // Feature parity has 24 hexes
    expect(screen.getByText('24 Hexes · 18 Epics')).toBeInTheDocument()

    // Switch to user segments (21 hexes)
    fireEvent.change(select, { target: { value: 'user-segments' } })
    expect(screen.getByText('21 Hexes · 18 Epics')).toBeInTheDocument()
  })
})

