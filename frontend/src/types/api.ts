export type Severity = "info" | "low" | "medium" | "high" | "critical";

export interface MitreAttack {
  technique_id: string;
  technique_name: string;
  tactic: string;
}

export interface ScenarioInfo {
  id: string;
  name: string;
  description: string;
  mitre_focus: string;
  target_decoys: string[];
}

export interface Asset {
  id: string;
  name: string;
  kind: "endpoint" | "server" | "decoy_file" | "honey_credential" | "external";
  status: "healthy" | "suspicious" | "alert" | "compromised" | "isolated" | "external";
  is_decoy: boolean;
  description: string;
  ip?: string;
}

export interface NetworkEdge {
  source: string;
  target: string;
  status: "normal" | "traversed" | "suspicious" | "blocked";
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
  mitre_attack?: MitreAttack;
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
  status: "open" | "acknowledged" | "resolved" | "contained";
  evidence: string[];
  recommended_actions: string[];
  mitre_attack?: MitreAttack;
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
