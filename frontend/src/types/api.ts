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
  kind: "endpoint" | "server" | "decoy_file" | "honey_credential";
  status: "healthy" | "suspicious" | "alert" | "isolated";
  is_decoy: boolean;
  description: string;
  canary_token?: string | null;
  content_source?: "adaption" | "cached" | "template";
  content_preview?: string | null;
}

export interface NetworkEdge {
  source: string;
  target: string;
  status: "normal" | "traversed" | "suspicious" | "blocked";
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
  mitre_attack?: MitreAttack;
  session_id: string;
  canary_token?: string | null;
  technique?: string | null;
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
  status: "open" | "acknowledged" | "resolved" | "contained";
  evidence: string[];
  recommended_actions: string[];
  mitre_attack?: MitreAttack;
}

export interface AttackPathStep {
  step: number;
  event_id: string;
  from_asset_id: string;
  to_asset_id: string;
  via_asset_id?: string | null;
  basis: "recorded" | "inferred";
  asset_id: string;
  label: string;
  timestamp: string;
}

export interface SimulationSummary {
  events_count: number;
  alerts_count: number;
  assets_affected: number;
  total_assets?: number;
  real_assets_count?: number;
  decoy_assets_count?: number;
  intruders_count?: number;
  decoy_interactions_count?: number;
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
