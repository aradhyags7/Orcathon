import React from 'react'
import { useSimulation } from '../hooks/useSimulation'
import { Header } from '../components/Header'
import { StatCards } from '../components/StatCards'
import { SimulationControls } from '../components/SimulationControls'
import { NetworkGraph } from '../components/NetworkGraph'
import { AlertPanel } from '../components/AlertPanel'
import { IncidentTimeline } from '../components/IncidentTimeline'

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
      </main>
    </div>
  )
}
