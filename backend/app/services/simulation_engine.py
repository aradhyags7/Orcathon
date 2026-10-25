from datetime import datetime, timezone, timedelta
from uuid import uuid4
from ..models.event import SecurityEvent
from ..models.alert import Alert
from ..models.simulation import SimulationResult, SimulationSummary, AttackPathStep
from .detection_engine import detection_engine
from .attack_path import attack_path_reconstructor
from ..repositories.memory_store import store

class SimulationEngine:
    """Executes controlled, safe cyber deception attack simulations."""

    def run_scenario(self, scenario_id: str = "credential_lateral_movement") -> SimulationResult:
        sim_id = f"sim-{uuid4().hex[:6]}"
        now = datetime.now(timezone.utc)

        # Predefined safe attack sequence traversing network assets and hitting 2 decoys
        raw_steps = [
            {
                "offset": 0,
                "event_type": "connection",
                "source": "employee-pc-01",
                "target": "file-server-01",
                "severity": "low",
                "message": "Simulated SMB connection established between employee workstation and file server",
                "is_decoy": False,
                "metadata": {"protocol": "SMB", "port": 445, "user": "engineering_intern"},
            },
            {
                "offset": 1,
                "event_type": "decoy_triggered",
                "source": "employee-pc-01",
                "target": "decoy-payroll-file",
                "severity": "high",
                "message": "Unauthorized read access to monitored decoy payroll file (Executive_Salaries_2026.xlsx)",
                "is_decoy": True,
                "metadata": {
                    "file_name": "Executive_Salaries_2026.xlsx",
                    "action": "READ_ACCESS",
                    "trap_type": "canary_document",
                },
            },
            {
                "offset": 2,
                "event_type": "file_access",
                "source": "file-server-01",
                "target": "finance-server-01",
                "severity": "medium",
                "message": "Lateral network probe targeting production finance database listener",
                "is_decoy": False,
                "metadata": {"protocol": "TCP", "port": 5432, "direction": "outbound"},
            },
            {
                "offset": 3,
                "event_type": "decoy_triggered",
                "source": "file-server-01",
                "target": "honey-credential-01",
                "severity": "critical",
                "message": "Authentication attempted using planted fake AWS root credential",
                "is_decoy": True,
                "metadata": {
                    "credential_alias": "aws_admin_svc_key",
                    "trap_type": "honey_token",
                    "action": "API_CALL_ATTEMPT",
                },
            },
        ]

        events: list[SecurityEvent] = []
        alerts: list[Alert] = []

        for step in raw_steps:
            t = (now + timedelta(seconds=step["offset"])).strftime("%Y-%m-%dT%H:%M:%SZ")
            evt = SecurityEvent(
                id=f"evt-{uuid4().hex[:6]}",
                simulation_id=sim_id,
                timestamp=t,
                event_type=step["event_type"],
                source_asset_id=step["source"],
                target_asset_id=step["target"],
                severity=step["severity"],
                message=step["message"],
                is_decoy_interaction=step["is_decoy"],
                metadata=step["metadata"],
            )
            events.append(evt)
            # Evaluate detection rules
            new_alerts = detection_engine.analyze_event(evt)
            alerts.extend(new_alerts)

        # Reconstruct attack path
        attack_path = attack_path_reconstructor.reconstruct(events)

        affected_assets = {e.source_asset_id for e in events} | {e.target_asset_id for e in events}
        summary = SimulationSummary(
            events_count=len(events),
            alerts_count=len(alerts),
            assets_affected=len(affected_assets),
        )

        completed_at = (now + timedelta(seconds=len(raw_steps))).strftime("%Y-%m-%dT%H:%M:%SZ")
        started_at = now.strftime("%Y-%m-%dT%H:%M:%SZ")

        result = SimulationResult(
            simulation_id=sim_id,
            scenario_id=scenario_id,
            status="completed",
            started_at=started_at,
            completed_at=completed_at,
            summary=summary,
            events=events,
            alerts=alerts,
            attack_path=attack_path,
        )

        # Store in repository
        store.add_simulation(result)
        return result

simulation_engine = SimulationEngine()
