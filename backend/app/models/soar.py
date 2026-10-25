from typing import Any, Literal
from pydantic import BaseModel, Field

PlaybookActionType = Literal[
    "isolate_source_host",
    "revoke_credentials",
    "kill_connections",
    "deploy_tarpit_proxy",
    "reroute_traffic",
    "enable_forensic_pcap",
    "generate_stix_bundle",
    "blacklist_iocs",
    "sync_adaption_dataset",
]


class PlaybookAction(BaseModel):
    action_id: str = Field(..., description="Unique action step identifier")
    name: str = Field(..., description="Action title")
    action_type: PlaybookActionType = Field(..., description="Execution action type")
    description: str = Field(..., description="Action narrative")
    parameters: dict[str, Any] = Field(default_factory=dict, description="Action parameter overrides")


class Playbook(BaseModel):
    id: str = Field(..., description="Unique playbook identifier")
    name: str = Field(..., description="Playbook title")
    description: str = Field(..., description="Operational purpose of the playbook")
    trigger_severity: Literal["low", "medium", "high", "critical"] = Field(..., description="Minimum trigger severity")
    target_scenario: str = Field(default="all", description="Applicable scenario or 'all'")
    actions: list[PlaybookAction] = Field(default_factory=list, description="Ordered stages of execution")


class ActionExecutionLog(BaseModel):
    action_id: str
    action_type: str
    status: Literal["completed", "simulated", "failed"] = "completed"
    details: str
    executed_at: str


class PlaybookExecutionRequest(BaseModel):
    incident_id: str = Field(..., description="Target incident or simulation ID")
    alert_id: str | None = Field(default=None, description="Optional specific alert triggering this run")
    dry_run: bool = Field(default=False, description="If True, simulates action without modifying live state")


class PlaybookExecutionResult(BaseModel):
    execution_id: str = Field(..., description="Unique playbook execution log ID")
    playbook_id: str = Field(..., description="ID of playbook executed")
    incident_id: str = Field(..., description="ID of incident acted upon")
    status: Literal["success", "partially_contained", "simulated"] = "success"
    executed_at: str = Field(..., description="ISO 8601 UTC timestamp")
    actions_executed: list[ActionExecutionLog] = Field(default_factory=list)
    isolated_assets: list[str] = Field(default_factory=list)
    blocked_connections: list[str] = Field(default_factory=list)
    mitigation_summary: str = Field(..., description="Executive summary of containment outcome")


class PlaybooksResponse(BaseModel):
    playbooks: list[Playbook]


class ExecutionsResponse(BaseModel):
    executions: list[PlaybookExecutionResult]
