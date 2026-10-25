import React, { useState, useEffect } from 'react'
import { Radio, ShieldCheck, ShieldAlert, FileText, Sparkles, Key, Server, Database } from 'lucide-react'
import type { Asset } from '../types/api'

interface CanaryTrapsPanelProps {
  currentStep?: number
  stepTimestamps?: Record<number, string>
  assets?: Asset[]
}

export const CanaryTrapsPanel: React.FC<CanaryTrapsPanelProps> = ({
  currentStep = 0,
  stepTimestamps = {},
  assets = [],
}) => {
  const [activeTab, setActiveTab] = useState<'tripwires' | 'content'>('tripwires')
  const [baselineToggle, setBaselineToggle] = useState<'template' | 'adaption'>('adaption')
  const [selectedDecoyId, setSelectedDecoyId] = useState<string>('decoy-payroll-file')

  const [liveClock, setLiveClock] = useState<string>(() => {
    return (
      new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }) + ' IST'
    )
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveClock(
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
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

  // Extract decoy assets
  const decoyAssets = assets.filter((a) => a.is_decoy)
  const currentDecoy = decoyAssets.find((a) => a.id === selectedDecoyId) || decoyAssets[0]

  return (
    <div className="panel-card canary-traps-card">
      {/* Header Row with Panel Switcher Tabs */}
      <div className="panel-header-row" style={{ marginBottom: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={() => setActiveTab('tripwires')}
            style={{
              background: activeTab === 'tripwires' ? '#E8F5EE' : 'transparent',
              border: activeTab === 'tripwires' ? '1px solid #CDE8D8' : '1px solid transparent',
              color: activeTab === 'tripwires' ? '#1B5E39' : '#6B7280',
              fontWeight: activeTab === 'tripwires' ? 700 : 500,
              fontSize: '0.74rem',
              padding: '2px 8px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Radio size={12} style={{ color: isAnyTripped ? '#DC2626' : '#16A34A' }} />
            <span>Decoy Tripwires</span>
          </button>

          <span style={{ color: '#D1D5DB', fontSize: '0.75rem' }}>|</span>

          <button
            type="button"
            onClick={() => setActiveTab('content')}
            style={{
              background: activeTab === 'content' ? '#EFF6FF' : 'transparent',
              border: activeTab === 'content' ? '1px solid #BFDBFE' : '1px solid transparent',
              color: activeTab === 'content' ? '#1D4ED8' : '#6B7280',
              fontWeight: activeTab === 'content' ? 700 : 500,
              fontSize: '0.74rem',
              padding: '2px 8px',
              borderRadius: '5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <FileText size={12} />
            <span>Decoy Content</span>
            <span
              style={{
                fontSize: '0.58rem',
                padding: '1px 4px',
                borderRadius: '3px',
                background: '#DBEAFE',
                color: '#1E40AF',
                fontWeight: 700,
              }}
            >
              Adaption
            </span>
          </button>
        </div>

        {activeTab === 'tripwires' ? (
          <span className={`panel-meta-tag ${isAnyTripped ? 'tag-meta-alerted' : ''}`}>
            {isAnyTripped ? 'Tripwires Sprung' : '3 Canaries Armed'}
          </span>
        ) : (
          /* Baseline Toggle (Template vs Adaption) */
          <div style={{ display: 'inline-flex', alignItems: 'center', background: '#F3F4F6', padding: '2px', borderRadius: '5px', border: '1px solid #E5E7EB' }}>
            <button
              type="button"
              onClick={() => setBaselineToggle('template')}
              style={{
                background: baselineToggle === 'template' ? '#FFFFFF' : 'transparent',
                color: baselineToggle === 'template' ? '#111827' : '#6B7280',
                border: 'none',
                boxShadow: baselineToggle === 'template' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                padding: '2px 7px',
                fontSize: '0.65rem',
                fontWeight: 600,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Template
            </button>
            <button
              type="button"
              onClick={() => setBaselineToggle('adaption')}
              style={{
                background: baselineToggle === 'adaption' ? '#FFFFFF' : 'transparent',
                color: baselineToggle === 'adaption' ? '#047857' : '#6B7280',
                border: 'none',
                boxShadow: baselineToggle === 'adaption' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
                padding: '2px 7px',
                fontSize: '0.65rem',
                fontWeight: 700,
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Sparkles size={10} />
              Adaption
            </button>
          </div>
        )}
      </div>

      {activeTab === 'tripwires' ? (
        <>
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
            <span className="canary-meta-time">{displayTime.includes('IST') ? displayTime : `${displayTime} IST`}</span>
          </div>

          {/* Subnet Meta Line */}
          <div className="canary-subnet-meta">
            <span className="subnet-label">Monitored Subnet:</span>
            <span className="subnet-code">10.0.0.0/24</span>
            <span className="subnet-sep">•</span>
            <span className="subnet-note">Automated Alerting</span>
          </div>

          {/* 3 Configured Decoy Assets */}
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
        </>
      ) : (
        /* Decoy Content Panel (Task 1) */
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '6px', minHeight: 0 }}>
          {/* Provenance & Evaluation Metadata Strip */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.67rem',
              padding: '3px 7px',
              background: '#F9FAFB',
              borderRadius: '5px',
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ color: '#6B7280' }}>Source:</span>
              <span
                style={{
                  fontWeight: 700,
                  color: baselineToggle === 'adaption' ? '#047857' : '#4B5563',
                  background: baselineToggle === 'adaption' ? '#D1FAE5' : '#E5E7EB',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  textTransform: 'uppercase',
                  fontSize: '0.62rem',
                }}
              >
                {baselineToggle === 'adaption'
                  ? (currentDecoy?.run_id ? 'adaption' : 'hand-authored template')
                  : 'template'}
              </span>
              <span style={{ color: '#9CA3AF' }}>•</span>
              <span style={{ color: '#6B7280' }}>Run ID:</span>
              <span style={{ fontFamily: 'monospace', color: '#374151' }}>
                {currentDecoy?.run_id || 'None'}
              </span>
            </div>
            <div style={{ color: '#6B7280' }}>
              Evaluation: <strong style={{ color: '#4B5563' }}>not available</strong>
            </div>
          </div>

          {/* Decoy Item Selector Buttons */}
          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
            {decoyAssets.map((decoy) => {
              const isSelected = (currentDecoy?.id || 'decoy-payroll-file') === decoy.id
              return (
                <button
                  key={decoy.id}
                  type="button"
                  onClick={() => setSelectedDecoyId(decoy.id)}
                  style={{
                    background: isSelected ? '#1E293B' : '#F3F4F6',
                    color: isSelected ? '#FFFFFF' : '#374151',
                    border: isSelected ? '1px solid #0F172A' : '1px solid #E5E7EB',
                    borderRadius: '5px',
                    padding: '2px 7px',
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {decoy.kind === 'honey_credential' ? (
                    <Key size={10} style={{ color: isSelected ? '#FBBF24' : '#D97706' }} />
                  ) : decoy.kind === 'server' ? (
                    <Server size={10} style={{ color: isSelected ? '#60A5FA' : '#2563EB' }} />
                  ) : (
                    <Database size={10} style={{ color: isSelected ? '#34D399' : '#059669' }} />
                  )}
                  <span>{decoy.name}</span>
                </button>
              )
            })}
          </div>

          {/* Active Decoy Content Preview Code Block */}
          <div
            style={{
              flex: 1,
              minHeight: 0,
              background: '#0F172A',
              borderRadius: '6px',
              padding: '6px 8px',
              border: '1px solid #1E293B',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <pre
              style={{
                margin: 0,
                fontSize: '0.68rem',
                fontFamily: 'Consolas, Monaco, monospace',
                color: baselineToggle === 'adaption' ? '#93C5FD' : '#E2E8F0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.3,
              }}
            >
              {baselineToggle === 'adaption'
                ? (currentDecoy?.content_preview || 'No content preview available')
                : (currentDecoy?.template_preview || `[TEMPLATE] Monitored tripwire for ${currentDecoy?.id}`)}
            </pre>

            {currentDecoy?.canary_token && (
              <div
                style={{
                  marginTop: '5px',
                  paddingTop: '4px',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.64rem',
                }}
              >
                <span style={{ color: '#94A3B8' }}>Canary Token:</span>
                <code style={{ color: '#FCD34D', background: 'rgba(252, 211, 77, 0.12)', padding: '1px 5px', borderRadius: '3px' }}>
                  {currentDecoy.canary_token}
                </code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
