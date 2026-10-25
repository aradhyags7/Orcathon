import React, { useState } from 'react'
import { useSimulation } from '../hooks/useSimulation'
import { Header } from '../components/Header'
import { StatCards } from '../components/StatCards'
import { NetworkGraph } from '../components/NetworkGraph'
import { AttackPathAnalysis } from '../components/AttackPathAnalysis'
import { IncidentTimeline } from '../components/IncidentTimeline'
import { CanaryTrapsPanel } from '../components/CanaryTrapsPanel'
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
      {/* Row 1 — Compact header: Brand, Telemetry, Simulation Controls */}
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
          <ShieldAlert size={15} className="toast-icon" />
          <span className="toast-text">{toastMessage}</span>
        </div>
      )}

      {/* Main Single-Screen Dashboard View */}
      <main className="dashboard-main-view">
        {/* Row 2 — Five KPI cards in one row */}
        <section className="dashboard-stats-section" aria-label="Incident Summary Metrics">
          <StatCards summary={simulation.summary} isCompleted={currentStep > 0} />
        </section>

        {/* Rows 3 & 4 — Main dashboard grid: Three Columns (52% / 24% / 24%) */}
        <div className="dashboard-content-grid">
          {/* Left Column (52%): Network Simulation on top + Attack Path Analysis directly underneath */}
          <div className="grid-col-left">
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

          {/* Middle Column (24%): Incident Timeline on top + Decoy Tripwires directly underneath */}
          <div className="grid-col-mid">
            <IncidentTimeline
              events={simulation.events || []}
              currentStep={currentStep}
              stepTimestamps={stepTimestamps}
              isCompleted={currentStep > 0}
              selectedEventId={selectedEventId}
              onSelectEvent={setSelectedEventId}
            />
            <CanaryTrapsPanel
              currentStep={currentStep}
              stepTimestamps={stepTimestamps}
              assets={graph.nodes}
            />
          </div>

          {/* Right Column (24%): Alert Details occupying the full available vertical space */}
          <div className="grid-col-right">
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
