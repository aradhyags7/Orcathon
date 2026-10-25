import { useState, useEffect, useCallback, useRef } from 'react'
import type { SimulationResult, GraphData, SecurityEvent, Alert, AttackPathStep, SimulationSummary } from '../types/api'
import { api } from '../lib/api'
import { mockSimulationResult, mockInitialGraph } from '../data/mockData'

export function useSimulation() {
  // Step 0: Baseline clean state
  // Steps 1 to 6: Progression through each network node
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Verify backend health on mount
  const checkBackend = useCallback(async () => {
    try {
      const res = await api.checkHealth()
      if (res.status === 'ok') {
        setBackendAvailable(true)
      }
    } catch {
      setBackendAvailable(false)
    }
  }, [])

  useEffect(() => {
    checkBackend()
    const interval = setInterval(checkBackend, 15000)
    return () => clearInterval(interval)
  }, [checkBackend])

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Auto-clear toast
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3200)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // Real-time attack simulation trigger
  const runSimulation = useCallback(async () => {
    if (isSimulating) return
    setIsSimulating(true)
    setError(null)
    setCurrentStep(0)
    setToastMessage("Intruder recon detected from 203.0.113.44. Initiating telemetry trace...")

    // If backend is active, trigger async backend run in background
    if (backendAvailable) {
      api.runSimulation('credential_lateral_movement').catch(() => null)
    }

    // Step-by-step real-time progression:
    // Step 1 (800ms): External Actor probes perimeter
    // Step 2 (2000ms): Infiltrates Web Server (compromised!)
    // Step 3 (3200ms): Trips Payroll Records Decoy File (Alert 1!)
    // Step 4 (4400ms): Attempts Admin Honey Credentials (Alert 2!)
    // Step 5 (5600ms): Lateral Movement to Decoy Server (Alert 3!)
    // Step 6 (6800ms): Database Server probe detected (Alert 4!)
    const stepDelays = [800, 2000, 3200, 4400, 5600, 6800]

    stepDelays.forEach((delay, index) => {
      const stepNumber = index + 1
      setTimeout(() => {
        setCurrentStep(stepNumber)

        if (stepNumber === 2) {
          setToastMessage("⚠️ Web Server 10.0.0.5 compromised via remote exploit!")
        } else if (stepNumber === 3) {
          setToastMessage("🚨 TRIPWIRE SPRUNG! Decoy file payroll_records_fake.xlsx accessed!")
        } else if (stepNumber === 4) {
          setToastMessage("🚨 CANARY TRIGGERED! Planted admin_decoy credentials used!")
        } else if (stepNumber === 5) {
          setToastMessage("🚨 HONEYPOT REACHED! Attacker routed to isolated Decoy Server!")
        } else if (stepNumber === 6) {
          setToastMessage("🛡️ INCIDENT CONTAINED: Database scan intercepted. 0 real data leaked.")
          setIsSimulating(false)
        }
      }, delay)
    })
  }, [isSimulating, backendAvailable])

  // Reset demo to baseline
  const resetDemo = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsSimulating(false)
    setCurrentStep(0)
    setError(null)
    setToastMessage("System telemetry restored to baseline. Tripwires re-armed.")

    if (backendAvailable) {
      api.resetDemo().catch(() => null)
    }
  }, [backendAvailable])

  // Compute active events based on currentStep
  const activeEvents: SecurityEvent[] = mockSimulationResult.events.slice(0, currentStep)

  // Compute active alerts based on currentStep
  // Step 3 unlocks Alert 1 (Payroll Decoy)
  // Step 4 unlocks Alert 2 (Honey Creds)
  // Step 5 unlocks Alert 3 (Decoy Server)
  // Step 6 unlocks Alert 4 (Database Server)
  let activeAlertsCount = 0
  if (currentStep >= 3) activeAlertsCount = 1
  if (currentStep >= 4) activeAlertsCount = 2
  if (currentStep >= 5) activeAlertsCount = 3
  if (currentStep >= 6) activeAlertsCount = 4
  const activeAlerts: Alert[] = mockSimulationResult.alerts.slice(0, activeAlertsCount)

  // Compute active attack path steps
  const activeAttackPath: AttackPathStep[] = mockSimulationResult.attack_path.slice(0, currentStep)

  // Compute dynamic summary metrics
  const activeSummary: SimulationSummary = {
    total_assets: 8,
    real_assets_count: 5,
    decoy_assets_count: 3,
    events_count: activeEvents.length,
    alerts_count: activeAlerts.length,
    intruders_count: currentStep >= 1 ? 1 : 0,
    decoy_interactions_count: Math.max(0, currentStep - 2 > 3 ? 3 : Math.max(0, currentStep - 2)),
    assets_affected: currentStep === 0 ? 0 : currentStep === 1 ? 1 : currentStep === 2 ? 2 : currentStep <= 4 ? 3 : 4,
  }

  // Construct active SimulationResult
  const simulation: SimulationResult | null = currentStep === 0 && !isSimulating
    ? null
    : {
        ...mockSimulationResult,
        summary: activeSummary,
        events: activeEvents,
        alerts: activeAlerts,
        attack_path: activeAttackPath,
      }

  // Graph state: nodes turn compromised/alerted and STAY compromised once visited!
  const graph: GraphData = {
    nodes: mockInitialGraph.nodes.map((n) => {
      if (n.id === 'external-actor') {
        return { ...n, status: currentStep >= 1 ? 'external' : 'healthy' }
      }
      if (n.id === 'web-server-01') {
        return { ...n, status: currentStep >= 2 ? 'compromised' : 'healthy' }
      }
      if (n.id === 'decoy-payroll-file') {
        return { ...n, status: currentStep >= 3 ? 'alert' : 'healthy' }
      }
      if (n.id === 'honey-credential-01') {
        return { ...n, status: currentStep >= 4 ? 'alert' : 'healthy' }
      }
      if (n.id === 'decoy-server-01') {
        return { ...n, status: currentStep >= 5 ? 'alert' : 'healthy' }
      }
      if (n.id === 'database-server-01') {
        return { ...n, status: currentStep >= 6 ? 'compromised' : 'healthy' }
      }
      return n
    }),
    edges: mockInitialGraph.edges.map((e) => {
      // Normal internal line
      if (e.source === 'employee-pc-01' && e.target === 'file-server-01') {
        return { ...e, status: 'normal', is_attack_path: false }
      }
      // Edge 1: External -> Web Server (active when currentStep >= 1)
      if (e.source === 'external-actor' && e.target === 'web-server-01') {
        return { ...e, status: currentStep >= 1 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 1 }
      }
      // Edge 2: Web Server -> Payroll Records (active when currentStep >= 2)
      if (e.source === 'web-server-01' && e.target === 'decoy-payroll-file') {
        return { ...e, status: currentStep >= 2 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 2 }
      }
      // Edge 3: Payroll Records -> Admin Credentials (active when currentStep >= 3)
      if (e.source === 'decoy-payroll-file' && e.target === 'honey-credential-01') {
        return { ...e, status: currentStep >= 3 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 3 }
      }
      // Edge 4: Admin Credentials -> Decoy Server (active when currentStep >= 4)
      if (e.source === 'honey-credential-01' && e.target === 'decoy-server-01') {
        return { ...e, status: currentStep >= 4 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 4 }
      }
      // Edge 5: Decoy Server -> Database Server (active when currentStep >= 5)
      if (e.source === 'decoy-server-01' && e.target === 'database-server-01') {
        return { ...e, status: currentStep >= 5 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 5 }
      }
      return e
    }),
  }

  return {
    simulation,
    graph,
    currentStep,
    isSimulating,
    isLoading: isSimulating,
    error,
    backendAvailable,
    toastMessage,
    runSimulation,
    resetDemo,
  }
}
