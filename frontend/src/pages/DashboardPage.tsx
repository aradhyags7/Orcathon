import React, { useState } from 'react'
import { useSimulation } from '../hooks/useSimulation'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { StatCards } from '../components/StatCards'
import { NetworkGraph } from '../components/NetworkGraph'
import { AttackPathAnalysis } from '../components/AttackPathAnalysis'
import { IncidentTimeline } from '../components/IncidentTimeline'
import { AlertDetails } from '../components/AlertDetails'
import { ShieldAlert } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Dashboard')
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined)

  const {
    simulation,
    graph,
    currentStep,
    isSimulating,
    backendAvailable,
    toastMessage,
    runSimulation,
    resetDemo,
  } = useSimulation()

  const isCompleted = currentStep > 0

  return (
    <div className="deceptitrace-app">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        alertsCount={simulation?.alerts ? simulation.alerts.length : 0}
      />

      {/* Main Content Workspace */}
      <div className="workspace-container">
        {/* Top Header Controls */}
        <Header
          backendAvailable={backendAvailable}
          isSimulating={isSimulating}
          simulationId={simulation?.simulation_id || 'sim-001'}
          onRunSimulation={runSimulation}
          onReset={resetDemo}
        />

        {/* Real-Time Alert Toast Notification */}
        {toastMessage && (
          <div className="live-toast-banner" role="alert">
            <ShieldAlert size={16} className="toast-icon" />
            <span className="toast-text">{toastMessage}</span>
          </div>
        )}

        {/* Dashboard Main Scroll Area */}
        <main className="dashboard-main-view">
          {/* Hero Section */}
          <section className="dashboard-hero">
            <span className="hero-kicker">Track 03 | ORCATHON</span>
            <h1 className="hero-title">DeceptiTrace</h1>
            <p className="hero-description">
              Simulate a network with decoy digital assets to detect intruders, trace their movement, and generate an incident timeline.
            </p>
          </section>

          {/* 5 KPI Stat Cards */}
          <section className="dashboard-stats-section" aria-label="Incident Summary Metrics">
            <StatCards summary={simulation?.summary} isCompleted={isCompleted} />
          </section>

          {/* Main 2-Column Grid */}
          <div className="dashboard-content-grid">
            {/* Left Column: Network Simulation + Attack Path */}
            <div className="grid-col-primary">
              <NetworkGraph
                graph={graph}
                currentStep={currentStep}
              />
              <AttackPathAnalysis
                steps={simulation?.attack_path}
                currentStep={currentStep}
                isCompleted={isCompleted}
              />
            </div>

            {/* Right Column: Incident Timeline + Alert Details */}
            <div className="grid-col-secondary">
              <IncidentTimeline
                events={simulation?.events || []}
                currentStep={currentStep}
                isCompleted={isCompleted}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
              />
              <AlertDetails
                alerts={simulation?.alerts || []}
                currentStep={currentStep}
                isCompleted={isCompleted}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
