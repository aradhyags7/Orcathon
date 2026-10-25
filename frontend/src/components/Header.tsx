import React from 'react'
import { Play, RotateCcw } from 'lucide-react'

interface HeaderProps {
  backendAvailable: boolean
  isSimulating: boolean
  simulationId?: string
  onRunSimulation: () => void
  onReset: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isSimulating,
  simulationId = 'sim-001',
  onRunSimulation,
  onReset,
}) => {
  return (
    <header className="top-header-bar">
      <div className="header-meta-group">
        <div className="env-pill">
          <span className="env-dot"></span>
          <span className="env-text">Simulation Environment</span>
        </div>

        <div className="header-telemetry-text">
          <span className="telemetry-time">Oct 25, 2026 10:24:18 AM (UTC)</span>
          <span className="telemetry-id">Simulation ID: {simulationId}</span>
        </div>
      </div>

      <div className="header-actions">
        <button
          id="reset-demo-btn"
          type="button"
          className="btn-header btn-header-reset"
          onClick={onReset}
          disabled={isSimulating}
          title="Reset simulation telemetry to baseline"
        >
          <RotateCcw size={15} strokeWidth={2.2} />
          <span>Reset Demo</span>
        </button>

        <button
          id="run-simulation-btn"
          type="button"
          className="btn-header btn-header-run"
          onClick={onRunSimulation}
          disabled={isSimulating}
        >
          {isSimulating ? (
            <>
              <span className="btn-spinner"></span>
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play size={14} fill="currentColor" />
              <span>Run Attack Simulation</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
