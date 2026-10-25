import React from 'react'
import { Play, RotateCcw, AlertCircle, ShieldAlert } from 'lucide-react'

interface SimulationControlsProps {
  isLoading: boolean
  onRunSimulation: (scenarioId: string) => void
  onReset: () => void
  error?: string | null
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isLoading,
  onRunSimulation,
  onReset,
  error,
}) => {
  return (
    <div className="simulation-controls-wrapper">
      <div className="controls-card">
        <div className="controls-left">
          <div className="controls-label-group">
            <ShieldAlert size={20} className="text-cyan" />
            <div>
              <h3 className="controls-title">Cyber Attack Simulation Controller</h3>
              <p className="controls-desc">Trigger a safe, synthetic intrusion through enterprise subnet to verify canary tripwires</p>
            </div>
          </div>
        </div>

        <div className="controls-right">
          <button
            id="run-simulation-btn"
            className="btn btn-primary"
            onClick={() => onRunSimulation('credential_lateral_movement')}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                <span>Executing Infiltration...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Run Attack Simulation</span>
              </>
            )}
          </button>

          <button
            id="reset-demo-btn"
            className="btn btn-secondary"
            onClick={onReset}
            disabled={isLoading}
            title="Reset telemetry and restore clean network state"
          >
            <RotateCcw size={15} />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
