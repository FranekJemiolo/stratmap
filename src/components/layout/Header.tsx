import React from 'react'
import type { DatasetView } from '../../types'
import {
  Compass,
  ChevronDown,
  Layers,
  Users,
  Sparkles,
} from 'lucide-react'

interface HeaderProps {
  activeDataset: DatasetView
  onDatasetChange: (dataset: DatasetView) => void
  totalEpics: number
  totalHexes: number
}

export const Header: React.FC<HeaderProps> = ({
  activeDataset,
  onDatasetChange,
  totalEpics,
  totalHexes,
}) => {
  return (
    <header className="h-14 w-full bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-white select-none z-30 shrink-0">
      {/* Brand & Sync Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20 border border-blue-400/30">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-tight text-white">StratMap</h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">
                Strategic Cockpit
              </span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800 text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span>Last synced: <strong className="text-slate-200 font-medium">Today</strong></span>
        </div>
      </div>

      {/* Center Dataset View Switcher Dropdown */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center">
          <label htmlFor="dataset-view-select" className="sr-only">
            Select Intelligence View
          </label>
          <div className="relative inline-block">
            <select
              id="dataset-view-select"
              value={activeDataset}
              onChange={(e) => onDatasetChange(e.target.value as DatasetView)}
              className="appearance-none bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium pl-8 pr-8 py-1.5 rounded-lg border border-slate-700 hover:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-blue-500/50 cursor-pointer transition-all shadow-xs"
            >
              <option value="feature-parity">Feature Parity (Competitor Matrix)</option>
              <option value="user-segments">User Segments (Enterprise Target Sectors)</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-blue-400">
              {activeDataset === 'feature-parity' ? (
                <Layers className="w-3.5 h-3.5" />
              ) : (
                <Users className="w-3.5 h-3.5" />
              )}
            </div>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-md border border-slate-700/50">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>
            {totalHexes} Hexes · {totalEpics} Epics
          </span>
        </div>
      </div>

      {/* GitHub Actions / Source links */}
      <div className="flex items-center gap-3">
        <a
          href="https://github.com/FranekJemiolo/stratmap"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-700 transition-colors"
          title="View source on GitHub"
        >
          <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
          <span className="hidden sm:inline">FranekJemiolo/stratmap</span>
        </a>
      </div>
    </header>
  )
}
