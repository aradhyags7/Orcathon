from typing import Literal
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
    asset_id: str = Field(..., description="ID of the asset affected/traversed")
    label: str = Field(..., description="Human-readable milestone description")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp ending in Z")

class SimulationSummary(BaseModel):
    events_count: int = Field(..., description="Total events generated")
    alerts_count: int = Field(..., description="Total alerts triggered")
    assets_affected: int = Field(..., description="Unique assets traversed or targeted")

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
