from datetime import datetime, timezone, timedelta
from uuid import uuid4
from ..models.event import SecurityEvent, MitreAttack
from ..models.alert import Alert
from ..models.simulation import SimulationResult, SimulationSummary, AttackPathStep, ScenarioInfo
from .detection_engine import detection_engine
from .attack_path import attack_path_reconstructor
from ..repositories.memory_store import store

AVAILABLE_SCENARIOS = [
    ScenarioInfo(
        id="credential_lateral_movement",
        name="Credential Dumping & Multi-Hop Pivot",
        description="Simulated adversary pivots from employee workstation to corporate share and triggers canary payroll & AWS admin honey-token.",
        mitre_focus="Lateral Movement & Credential Access (T1021, T1552)",
        target_decoys=["decoy-payroll-file", "honey-credential-01"],
    ),
    ScenarioInfo(
        id="ransomware_canary_recon",
        name="Pre-Ransomware Directory Reconnaissance",
        description="Simulated malware scans high-value shares for sensitive documents to encrypt, tripping the canary payroll trap early.",
        mitre_focus="Discovery & Impact Preparation (T1083, T1486)",
        target_decoys=["decoy-payroll-file"],
    ),
    ScenarioInfo(
        id="insider_credential_dump",
        name="Rogue Insider Privilege Escalation",
        description="Privileged insider probes server memory and uses planted admin honey credentials against restricted finance database.",
        mitre_focus="Privilege Escalation & Cloud Account Abuse (T1003, T1078.004)",
        target_decoys=["decoy-admin-credential", "honey-credential-01"],
    ),
]

class SimulationEngine:
    """Executes controlled, safe cyber deception attack simulations."""

    def get_scenarios(self) -> list[ScenarioInfo]:
        return AVAILABLE_SCENARIOS

    def run_scenario(self, scenario_id: str = "credential_lateral_movement") -> SimulationResult:
        sim_id = f"sim-{uuid4().hex[:6]}"
        now = datetime.now(timezone.utc)

        # Build scenario step definitions
        if scenario_id == "ransomware_canary_recon":
            raw_steps = [
                {
                    "offset": 0,
                    "event_type": "connection",
                    "source": "employee-pc-01",
                    "target": "file-server-01",
                    "severity": "low",
                    "message": "Outbound discovery probe scanning for SMB network shares on subnet 10.0.1.0/24",
                    "is_decoy": False,
                    "metadata": {"scanner": "SharpShares", "port": 445},
                    "mitre": MitreAttack(technique_id="T1046", technique_name="Network Service Discovery", tactic="Discovery"),
                },
                {
                    "offset": 1,
                    "event_type": "file_access",
                    "source": "employee-pc-01",
                    "target": "file-server-01",
                    "severity": "medium",
                    "message": "Automated recursive file enumeration attempting directory traversal on finance shares",
                    "is_decoy": False,
                    "metadata": {"action": "DIR_ENUMERATION", "files_scanned": 142},
                    "mitre": MitreAttack(technique_id="T1083", technique_name="File and Directory Discovery", tactic="Discovery"),
                },
                {
                    "offset": 2,
                    "event_type": "decoy_triggered",
                    "source": "employee-pc-01",
                    "target": "decoy-payroll-file",
                    "severity": "high",
                    "message": "Pre-encryption read attempt intercepted on monitored canary spreadsheet (Executive_Salaries_2026.xlsx)",
                    "is_decoy": True,
                    "metadata": {"file_name": "Executive_Salaries_2026.xlsx", "trap_type": "canary_document", "action": "ENCRYPTION_PROBE"},
                    "mitre": MitreAttack(technique_id="T1486", technique_name="Data Encrypted for Impact", tactic="Impact"),
                },
            ]
        elif scenario_id == "insider_credential_dump":
            raw_steps = [
                {
                    "offset": 0,
                    "event_type": "connection",
                    "source": "file-server-01",
                    "target": "finance-server-01",
                    "severity": "low",
                    "message": "Internal administrative management session initiated via SSH port 22",
                    "is_decoy": False,
                    "metadata": {"protocol": "SSH", "port": 22},
                    "mitre": MitreAttack(technique_id="T1021.004", technique_name="SSH Lateral Movement", tactic="Lateral Movement"),
                },
                {
                    "offset": 1,
                    "event_type": "credential_attempt",
                    "source": "file-server-01",
                    "target": "decoy-admin-credential",
                    "severity": "high",
                    "message": "Credential memory extraction tool dumped fake domain admin honey-credential",
                    "is_decoy": True,
                    "metadata": {"tool": "Mimikatz_sim", "credential_type": "Domain_Admin_NTLM"},
                    "mitre": MitreAttack(technique_id="T1003", technique_name="OS Credential Dumping", tactic="Credential Access"),
                },
                {
                    "offset": 2,
                    "event_type": "decoy_triggered",
                    "source": "file-server-01",
                    "target": "honey-credential-01",
                    "severity": "critical",
                    "message": "Unauthorized API invocation using extracted AWS cloud root canary key",
                    "is_decoy": True,
                    "metadata": {"action": "sts:GetCallerIdentity", "credential": "aws_admin_svc_key"},
                    "mitre": MitreAttack(technique_id="T1078.004", technique_name="Cloud Accounts", tactic="Defense Evasion"),
                },
            ]
        else:
            # Default: credential_lateral_movement
            scenario_id = "credential_lateral_movement"
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
                    "mitre": MitreAttack(technique_id="T1021.002", technique_name="SMB/Windows Admin Shares", tactic="Lateral Movement"),
                },
                {
                    "offset": 1,
                    "event_type": "decoy_triggered",
                    "source": "employee-pc-01",
                    "target": "decoy-payroll-file",
                    "severity": "high",
                    "message": "Unauthorized read access to monitored decoy payroll file (Executive_Salaries_2026.xlsx)",
                    "is_decoy": True,
                    "metadata": {"file_name": "Executive_Salaries_2026.xlsx", "action": "READ_ACCESS", "trap_type": "canary_document"},
                    "mitre": MitreAttack(technique_id="T1083", technique_name="File and Directory Discovery", tactic="Discovery"),
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
                    "mitre": MitreAttack(technique_id="T1046", technique_name="Network Service Discovery", tactic="Discovery"),
                },
                {
                    "offset": 3,
                    "event_type": "decoy_triggered",
                    "source": "file-server-01",
                    "target": "honey-credential-01",
                    "severity": "critical",
                    "message": "Authentication attempted using planted fake AWS root credential",
                    "is_decoy": True,
                    "metadata": {"credential_alias": "aws_admin_svc_key", "trap_type": "honey_token", "action": "API_CALL_ATTEMPT"},
                    "mitre": MitreAttack(technique_id="T1552", technique_name="Unsecured Credentials", tactic="Credential Access"),
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
                mitre_attack=step.get("mitre"),
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
