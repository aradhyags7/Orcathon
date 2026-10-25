from typing import Any, Literal
from pydantic import BaseModel, Field

Severity = Literal["info", "low", "medium", "high", "critical"]
EventType = Literal["connection", "file_access", "credential_attempt", "decoy_triggered"]

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

class EventsResponse(BaseModel):
    events: list[SecurityEvent]
