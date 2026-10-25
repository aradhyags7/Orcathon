import type { Asset, GraphData, SecurityEvent, Alert, SimulationResult } from '../types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${endpoint}`
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!res.ok) {
      let errorMsg = `HTTP Error ${res.status}: ${res.statusText}`
      try {
        const body = await res.json()
        if (body?.error?.message) {
          errorMsg = body.error.message
        }
      } catch {
        // ignore JSON parse fail
      }
      throw new Error(errorMsg)
    }

    return await res.json() as T
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err
    }
    throw new Error('Network request failed')
  }
}

export const api = {
  checkHealth: () => request<{ status: string }>('/health'),
  getAssets: () => request<{ assets: Asset[] }>('/assets'),
  getGraph: () => request<GraphData>('/graph'),
  getScenarios: () => request<{ scenarios: unknown[] }>('/scenarios'),
  runSimulation: (scenarioId: string = 'credential_lateral_movement') =>
    request<SimulationResult>('/simulations/run', {
      method: 'POST',
      body: JSON.stringify({ scenario_id: scenarioId }),
    }),
  getSimulation: (id: string) => request<SimulationResult>(`/simulations/${id}`),
  getEvents: (simId?: string) =>
    request<{ events: SecurityEvent[] }>(simId ? `/events?simulation_id=${simId}` : '/events'),
  getAlerts: (simId?: string) =>
    request<{ alerts: Alert[] }>(simId ? `/alerts?simulation_id=${simId}` : '/alerts'),
  containAlert: (alertId: string) =>
    request<{ status: string; alert_id: string; isolated_asset: string; remediation_applied: string }>(
      `/alerts/${alertId}/contain`,
      { method: 'POST' }
    ),
  getAdaptionStatus: () => request<Record<string, unknown>>('/adaption/status'),
  curateDataset: () => request<Record<string, unknown>>('/adaption/curate-dataset', { method: 'POST' }),
  getExportDatasetUrl: () => `${BASE_URL}/adaption/export-dataset`,
  getBaseline: () => request<Record<string, unknown>>('/baseline'),
  resetDemo: () => request<{ status: string }>('/reset', { method: 'POST' }),
}


