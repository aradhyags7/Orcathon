from typing import Literal, Optional
from pydantic import BaseModel, Field
from .event import SecurityEvent
from .alert import Alert

class ScenarioInfo(BaseModel):
    id: str = Field(..., description="Unique scenario identifier")
    name: str = Field(..., description="Human-readable scenario title")
    description: str = Field(..., description="Narrative of the threat scenario")
    mitre_focus: str = Field(..., description="Primary MITRE ATT&CK tactic focus")
    target_decoys: list[str] = Field(default_factory=list, description="Decoys triggered in this attack")

class ScenariosResponse(BaseModel):
    scenarios: list[ScenarioInfo]

class AttackPathStep(BaseModel):
    step: int = Field(..., description="1-indexed sequence order")
    event_id: str = Field(..., description="Associated event ID")
    from_asset_id: str = Field(..., description="Source asset of this hop")
    to_asset_id: str = Field(..., description="Destination asset of this hop")
    via_asset_id: Optional[str] = Field(default=None, description="Decoy file or credential that enabled the pivot")
    basis: Literal["recorded", "inferred"] = Field(default="recorded", description="Directly recorded telemetry or inferred token correlation")
    asset_id: str = Field(..., description="Target asset ID (compatibility alias)")
    label: str = Field(..., description="Human-readable milestone description")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp ending in Z")

class SimulationSummary(BaseModel):
    events_count: int = Field(..., description="Total events generated")
    alerts_count: int = Field(..., description="Total alerts triggered")
    assets_affected: int = Field(..., description="Unique assets traversed or targeted")
    total_assets: int = Field(default=8, description="Total inventory assets")
    real_assets_count: int = Field(default=5, description="Count of legitimate production assets")
    decoy_assets_count: int = Field(default=3, description="Count of deployed decoy assets")
    intruders_count: int = Field(default=1, description="Count of external intruder entities")
    decoy_interactions_count: int = Field(default=2, description="Count of decoy tripwire interactions")

class SimulationRunRequest(BaseModel):
    scenario_id: str = Field(default="credential_lateral_movement", description="Simulation scenario identifier")

class SimulationResult(BaseModel):
    simulation_id: str = Field(..., description="Unique simulation run identifier")
    scenario_id: str = Field(..., description="Scenario identifier")
    status: Literal["completed"] = Field(default="completed", description="Execution status")
    started_at: str = Field(..., description="ISO 8601 UTC timestamp")
    completed_at: str = Field(..., description="ISO 8601 UTC timestamp")
    summary: SimulationSummary = Field(..., description="Aggregated statistics")
    events: list[SecurityEvent] = Field(default_factory=list, description="All ordered events")
    alerts: list[Alert] = Field(default_factory=list, description="All raised alerts")
    attack_path: list[AttackPathStep] = Field(default_factory=list, description="Chronological attack path steps")

class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"

class ResetResponse(BaseModel):
    status: Literal["ok"] = "ok"

class ErrorDetail(BaseModel):
    code: str
    message: str

class ErrorResponse(BaseModel):
    error: ErrorDetail
