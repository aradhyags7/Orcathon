import React, { useState, useEffect } from 'react'
import type { Alert } from '../types/api'
import { Bell, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react'

interface AlertDetailsProps {
  alerts: Alert[]
  currentStep?: number
  isCompleted?: boolean
}

export const AlertDetails: React.FC<AlertDetailsProps> = ({ alerts = [] }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0)

  // Automatically focus on the latest alert as it triggers in real time
  useEffect(() => {
    if (alerts.length > 0) {
      setCurrentIndex(alerts.length - 1)
    } else {
      setCurrentIndex(0)
    }
  }, [alerts.length])

  if (alerts.length === 0) {
    return (
      <div className="panel-card alert-details-card">
        <div className="panel-header-row">
          <div className="panel-title-group">
            <Bell size={16} className="panel-title-icon" />
            <h2 className="panel-title-text">Alert Details</h2>
          </div>
          <span className="panel-meta-tag">0 active</span>
        </div>
        <div className="empty-alert-state">
          <ShieldCheck size={32} className="text-emerald" style={{ opacity: 0.5, margin: '0 auto 8px auto' }} />
          <p>Zero decoy interactions detected.</p>
          <span style={{ fontSize: '0.72rem', color: '#888' }}>
            Canary tripwires are armed. Run the attack simulation to observe live alerts.
          </span>
        </div>
      </div>
    )
  }

  const currentAlert = alerts[currentIndex] || alerts[0]
  const total = alerts.length

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : total - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < total - 1 ? prev + 1 : 0))
  }

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

      {/* Alert Header Row: Severity Pill, Title, Time */}
      <div className="alert-header-highlight alert-pulse-reveal">
        <div className="alert-meta-left">
          <span className={`severity-tag tag-${currentAlert.severity}`}>
            <span className="severity-dot"></span>
            {currentAlert.severity.charAt(0).toUpperCase() + currentAlert.severity.slice(1)}
          </span>
          <h3 className="alert-main-title">{currentAlert.title}</h3>
        </div>
        <span className="alert-meta-time">
          {new Date(currentAlert.created_at).toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
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
      </div>
    </div>
  )
}
