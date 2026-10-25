import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Sparkles, Layers, ShieldCheck } from 'lucide-react'

interface BaselineSample {
  id: string
  name: string
  category: string
  prompt: string
  template_baseline: string
  adaption_generated: string
  source: string
  canary_token_placeholder: string
}

interface BaselineData {
  title: string
  description: string
  source: string
  total_samples: number
  samples: BaselineSample[]
  evaluation: {
    realism_score: string
    metric_source: string
  }
}

export const BaselineComparison: React.FC = () => {
  const [data, setData] = useState<BaselineData | null>(null)
  const [selectedIdx, setSelectedIdx] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    api.getBaseline()
      .then((res: unknown) => {
        setData(res as BaselineData)
      })
      .catch(() => {
        setData(null)
      })
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return <div className="panel-card" style={{ padding: '1rem', color: '#94a3b8' }}>Loading Adaption baseline comparison...</div>
  }

  if (!data || !data.samples || data.samples.length === 0) {
    return null
  }

  const active = data.samples[selectedIdx] || data.samples[0]

  return (
    <div className="panel-card baseline-comparison-panel" style={{ marginTop: '1.5rem', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={20} color="#38bdf8" />
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc' }}>
            Adaption Labs Adaptive Data: Decoy Synthesis Baseline
          </h3>
          <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
            Source: {data.source.toUpperCase()}
          </span>
        </div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldCheck size={14} color="#10b981" />
          <span>Canary tokens injected locally (zero model leakage)</span>
        </div>
      </div>

      <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 1rem 0' }}>
        {data.description}
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {data.samples.map((s, idx) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            style={{
              padding: '0.4rem 0.75rem',
              fontSize: '0.8rem',
              borderRadius: '6px',
              border: selectedIdx === idx ? '1px solid #38bdf8' : '1px solid #334155',
              background: selectedIdx === idx ? 'rgba(56, 189, 248, 0.1)' : '#1e293b',
              color: selectedIdx === idx ? '#38bdf8' : '#94a3b8',
              cursor: 'pointer',
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Side-by-side comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Left: Template Baseline */}
        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem', border: '1px solid #334155' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>
              Standard Template / Faker Baseline
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Flat Placeholder</span>
          </div>
          <pre style={{ margin: 0, padding: '0.75rem', background: '#090d16', borderRadius: '6px', color: '#cbd5e1', fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', minHeight: '130px' }}>
            {active.template_baseline}
          </pre>
        </div>

        {/* Right: Adaption Generated */}
        <div style={{ background: '#1e293b', borderRadius: '8px', padding: '1rem', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Layers size={14} />
              Adaption Labs Adaptive Synthesis
            </span>
            <span style={{ fontSize: '0.7rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
              Corporate Blueprint
            </span>
          </div>
          <pre style={{ margin: 0, padding: '0.75rem', background: '#090d16', borderRadius: '6px', color: '#7dd3fc', fontSize: '0.8rem', whiteSpace: 'pre-wrap', fontFamily: 'monospace', minHeight: '130px' }}>
            {active.adaption_generated}
          </pre>
        </div>
      </div>
    </div>
  )
}
