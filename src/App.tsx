import { useMemo } from 'react'
import { Header } from './components/layout/Header'
import { BattleMapPane } from './components/battle-map/BattleMapPane'
import { TechTreePane } from './components/tech-tree/TechTreePane'
import { useStratMapStore } from './store/useStratMapStore'
import {
  internalExecutionData,
  marketIntelData,
  userSegmentsIntelData,
} from './data'
import { parseExecutionData, calculateHexLayout } from './utils/parsers'
import { layoutNodesAndEdges } from './utils/dagreLayout'

export function App() {
  const {
    activeDataset,
    selectedEpicId,
    selectedHexId,
    highlightedEpicId,
    setDataset,
    selectHex,
    selectEpic,
    clearSelection,
  } = useStratMapStore()

  // 1. Prepare Tech Tree DAG nodes & edges (hierarchical layout)
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const { nodes, edges } = parseExecutionData(internalExecutionData)
    return layoutNodesAndEdges(nodes, edges, 'TB')
  }, [])

  // 2. Select active Battle Map dataset according to dropdown selection
  const rawHexData = useMemo(() => {
    return activeDataset === 'feature-parity' ? marketIntelData : userSegmentsIntelData
  }, [activeDataset])

  // 3. Compute Hex layout coordinates and bounds
  const { tiles: calculatedHexTiles, bounds: hexBounds } = useMemo(() => {
    return calculateHexLayout(rawHexData, 54)
  }, [rawHexData])

  // 4. Compute linked hex counts for each Epic
  const linkedHexCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    rawHexData.forEach((hex) => {
      counts[hex.associatedEpicId] = (counts[hex.associatedEpicId] || 0) + 1
    })
    return counts
  }, [rawHexData])

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950">
      {/* 100% Width Top Navigation */}
      <Header
        activeDataset={activeDataset}
        onDatasetChange={setDataset}
        totalEpics={internalExecutionData.length}
        totalHexes={rawHexData.length}
      />

      {/* Main Dual-Pane 60/40 Horizontal Split Layout */}
      <main className="flex-1 flex flex-col lg:flex-row w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left Pane (60% width on desktop) — The Battle Map */}
        <section
          aria-label="Competitive Battle Map"
          className="h-1/2 lg:h-full w-full lg:w-[60%] flex flex-col relative z-10"
        >
          <BattleMapPane
            tiles={calculatedHexTiles}
            bounds={hexBounds}
            selectedHexId={selectedHexId}
            selectedEpicId={selectedEpicId}
            onSelectHex={selectHex}
            onClearSelection={clearSelection}
          />
        </section>

        {/* Right Pane (40% width on desktop) — The Tech Tree */}
        <section
          aria-label="Jira Tech Tree Execution"
          className="h-1/2 lg:h-full w-full lg:w-[40%] flex flex-col relative z-20"
        >
          <TechTreePane
            initialNodes={layoutedNodes}
            initialEdges={layoutedEdges}
            selectedEpicId={selectedEpicId}
            highlightedEpicId={highlightedEpicId}
            onSelectEpic={selectEpic}
            linkedHexCounts={linkedHexCounts}
          />
        </section>
      </main>
    </div>
  )
}

export default App
