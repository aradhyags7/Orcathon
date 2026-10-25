from typing import Literal, Optional
from pydantic import BaseModel, Field
from .event import Severity, MitreAttack

AlertStatus = Literal["open", "acknowledged", "resolved", "contained"]

class Alert(BaseModel):
    id: str = Field(..., description="Unique alert identifier")
    simulation_id: str = Field(..., description="ID of the simulation run")
    event_id: str = Field(..., description="Event that triggered this alert")
    created_at: str = Field(..., description="ISO 8601 UTC timestamp ending in Z")
    severity: Severity = Field(..., description="Severity rating")
    title: str = Field(..., description="Concise alert title")
    description: str = Field(..., description="Explanation of the suspicious interaction")
    source_asset_id: str = Field(..., description="Source asset ID")
    target_asset_id: str = Field(..., description="Target asset ID")
    status: AlertStatus = Field(default="open", description="Alert lifecycle state")
    evidence: list[str] = Field(default_factory=list, description="List of concrete evidence facts")
    recommended_actions: list[str] = Field(default_factory=list, description="Defensive remediation recommendations")
    mitre_attack: Optional[MitreAttack] = Field(default=None, description="Associated MITRE ATT&CK technique")

class AlertsResponse(BaseModel):
    alerts: list[Alert]
