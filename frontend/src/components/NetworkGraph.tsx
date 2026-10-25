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
  subName?: string
  ip: string
  kind: 'external' | 'server' | 'endpoint' | 'decoy_file' | 'honey_credential'
  isDecoy: boolean
}

// Optimized node coordinates: Wide 160px gap between Payroll Records (440) and Admin Credentials (600)
// This completely prevents any possibility of text overlap!
// Optimized node coordinates distributed across 880x400 canvas (occupying >90% width/height)
// Wide spacing prevents text collisions and makes topology the clear visual centerpiece.
const TOPOLOGY_NODES: Record<string, NodePosition> = {
  'employee-pc-01': {
    x: 240,
    y: 70,
    name: 'Employee PC',
    ip: '10.0.0.12',
    kind: 'endpoint',
    isDecoy: false,
  },
  'file-server-01': {
    x: 450,
    y: 70,
    name: 'File Server',
    ip: '10.0.0.8',
    kind: 'server',
    isDecoy: false,
  },
  'external-actor': {
    x: 75,
    y: 190,
    name: 'External Actor',
    ip: '203.0.113.44',
    kind: 'external',
    isDecoy: false,
  },
  'web-server-01': {
    x: 240,
    y: 190,
    name: 'Web Server',
    ip: '10.0.0.5',
    kind: 'server',
    isDecoy: false,
  },
  'decoy-payroll-file': {
    x: 450,
    y: 190,
    name: 'Payroll Records',
    subName: '(decoy file)',
    ip: '10.0.0.30',
    kind: 'decoy_file',
    isDecoy: true,
  },
  'admin-credentials-decoy': {
    x: 650,
    y: 190,
    name: 'Admin Credentials',
    subName: '(decoy)',
    ip: '10.0.0.40',
    kind: 'honey_credential',
    isDecoy: true,
  },
  'hr-workstation-01': {
    x: 450,
    y: 310,
    name: 'HR Workstation',
    ip: '10.0.0.14',
    kind: 'endpoint',
    isDecoy: false,
  },
  'decoy-server-01': {
    x: 650,
    y: 310,
    name: 'Decoy Server',
    ip: '10.0.0.50',
    kind: 'server',
    isDecoy: true,
  },
  'database-server-01': {
    x: 815,
    y: 310,
    name: 'Database Server',
    ip: '10.0.0.10',
    kind: 'server',
    isDecoy: false,
  },
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ graph: _graph, activePath: _activePath = [], currentStep = 6 }) => {
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

      {/* SVG Canvas - NO UNPOSITIONED ELEMENTS AT (0,0) */}
      <div className="topology-canvas-container">
        <svg
          viewBox="0 0 880 390"
          preserveAspectRatio="xMidYMid meet"
          className="topology-svg"
          role="img"
          aria-label="DeceptiTrace Interactive Topology Canvas"
        >
          <defs>
            <marker
              id="arrow-attack"
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto"
            >
              <polygon points="0 2, 7 5, 0 8" fill="#dc2626" />
            </marker>

            <marker
              id="arrow-normal"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto"
            >
              <polygon points="0 2, 6 5, 0 8" fill="#9ca3af" />
            </marker>
          </defs>

          {/* 1. Normal Connections */}
          <line
            x1={TOPOLOGY_NODES['employee-pc-01'].x + 24}
            y1={TOPOLOGY_NODES['employee-pc-01'].y}
            x2={TOPOLOGY_NODES['file-server-01'].x - 24}
            y2={TOPOLOGY_NODES['file-server-01'].y}
            className="conn-normal"
            markerEnd="url(#arrow-normal)"
          />

          <line
            x1={TOPOLOGY_NODES['employee-pc-01'].x}
            y1={TOPOLOGY_NODES['employee-pc-01'].y + 24}
            x2={TOPOLOGY_NODES['web-server-01'].x}
            y2={TOPOLOGY_NODES['web-server-01'].y - 24}
            className="conn-normal"
            markerEnd="url(#arrow-normal)"
          />

          <line
            x1={TOPOLOGY_NODES['web-server-01'].x + 21}
            y1={TOPOLOGY_NODES['web-server-01'].y + 12}
            x2={TOPOLOGY_NODES['hr-workstation-01'].x - 21}
            y2={TOPOLOGY_NODES['hr-workstation-01'].y - 12}
            className="conn-normal"
            markerEnd="url(#arrow-normal)"
          />

          {/* 2. Observed Attack Path Segments (Pure animated dashed stroke, zero top-left glitch) */}
          {currentStep >= 1 && (
            <line
              x1={TOPOLOGY_NODES['external-actor'].x + 26}
              y1={TOPOLOGY_NODES['external-actor'].y}
              x2={TOPOLOGY_NODES['web-server-01'].x - 24}
              y2={TOPOLOGY_NODES['web-server-01'].y}
              className="conn-attack-dashed"
              markerEnd="url(#arrow-attack)"
            />
          )}

          {currentStep >= 2 && (
            <line
              x1={TOPOLOGY_NODES['web-server-01'].x + 24}
              y1={TOPOLOGY_NODES['web-server-01'].y}
              x2={TOPOLOGY_NODES['decoy-payroll-file'].x - 24}
              y2={TOPOLOGY_NODES['decoy-payroll-file'].y}
              className="conn-attack-dashed"
              markerEnd="url(#arrow-attack)"
            />
          )}

          {currentStep >= 3 && (
            <line
              x1={TOPOLOGY_NODES['decoy-payroll-file'].x + 24}
              y1={TOPOLOGY_NODES['decoy-payroll-file'].y}
              x2={TOPOLOGY_NODES['admin-credentials-decoy'].x - 24}
              y2={TOPOLOGY_NODES['admin-credentials-decoy'].y}
              className="conn-attack-dashed"
              markerEnd="url(#arrow-attack)"
            />
          )}

          {currentStep >= 4 && (
            <line
              x1={TOPOLOGY_NODES['admin-credentials-decoy'].x}
              y1={TOPOLOGY_NODES['admin-credentials-decoy'].y + 24}
              x2={TOPOLOGY_NODES['decoy-server-01'].x}
              y2={TOPOLOGY_NODES['decoy-server-01'].y - 24}
              className="conn-attack-dashed"
              markerEnd="url(#arrow-attack)"
            />
          )}

          {currentStep >= 5 && (
            <line
              x1={TOPOLOGY_NODES['decoy-server-01'].x + 24}
              y1={TOPOLOGY_NODES['decoy-server-01'].y}
              x2={TOPOLOGY_NODES['database-server-01'].x - 24}
              y2={TOPOLOGY_NODES['database-server-01'].y}
              className="conn-attack-dashed"
              markerEnd="url(#arrow-attack)"
            />
          )}

          {/* 3. Render Nodes */}
          {Object.entries(TOPOLOGY_NODES).map(([id, node]) => {
            const Icon = getNodeIcon(node.kind)
            const isActor = node.kind === 'external'

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

            let circleClass = 'node-circle circle-real'
            if (isActor) {
              circleClass = 'node-circle circle-actor'
            } else if (node.isDecoy) {
              circleClass = isAlerted ? 'node-circle circle-decoy-alerted' : 'node-circle circle-decoy'
            } else if (isCompromised) {
              circleClass = 'node-circle circle-real-compromised'
            }

            let badgeClass = 'node-pill pill-healthy'
            if (isActor) {
              badgeClass = 'node-pill pill-actor'
            } else if (node.isDecoy) {
              badgeClass = 'node-pill pill-decoy'
            } else if (isCompromised) {
              badgeClass = 'node-pill pill-compromised'
            }

            const hasSub = Boolean(node.subName)

            return (
              <g
                key={id}
                transform={`translate(${node.x}, ${node.y})`}
                className={`node-item-group ${isAlerted || isCompromised || (isActor && isActorActive) ? 'node-group-active' : ''}`}
              >
                {/* Node Avatar Circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isActor ? '26' : '23'}
                  className={circleClass}
                />

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

                {/* Node Title with optional subtitle to prevent horizontal text collision */}
                <text x="0" y="34" className="node-label-title" textAnchor="middle">
                  {node.name}
                </text>
                {hasSub && (
                  <text x="0" y="45" className="node-label-sub" textAnchor="middle">
                    {node.subName}
                  </text>
                )}

                {/* Node IP Address */}
                <text x="0" y={hasSub ? "57" : "47"} className="node-label-ip" textAnchor="middle">
                  {node.ip}
                </text>

                {/* Status Pill Badge */}
                <foreignObject x="-35" y={hasSub ? "62" : "52"} width="70" height="18">
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
