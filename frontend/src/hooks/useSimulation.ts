import { useState, useEffect, useCallback } from 'react'
import type { SimulationResult, GraphData } from '../types/api'
import { api } from '../lib/api'
import { mockSimulationResult, mockInitialGraph } from '../data/mockData'

export function useSimulation() {
  const [simulation, setSimulation] = useState<SimulationResult | null>(null)
  const [graph, setGraph] = useState<GraphData>(mockInitialGraph)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false)

  // Verify backend health on mount
  const checkBackend = useCallback(async () => {
    try {
      const res = await api.checkHealth()
      if (res.status === 'ok') {
        setBackendAvailable(true)
        const g = await api.getGraph()
        setGraph(g)
      }
    } catch {
      setBackendAvailable(false)
    }
  }, [])

  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 10000)
    return () => clearInterval(interval)
  }, [checkBackend])

  // Run simulation trigger
  const runSimulation = async (scenarioId: string = 'credential_lateral_movement') => {
    setIsLoading(true)
    setError(null)
    try {
      if (backendAvailable) {
        const result = await api.runSimulation(scenarioId)
        setSimulation(result)
        const updatedGraph = await api.getGraph()
        setGraph(updatedGraph)
      } else {
        // Safe mock demonstration mode when backend is offline
        await new Promise((r) => setTimeout(r, 600))
        setSimulation(mockSimulationResult)
        // Mark graph nodes as alerted
        setGraph({
          nodes: mockInitialGraph.nodes.map((n) => {
            if (n.id === 'decoy-payroll-file' || n.id === 'honey-credential-01') {
              return { ...n, status: 'alert' }
            }
            if (n.id === 'employee-pc-01' || n.id === 'file-server-01') {
              return { ...n, status: 'suspicious' }
            }
            return n
          }),
          edges: mockInitialGraph.edges.map((e) => ({
            ...e,
            status: e.target.includes('decoy') || e.target.includes('honey') ? 'suspicious' : 'traversed',
          })),
        })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Simulation failed to execute'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  // Reset demo state
  const resetDemo = async () => {
    setIsLoading(true)
    setError(null)
    try {
      if (backendAvailable) {
        await api.resetDemo()
        const g = await api.getGraph()
        setGraph(g)
      } else {
        setGraph(mockInitialGraph)
      }
      setSimulation(null)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Reset operation failed'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    simulation,
    graph,
    isLoading,
    error,
    backendAvailable,
    runSimulation,
    resetDemo,
    checkBackend,
  }
}
