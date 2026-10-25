export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface Asset {
  id: string;
  name: string;
  kind: "endpoint" | "server" | "decoy_file" | "honey_credential" | "external";
  status: "healthy" | "suspicious" | "alert" | "compromised" | "external";
  is_decoy: boolean;
  description: string;
  ip?: string;
  canary_token?: string | null;
  content_source?: "adaption" | "cached" | "template" | "hand-authored template";
  content_preview?: string | null;
  template_preview?: string | null;
  run_id?: string | null;
  evaluation?: string | null;
}

export interface NetworkEdge {
  source: string;
  target: string;
  status: "normal" | "traversed" | "suspicious";
  is_attack_path?: boolean;
}

export interface SecurityEvent {
  id: string;
  simulation_id: string;
  timestamp: string;
  event_type: "connection" | "file_access" | "credential_attempt" | "decoy_triggered" | "web_exploit" | "network_scan";
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
  source_label?: string;
  target_label?: string;
  event_type?: string;
  reason?: string;
  status: "open" | "acknowledged" | "resolved";
  evidence: string[];
  recommended_actions: string[];
}

export interface AttackPathStep {
  step: number;
  event_id: string;
  asset_id: string;
  name?: string;
  ip?: string;
  label: string;
  timestamp: string;
  type?: "observed" | "inferred";
  basis?: "recorded" | "inferred" | "observed";
  kind?: Asset["kind"];
}

export interface SimulationSummary {
  events_count: number;
  alerts_count: number;
  assets_affected: number;
  intruders_count?: number;
  decoy_interactions_count?: number;
  total_assets?: number;
  real_assets_count?: number;
  decoy_assets_count?: number;
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
