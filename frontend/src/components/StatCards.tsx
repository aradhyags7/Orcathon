import React from 'react'
import type { SimulationSummary } from '../types/api'
import { Server, AlertTriangle, Users, Crosshair, Layers } from 'lucide-react'

interface StatCardsProps {
  summary?: SimulationSummary
  isCompleted?: boolean
}

export const StatCards: React.FC<StatCardsProps> = ({ summary, isCompleted = true }) => {
  const cards = [
    {
      id: 'network-assets',
      title: 'Network Assets',
      value: summary?.total_assets ?? 8,
      subtext: isCompleted
        ? `${summary?.real_assets_count ?? 5} real · ${summary?.decoy_assets_count ?? 3} decoy`
        : '5 real · 3 decoy',
      icon: Server,
      theme: 'theme-green',
      bars: [4, 7, 10],
    },
    {
      id: 'security-alerts',
      title: 'Security Alerts',
      value: isCompleted ? summary?.alerts_count ?? 4 : 4,
      subtext: '2 high · 1 medium · 1 low',
      icon: AlertTriangle,
      theme: 'theme-red',
      bars: [3, 6, 9],
    },
    {
      id: 'intruders-detected',
      title: 'Intruders Detected',
      value: isCompleted ? summary?.intruders_count ?? 1 : 1,
      subtext: 'External actor',
      icon: Users,
      theme: 'theme-teal',
      bars: [2, 5, 8],
    },
    {
      id: 'decoy-interactions',
      title: 'Decoy Interactions',
      value: isCompleted ? summary?.decoy_interactions_count ?? 3 : 3,
      subtext: 'Decoy assets accessed',
      icon: Crosshair,
      theme: 'theme-amber',
      bars: [4, 7, 10],
    },
    {
      id: 'assets-affected',
      title: 'Assets Affected',
      value: isCompleted ? summary?.assets_affected ?? 4 : 4,
      subtext: 'Real and decoy assets',
      icon: Layers,
      theme: 'theme-green',
      bars: [3, 6, 8],
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
