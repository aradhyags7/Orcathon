import type { GraphData, SimulationResult, Asset } from '../types/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const api = {
  async checkHealth(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/health`)
    if (!res.ok) {
      throw new Error(`Health check failed with status: ${res.status}`)
    }
    return res.json()
  },

  async getAssets(): Promise<{ assets: Asset[] }> {
    const res = await fetch(`${API_BASE_URL}/assets`)
    if (!res.ok) {
      throw new Error(`Failed to fetch assets: ${res.status}`)
    }
    return res.json()
  },

  async getGraph(): Promise<GraphData> {
    const res = await fetch(`${API_BASE_URL}/graph`)
    if (!res.ok) {
      throw new Error(`Failed to fetch graph: ${res.status}`)
    }
    return res.json()
  },

  async runSimulation(scenarioId: string = 'credential_lateral_movement'): Promise<SimulationResult> {
    const res = await fetch(`${API_BASE_URL}/simulations/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scenario_id: scenarioId }),
    })
    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      const message = errorData?.error?.message || `Simulation failed with status: ${res.status}`
      throw new Error(message)
    }
    return res.json()
  },

  async resetDemo(): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/reset`, {
      method: 'POST',
    })
    if (!res.ok) {
      throw new Error(`Reset failed with status: ${res.status}`)
    }
    return res.json()
  },

  async getBaseline(): Promise<unknown> {
    const res = await fetch(`${API_BASE_URL}/baseline`)
    if (!res.ok) {
      throw new Error(`Failed to fetch baseline: ${res.status}`)
    }
    return res.json()
  },
}
