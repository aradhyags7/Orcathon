import React from 'react'
import type { AttackPathStep } from '../types/api'
import {
  GitCommit,
  UserX,
  Server,
  FileSpreadsheet,
  Key,
  Database,
  ArrowRight,
  Shield,
} from 'lucide-react'

interface AttackPathAnalysisProps {
  steps?: AttackPathStep[]
  currentStep?: number
  isCompleted?: boolean
}

export const AttackPathAnalysis: React.FC<AttackPathAnalysisProps> = ({
  currentStep = 0,
}) => {
  const allSteps = [
    {
      step: 1,
      title: '1. Initial Entry',
      ip: '203.0.113.44',
      name: 'External Actor',
      time: '10:24:18',
      type: 'Observed',
      icon: UserX,
      theme: 'theme-red',
    },
    {
      step: 2,
      title: '2. Web Server',
      ip: '10.0.0.5',
      name: 'Web Server',
      time: '10:24:35',
      type: 'Observed',
      icon: Server,
      theme: 'theme-green',
    },
    {
      step: 3,
      title: '3. Decoy File Access',
      ip: '10.0.0.30',
      name: 'Payroll Records',
      time: '10:25:02',
      type: 'Observed',
      icon: FileSpreadsheet,
      theme: 'theme-amber',
    },
    {
      step: 4,
      title: '4. Decoy Credentials',
      ip: '10.0.0.40',
      name: 'Admin Credentials',
      time: '10:25:28',
      type: 'Observed',
      icon: Key,
      theme: 'theme-amber',
    },
    {
      step: 5,
      title: '5. Decoy Server',
      ip: '10.0.0.50',
      name: 'Decoy Server',
      time: '10:26:01',
      type: 'Observed',
      icon: Server,
      theme: 'theme-amber',
    },
    {
      step: 6,
      title: '6. Real Server Touched',
      ip: '10.0.0.10',
      name: 'Database Server',
      time: '10:26:32',
      type: 'Observed',
      icon: Database,
      theme: 'theme-green',
    },
  ]

  // Only render cards up to the active current step!
  const visibleSteps = allSteps.filter((s) => s.step <= currentStep)

  let alertsCount = 0
  if (currentStep >= 3) alertsCount = 1
  if (currentStep >= 4) alertsCount = 2
  if (currentStep >= 5) alertsCount = 3
  if (currentStep >= 6) alertsCount = 4

  return (
    <div className="panel-card attack-path-card">
      {/* Header and Legend */}
      <div className="panel-header-row">
        <div className="panel-title-group">
          <GitCommit size={18} className="panel-title-icon" />
          <h2 className="panel-title-text">Attack Path Analysis</h2>
        </div>

        <div className="path-legend-group">
          <span className="path-meta-tag">
            {currentStep > 0
              ? `${visibleSteps.length} steps • ${alertsCount} alerts`
              : '0 steps recorded'}
          </span>
          <div className="legend-entry">
            <span className="line-legend line-attack"></span>
            <span>Observed</span>
          </div>
          <div className="legend-entry">
            <span className="line-legend line-inferred"></span>
            <span>Inferred</span>
          </div>
        </div>
      </div>

      {/* Horizontal Step Cards Sequence */}
      <div className="attack-path-steps-scroll">
        {visibleSteps.length === 0 ? (
          <div className="empty-state-box">
            <Shield size={24} style={{ opacity: 0.35, margin: '0 auto 6px auto' }} />
            <p>Attack path reconstruction standing by.</p>
            <span>Run simulation to visually map intruder movement across network assets.</span>
          </div>
        ) : (
          <div className="attack-path-flow">
            {visibleSteps.map((step, idx) => {
              const Icon = step.icon
              const isLast = idx === visibleSteps.length - 1
              const isNewest = step.step === currentStep

              return (
                <React.Fragment key={step.step}>
                  <div className={`path-step-card ${isNewest ? 'card-newly-revealed' : ''}`}>
                    <span className="step-card-title">{step.title}</span>

                    <div className="step-card-icon-wrap">
                      <div className={`step-avatar ${step.theme}`}>
                        <Icon size={18} strokeWidth={2.2} />
                      </div>
                    </div>

                    <div className="step-card-meta">
                      <span className="step-card-ip">{step.ip}</span>
                      <span className="step-card-name">{step.name}</span>
                      <span className="step-card-time">{step.time}</span>
                    </div>

                    <div className="step-card-badge">
                      <span className="observed-dot"></span>
                      <span>{step.type}</span>
                    </div>
                  </div>

                  {!isLast && (
                    <div className="step-connector">
                      <div className="connector-dashed-line"></div>
                      <ArrowRight size={14} className="connector-arrow" />
                    </div>
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
