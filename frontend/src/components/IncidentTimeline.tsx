import React from 'react'
import type { AttackPathStep, SecurityEvent } from '../types/api'
import { Clock, ShieldAlert, Terminal, FileCode, CheckCircle } from 'lucide-react'

interface IncidentTimelineProps {
  steps: AttackPathStep[]
  events: SecurityEvent[]
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ steps, events }) => {
  const eventMap = new Map<string, SecurityEvent>()
  events.forEach((e) => eventMap.set(e.id, e))

  return (
    <div className="panel-card timeline-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Reconstructed Attack Path Timeline</h2>
          <p className="panel-subtitle">Multi-hop chronological event sequence from initial access to decoy intercept</p>
        </div>
        <span className="count-tag">{steps.length} Milestones</span>
      </div>

      <div className="timeline-scroll-area">
        {steps.length === 0 ? (
          <div className="empty-state">
            <Clock size={36} className="empty-icon text-cyan" />
            <p className="empty-title">Awaiting Intrusion Telemetry</p>
            <p className="empty-sub">No lateral movement or attack milestones recorded yet. Run a simulation to reconstruct the timeline.</p>
          </div>
        ) : (
          <div className="timeline-tree">
            {steps.map((step, idx) => {
              const evt = eventMap.get(step.event_id)
              const isDecoy = evt?.is_decoy_interaction
              const isFirst = idx === 0
              const isLast = idx === steps.length - 1

              return (
                <div key={step.step} className="timeline-item">
                  <div className="timeline-track">
                    <div className={`timeline-node ${isDecoy ? 'node-tripwire' : isFirst ? 'node-ingress' : 'node-pivot'}`}>
                      {isDecoy ? <ShieldAlert size={14} /> : isFirst ? <Terminal size={14} /> : <FileCode size={14} />}
                    </div>
                    {!isLast && <div className="timeline-line"></div>}
                  </div>

                  <div className={`timeline-content-card ${isDecoy ? 'card-decoy-hit' : ''}`}>
                    <div className="timeline-step-header">
                      <div className="step-tag-row">
                        <span className="step-number">STEP {step.step}</span>
                        <span className="step-label">{step.label}</span>
                      </div>
                      <span className="step-time">
                        {new Date(step.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <div className="timeline-asset-focus">
                      <span className="asset-tag">Asset: <code>{step.asset_id}</code></span>
                      {evt && (
                        <span className={`event-type-pill pill-${evt.severity}`}>
                          {evt.event_type.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    {evt && (
                      <p className="timeline-event-msg">{evt.message}</p>
                    )}

                    {isDecoy && (
                      <div className="decoy-intercept-callout">
                        <CheckCircle size={13} className="text-emerald" />
                        <span>Canary trap triggered & alert emitted within 100ms</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
