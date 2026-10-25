import React, { useState } from 'react'
import type { Asset } from '../types/api'
import { ShieldAlert, FileText, Key, Eye, EyeOff } from 'lucide-react'

interface DecoyContentPanelProps {
  assets: Asset[]
}

export const DecoyContentPanel: React.FC<DecoyContentPanelProps> = ({ assets }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const decoys = assets.filter((a) => a.is_decoy)

  if (decoys.length === 0) return null

  return (
    <div className="panel-card decoy-content-panel" style={{ marginTop: '1.5rem', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShieldAlert size={20} color="#f59e0b" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            Active Deception Tripwires & Injected Decoy Content
          </h3>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
          {decoys.length} Deception Assets Armed
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {decoys.map((decoy) => {
          const isExpanded = expandedId === decoy.id
          const source = decoy.content_source || 'template'
          const sourceBadgeColor =
            source === 'adaption' ? '#38bdf8' : source === 'cached' ? '#10b981' : '#94a3b8'

          return (
            <div
              key={decoy.id}
              style={{
                background: '#1e293b',
                borderRadius: '8px',
                border: '1px solid #334155',
                padding: '0.75rem 1rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {decoy.kind === 'honey_credential' ? (
                    <Key size={16} color="#f59e0b" />
                  ) : (
                    <FileText size={16} color="#38bdf8" />
                  )}
                  <strong style={{ color: '#f1f5f9', fontSize: '0.9rem' }}>{decoy.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({decoy.id})</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: sourceBadgeColor,
                      border: `1px solid ${sourceBadgeColor}40`,
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Source: {source}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {decoy.canary_token && (
                    <code style={{ fontSize: '0.75rem', background: '#0f172a', color: '#fbbf24', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                      Token: {decoy.canary_token}
                    </code>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : decoy.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.8rem',
                    }}
                  >
                    {isExpanded ? <EyeOff size={14} /> : <Eye size={14} />}
                    {isExpanded ? 'Hide Payload' : 'Inspect Payload'}
                  </button>
                </div>
              </div>

              {isExpanded && decoy.content_preview && (
                <div style={{ marginTop: '0.75rem' }}>
                  <pre
                    style={{
                      margin: 0,
                      padding: '0.75rem',
                      background: '#090d16',
                      borderRadius: '6px',
                      color: '#93c5fd',
                      fontSize: '0.8rem',
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'monospace',
                      border: '1px solid #1e293b',
                    }}
                  >
                    {decoy.content_preview}
                  </pre>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
