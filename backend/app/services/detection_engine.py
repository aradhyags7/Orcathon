from datetime import datetime, timezone
from uuid import uuid4
from ..models.event import SecurityEvent
from ..models.alert import Alert
from ..repositories.memory_store import store

class DetectionEngine:
    """Evaluates security telemetry events against decoy tripwires and policy rules."""

    def analyze_event(self, event: SecurityEvent) -> list[Alert]:
        alerts: list[Alert] = []
        target_asset = store.get_asset(event.target_asset_id)
        source_asset = store.get_asset(event.source_asset_id)

        target_name = target_asset.name if target_asset else event.target_asset_id
        source_name = source_asset.name if source_asset else event.source_asset_id

        # Rule 1: Decoy Canary File Access
        if target_asset and target_asset.kind == "decoy_file" or event.event_type == "decoy_triggered" and "file" in event.target_asset_id:
            alert = Alert(
                id=f"alert-{uuid4().hex[:6]}",
                simulation_id=event.simulation_id,
                event_id=event.id,
                created_at=event.timestamp,
                severity="high",
                title="Decoy Canary File Accessed",
                description=f"Simulated actor on {source_name} accessed monitored decoy document ({target_name}).",
                source_asset_id=event.source_asset_id,
                target_asset_id=event.target_asset_id,
                status="open",
                evidence=[
                    f"Target asset '{target_name}' is a registered deception tripwire.",
                    f"Beacon fired from source endpoint {event.source_asset_id}.",
                    "Zero legitimate business access patterns permit opening this canary document.",
                ],
                recommended_actions=[
                    f"Isolate host {event.source_asset_id} from internal subnet.",
                    "Revoke active sessions and Kerberos TGTs for the current user profile.",
                    "Audit file access logs on adjacent storage nodes.",
                ],
            )
            alerts.append(alert)

        # Rule 2: Honey Credential / Token Authentication Probe
        elif target_asset and target_asset.kind == "honey_credential" or "credential" in event.target_asset_id:
            alert = Alert(
                id=f"alert-{uuid4().hex[:6]}",
                simulation_id=event.simulation_id,
                event_id=event.id,
                created_at=event.timestamp,
                severity="critical",
                title="Honey-Token Credential Infiltration Attempt",
                description=f"Planted honey-token ({target_name}) used in lateral authentication from {source_name}.",
                source_asset_id=event.source_asset_id,
                target_asset_id=event.target_asset_id,
                status="open",
                evidence=[
                    f"Honey-token '{target_name}' has zero authorized production usage.",
                    f"Originating node {event.source_asset_id} executed lateral pivot using stolen token.",
                    "Signature correlates with automated memory-dumping / credential-harvesting tools.",
                ],
                recommended_actions=[
                    "Immediately blacklist and cycle all credentials in the affected credential vault.",
                    f"Quarantine {event.source_asset_id} and trigger emergency memory forensics.",
                    "Enforce MFA challenge on all downstream privileged service accounts.",
                ],
            )
            alerts.append(alert)

        return alerts

detection_engine = DetectionEngine()
