import React from 'react'
import {
  Shield,
  LayoutDashboard,
  Network,
  Box,
  Clock,
  Bell,
  Activity,
  FileText,
  Settings,
} from 'lucide-react'

interface SidebarProps {
  activeTab?: string
  onSelectTab?: (tab: string) => void
  alertsCount?: number
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab = 'Dashboard',
  onSelectTab,
  alertsCount = 4,
}) => {
  const navItems = [
    { id: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'Network Simulation', label: 'Network Simulation', icon: Network },
    { id: 'Decoy Assets', label: 'Decoy Assets', icon: Box },
    { id: 'Incident Timeline', label: 'Incident Timeline', icon: Clock },
    { id: 'Alerts', label: 'Alerts', icon: Bell, badge: alertsCount },
    { id: 'Attack Path Analysis', label: 'Attack Path Analysis', icon: Activity },
  ]

  const secondaryItems = [
    { id: 'Reports', label: 'Reports', icon: FileText },
    { id: 'Settings', label: 'Settings', icon: Settings },
  ]

  return (
    <aside className="sidebar-container" aria-label="Main Navigation">
      {/* Brand Header */}
      <div className="sidebar-brand">
        <div className="brand-logo-wrap">
          <Shield size={24} className="brand-shield-icon" fill="none" strokeWidth={2.2} />
        </div>
        <div className="brand-text">
          <h1 className="brand-title">DeceptiTrace</h1>
          <p className="brand-tagline">Cyber Deception • Detect • Trace • Investigate</p>
        </div>
      </div>

      {/* Main Nav Items */}
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <li key={item.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  onClick={() => onSelectTab?.(item.id)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="nav-badge">{item.badge}</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>

        <div className="nav-divider"></div>

        <ul className="nav-list secondary-list">
          {secondaryItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <li key={item.id} className="nav-item">
                <button
                  type="button"
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                  onClick={() => onSelectTab?.(item.id)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer Branding & Abstract Wave Artwork */}
      <div className="sidebar-footer">
        <svg className="sidebar-waves" viewBox="0 0 200 120" preserveAspectRatio="none">
          <path
            d="M-20,110 C40,70 80,130 140,80 C180,40 220,100 240,60"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1.2"
          />
          <path
            d="M-20,120 C50,85 100,140 160,90 C190,65 210,110 240,80"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="1.2"
          />
          <path
            d="M-20,100 C60,60 110,120 170,75 C200,50 230,90 250,70"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        </svg>
        <div className="sidebar-watermark">
          <span>Decept</span>
          <span>Detect</span>
          <span>Trace</span>
          <span>Investigate</span>
        </div>
      </div>
    </aside>
  )
}
