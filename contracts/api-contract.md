# DeceptiTrace API Contract Specification

**Version:** 1.0.0  
**Base URL (Local):** `http://localhost:8000`  
**API Prefix:** `/api`  
**Standard Timestamp Format:** ISO 8601 UTC with `Z` suffix (`YYYY-MM-DDTHH:MM:SSZ`)

---

## 1. Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Backend liveness check |
| `GET` | `/api/assets` | Retrieve all network assets (normal + decoys) |
| `GET` | `/api/graph` | Retrieve topology nodes and edges with traversal status |
| `POST` | `/api/simulations/run` | Execute controlled attack scenario and return full result |
| `GET` | `/api/events` | List recorded security events (`?simulation_id=...`) |
| `GET` | `/api/alerts` | List generated detection alerts (`?simulation_id=...`) |
| `GET` | `/api/simulations/{id}` | Retrieve completed simulation by ID |
| `POST` | `/api/reset` | Clear simulation state while retaining base assets |

---

## 2. Shared Data Models

### Enums
- **Severity**: `"info"` | `"low"` | `"medium"` | `"high"` | `"critical"`
- **AssetKind**: `"endpoint"` | `"server"` | `"decoy_file"` | `"honey_credential"`
- **AssetStatus**: `"healthy"` | `"suspicious"` | `"alert"`
- **EdgeStatus**: `"normal"` | `"traversed"` | `"suspicious"`
- **EventType**: `"connection"` | `"file_access"` | `"credential_attempt"` | `"decoy_triggered"`
- **AlertStatus**: `"open"` | `"acknowledged"` | `"resolved"`

---

## 3. Detailed Request / Response Specifications

### `GET /api/health`
**Response (200 OK):**
```json
{
  "status": "ok"
}
```

### `GET /api/assets`
**Response (200 OK):**
```json
{
  "assets": [
    {
      "id": "employee-pc-01",
      "name": "Employee PC",
      "kind": "endpoint",
      "status": "healthy",
      "is_decoy": false,
      "description": "Simulated employee workstation"
    },
    {
      "id": "decoy-payroll-file",
      "name": "Payroll Records",
      "kind": "decoy_file",
      "status": "healthy",
      "is_decoy": true,
      "description": "Simulated decoy file"
    }
  ]
}
```

### `GET /api/graph`
**Response (200 OK):**
```json
{
  "nodes": [
    {
      "id": "employee-pc-01",
      "name": "Employee PC",
      "kind": "endpoint",
      "status": "healthy",
      "is_decoy": false,
      "description": "Simulated employee workstation"
    }
  ],
  "edges": [
    {
      "source": "employee-pc-01",
      "target": "file-server-01",
      "status": "normal"
    }
  ]
}
```

### `POST /api/simulations/run`
**Request Body:**
```json
{
  "scenario_id": "credential_lateral_movement"
}
```

**Response (200 OK):**
```json
{
  "simulation_id": "sim-001",
  "scenario_id": "credential_lateral_movement",
  "status": "completed",
  "started_at": "2026-10-25T10:15:00Z",
  "completed_at": "2026-10-25T10:15:03Z",
  "summary": {
    "events_count": 4,
    "alerts_count": 2,
    "assets_affected": 3
  },
  "events": [
    {
      "id": "evt-001",
      "simulation_id": "sim-001",
      "timestamp": "2026-10-25T10:15:00Z",
      "event_type": "connection",
      "source_asset_id": "employee-pc-01",
      "target_asset_id": "file-server-01",
      "severity": "low",
      "message": "Simulated connection to file server",
      "is_decoy_interaction": false,
      "metadata": {}
    },
    {
      "id": "evt-002",
      "simulation_id": "sim-001",
      "timestamp": "2026-10-25T10:15:01Z",
      "event_type": "decoy_triggered",
      "source_asset_id": "employee-pc-01",
      "target_asset_id": "decoy-payroll-file",
      "severity": "high",
      "message": "Interaction with a monitored decoy file",
      "is_decoy_interaction": true,
      "metadata": {
        "scenario": "credential_lateral_movement"
      }
    }
  ],
  "alerts": [
    {
      "id": "alert-001",
      "simulation_id": "sim-001",
      "event_id": "evt-002",
      "created_at": "2026-10-25T10:15:01Z",
      "severity": "high",
      "title": "Decoy File Access Detected",
      "description": "A simulated actor interacted with a monitored decoy file.",
      "source_asset_id": "employee-pc-01",
      "target_asset_id": "decoy-payroll-file",
      "status": "open",
      "evidence": [
        "An event targeted a configured decoy asset",
        "The event was linked to simulation sim-001"
      ],
      "recommended_actions": [
        "Investigate the source endpoint",
        "Review the associated event timeline"
      ]
    }
  ],
  "attack_path": [
    {
      "step": 1,
      "event_id": "evt-001",
      "asset_id": "employee-pc-01",
      "label": "Simulation started",
      "timestamp": "2026-10-25T10:15:00Z"
    },
    {
      "step": 2,
      "event_id": "evt-002",
      "asset_id": "decoy-payroll-file",
      "label": "Decoy interaction detected",
      "timestamp": "2026-10-25T10:15:01Z"
    }
  ]
}
```

### `GET /api/events`
Query param: `simulation_id` (optional)  
**Response (200 OK):**
```json
{
  "events": []
}
```

### `GET /api/alerts`
Query param: `simulation_id` (optional)  
**Response (200 OK):**
```json
{
  "alerts": []
}
```

### `GET /api/simulations/{id}`
Path param: `id` (e.g. `sim-001`)  
**Response (200 OK):** `SimulationResult`  
**Error (404 Not Found):**
```json
{
  "error": {
    "code": "SIMULATION_NOT_FOUND",
    "message": "The requested simulation does not exist."
  }
}
```

### `POST /api/reset`
**Response (200 OK):**
```json
{
  "status": "ok"
}
```
