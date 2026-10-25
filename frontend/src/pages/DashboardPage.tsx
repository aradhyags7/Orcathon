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
      {/* Left Navigation Sidebar: Only Homepage */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Workspace */}
      <div className="workspace-container">
        {/* Top Header Controls with Live Clock & CSV Export */}
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
            <StatCards summary={simulation.summary} isCompleted={currentStep > 0} />
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
                steps={simulation.attack_path}
                currentStep={currentStep}
                stepTimestamps={stepTimestamps}
                isCompleted={currentStep > 0}
              />
            </div>

            {/* Right Column: Incident Timeline + Alert Details */}
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
