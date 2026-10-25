import { useState, useEffect, useCallback, useRef } from 'react'
import type { SimulationResult, GraphData, SecurityEvent, Alert, AttackPathStep, SimulationSummary } from '../types/api'
import { api } from '../lib/api'
import { mockSimulationResult, mockInitialGraph } from '../data/mockData'

export function useSimulation() {
  // Start at step 0 so the dashboard begins at clean baseline, ready to run live simulation
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [backendAvailable, setBackendAvailable] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Real-time dynamic timestamps generated from current live clock
  const [stepTimestamps, setStepTimestamps] = useState<Record<number, string>>(() => {
    const now = Date.now()
    return {
      1: new Date(now - 134000).toLocaleTimeString('en-US', { hour12: false }),
      2: new Date(now - 117000).toLocaleTimeString('en-US', { hour12: false }),
      3: new Date(now - 90000).toLocaleTimeString('en-US', { hour12: false }),
      4: new Date(now - 64000).toLocaleTimeString('en-US', { hour12: false }),
      5: new Date(now - 31000).toLocaleTimeString('en-US', { hour12: false }),
      6: new Date(now).toLocaleTimeString('en-US', { hour12: false }),
    }
  })

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

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
      timersRef.current.forEach((t) => clearTimeout(t))
    }
  }, [])

  // Auto-clear toast banner
  useEffect(() => {
    if (toastMessage) {
      const t = setTimeout(() => setToastMessage(null), 3000)
      return () => clearTimeout(t)
    }
  }, [toastMessage])

  // Real-time attack simulation trigger (zero layout shift, no blank flash)
  const runSimulation = useCallback(async () => {
    if (isSimulating) return
    setIsSimulating(true)
    setError(null)

    // Clear any previous timers
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []

    const startTime = Date.now()

    // Immediately start at Step 1 so items DO NOT disappear for 1 second!
    setCurrentStep(1)
    const initialTimestamps: Record<number, string> = {
      1: new Date(startTime).toLocaleTimeString('en-US', { hour12: false }),
    }
    setStepTimestamps(initialTimestamps)
    setToastMessage("Intruder recon detected from 203.0.113.44. Initiating telemetry trace...")

    // Trigger backend call asynchronously if available
    if (backendAvailable) {
      api.runSimulation('credential_lateral_movement').catch(() => null)
    }

    // Step-by-step progression with real-time timestamps
    const schedule = [
      { step: 2, delay: 1200, msg: "⚠️ Web Server 10.0.0.5 compromised via web exploit!" },
      { step: 3, delay: 2400, msg: "🚨 TRIPWIRE SPRUNG! Decoy file payroll_records_fake.xlsx accessed!" },
      { step: 4, delay: 3600, msg: "🚨 CANARY TRIGGERED! Planted admin_decoy credentials used!" },
      { step: 5, delay: 4800, msg: "🚨 HONEYPOT REACHED! Attacker routed to isolated Decoy Server 10.0.0.50!" },
      { step: 6, delay: 6000, msg: "🛡️ [Simulated] Scenario Complete: Database probe detected & blocked. Simulated containment applied." },
    ]

    schedule.forEach(({ step, delay, msg }) => {
      const timer = setTimeout(() => {
        const currentClockTime = new Date().toLocaleTimeString('en-US', { hour12: false })
        setCurrentStep(step)
        setStepTimestamps((prev) => ({
          ...prev,
          [step]: currentClockTime,
        }))
        setToastMessage(msg)

        if (step === 6) {
          setIsSimulating(false)
        }
      }, delay)
      timersRef.current.push(timer)
    })
  }, [isSimulating, backendAvailable])

  // Reset demo to baseline
  const resetDemo = useCallback(async () => {
    timersRef.current.forEach((t) => clearTimeout(t))
    timersRef.current = []
    setIsSimulating(false)
    setCurrentStep(0)
    setError(null)
    setToastMessage("System telemetry restored to clean baseline. Tripwires re-armed.")

    if (backendAvailable) {
      api.resetDemo().catch(() => null)
    }
  }, [backendAvailable])

  // Compute active events based on currentStep and real-time clock
  const activeEvents: SecurityEvent[] = mockSimulationResult.events
    .slice(0, currentStep)
    .map((e, idx) => {
      const stepNum = idx + 1
      const realTime = stepTimestamps[stepNum] || e.timestamp
      return {
        ...e,
        timestamp: realTime,
      }
    })

  // Compute active alerts
  let activeAlertsCount = 0
  if (currentStep >= 3) activeAlertsCount = 1
  if (currentStep >= 4) activeAlertsCount = 2
  if (currentStep >= 5) activeAlertsCount = 3
  if (currentStep >= 6) activeAlertsCount = 4

  const activeAlerts: Alert[] = mockSimulationResult.alerts
    .slice(0, activeAlertsCount)
    .map((a, idx) => {
      // Map alert timestamps to corresponding step times:
      // Alert 1 -> Step 3
      // Alert 2 -> Step 4
      // Alert 3 -> Step 5
      // Alert 4 -> Step 6
      const stepForAlert = idx + 3
      const realTime = stepTimestamps[stepForAlert] || a.created_at
      return {
        ...a,
        created_at: realTime,
      }
    })

  // Compute active attack path steps
  const activeAttackPath: AttackPathStep[] = mockSimulationResult.attack_path
    .slice(0, currentStep)
    .map((s, idx) => {
      const stepNum = idx + 1
      const realTime = stepTimestamps[stepNum] || s.timestamp
      return {
        ...s,
        timestamp: realTime,
      }
    })

  // Summary counts
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

  const simulation: SimulationResult = {
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
        return { ...n, status: currentStep >= 6 ? 'alert' : 'healthy' }
      }
      return n
    }),
    edges: mockInitialGraph.edges.map((e) => {
      if (e.source === 'employee-pc-01' && e.target === 'file-server-01') {
        return { ...e, status: 'normal', is_attack_path: false }
      }
      if (e.source === 'external-actor' && e.target === 'web-server-01') {
        return { ...e, status: currentStep >= 1 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 1 }
      }
      if (e.source === 'web-server-01' && e.target === 'decoy-payroll-file') {
        return { ...e, status: currentStep >= 2 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 2 }
      }
      if (e.source === 'decoy-payroll-file' && e.target === 'honey-credential-01') {
        return { ...e, status: currentStep >= 3 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 3 }
      }
      if (e.source === 'honey-credential-01' && e.target === 'decoy-server-01') {
        return { ...e, status: currentStep >= 4 ? 'suspicious' : 'normal', is_attack_path: currentStep >= 4 }
      }
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
    stepTimestamps,
    isSimulating,
    isLoading: isSimulating,
    error,
    backendAvailable,
    toastMessage,
    runSimulation,
    resetDemo,
  }
}
