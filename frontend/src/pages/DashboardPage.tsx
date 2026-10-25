import React, { useState } from 'react'
import { useSimulation } from '../hooks/useSimulation'
import { Sidebar } from '../components/Sidebar'
import { Header } from '../components/Header'
import { StatCards } from '../components/StatCards'
import { NetworkGraph } from '../components/NetworkGraph'
import { AttackPathAnalysis } from '../components/AttackPathAnalysis'
import { IncidentTimeline } from '../components/IncidentTimeline'
import { AlertDetails } from '../components/AlertDetails'
import { downloadIncidentReportCsv } from '../lib/exportCsv'
import { ShieldAlert } from 'lucide-react'

export const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Homepage')
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>(undefined)

  const {
    simulation,
    graph,
    currentStep,
    stepTimestamps,
    isSimulating,
    backendAvailable,
    toastMessage,
    runSimulation,
    resetDemo,
  } = useSimulation()

  const handleExportCsv = () => {
    downloadIncidentReportCsv(
      simulation.events,
      simulation.alerts,
      simulation.simulation_id
    )
  }

  return (
    <div className="deceptitrace-app">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* 2. Main Workspace Area */}
      <div className="workspace-container">
        {/* Header and Simulation Controls */}
        <Header
          backendAvailable={backendAvailable}
          isSimulating={isSimulating}
          simulationId={simulation.simulation_id || 'sim-001'}
          onRunSimulation={runSimulation}
          onReset={resetDemo}
          onExportCsv={handleExportCsv}
        />

        {/* Real-Time Alert Toast Notification */}
        {toastMessage && (
          <div className="live-toast-banner" role="alert">
            <ShieldAlert size={16} className="toast-icon" />
            <span className="toast-text">{toastMessage}</span>
          </div>
        )}

        {/* Dashboard Main Content Area */}
        <main className="dashboard-main-view">
          {/* Dashboard Title and Description */}
          <section className="dashboard-hero">
            <span className="hero-kicker">Track 03 | ORCATHON</span>
            <h1 className="hero-title">DeceptiTrace</h1>
            <p className="hero-description">
              Simulate a network with decoy digital assets to detect intruders, trace their movement, and generate an incident timeline.
            </p>
          </section>

          {/* Five KPI Cards in One Horizontal Row */}
          <section className="dashboard-stats-section" aria-label="Incident Summary Metrics">
            <StatCards summary={simulation.summary} isCompleted={currentStep > 0} />
          </section>

          {/* Main Dashboard Two-Column Grid */}
          <div className="dashboard-content-grid">
            {/* Left Column (~68-70% width): Network Simulation at top + Attack Path Analysis directly below */}
            <div className="grid-col-primary">
              <NetworkGraph
                graph={graph}
                currentStep={currentStep}
              />
              <AttackPathAnalysis
                steps={simulation.attack_path}
                currentStep={currentStep}
                stepTimestamps={stepTimestamps}
                isCompleted={currentStep > 0}
              />
            </div>

            {/* Right Column (~30-32% width): Incident Timeline at top + Alert Details directly below */}
            <div className="grid-col-secondary">
              <IncidentTimeline
                events={simulation.events || []}
                currentStep={currentStep}
                stepTimestamps={stepTimestamps}
                isCompleted={currentStep > 0}
                selectedEventId={selectedEventId}
                onSelectEvent={setSelectedEventId}
              />
              <AlertDetails
                alerts={simulation.alerts || []}
                currentStep={currentStep}
                stepTimestamps={stepTimestamps}
                isCompleted={currentStep > 0}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
