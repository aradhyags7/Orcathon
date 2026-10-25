import React, { useState, useEffect } from 'react'
import { Radio, ShieldCheck, ShieldAlert } from 'lucide-react'

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
      <div className="panel-header-row">
        <div className="panel-title-group">
          <Radio size={15} className="panel-title-icon" style={{ color: isAnyTripped ? '#DC2626' : '#16A34A' }} />
          <h2 className="panel-title-text">Decoy Tripwires</h2>
        </div>
        <span className={`panel-meta-tag ${isAnyTripped ? 'tag-meta-alerted' : ''}`}>
          {isAnyTripped ? 'Tripwires Sprung' : '3 Canaries Armed'}
        </span>
      </div>

      {/* Subnet & Status Banner */}
      <div className="canary-status-bar">
        <div className="canary-status-left">
          {isAnyTripped ? (
            <ShieldAlert size={14} className="safe-icon-alert" />
          ) : (
            <ShieldCheck size={14} className="safe-icon-green" />
          )}
          <span className="canary-active-title">
            {isAnyTripped ? 'Intruder Contact Detected' : 'Perimeter Armed • Zero Contact'}
          </span>
        </div>
        <span className="canary-meta-time">{displayTime}</span>
      </div>

      {/* Subnet Meta Line */}
      <div className="canary-subnet-meta">
        <span className="subnet-label">Monitored Subnet:</span>
        <span className="subnet-code">10.0.0.0/24</span>
        <span className="subnet-sep">•</span>
        <span className="subnet-note">Automated Alerting</span>
      </div>

      {/* 3 Configured Decoy Assets (Section 6) */}
      <div className="canary-endpoints-section">
        <ul className="canary-endpoints-list">
          {/* Decoy 1: Payroll Records (10.0.0.30) */}
          <li className={`canary-endpoint-item ${isPayrollTripped ? 'item-tripped' : ''}`}>
            <div className="endpoint-item-top">
              <span className="endpoint-name">Payroll Records</span>
              <span className={`endpoint-status-pill ${isPayrollTripped ? 'pill-tripped' : 'pill-monitoring'}`}>
                <span className="pill-dot"></span>
                {isPayrollTripped ? 'Triggered' : 'Monitoring'}
              </span>
            </div>
            <div className="endpoint-item-bottom">
              <span className="endpoint-ip">10.0.0.30</span>
              <span className="endpoint-desc">fake .xlsx canary trap</span>
            </div>
          </li>

          {/* Decoy 2: Admin Credentials (10.0.0.40) */}
          <li className={`canary-endpoint-item ${isCredentialsTripped ? 'item-tripped' : ''}`}>
            <div className="endpoint-item-top">
              <span className="endpoint-name">Admin Credentials</span>
              <span className={`endpoint-status-pill ${isCredentialsTripped ? 'pill-tripped' : 'pill-monitoring'}`}>
                <span className="pill-dot"></span>
                {isCredentialsTripped ? 'Triggered' : 'Monitoring'}
              </span>
            </div>
            <div className="endpoint-item-bottom">
              <span className="endpoint-ip">10.0.0.40</span>
              <span className="endpoint-desc">planted decoy root key</span>
            </div>
          </li>

          {/* Decoy 3: Decoy Server (10.0.0.50) */}
          <li className={`canary-endpoint-item ${isServerTripped ? 'item-tripped' : ''}`}>
            <div className="endpoint-item-top">
              <span className="endpoint-name">Decoy Server</span>
              <span className={`endpoint-status-pill ${isServerTripped ? 'pill-tripped' : 'pill-monitoring'}`}>
                <span className="pill-dot"></span>
                {isServerTripped ? 'Triggered' : 'Monitoring'}
              </span>
            </div>
            <div className="endpoint-item-bottom">
              <span className="endpoint-ip">10.0.0.50</span>
              <span className="endpoint-desc">isolated honeypot node</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
