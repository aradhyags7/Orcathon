import React from 'react'
import type { Alert } from '../types/api'
import { AlertTriangle, ShieldCheck, Flame, Info, CheckCircle2 } from 'lucide-react'

interface AlertPanelProps {
  alerts: Alert[]
}

export const AlertPanel: React.FC<AlertPanelProps> = ({ alerts }) => {
  const getSeverityBadge = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="severity-pill pill-critical"><Flame size={12} /> CRITICAL</span>
      case 'high':
        return <span className="severity-pill pill-high"><AlertTriangle size={12} /> HIGH</span>
      case 'medium':
        return <span className="severity-pill pill-medium"><Info size={12} /> MEDIUM</span>
      default:
        return <span className="severity-pill pill-low"><Info size={12} /> LOW</span>
    }
  }

  return (
    <div className="panel-card alert-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Decoy Detection Alerts</h2>
          <p className="panel-subtitle">Instant high-fidelity detections triggered by canary tripwires</p>
        </div>
        <span className="count-tag">{alerts.length} Active</span>
      </div>

      <div className="alerts-scroll-area">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <ShieldCheck size={36} className="empty-icon text-emerald" />
            <p className="empty-title">Zero Decoy Interactions Detected</p>
            <p className="empty-sub">All canary files and honey-tokens remain untouched. Click "Run Attack Simulation" to test tripwires.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={`alert-card border-${alert.severity}`}>
              <div className="alert-card-top">
                <div className="alert-title-group">
                  {getSeverityBadge(alert.severity)}
                  <h3 className="alert-title">{alert.title}</h3>
                </div>
                <span className="alert-timestamp">{new Date(alert.created_at).toLocaleTimeString()}</span>
              </div>

              <p className="alert-desc">{alert.description}</p>

              <div className="asset-pivot-tags">
                <span className="pivot-tag">Source: <code>{alert.source_asset_id}</code></span>
                <span className="pivot-arrow">→</span>
                <span className="pivot-tag pivot-target">Decoy: <code>{alert.target_asset_id}</code></span>
              </div>

              {alert.evidence && alert.evidence.length > 0 && (
                <div className="alert-evidence-block">
                  <span className="evidence-header">Verified Forensics & Evidence:</span>
                  <ul className="evidence-list">
                    {alert.evidence.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {alert.recommended_actions && alert.recommended_actions.length > 0 && (
                <div className="alert-recommendations-block">
                  <span className="recommendation-header">Recommended Defensive Actions:</span>
                  <div className="recommendations-pills">
                    {alert.recommended_actions.map((action, idx) => (
                      <div key={idx} className="action-pill">
                        <CheckCircle2 size={13} className="action-icon" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
