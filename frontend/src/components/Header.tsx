import React from 'react'
import { ShieldAlert, Radio, Activity } from 'lucide-react'

interface HeaderProps {
  backendAvailable: boolean
  isSimulating: boolean
  simulationId?: string
}

export const Header: React.FC<HeaderProps> = ({
  backendAvailable,
  isSimulating,
  simulationId,
}) => {
  return (
    <header className="header-container">
      <div className="header-brand">
        <div className="brand-logo-glow">
          <ShieldAlert className="brand-icon" size={28} />
        </div>
        <div>
          <div className="brand-title-row">
            <h1 className="brand-title">DeceptiTrace</h1>
            <span className="brand-badge">ORCATHON TRACK 3</span>
            <span className="brand-prize-badge">ADAPTION READY</span>
          </div>
          <p className="brand-subtitle">
            Cyber Deception Telemetry & Multi-Hop Attack Path Reconstruction
          </p>
        </div>
      </div>

      <div className="header-meta">
        <div className={`status-pill ${backendAvailable ? 'status-online' : 'status-mock'}`}>
          <Radio size={14} className={backendAvailable ? 'pulse-icon' : ''} />
          <span>{backendAvailable ? 'API Connected (Port 8000)' : 'Mock Engine Active'}</span>
        </div>

        {simulationId && (
          <div className="simulation-session-tag">
            <Activity size={14} />
            <span>SESSION: <strong>{simulationId}</strong></span>
          </div>
        )}

        {isSimulating && (
          <div className="live-sim-badge">
            <span className="radar-ping"></span>
            Simulating Infiltration...
          </div>
        )}
      </div>
    </header>
  )
}
