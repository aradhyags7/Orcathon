from typing import Any, Literal, Optional
from pydantic import BaseModel, Field

Severity = Literal["info", "low", "medium", "high", "critical"]
EventType = Literal["connection", "file_access", "credential_attempt", "decoy_triggered"]

class MitreAttack(BaseModel):
    technique_id: str = Field(..., description="e.g. T1083, T1078, T1021.002")
    technique_name: str = Field(..., description="Human-readable MITRE ATT&CK technique name")
    tactic: str = Field(..., description="e.g. Initial Access, Discovery, Lateral Movement, Credential Access")

class SecurityEvent(BaseModel):
    id: str = Field(..., description="Unique event identifier")
    simulation_id: str = Field(..., description="ID of the simulation run")
    timestamp: str = Field(..., description="ISO 8601 UTC timestamp ending in Z")
    event_type: EventType = Field(..., description="Type of security event observed")
    source_asset_id: str = Field(..., description="Source asset ID")
    target_asset_id: str = Field(..., description="Target asset ID")
    severity: Severity = Field(..., description="Severity level")
    message: str = Field(..., description="Detailed description of the observed event")
    is_decoy_interaction: bool = Field(default=False, description="Whether this event interacted with a decoy")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Arbitrary event metadata")
    mitre_attack: Optional[MitreAttack] = Field(default=None, description="Associated MITRE ATT&CK technique")

class EventsResponse(BaseModel):
    events: list[SecurityEvent]
