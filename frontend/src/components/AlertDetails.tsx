import React, { useState, useEffect } from 'react'
import type { Alert } from '../types/api'
import { Bell, ChevronLeft, ChevronRight, ShieldCheck, ShieldAlert } from 'lucide-react'

interface AlertDetailsProps {
  alerts: Alert[]
  currentStep?: number
  stepTimestamps?: Record<number, string>
  isCompleted?: boolean
}

interface DecoyStatusItem {
  id: string
  name: string
  ip: string
  detail: string
  trippedStep: number
}

const DECOY_CONFIG: DecoyStatusItem[] = [
  {
    id: 'payroll',
    name: 'Payroll Records',
    ip: '10.0.0.30',
    detail: 'Fake .xlsx canary trap',
    trippedStep: 3,
  },
  {
    id: 'credentials',
    name: 'Admin Credentials',
    ip: '10.0.0.40',
    detail: 'Planted root credential decoy',
    trippedStep: 4,
  },
  {
    id: 'server',
    name: 'Decoy Server',
    ip: '10.0.0.50',
    detail: 'Isolated honeypot endpoint',
    trippedStep: 5,
  },
]

export const AlertDetails: React.FC<AlertDetailsProps> = ({
  alerts = [],
  currentStep = 6,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // Automatically focus on the latest alert as it triggers
  useEffect(() => {
    if (alerts.length > 0) {
      setCurrentIndex(alerts.length - 1)
    } else {
      setCurrentIndex(0)
    }
  }, [alerts.length])

  const total = alerts.length
  const currentAlert = alerts[currentIndex] || alerts[0]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
  }

  // Standby View when 0 alerts have triggered yet (before step 3)
  if (alerts.length === 0 || currentStep < 3) {
    return (
      <div className="panel-card alert-details-card">
        <div className="panel-header-row">
          <div className="panel-title-group">
            <Bell size={16} className="panel-title-icon" />
            <h2 className="panel-title-text">Alert Details</h2>
          </div>
          <span className="panel-meta-tag">0 Active Alerts</span>
        </div>

        {/* Compact Standby Decoy Status Section (Section 9) */}
        <div className="alert-standby-decoy-container">
          <div className="standby-banner">
            <ShieldCheck size={16} className="standby-shield" />
            <div className="standby-text">
              <span className="standby-title">3 Decoy Tripwires Armed</span>
              <span className="standby-sub">Subnet 10.0.0.0/24 • Zero Intruder Contact</span>
            </div>
          </div>

          <div className="decoy-status-list">
            {DECOY_CONFIG.map((decoy) => {
              const isTriggered = currentStep >= decoy.trippedStep
              return (
                <div key={decoy.id} className={`decoy-status-row ${isTriggered ? 'decoy-row-triggered' : ''}`}>
                  <div className="decoy-info-col">
                    <div className="decoy-name-line">
                      <span className="decoy-item-name">{decoy.name}</span>
                      <span className="decoy-item-ip">{decoy.ip}</span>
                    </div>
                    <span className="decoy-item-detail">{decoy.detail}</span>
                  </div>
                  <span className={`decoy-state-badge ${isTriggered ? 'badge-triggered' : 'badge-monitoring'}`}>
                    <span className="badge-dot"></span>
                    {isTriggered ? 'Triggered' : 'Monitoring'}
                  </span>
                </div>
              )
            })}
          </div>

          <p className="alert-empty-hint">
            Awaiting canary interaction. High-severity alerts and response playbooks will appear here automatically.
          </p>
        </div>
      </div>
    )
  }

  // Active Alert Inspector View (Section 6 & 9)
  return (
    <div className="panel-card alert-details-card">
      {/* Header with Title and Pagination Controls */}
      <div className="panel-header-row">
        <div className="panel-title-group">
          <Bell size={16} className="panel-title-icon" />
          <h2 className="panel-title-text">Alert Details</h2>
        </div>

        <div className="pagination-controls">
          <button
            type="button"
            className="pager-btn"
            onClick={handlePrev}
            aria-label="Previous alert"
            disabled={total <= 1}
          >
            <ChevronLeft size={14} />
          </button>
          <span className="pager-text">
            {currentIndex + 1} of {total}
          </span>
          <button
            type="button"
            className="pager-btn"
            onClick={handleNext}
            aria-label="Next alert"
            disabled={total <= 1}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Alert Header Row: Severity Pill, Title, Real-Time Time */}
      <div className="alert-header-highlight alert-pulse-reveal">
        <div className="alert-meta-left">
          <span className={`severity-tag tag-${currentAlert.severity}`}>
            <span className="severity-dot"></span>
            {currentAlert.severity.charAt(0).toUpperCase() + currentAlert.severity.slice(1)}
          </span>
          <h3 className="alert-main-title">{currentAlert.title}</h3>
        </div>
        <span className="alert-meta-time">
          {currentAlert.created_at}
        </span>
      </div>

      {/* Key-Value Breakdown Table */}
      <div className="alert-fields-grid">
        <div className="field-row">
          <span className="field-label">Source</span>
          <span className="field-value">
            {currentAlert.source_label || currentAlert.source_asset_id}
          </span>
        </div>

        <div className="field-row">
          <span className="field-label">Target</span>
          <span className="field-value target-highlight">
            {currentAlert.target_label || currentAlert.target_asset_id}
          </span>
        </div>

        <div className="field-row">
          <span className="field-label">Event Type</span>
          <span className="field-value">{currentAlert.event_type || 'File Access'}</span>
        </div>

        <div className="field-row">
          <span className="field-label">Reason</span>
          <span className="field-value">{currentAlert.reason || currentAlert.description}</span>
        </div>

        {/* Evidence Block */}
        <div className="field-row vertical-field">
          <span className="field-label">Evidence</span>
          <ul className="evidence-bullet-list">
            {currentAlert.evidence && currentAlert.evidence.length > 0 ? (
              currentAlert.evidence.map((ev, i) => (
                <li key={i}>{ev}</li>
              ))
            ) : (
              <li>Monitored canary decoy triggered</li>
            )}
          </ul>
        </div>

        {/* Recommended Actions Block */}
        <div className="field-row vertical-field">
          <span className="field-label">Recommended Actions</span>
          <ul className="evidence-bullet-list">
            {currentAlert.recommended_actions && currentAlert.recommended_actions.length > 0 ? (
              currentAlert.recommended_actions.map((act, i) => (
                <li key={i}>{act}</li>
              ))
            ) : (
              <li>Isolate affected host and review access logs</li>
            )}
          </ul>
        </div>

        {/* Compact Monitored Decoy Tripwires Status Strip (Section 9) */}
        <div className="compact-decoys-footer">
          <span className="compact-decoys-title">Monitored Decoy Tripwires</span>
          <div className="compact-decoys-pills">
            {DECOY_CONFIG.map((d) => {
              const isTriggered = currentStep >= d.trippedStep
              return (
                <div key={d.id} className={`decoy-pill-item ${isTriggered ? 'pill-tripped' : 'pill-active'}`}>
                  {isTriggered ? (
                    <ShieldAlert size={11} className="decoy-pill-icon alert-icon" />
                  ) : (
                    <ShieldCheck size={11} className="decoy-pill-icon safe-icon" />
                  )}
                  <span className="decoy-pill-name">{d.name} ({d.ip}):</span>
                  <span className="decoy-pill-status">{isTriggered ? 'Triggered' : 'Monitoring'}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
