import React, { useState, useEffect } from 'react'
import type { Alert } from '../types/api'
import { Bell, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'

interface AlertDetailsProps {
  alerts: Alert[]
  currentStep?: number
  stepTimestamps?: Record<number, string>
  isCompleted?: boolean
}

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

        <div className="alert-standby-placeholder">
          <div className="standby-icon-circle">
            <ShieldCheck size={28} className="standby-glyph-green" />
          </div>
          <h3 className="standby-headline">No Alerts Triggered</h3>
          <p className="standby-desc">
            Decoy tripwires are armed and monitoring internal subnet <code>10.0.0.0/24</code>.
          </p>
          <div className="standby-notice-pill">
            <span className="notice-dot-green"></span>
            <span>Awaiting Canary Asset Interaction</span>
          </div>
          <span className="standby-footnote">
            High-severity forensic alerts and automated mitigations will appear here in real time when an intruder accesses a decoy.
          </span>
        </div>
      </div>
    )
  }

  // Active Alert Inspector View (Section 7)
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
            <ChevronLeft size={13} />
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
            <ChevronRight size={13} />
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
          <span className="field-value">{currentAlert.event_type || 'Decoy Asset Touch'}</span>
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
          <ul className="evidence-bullet-list action-bullet-list">
            {currentAlert.recommended_actions && currentAlert.recommended_actions.length > 0 ? (
              currentAlert.recommended_actions.map((act, i) => (
                <li key={i}>{act}</li>
              ))
            ) : (
              <li>Isolate affected host and review access logs</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
