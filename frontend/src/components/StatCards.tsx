import React from 'react'
import type { SimulationSummary } from '../types/api'
import { Server, AlertTriangle, Users, Crosshair, Layers } from 'lucide-react'

interface StatCardsProps {
  summary?: SimulationSummary
  isCompleted?: boolean
}

export const StatCards: React.FC<StatCardsProps> = ({ summary }) => {
  const alertsCount = summary?.alerts_count ?? 0
  const intrudersCount = summary?.intruders_count ?? 0
  const decoyCount = summary?.decoy_interactions_count ?? 0
  const affectedCount = summary?.assets_affected ?? 0

  const cards = [
    {
      id: 'network-assets',
      title: 'Network Assets',
      value: summary?.total_assets ?? 8,
      subtext: `${summary?.real_assets_count ?? 5} real · ${summary?.decoy_assets_count ?? 3} decoy`,
      icon: Server,
      theme: 'theme-green',
      bars: [4, 7, 10],
    },
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      value: alertsCount,
      subtext: alertsCount >= 4
        ? '2 high · 1 medium · 1 low'
        : alertsCount > 0
        ? `${alertsCount} active alert${alertsCount > 1 ? 's' : ''}`
        : '0 detected',
      icon: AlertTriangle,
      theme: alertsCount > 0 ? 'theme-red' : 'theme-teal',
      bars: alertsCount > 0 ? [3, 6, 9] : [2, 2, 2],
    },
    {
      id: 'intruders-detected',
      title: 'Intruders Detected',
      value: intrudersCount,
      subtext: intrudersCount > 0 ? 'External actor' : 'Perimeter secure',
      icon: Users,
      theme: intrudersCount > 0 ? 'theme-red' : 'theme-teal',
      bars: intrudersCount > 0 ? [2, 5, 8] : [2, 2, 2],
    },
    {
      id: 'decoy-interactions',
      title: 'Decoy Interactions',
      value: decoyCount,
      subtext: decoyCount > 0 ? 'Decoy assets accessed' : 'Canary tripwires armed',
      icon: Crosshair,
      theme: decoyCount > 0 ? 'theme-amber' : 'theme-teal',
      bars: decoyCount > 0 ? [4, 7, 10] : [2, 2, 2],
    },
    {
      id: 'assets-affected',
      title: 'Assets Affected',
      value: affectedCount,
      subtext: affectedCount > 0 ? 'Real and decoy assets' : 'All systems nominal',
      icon: Layers,
      theme: affectedCount > 0 ? 'theme-green' : 'theme-teal',
      bars: affectedCount > 0 ? [3, 6, 8] : [2, 2, 2],
    },
  ]

  return (
    <div className="stat-cards-grid">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div key={card.id} className="stat-card">
            <div className="stat-card-left">
              <div className={`stat-icon-wrapper ${card.theme}`}>
                <Icon size={17} strokeWidth={2.2} />
              </div>
            </div>

            <div className="stat-card-main">
              <span className="stat-title">{card.title}</span>
              <div className="stat-value-row">
                <span className="stat-value">{card.value}</span>
              </div>
              <span className="stat-subtext">{card.subtext}</span>
            </div>

            <div className={`stat-card-spark ${card.theme}`}>
              {card.bars.map((h, i) => (
                <div
                  key={i}
                  className="spark-bar"
                  style={{ height: `${h * 2}px` }}
                ></div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
