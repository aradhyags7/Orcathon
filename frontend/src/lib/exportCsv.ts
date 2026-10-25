import type { SecurityEvent, Alert } from '../types/api'

export function downloadIncidentReportCsv(
  events: SecurityEvent[] = [],
  alerts: Alert[] = [],
  simulationId: string = 'sim-001'
): void {
  const rows: string[] = []

  // Section 1: Security Alerts
  rows.push('--- SECURITY ALERTS ---')
  rows.push('Alert ID,Created At,Severity,Title,Event ID,Source,Target,Status,Reason')
  for (const a of alerts) {
    const titleEsc = `"${(a.title || '').replace(/"/g, '""')}"`
    const reasonEsc = `"${(a.reason || a.description || '').replace(/"/g, '""')}"`
    rows.push([
      a.id,
      a.created_at,
      a.severity,
      titleEsc,
      a.event_id,
      a.source_label || a.source_asset_id,
      a.target_label || a.target_asset_id,
      a.status,
      reasonEsc,
    ].join(','))
  }

  rows.push('')

  // Section 2: Security Events
  rows.push('--- SECURITY EVENTS & TELEMETRY ---')
  rows.push('Event ID,Timestamp,Type,Source Asset,Target Asset,Severity,Decoy Interaction,Message')
  for (const e of events) {
    const msgEsc = `"${(e.message || '').replace(/"/g, '""')}"`
    rows.push([
      e.id,
      e.timestamp,
      e.event_type,
      e.source_asset_id,
      e.target_asset_id,
      e.severity,
      e.is_decoy_interaction ? 'YES' : 'NO',
      msgEsc,
    ].join(','))
  }

  const csvContent = rows.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `deceptitrace-incident-report-${simulationId}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
