import React, { useState, useEffect } from 'react'
import { Radio } from 'lucide-react'

interface CanaryTrapsPanelProps {
  currentStep?: number
  stepTimestamps?: Record<number, string>
}

export const CanaryTrapsPanel: React.FC<CanaryTrapsPanelProps> = ({
  currentStep = 0,
  stepTimestamps = {},
}) => {
  const [liveClock, setLiveClock] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(
        new Date().toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      )
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const isPayrollTripped = currentStep >= 3
  const isCredentialsTripped = currentStep >= 4
  const isServerTripped = currentStep >= 5
  const isAnyTripped = isPayrollTripped || isCredentialsTripped || isServerTripped

  const displayTime = isAnyTripped
    ? (stepTimestamps[3] || liveClock)
    : liveClock

  return (
    <div className="panel-card canary-traps-card">
      {/* Header Row */}
      <div className="panel-header-row" style={{ marginBottom: '8px' }}>
        <div className="panel-title-group">
          <Radio size={15} className="panel-title-icon" style={{ color: isAnyTripped ? '#DC2626' : '#16A34A' }} />
          <h2 className="panel-title-text" style={{ fontSize: '0.88rem' }}>Decoy Tripwires</h2>
        </div>
        <span className={`panel-meta-tag ${isAnyTripped ? 'tag-meta-alerted' : ''}`}>
          {isAnyTripped ? 'Tripwires Tripped' : 'Canaries Armed'}
        </span>
      </div>

      {/* Status Bar */}
      <div className="canary-status-bar">
        <div className="canary-status-left">
          <span className={`severity-tag ${isAnyTripped ? 'tag-high' : 'tag-info'}`}>
            <span className="severity-dot"></span>
            {isAnyTripped ? 'Alert' : 'Armed'}
          </span>
          <span className="canary-active-title">
            {isAnyTripped ? 'Active Decoy Contact' : 'Decoy Tripwires Active'}
          </span>
        </div>
        <span className="canary-meta-time">{displayTime}</span>
      </div>

      {/* Monitoring Specs */}
      <div className="canary-specs-list">
        <div className="canary-spec-row">
          <span className="spec-label">Monitoring</span>
          <span className="spec-val">Internal Subnet 10.0.0.0/24</span>
        </div>
        <div className="canary-spec-row">
          <span className="spec-label">Canary Assets</span>
          <span className="spec-val target-highlight">3 Monitored Decoys (Files, Creds, Server)</span>
        </div>
        <div className="canary-spec-row">
          <span className="spec-label">Status</span>
          <span className="spec-val" style={{ color: isAnyTripped ? '#B91C1C' : '#15803D', fontWeight: 600 }}>
            {isAnyTripped ? 'Intruder Contact Detected' : 'Armed • Zero Intruder Contact'}
          </span>
        </div>
      </div>

      {/* Monitored Trap Endpoints */}
      <div className="canary-endpoints-section">
        <span className="endpoints-header-label">Monitored Trap Endpoints</span>
        <ul className="canary-endpoints-list">
          <li className={`canary-endpoint-item ${isPayrollTripped ? 'item-tripped' : ''}`}>
            <div className="endpoint-item-top">
              <span className="endpoint-name">Payroll Records</span>
              <span className={`endpoint-status-pill ${isPayrollTripped ? 'pill-tripped' : 'pill-armed'}`}>
                {isPayrollTripped ? 'TRIPPED' : 'ARMED'}
              </span>
            </div>
            <span className="endpoint-detail">10.0.0.30 <code>(fake .xlsx canary)</code></span>
          </li>

          <li className={`canary-endpoint-item ${isCredentialsTripped ? 'item-tripped' : ''}`}>
            <div className="endpoint-item-top">
              <span className="endpoint-name">Admin Credentials</span>
              <span className={`endpoint-status-pill ${isCredentialsTripped ? 'pill-tripped' : 'pill-armed'}`}>
                {isCredentialsTripped ? 'TRIPPED' : 'ARMED'}
              </span>
            </div>
            <span className="endpoint-detail">10.0.0.40 <code>(decoy root key)</code></span>
          </li>

          <li className={`canary-endpoint-item ${isServerTripped ? 'item-tripped' : ''}`}>
            <div className="endpoint-item-top">
              <span className="endpoint-name">Decoy Server</span>
              <span className={`endpoint-status-pill ${isServerTripped ? 'pill-tripped' : 'pill-armed'}`}>
                {isServerTripped ? 'TRIPPED' : 'ARMED'}
              </span>
            </div>
            <span className="endpoint-detail">10.0.0.50 <code>(honeypot node)</code></span>
          </li>
        </ul>
      </div>
    </div>
  )
}
