import React, { useState } from 'react'
import { useSimulation } from '../hooks/useSimulation'
import { Header } from '../components/Header'
import { StatCards } from '../components/StatCards'
import { NetworkGraph } from '../components/NetworkGraph'
import { AttackPathAnalysis } from '../components/AttackPathAnalysis'
import { CanaryTrapsPanel } from '../components/CanaryTrapsPanel'
import { IncidentTimeline } from '../components/IncidentTimeline'
import { AlertDetails } from '../components/AlertDetails'
import { downloadIncidentReportCsv } from '../lib/exportCsv'
import { ShieldAlert } from 'lucide-react'

export const DashboardPage: React.FC = () => {
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
      {/* Top Header Controls with Brand Emblem, Live Clock & CSV Export */}
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

      {/* Single-Screen Dashboard Main Workspace */}
      <main className="dashboard-main-view">
        {/* 5 KPI Stat Cards */}
        <section className="dashboard-stats-section" aria-label="Incident Summary Metrics">
          <StatCards summary={simulation.summary} isCompleted={currentStep > 0} />
        </section>

        {/* Main 2-Column Content Grid: Fully fits on one screen without scrolling */}
        <div className="dashboard-content-grid">
          {/* Left Primary Column: Network Simulation + Attack Path & Decoy Tripwires */}
          <div className="grid-col-primary">
            <NetworkGraph
              graph={graph}
              currentStep={currentStep}
            />
            {/* Split Row: Attack Path Analysis + Canary Decoy Tripwires Panel */}
            <div className="attack-path-split-row">
              <AttackPathAnalysis
                steps={simulation.attack_path}
                currentStep={currentStep}
                stepTimestamps={stepTimestamps}
                isCompleted={currentStep > 0}
              />
              <CanaryTrapsPanel
                currentStep={currentStep}
                stepTimestamps={stepTimestamps}
              />
            </div>
          </div>

          {/* Right Secondary Column: Incident Timeline + Alert Details */}
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
  )
}
