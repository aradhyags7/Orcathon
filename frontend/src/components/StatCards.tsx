import React from 'react'
import { BellRing, ShieldCheck, Cpu, GitFork } from 'lucide-react'
import type { SimulationSummary } from '../types/api'

interface StatCardsProps {
  summary?: SimulationSummary
  isCompleted: boolean
}

export const StatCards: React.FC<StatCardsProps> = ({ summary, isCompleted }) => {
  const stats = [
    {
      title: 'Decoy Alerts Raised',
      value: summary ? summary.alerts_count : 0,
      suffix: summary && summary.alerts_count > 0 ? 'CRITICAL TRIPS' : 'STANDBY',
      icon: BellRing,
      accent: 'stat-red',
      description: 'Tripwires triggered by intruder access',
    },
    {
      title: 'Telemetry Events',
      value: summary ? summary.events_count : 0,
      suffix: isCompleted ? 'RECORDED' : 'IDLE',
      icon: Cpu,
      accent: 'stat-blue',
      description: 'Ingress, probe & lateral telemetry',
    },
    {
      title: 'Assets Traversed',
      value: summary ? summary.assets_affected : 0,
      suffix: 'TOPOLOGY NODES',
      icon: GitFork,
      accent: 'stat-amber',
      description: 'Workstations, shares & canary tokens',
    },
    {
      title: 'Deception Posture',
      value: isCompleted ? 'DEFENDED' : 'ARMED',
      suffix: 'ACTIVE SENSORS',
      icon: ShieldCheck,
      accent: 'stat-emerald',
      description: 'Canary traps & honey credentials armed',
    },
  ]

  return (
    <div className="stat-cards-grid">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <div key={idx} className={`stat-card ${stat.accent}`}>
            <div className="stat-card-header">
              <span className="stat-title">{stat.title}</span>
              <div className="stat-icon-wrapper">
                <Icon size={18} />
              </div>
            </div>
            <div className="stat-value-row">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-suffix">{stat.suffix}</span>
            </div>
            <p className="stat-desc">{stat.description}</p>
          </div>
        )
      })}
    </div>
  )
}
