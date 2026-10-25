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
  stepTimestamps?: Record<number, string>
  isCompleted?: boolean
}

export const AttackPathAnalysis: React.FC<AttackPathAnalysisProps> = ({
  steps,
  currentStep = 6,
  stepTimestamps = {},
}) => {
  const allSteps = [
    {
      step: 1,
      title: '1. Initial Entry',
      ip: '203.0.113.44',
      name: 'External Actor',
      defaultTime: '10:24:18 IST',
      icon: UserX,
      theme: 'theme-red',
      basis: 'observed',
    },
    {
      step: 2,
      title: '2. Web Server',
      ip: '10.0.0.5',
      name: 'Web Server',
      defaultTime: '10:24:35 IST',
      icon: Server,
      theme: 'theme-green',
      basis: 'observed', // Directly recorded telemetry (evt-002: authenticated web exploit)
    },
    {
      step: 3,
      title: '3. Decoy File Access',
      ip: '10.0.0.30',
      name: 'Payroll Records',
      defaultTime: '10:25:02 IST',
      icon: FileSpreadsheet,
      theme: 'theme-amber',
      basis: 'observed', // Directly recorded telemetry (evt-003: read payroll decoy file)
    },
    {
      step: 4,
      title: '4. Decoy Credentials',
      ip: '10.0.0.40',
      name: 'Admin Credentials',
      defaultTime: '10:25:28 IST',
      icon: Key,
      theme: 'theme-amber',
      basis: 'observed', // Directly recorded telemetry (evt-004: decoy admin credentials extracted)
    },
    {
      step: 5,
      title: '5. Decoy Server',
      ip: '10.0.0.50',
      name: 'Decoy Server',
      defaultTime: '10:26:01 IST',
      icon: Server,
      theme: 'theme-amber',
      basis: 'inferred', // Canary-token linkage: lateral pivot to decoy server using stolen canary credentials
    },
    {
      step: 6,
      title: '6. Real Server Touched',
      ip: '10.0.0.10',
      name: 'Database Server',
      defaultTime: '10:26:32 IST',
      icon: Database,
      theme: 'theme-green',
      basis: 'observed', // Directly recorded telemetry (evt-006: probe on port 5432)
    },
  ]

  // Render ONLY the steps that have occurred in real time (No light preview text)
  const visibleSteps = allSteps.filter((s) => s.step <= currentStep).map((s) => {
    const passed = steps?.find((st) => st.step === s.step)
    const effectiveBasis = passed?.basis || passed?.type || s.basis
    const isInferred = effectiveBasis === 'inferred'
    return {
      ...s,
      isInferred,
    }
  })

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
          <h2 className="panel-title-text">Attack Path Analysis (IST)</h2>
        </div>

        <div className="path-legend-group">
          <span className="path-meta-tag">
            {currentStep > 0
              ? `${visibleSteps.length === 1 ? '1 step' : `${visibleSteps.length} steps`} • ${alertsCount === 1 ? '1 alert' : `${alertsCount} alerts`}`
              : '0 steps recorded'}
          </span>
          <div className="legend-entry">
            <span className="line-legend line-attack"></span>
            <span>Observed</span>
          </div>
          <div className="legend-entry">
            <span className="line-legend line-inferred"></span>
            <span>Inferred (Canary Link)</span>
          </div>
        </div>
      </div>

      {/* Horizontal Step Cards Sequence: Only displays actively reached steps */}
      <div className="attack-path-steps-scroll">
        {visibleSteps.length === 0 ? (
          <div className="empty-state-box">
            <Shield size={22} style={{ opacity: 0.35, margin: '0 auto 6px auto' }} />
            <p>Attack path reconstruction standing by.</p>
            <span>Click "Run Attack Simulation" to observe real-time intrusion steps.</span>
          </div>
        ) : (
          <div className="attack-path-flow">
            {visibleSteps.map((step, idx) => {
              const Icon = step.icon
              const isLast = idx === visibleSteps.length - 1
              const isNewest = step.step === currentStep
              const displayTime = stepTimestamps[step.step] || step.defaultTime

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
                      <span className="step-card-time">{displayTime.includes('IST') ? displayTime : `${displayTime} IST`}</span>
                    </div>

                    <div className={`step-card-badge ${step.isInferred ? 'badge-inferred' : 'badge-observed'}`}>
                      <span className={step.isInferred ? 'inferred-dot' : 'observed-dot'}></span>
                      <span>{step.isInferred ? 'Inferred' : 'Observed'}</span>
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
