import React from 'react'
import type { SecurityEvent } from '../types/api'
import { Clock, ShieldAlert } from 'lucide-react'

interface IncidentTimelineProps {
  events?: SecurityEvent[]
  currentStep?: number
  isCompleted?: boolean
  selectedEventId?: string
  onSelectEvent?: (eventId: string) => void
}

interface TimelineItem {
  id: string
  time: string
  title: string
  desc: string
  dotColor: string
  severityLabel?: 'High' | 'Medium' | 'Low'
  step: number
}

const allTimelineItems: TimelineItem[] = [
  {
    id: 'evt-001',
    step: 1,
    time: '10:24:18',
    title: 'External connection detected',
    desc: '203.0.113.44 → 10.0.0.5 (Web Server)',
    dotColor: 'dot-red',
  },
  {
    id: 'evt-002',
    step: 2,
    time: '10:24:35',
    title: 'Web server accessed',
    desc: 'Authenticated using web exploit',
    dotColor: 'dot-red',
  },
  {
    id: 'evt-003',
    step: 3,
    time: '10:25:02',
    title: 'Decoy file accessed',
    desc: 'Read payroll_records_fake.xlsx',
    dotColor: 'dot-red',
    severityLabel: 'High',
  },
  {
    id: 'evt-004',
    step: 4,
    time: '10:25:28',
    title: 'Fake credentials used',
    desc: 'Attempted login with decoy admin account',
    dotColor: 'dot-red',
    severityLabel: 'High',
  },
  {
    id: 'evt-005',
    step: 5,
    time: '10:26:01',
    title: 'Lateral movement to decoy server',
    desc: 'Accessed decoy server 10.0.0.50',
    dotColor: 'dot-amber',
    severityLabel: 'Medium',
  },
  {
    id: 'evt-006',
    step: 6,
    time: '10:26:32',
    title: 'Real server touched',
    desc: 'Scanned database server 10.0.0.10',
    dotColor: 'dot-green',
    severityLabel: 'Low',
  },
]

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({
  currentStep = 0,
  selectedEventId,
  onSelectEvent,
}) => {
  // Only show events that have occurred up to currentStep!
  const visibleItems = allTimelineItems.filter((item) => item.step <= currentStep)
  const alertCount = visibleItems.filter((i) => i.severityLabel !== undefined).length

  return (
    <div className="panel-card incident-timeline-card">
      <div className="panel-header-row">
        <div className="panel-title-group">
          <Clock size={16} className="panel-title-icon" />
          <h2 className="panel-title-text">Incident Timeline</h2>
        </div>
        <span className="panel-meta-tag">
          {currentStep > 0
            ? `${visibleItems.length} events • ${alertCount} alerts`
            : '0 events recorded'}
        </span>
      </div>

      <div className="timeline-body-scroll">
        {visibleItems.length === 0 ? (
          <div className="empty-state-box">
            <ShieldAlert size={28} className="empty-state-icon" style={{ opacity: 0.4, margin: '0 auto 8px auto' }} />
            <p>No active security telemetry.</p>
            <span>Click "Run Attack Simulation" to observe real-time intrusion events.</span>
          </div>
        ) : (
          <div className="vertical-timeline-track">
            {visibleItems.map((item, idx) => {
              const isSelected = selectedEventId === item.id
              const isLast = idx === visibleItems.length - 1
              const isNewlyAdded = item.step === currentStep

              return (
                <div
                  key={item.id}
                  className={`timeline-entry-row ${isSelected ? 'row-selected' : ''} ${isNewlyAdded ? 'entry-fade-in' : ''}`}
                  onClick={() => onSelectEvent?.(item.id)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Timeline Node + Track Line */}
                  <div className="track-col">
                    <span className={`track-dot ${item.dotColor} ${isNewlyAdded ? 'track-dot-pulse' : ''}`}></span>
                    {!isLast && <span className="track-vertical-line"></span>}
                  </div>

                  {/* Time Stamp */}
                  <div className="time-col">
                    <span className="time-label">{item.time}</span>
                  </div>

                  {/* Text Details */}
                  <div className="content-col">
                    <div className="entry-title-row">
                      <span className="entry-title">{item.title}</span>
                      {item.severityLabel && (
                        <span className={`timeline-severity-pill pill-${item.severityLabel.toLowerCase()} ${isNewlyAdded ? 'badge-pop' : ''}`}>
                          {item.severityLabel}
                        </span>
                      )}
                    </div>
                    <span className="entry-desc">{item.desc}</span>
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
