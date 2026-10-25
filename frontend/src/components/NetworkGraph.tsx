import React from 'react'
import type { GraphData } from '../types/api'
import {
  Network,
  Server,
  Monitor,
  FileSpreadsheet,
  Key,
  Database,
  UserX,
} from 'lucide-react'

interface NetworkGraphProps {
  graph: GraphData
  activePath?: string[]
  currentStep?: number
}

interface NodePosition {
  x: number
  y: number
  name: string
  ip: string
  kind: 'external' | 'server' | 'endpoint' | 'decoy_file' | 'honey_credential'
  isDecoy: boolean
}

const TOPOLOGY_NODES: Record<string, NodePosition> = {
  'employee-pc-01': {
    x: 315,
    y: 105,
    name: 'Employee PC',
    ip: '10.0.0.12',
    kind: 'endpoint',
    isDecoy: false,
  },
  'file-server-01': {
    x: 450,
    y: 105,
    name: 'File Server',
    ip: '10.0.0.8',
    kind: 'server',
    isDecoy: false,
  },
  'external-actor': {
    x: 200,
    y: 215,
    name: 'External Actor',
    ip: '203.0.113.44',
    kind: 'external',
    isDecoy: false,
  },
  'web-server-01': {
    x: 315,
    y: 215,
    name: 'Web Server',
    ip: '10.0.0.5',
    kind: 'server',
    isDecoy: false,
  },
  'decoy-payroll-file': {
    x: 450,
    y: 215,
    name: 'Payroll Records (decoy file)',
    ip: '10.0.0.30',
    kind: 'decoy_file',
    isDecoy: true,
  },
  'admin-credentials-decoy': {
    x: 585,
    y: 215,
    name: 'Admin Credentials (decoy)',
    ip: '10.0.0.40',
    kind: 'honey_credential',
    isDecoy: true,
  },
  'hr-workstation-01': {
    x: 415,
    y: 320,
    name: 'HR Workstation',
    ip: '10.0.0.14',
    kind: 'endpoint',
    isDecoy: false,
  },
  'decoy-server-01': {
    x: 585,
    y: 320,
    name: 'Decoy Server',
    ip: '10.0.0.50',
    kind: 'server',
    isDecoy: true,
  },
  'database-server-01': {
    x: 700,
    y: 320,
    name: 'Database Server',
    ip: '10.0.0.10',
    kind: 'server',
    isDecoy: false,
  },
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ currentStep = 0 }) => {
  const getNodeIcon = (kind: NodePosition['kind']) => {
    switch (kind) {
      case 'external':
        return UserX
      case 'endpoint':
        return Monitor
      case 'decoy_file':
        return FileSpreadsheet
      case 'honey_credential':
        return Key
      case 'server':
        return Server
      default:
        return Database
    }
  }

  // Node statuses determined dynamically by real-time attack step:
  // Once a node is reached, it TURNS RED/COMPROMISED/ALERTED and REMAINS RED even as attack progresses!
  const isActorActive = currentStep >= 1
  const isWebServerCompromised = currentStep >= 2
  const isPayrollDecoyAlerted = currentStep >= 3
  const isHoneyCredsAlerted = currentStep >= 4
  const isDecoyServerAlerted = currentStep >= 5
  const isDatabaseCompromised = currentStep >= 6

  return (
    <div className="panel-card network-sim-card">
      {/* Header and Legend */}
      <div className="panel-header-row">
        <div className="panel-title-group">
          <Network size={18} className="panel-title-icon" />
          <h2 className="panel-title-text">Network Simulation</h2>
        </div>

        <div className="topology-legend">
          <div className="legend-entry">
            <span className="dot dot-green"></span>
            <span>Real Asset</span>
          </div>
          <div className="legend-entry">
            <span className="dot dot-amber"></span>
            <span>Decoy Asset</span>
          </div>
          <div className="legend-entry">
            <span className="dot dot-red"></span>
            <span>Intruder (External)</span>
          </div>
          <div className="legend-entry">
            <span className="line-legend line-normal"></span>
            <span>Normal Connection</span>
          </div>
          <div className="legend-entry">
            <span className="line-legend line-attack"></span>
            <span>Attack Path (Observed)</span>
          </div>
          <div className="legend-entry">
            <span className="line-legend line-inferred"></span>
            <span>Inferred Movement</span>
          </div>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="topology-canvas-container">
        <svg
          viewBox="0 0 760 380"
          className="topology-svg"
          role="img"
          aria-label="DeceptiTrace Interactive Topology Canvas"
        >
          <defs>
            {/* Red Arrow Marker for Observed Attack Path */}
            <marker
              id="arrow-attack"
              markerWidth="8"
              markerHeight="8"
              refX="18"
              refY="4"
              orient="auto"
            >
              <polygon points="0 1, 8 4, 0 7" fill="#dc2626" />
            </marker>

            {/* Gray Arrow Marker for Normal Connections */}
            <marker
              id="arrow-normal"
              markerWidth="7"
              markerHeight="7"
              refX="16"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 1, 6 3.5, 0 6" fill="#9ca3af" />
            </marker>
          </defs>

          {/* 1. Normal Connections (Always Visible) */}
          <line
            x1={TOPOLOGY_NODES['employee-pc-01'].x + 22}
            y1={TOPOLOGY_NODES['employee-pc-01'].y}
            x2={TOPOLOGY_NODES['file-server-01'].x - 22}
            y2={TOPOLOGY_NODES['file-server-01'].y}
            className="conn-normal"
            markerEnd="url(#arrow-normal)"
            markerStart="url(#arrow-normal)"
          />

          <line
            x1={TOPOLOGY_NODES['employee-pc-01'].x}
            y1={TOPOLOGY_NODES['employee-pc-01'].y + 22}
            x2={TOPOLOGY_NODES['web-server-01'].x}
            y2={TOPOLOGY_NODES['web-server-01'].y - 22}
            className="conn-normal"
            markerEnd="url(#arrow-normal)"
            markerStart="url(#arrow-normal)"
          />

          <line
            x1={TOPOLOGY_NODES['web-server-01'].x + 18}
            y1={TOPOLOGY_NODES['web-server-01'].y + 18}
            x2={TOPOLOGY_NODES['hr-workstation-01'].x - 18}
            y2={TOPOLOGY_NODES['hr-workstation-01'].y - 18}
            className="conn-normal"
            markerEnd="url(#arrow-normal)"
          />

          {/* 2. Real-Time Observed Attack Path Segments with Animated Traveling Laser Beam */}
          {/* Segment 1: External Actor -> Web Server (Step >= 1) */}
          {currentStep >= 1 && (
            <g className="attack-path-segment">
              <line
                x1={TOPOLOGY_NODES['external-actor'].x + 22}
                y1={TOPOLOGY_NODES['external-actor'].y}
                x2={TOPOLOGY_NODES['web-server-01'].x - 22}
                y2={TOPOLOGY_NODES['web-server-01'].y}
                className="conn-attack-dashed"
                markerEnd="url(#arrow-attack)"
              />
              {currentStep === 1 && (
                <circle r="4" fill="#DC2626" className="traveling-laser-pulse">
                  <animateMotion
                    path={`M${TOPOLOGY_NODES['external-actor'].x + 22},${TOPOLOGY_NODES['external-actor'].y} L${TOPOLOGY_NODES['web-server-01'].x - 22},${TOPOLOGY_NODES['web-server-01'].y}`}
                    dur="0.9s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}

          {/* Segment 2: Web Server -> Payroll Records Decoy (Step >= 2) */}
          {currentStep >= 2 && (
            <g className="attack-path-segment">
              <line
                x1={TOPOLOGY_NODES['web-server-01'].x + 22}
                y1={TOPOLOGY_NODES['web-server-01'].y}
                x2={TOPOLOGY_NODES['decoy-payroll-file'].x - 22}
                y2={TOPOLOGY_NODES['decoy-payroll-file'].y}
                className="conn-attack-dashed"
                markerEnd="url(#arrow-attack)"
              />
              {currentStep === 2 && (
                <circle r="4" fill="#DC2626" className="traveling-laser-pulse">
                  <animateMotion
                    path={`M${TOPOLOGY_NODES['web-server-01'].x + 22},${TOPOLOGY_NODES['web-server-01'].y} L${TOPOLOGY_NODES['decoy-payroll-file'].x - 22},${TOPOLOGY_NODES['decoy-payroll-file'].y}`}
                    dur="0.9s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}

          {/* Segment 3: Payroll Records Decoy -> Admin Credentials Decoy (Step >= 3) */}
          {currentStep >= 3 && (
            <g className="attack-path-segment">
              <line
                x1={TOPOLOGY_NODES['decoy-payroll-file'].x + 22}
                y1={TOPOLOGY_NODES['decoy-payroll-file'].y}
                x2={TOPOLOGY_NODES['admin-credentials-decoy'].x - 22}
                y2={TOPOLOGY_NODES['admin-credentials-decoy'].y}
                className="conn-attack-dashed"
                markerEnd="url(#arrow-attack)"
              />
              {currentStep === 3 && (
                <circle r="4" fill="#DC2626" className="traveling-laser-pulse">
                  <animateMotion
                    path={`M${TOPOLOGY_NODES['decoy-payroll-file'].x + 22},${TOPOLOGY_NODES['decoy-payroll-file'].y} L${TOPOLOGY_NODES['admin-credentials-decoy'].x - 22},${TOPOLOGY_NODES['admin-credentials-decoy'].y}`}
                    dur="0.9s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}

          {/* Segment 4: Admin Credentials -> Decoy Server (Step >= 4, Vertical Down) */}
          {currentStep >= 4 && (
            <g className="attack-path-segment">
              <line
                x1={TOPOLOGY_NODES['admin-credentials-decoy'].x}
                y1={TOPOLOGY_NODES['admin-credentials-decoy'].y + 22}
                x2={TOPOLOGY_NODES['decoy-server-01'].x}
                y2={TOPOLOGY_NODES['decoy-server-01'].y - 22}
                className="conn-attack-dashed"
                markerEnd="url(#arrow-attack)"
              />
              {currentStep === 4 && (
                <circle r="4" fill="#DC2626" className="traveling-laser-pulse">
                  <animateMotion
                    path={`M${TOPOLOGY_NODES['admin-credentials-decoy'].x},${TOPOLOGY_NODES['admin-credentials-decoy'].y + 22} L${TOPOLOGY_NODES['decoy-server-01'].x},${TOPOLOGY_NODES['decoy-server-01'].y - 22}`}
                    dur="0.9s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}

          {/* Segment 5: Decoy Server -> Database Server (Step >= 5, Horizontal Right) */}
          {currentStep >= 5 && (
            <g className="attack-path-segment">
              <line
                x1={TOPOLOGY_NODES['decoy-server-01'].x + 22}
                y1={TOPOLOGY_NODES['decoy-server-01'].y}
                x2={TOPOLOGY_NODES['database-server-01'].x - 22}
                y2={TOPOLOGY_NODES['database-server-01'].y}
                className="conn-attack-dashed"
                markerEnd="url(#arrow-attack)"
              />
              {currentStep === 5 && (
                <circle r="4" fill="#DC2626" className="traveling-laser-pulse">
                  <animateMotion
                    path={`M${TOPOLOGY_NODES['decoy-server-01'].x + 22},${TOPOLOGY_NODES['decoy-server-01'].y} L${TOPOLOGY_NODES['database-server-01'].x - 22},${TOPOLOGY_NODES['database-server-01'].y}`}
                    dur="0.9s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          )}

          {/* 3. Render Nodes with Live Real-Time State */}
          {Object.entries(TOPOLOGY_NODES).map(([id, node]) => {
            const Icon = getNodeIcon(node.kind)
            const isActor = node.kind === 'external'

            // Dynamic status logic
            let isCompromised = false
            let isAlerted = false
            let statusLabel = 'Healthy'

            if (id === 'external-actor') {
              statusLabel = 'External'
            } else if (id === 'web-server-01') {
              isCompromised = isWebServerCompromised
              statusLabel = isWebServerCompromised ? 'Compromised' : 'Healthy'
            } else if (id === 'decoy-payroll-file') {
              isAlerted = isPayrollDecoyAlerted
              statusLabel = 'Decoy'
            } else if (id === 'admin-credentials-decoy') {
              isAlerted = isHoneyCredsAlerted
              statusLabel = 'Decoy'
            } else if (id === 'decoy-server-01') {
              isAlerted = isDecoyServerAlerted
              statusLabel = 'Decoy'
            } else if (id === 'database-server-01') {
              isCompromised = isDatabaseCompromised
              statusLabel = isDatabaseCompromised ? 'Compromised' : 'Healthy'
            } else {
              statusLabel = 'Healthy'
            }

            // Circle style
            let circleClass = 'node-circle circle-real'
            if (isActor) {
              circleClass = 'node-circle circle-actor'
            } else if (node.isDecoy) {
              circleClass = isAlerted ? 'node-circle circle-decoy-alerted' : 'node-circle circle-decoy'
            } else if (isCompromised) {
              circleClass = 'node-circle circle-real-compromised'
            }

            // Pill badge style
            let badgeClass = 'node-pill pill-healthy'
            if (isActor) {
              badgeClass = 'node-pill pill-actor'
            } else if (node.isDecoy) {
              badgeClass = 'node-pill pill-decoy'
            } else if (isCompromised) {
              badgeClass = 'node-pill pill-compromised'
            }

            return (
              <g
                key={id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`node-item-group ${isCompromised || isAlerted ? 'node-alerted-bounce' : ''}`}
              >
                {/* Node Avatar Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isActor ? '24' : '20'}
                  className={circleClass}
                />

                {/* Animated Pulsing Halo when active/alerted */}
                {(isActorActive && isActor) || isAlerted || isCompromised ? (
                  <circle cx="0" cy="0" r="28" className="beacon-actor-pulse" />
                ) : null}

                {/* Inner Icon */}
                <foreignObject
                  x={isActor ? -11 : -9}
                  y={isActor ? -11 : -9}
                  width={isActor ? 22 : 18}
                  height={isActor ? 22 : 18}
                  className="node-icon-foreign"
                >
                  <Icon
                    size={isActor ? 22 : 18}
                    className={`node-glyph ${isActor ? 'glyph-actor' : node.isDecoy ? 'glyph-decoy' : 'glyph-real'}`}
                  />
                </foreignObject>

                {/* Text Labels below node */}
                <text x="0" y="32" className="node-label-title" textAnchor="middle">
                  {node.name}
                </text>
                <text x="0" y="44" className="node-label-ip" textAnchor="middle">
                  {node.ip}
                </text>

                {/* Status Pill Badge */}
                <foreignObject x="-36" y="49" width="72" height="18">
                  <div className={`status-pill-wrap ${badgeClass}`}>
                    <span>{statusLabel}</span>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>
      </div>
    </div>
  )
}
