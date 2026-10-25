export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface Asset {
  id: string;
  name: string;
  kind: "endpoint" | "server" | "decoy_file" | "honey_credential";
  status: "healthy" | "suspicious" | "alert";
  is_decoy: boolean;
  description: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  status: "normal" | "traversed" | "suspicious";
}

export interface SecurityEvent {
  id: string;
  simulation_id: string;
  timestamp: string;
  event_type: "connection" | "file_access" | "credential_attempt" | "decoy_triggered";
  source_asset_id: string;
  target_asset_id: string;
  severity: Severity;
  message: string;
  is_decoy_interaction: boolean;
  metadata: Record<string, unknown>;
}

export interface Alert {
  id: string;
  simulation_id: string;
  event_id: string;
  created_at: string;
  severity: Severity;
  title: string;
  description: string;
  source_asset_id: string;
  target_asset_id: string;
  status: "open" | "acknowledged" | "resolved";
  evidence: string[];
  recommended_actions: string[];
}

export interface AttackPathStep {
  step: number;
  event_id: string;
  asset_id: string;
  label: string;
  timestamp: string;
}

export interface SimulationSummary {
  events_count: number;
  alerts_count: number;
  assets_affected: number;
}

export interface SimulationResult {
  simulation_id: string;
  scenario_id: string;
  status: "completed";
  started_at: string;
  completed_at: string;
  summary: SimulationSummary;
  events: SecurityEvent[];
  alerts: Alert[];
  attack_path: AttackPathStep[];
}

export interface GraphData {
  nodes: Asset[];
  edges: NetworkEdge[];
}

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}
