import React from 'react'
import type { GraphData, Asset } from '../types/api'
import { Laptop, Server, FileWarning, KeyRound } from 'lucide-react'

interface NetworkGraphProps {
  graph: GraphData
  activePath?: string[]
}

interface NodeCoords {
  x: number
  y: number
}

// Preset visual coordinates for stable, aesthetic layout
const NODE_COORDINATES: Record<string, NodeCoords> = {
  'employee-pc-01': { x: 120, y: 190 },
  'file-server-01': { x: 380, y: 130 },
  'finance-server-01': { x: 640, y: 290 },
  'decoy-payroll-file': { x: 380, y: 310 },
  'honey-credential-01': { x: 640, y: 130 },
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ graph, activePath = [] }) => {

  const getNodeIcon = (kind: Asset['kind']) => {
    switch (kind) {
      case 'endpoint':
        return Laptop
      case 'server':
        return Server
      case 'decoy_file':
        return FileWarning
      case 'honey_credential':
        return KeyRound
      default:
        return Server
    }
  }

  return (
    <div className="panel-card network-graph-panel">
      <div className="panel-header">
        <div>
          <h2 className="panel-title">Network Deception Topology</h2>
          <p className="panel-subtitle">Simulated enterprise perimeter, internal shares & active decoy traps</p>
        </div>
        <div className="graph-badges">
          <span className="badge badge-decoy">2 Decoys Active</span>
          <span className="badge badge-sensors">Live Tripwires</span>
        </div>
      </div>

      <div className="graph-container">
        <svg viewBox="0 0 780 400" className="topology-svg" role="img" aria-label="Network Deception Topology Graph">
          <defs>
            {/* Standard edge marker */}
            <marker id="arrowNormal" markerWidth="8" markerHeight="8" refX="28" refY="4" orient="auto">
              <polygon points="0 0, 8 4, 0 8" fill="#475569" />
            </marker>
            {/* Traversed edge marker */}
            <marker id="arrowTraversed" markerWidth="10" markerHeight="10" refX="30" refY="5" orient="auto">
              <polygon points="0 0, 10 5, 0 10" fill="#38bdf8" />
            </marker>
            {/* Suspicious/Decoy alert marker */}
            <marker id="arrowAlert" markerWidth="10" markerHeight="10" refX="30" refY="5" orient="auto">
              <polygon points="0 0, 10 5, 0 10" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Render edges */}
          {graph.edges.map((edge, idx) => {
            const src = NODE_COORDINATES[edge.source] || { x: 100, y: 100 }
            const tgt = NODE_COORDINATES[edge.target] || { x: 200, y: 200 }
            const isAlert = edge.status === 'suspicious'
            const isTraversed = edge.status === 'traversed'
            const marker = isAlert ? 'url(#arrowAlert)' : isTraversed ? 'url(#arrowTraversed)' : 'url(#arrowNormal)'
            const strokeClass = isAlert ? 'edge-line edge-alert' : isTraversed ? 'edge-line edge-traversed' : 'edge-line'

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={src.x}
                  y1={src.y}
                  x2={tgt.x}
                  y2={tgt.y}
                  className={strokeClass}
                  markerEnd={marker}
                />
                {isAlert && (
                  <circle className="edge-pulse-dot" r="4" fill="#f43f5e">
                    <animateMotion
                      path={`M${src.x},${src.y} L${tgt.x},${tgt.y}`}
                      dur="1.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            )
          })}

          {/* Render nodes */}
          {graph.nodes.map((node) => {
            const coords = NODE_COORDINATES[node.id] || { x: 200, y: 200 }
            const isDecoy = node.is_decoy
            const isAlert = node.status === 'alert'
            const isSuspicious = node.status === 'suspicious'
            const isHighlighted = activePath.includes(node.id)

            const boxClass = isAlert
              ? 'node-card node-alert'
              : isDecoy
              ? 'node-card node-decoy'
              : isSuspicious || isHighlighted
              ? 'node-card node-suspicious'
              : 'node-card node-healthy'

            const Icon = getNodeIcon(node.kind)

            return (
              <g
                key={node.id}
                transform={`translate(${coords.x}, ${coords.y})`}
                className="node-group"
              >
                {/* Background Card */}
                <rect
                  x="-75"
                  y="-35"
                  width="150"
                  height="70"
                  rx="10"
                  className={boxClass}
                />

                {/* Status beacon dot */}
                <circle
                  cx="-56"
                  cy="-18"
                  r="5"
                  className={isAlert ? 'beacon-pulse red-pulse' : isDecoy ? 'beacon-decoy' : 'beacon-green'}
                />

                {/* Node icon label */}
                <foreignObject x="-70" y="-12" width="140" height="42">
                  <div className="node-content">
                    <div className="node-icon-row">
                      <Icon size={14} className="node-icon" />
                      <span className="node-name" title={node.name}>{node.name}</span>
                    </div>
                    <span className="node-kind-tag">
                      {isDecoy ? 'TRIPWIRE DECOY' : node.kind.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </foreignObject>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="graph-legend">
          <div className="legend-item">
            <span className="legend-swatch green-swatch"></span>
            <span>Healthy Host</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch blue-swatch"></span>
            <span>Traversed Path</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch red-swatch"></span>
            <span>Tripped Decoy / Alert</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch purple-swatch"></span>
            <span>Armed Canary Token</span>
          </div>
        </div>
      </div>
    </div>
  )
}
