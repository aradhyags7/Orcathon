import React, { useState, useEffect } from 'react'
import { Play, RotateCcw, Download } from 'lucide-react'

interface HeaderProps {
  backendAvailable: boolean
  isSimulating: boolean
  simulationId?: string
  onRunSimulation: () => void
  onReset: () => void
  onExportCsv?: () => void
}

export const Header: React.FC<HeaderProps> = ({
  isSimulating,
  simulationId = 'sim-001',
  onRunSimulation,
  onReset,
  onExportCsv,
}) => {
  // Live ticking clock for header telemetry
  const [liveClock, setLiveClock] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-US', {
      timeZone: 'UTC',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'UTC',
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const todayStr = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

  return (
    <header className="top-header-bar">
      <div className="header-meta-group">
        <div className="env-pill">
          <span className="env-dot"></span>
          <span className="env-text">Simulation Environment</span>
        </div>

        <div className="header-telemetry-text">
          <span className="telemetry-time">{todayStr} {liveClock} (UTC)</span>
          <span className="telemetry-id">Simulation ID: {simulationId}</span>
        </div>
      </div>

      <div className="header-actions">
        {/* Download CSV Report Button */}
        <button
          id="export-csv-btn"
          type="button"
          className="btn-header btn-header-csv"
          onClick={onExportCsv}
          title="Download incident investigation report in CSV format"
        >
          <Download size={14} strokeWidth={2.2} />
          <span>Export CSV</span>
        </button>

        <button
          id="reset-demo-btn"
          type="button"
          className="btn-header btn-header-reset"
          onClick={onReset}
          disabled={isSimulating}
          title="Reset simulation telemetry to baseline"
        >
          <RotateCcw size={14} strokeWidth={2.2} />
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
