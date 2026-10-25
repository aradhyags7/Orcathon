import React from 'react'
import { useSimulation } from '../hooks/useSimulation'
import { Header } from '../components/Header'
import { StatCards } from '../components/StatCards'
import { SimulationControls } from '../components/SimulationControls'
import { NetworkGraph } from '../components/NetworkGraph'
import { AlertPanel } from '../components/AlertPanel'
import { IncidentTimeline } from '../components/IncidentTimeline'
import { DecoyContentPanel } from '../components/DecoyContentPanel'
import { BaselineComparison } from '../components/BaselineComparison'

export const DashboardPage: React.FC = () => {
  const {
    simulation,
    graph,
    isLoading,
    error,
    backendAvailable,
    runSimulation,
    resetDemo,
  } = useSimulation()

  const activePath = simulation ? simulation.attack_path.map((step) => step.asset_id) : []

  return (
    <div className="dashboard-layout">
      <Header
        backendAvailable={backendAvailable}
        isSimulating={isLoading}
        simulationId={simulation?.simulation_id}
      />

      <main className="dashboard-content">
        {!backendAvailable && (
          <div
            className="backend-offline-banner"
            role="alert"
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              fontSize: '0.9rem',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span>
              <strong>Backend API Unreachable (http://localhost:8000/api):</strong> Operating in offline demonstration mock fallback. Start the FastAPI backend server to stream live telemetry.
            </span>
          </div>
        )}

        <StatCards
          summary={simulation?.summary}
          isCompleted={simulation !== null}
        />

        <SimulationControls
          isLoading={isLoading}
          onRunSimulation={runSimulation}
          onReset={resetDemo}
          error={error}
        />

        <div className="dashboard-grid">
          <div className="grid-main-col">
            <NetworkGraph graph={graph} activePath={activePath} />
            <IncidentTimeline
              steps={simulation ? simulation.attack_path : []}
              events={simulation ? simulation.events : []}
            />
          </div>

          <div className="grid-side-col">
            <AlertPanel alerts={simulation ? simulation.alerts : []} />
          </div>
        </div>

        {/* Real Decoy Content & Canary Token Inspector */}
        <DecoyContentPanel assets={graph.nodes} />

        {/* Adaption Labs Synthesis Baseline Comparison */}
        <BaselineComparison />
      </main>
    </div>
  )
}
