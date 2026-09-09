import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReactFlowProvider } from '@xyflow/react'
import { EpicNode } from '../components/tech-tree/EpicNode'
import type { EpicFlowNode } from '../types'

function renderWithProvider(ui: React.ReactElement) {
  return render(<ReactFlowProvider>{ui}</ReactFlowProvider>)
}

// Helper to create mock EpicFlowNode props
function createMockNodeProps(overrides: Partial<EpicFlowNode['data']> = {}) {
  const node: EpicFlowNode = {
    id: 'PROJ-101',
    type: 'epic',
    position: { x: 0, y: 0 },
    data: {
      id: 'PROJ-101',
      label: 'Core Identity & Auth System',
      progress: 100,
      status: 'Done',
      blocks: ['PROJ-102'],
      accelerates: ['PROJ-104'],
      isHighlighted: false,
      isDimmed: false,
      isSelected: false,
      linkedHexCount: 2,
      ...overrides,
    },
  }

  return {
    id: node.id,
    data: node.data,
    type: 'epic' as const,
    selected: false,
    zIndex: 1,
    isConnectable: true,
    positionAbsoluteX: 0,
    positionAbsoluteY: 0,
    dragging: false,
  }
}

describe('EpicNode Component', () => {
  it('renders node ID, label, and progress properly', () => {
    const props = createMockNodeProps({
      id: 'PROJ-101',
      label: 'Core Identity & Auth System',
      progress: 100,
      status: 'Done',
    })

    renderWithProvider(<EpicNode {...props} />)

    expect(screen.getByText('PROJ-101')).toBeInTheDocument()
    expect(screen.getByText('Core Identity & Auth System')).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
    expect(screen.getByText('Unlocked')).toBeInTheDocument()
  })

  it('renders "Locked" status when progress is 0', () => {
    const props = createMockNodeProps({
      id: 'PROJ-111',
      label: 'Predictive Anomaly Detection',
      progress: 0,
      status: 'To Do',
    })

    renderWithProvider(<EpicNode {...props} />)

    expect(screen.getByText('PROJ-111')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('renders "In Progress" status when progress is between 1 and 99', () => {
    const props = createMockNodeProps({
      id: 'PROJ-104',
      label: 'Unified Event Pipeline',
      progress: 85,
      status: 'In Progress',
    })

    renderWithProvider(<EpicNode {...props} />)

    expect(screen.getByText('PROJ-104')).toBeInTheDocument()
    expect(screen.getByText('85%')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
  })

  it('applies dimmed styling when isDimmed is true', () => {
    const props = createMockNodeProps({
      isDimmed: true,
    })

    const { container } = renderWithProvider(<EpicNode {...props} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('opacity-35')
  })

  it('applies selected ring styling when isSelected is true', () => {
    const props = createMockNodeProps({
      isSelected: true,
    })

    const { container } = renderWithProvider(<EpicNode {...props} />)
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('border-blue-600')
    expect(card.className).toContain('ring-2')
  })

  it('renders linked territory count badge', () => {
    const props = createMockNodeProps({
      linkedHexCount: 3,
    })

    renderWithProvider(<EpicNode {...props} />)
    expect(screen.getByText('3 territories')).toBeInTheDocument()
  })
})
