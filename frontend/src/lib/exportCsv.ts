import type { SecurityEvent, Alert } from '../types/api'

export function downloadIncidentReportCsv(
  events: SecurityEvent[],
  alerts: Alert[],
  simulationId: string = 'sim-001'
): void {
  const generatedTime = new Date().toISOString()
  const generatedLocalTime = new Date().toLocaleString()

  // 1. Report Metadata & Executive Header
  const metadataLines = [
    '# =========================================================================================',
    '# DECEPTITRACE — AUTONOMOUS CYBER DECEPTION & FORENSIC INCIDENT REPORT',
    '# =========================================================================================',
    `# Simulation ID: ${simulationId}`,
    '# Scenario: Credential Lateral Movement & Canary Tripwire Detection',
    `# Generated At (UTC): ${generatedTime}`,
    `# Generated At (Local): ${generatedLocalTime}`,
    '# Ingress Threat Actor IP: 203.0.113.44 (External Infiltration)',
    '# Target Network: DMZ & Production VLAN (10.0.0.0/24)',
    '# Incident Containment Status: 100% CONTAINED IN DECEPTION SANDBOX',
    '# Production Data Breached: 0 BYTES',
    `# Total Recorded Events: ${events.length}`,
    `# Total Security Alerts: ${alerts.length}`,
    '# =========================================================================================',
    '',
  ]

  // 2. Section: Reconstructed Attack Path Chronology
  const attackPathHeaders = [
    'Step',
    'Timestamp',
    'Stage_Name',
    'Source_Asset',
    'Source_IP',
    'Target_Asset',
    'Target_IP',
    'Detection_Status',
  ]

  const attackPathSteps = [
    { step: 1, name: '1. Initial Entry', src: 'External Actor', srcIp: '203.0.113.44', tgt: 'Web Server', tgtIp: '10.0.0.5' },
    { step: 2, name: '2. Web Server Access', src: 'External Actor', srcIp: '203.0.113.44', tgt: 'Web Server', tgtIp: '10.0.0.5' },
    { step: 3, name: '3. Decoy File Access', src: 'Web Server', srcIp: '10.0.0.5', tgt: 'Payroll Records (Decoy)', tgtIp: '10.0.0.30' },
    { step: 4, name: '4. Decoy Credentials', src: 'Web Server', srcIp: '10.0.0.5', tgt: 'Admin Credentials (Decoy)', tgtIp: '10.0.0.40' },
    { step: 5, name: '5. Lateral Movement', src: 'Admin Credentials', srcIp: '10.0.0.40', tgt: 'Decoy Server', tgtIp: '10.0.0.50' },
    { step: 6, name: '6. Real Server Touched', src: 'Decoy Server', srcIp: '10.0.0.50', tgt: 'Database Server', tgtIp: '10.0.0.10' },
  ]

  const attackPathRows = attackPathSteps.map((s, idx) => {
    const evt = events[idx]
    const time = evt?.timestamp || '--:--:--'
    return [
      s.step,
      time,
      `"${s.name}"`,
      `"${s.src}"`,
      s.srcIp,
      `"${s.tgt}"`,
      s.tgtIp,
      'Observed',
    ].join(',')
  })

  // 3. Section: Detailed Security Events Log
  const eventHeaders = [
    'Event_ID',
    'Timestamp',
    'Event_Type',
    'Severity',
    'Source_Asset_ID',
    'Target_Asset_ID',
    'Decoy_Interaction',
    'Event_Description',
    'Technical_Metadata',
  ]

  const eventRows = events.map((e) => {
    const metaStr = Object.entries(e.metadata || {})
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')

    return [
      e.id,
      e.timestamp,
      e.event_type,
      e.severity.toUpperCase(),
      e.source_asset_id,
      e.target_asset_id,
      e.is_decoy_interaction ? 'YES (TRIPWIRE)' : 'NO (STANDARD)',
      `"${e.message.replace(/"/g, '""')}"`,
      `"${metaStr.replace(/"/g, '""')}"`,
    ].join(',')
  })

  // 4. Section: Security Alerts & Forensics
  const alertHeaders = [
    'Alert_ID',
    'Timestamp',
    'Severity',
    'Alert_Title',
    'Source_Host',
    'Target_Decoy_Asset',
    'Reason_For_Alert',
    'Forensic_Evidence',
    'Recommended_Mitigation',
  ]

  const alertRows = alerts.map((a) => {
    const evidenceStr = (a.evidence || []).join(' | ')
    const actionsStr = (a.recommended_actions || []).join(' | ')

    return [
      a.id,
      a.created_at,
      a.severity.toUpperCase(),
      `"${a.title.replace(/"/g, '""')}"`,
      `"${(a.source_label || a.source_asset_id).replace(/"/g, '""')}"`,
      `"${(a.target_label || a.target_asset_id).replace(/"/g, '""')}"`,
      `"${(a.reason || a.description).replace(/"/g, '""')}"`,
      `"${evidenceStr.replace(/"/g, '""')}"`,
      `"${actionsStr.replace(/"/g, '""')}"`,
    ].join(',')
  })

  // Assemble full CSV content with UTF-8 BOM
  const fullCsvContent = [
    ...metadataLines,
    '[SECTION: RECONSTRUCTED ATTACK PATH]',
    attackPathHeaders.join(','),
    ...attackPathRows,
    '',
    '[SECTION: DETAILED SECURITY TELEMETRY EVENTS]',
    eventHeaders.join(','),
    ...eventRows,
    '',
    '[SECTION: DECOY DETECTION ALERTS & REMEDIATION]',
    alertHeaders.join(','),
    ...alertRows,
  ].join('\r\n')

  // Create blob with UTF-8 BOM for Microsoft Excel / Google Sheets compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + fullCsvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')

  link.setAttribute('href', url)
  link.setAttribute('download', `deceptitrace-forensic-report-${dateStr}-${timeStr}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
