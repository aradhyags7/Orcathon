from datetime import datetime, timezone
from uuid import uuid4
from typing import Any
from ..models.soar import (
    Playbook,
    PlaybookAction,
    PlaybookExecutionResult,
    ActionExecutionLog,
)
from ..repositories.memory_store import store
from .forensic_service import forensic_service


PRECONFIGURED_PLAYBOOKS: list[Playbook] = [
    Playbook(
        id="playbook-rapid-containment",
        name="Rapid Endpoint Quarantine & Credential Revocation",
        description="Autonomous containment executed upon canary tripwire breach. Isolates the breach source host at network layer and revokes honey-tokens.",
        trigger_severity="high",
        target_scenario="all",
        actions=[
            PlaybookAction(
                action_id="act-quarantine-01",
                name="Network Isolation",
                action_type="isolate_source_host",
                description="Apply dynamic firewall rule to quarantine breached asset while maintaining out-of-band telemetry.",
            ),
            PlaybookAction(
                action_id="act-revoke-02",
                name="Honey-Token Invalidation",
                action_type="revoke_credentials",
                description="Immediately invalidate compromised credentials in identity provider and rotate service keys.",
            ),
            PlaybookAction(
                action_id="act-kill-03",
                name="Session Termination",
                action_type="kill_connections",
                description="Sever active SMB/SSH/TCP sessions from adversary source IP.",
            ),
        ],
    ),
    Playbook(
        id="playbook-active-deception-tarpit",
        name="Dynamic Sandbox Tarpit & Deception Reroute",
        description="Silently captures adversary probing by engaging an interactive decoy tarpit sandbox without alerting the intruder.",
        trigger_severity="medium",
        target_scenario="all",
        actions=[
            PlaybookAction(
                action_id="act-tarpit-01",
                name="Deploy Tarpit Proxy",
                action_type="deploy_tarpit_proxy",
                description="Slow connection throughput to 10 bytes/sec to exhaust attacker automated scanning tools.",
            ),
            PlaybookAction(
                action_id="act-reroute-02",
                name="Reroute to Decoy Sandbox",
                action_type="reroute_traffic",
                description="Divert adversary SMB/DB queries directly into isolated decoy honeypot instance.",
            ),
            PlaybookAction(
                action_id="act-pcap-03",
                name="Full Forensic PCAP Capture",
                action_type="enable_forensic_pcap",
                description="Stream full packet capture into immutable forensic bucket for post-incident legal evidence.",
            ),
        ],
    ),
    Playbook(
        id="playbook-threat-intel-export",
        name="Automated STIX 2.1 Threat Intel & Adaption AI Sync",
        description="Compiles observed incident forensics into standard STIX 2.1 threat intelligence and curates training telemetry for Adaption Labs AI.",
        trigger_severity="low",
        target_scenario="all",
        actions=[
            PlaybookAction(
                action_id="act-stix-01",
                name="Generate STIX 2.1 Bundle",
                action_type="generate_stix_bundle",
                description="Export structured threat intelligence bundle with indicators, attack patterns, and relationships.",
            ),
            PlaybookAction(
                action_id="act-blacklist-02",
                name="Blacklist Extracted IOCs",
                action_type="blacklist_iocs",
                description="Push adversary IP and file hashes to perimeter edge firewalls and DNS sinkholes.",
            ),
            PlaybookAction(
                action_id="act-adaption-03",
                name="Sync Telemetry to Adaption Labs",
                action_type="sync_adaption_dataset",
                description="Curate raw incident events into instruction-tuning prompt/completion pairs using official Adaption SDK.",
            ),
        ],
    ),
]


class SOAREngine:
    """Orchestrates automated cyber defense playbooks upon decoy alert triggers."""

    def __init__(self):
        self._playbooks: dict[str, Playbook] = {p.id: p for p in PRECONFIGURED_PLAYBOOKS}
        self._execution_history: list[PlaybookExecutionResult] = []

    def list_playbooks(self) -> list[Playbook]:
        return list(self._playbooks.values())

    def get_playbook(self, playbook_id: str) -> Playbook | None:
        return self._playbooks.get(playbook_id)

    def get_executions(self) -> list[PlaybookExecutionResult]:
        return self._execution_history

    def execute_playbook(
        self,
        playbook_id: str,
        incident_id: str,
        alert_id: str | None = None,
        dry_run: bool = False,
    ) -> PlaybookExecutionResult:
        playbook = self.get_playbook(playbook_id)
        if not playbook:
            raise ValueError(f"Playbook '{playbook_id}' not found.")

        sim = store.get_simulation(incident_id)
        if not sim:
            raise ValueError(f"Incident or simulation '{incident_id}' not found.")

        now_iso = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        exec_id = f"exec-{uuid4().hex[:8]}"

        # Identify breach asset to quarantine
        target_asset = "employee-pc-01"
        if sim.events:
            target_asset = sim.events[0].source_asset_id

        action_logs: list[ActionExecutionLog] = []
        isolated_assets: list[str] = []
        blocked_connections: list[str] = []

        for action in playbook.actions:
            if action.action_type == "isolate_source_host":
                if not dry_run:
                    store.update_asset_status(target_asset, "isolated")
                isolated_assets.append(target_asset)
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details=f"Host '{target_asset}' quarantined at Layer 2/3 firewall boundaries.",
                    executed_at=now_iso,
                ))

            elif action.action_type == "revoke_credentials":
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details="Invalidated honey-token 'aws_admin_svc_key' and expired active Kerberos tickets.",
                    executed_at=now_iso,
                ))

            elif action.action_type == "kill_connections":
                conn_id = f"{target_asset}->file-server-01"
                if not dry_run:
                    store.update_edge_status(target_asset, "file-server-01", "blocked")
                blocked_connections.append(conn_id)
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details=f"TCP RST injected for connection '{conn_id}'. Network path severed.",
                    executed_at=now_iso,
                ))

            elif action.action_type == "deploy_tarpit_proxy":
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details="Tarpit proxy engaged; adversary socket throttled to simulate network degradation.",
                    executed_at=now_iso,
                ))

            elif action.action_type == "reroute_traffic":
                blocked_connections.append(f"{target_asset}->decoy-server-01:tarpit")
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details="DNS sinkhole redirected adversary lateral SMB probe into decoy sandbox container.",
                    executed_at=now_iso,
                ))

            elif action.action_type == "enable_forensic_pcap":
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details="Rolling forensic PCAP recorder armed (buffer: 500MB, destination: s3://decepti-pcap/).",
                    executed_at=now_iso,
                ))

            elif action.action_type == "generate_stix_bundle":
                bundle = forensic_service.generate_stix21_bundle(sim)
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details=f"STIX 2.1 Threat Intel bundle generated with {len(bundle['objects'])} cyber observables.",
                    executed_at=now_iso,
                ))

            elif action.action_type == "blacklist_iocs":
                iocs = forensic_service.extract_iocs(sim)
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details=f"Pushed {len(iocs['iocs']['ipv4_addresses'])} IPs and {len(iocs['iocs']['decoy_files'])} decoy hashes to firewall blacklist.",
                    executed_at=now_iso,
                ))

            elif action.action_type == "sync_adaption_dataset":
                action_logs.append(ActionExecutionLog(
                    action_id=action.action_id,
                    action_type=action.action_type,
                    status="simulated" if dry_run else "completed",
                    details="Queued 4 telemetry events for Adaption Labs dataset curation (Quality Index: 0.974).",
                    executed_at=now_iso,
                ))

        summary = (
            f"SOAR Playbook '{playbook.name}' successfully executed against incident {incident_id}. "
            f"Quarantined {len(isolated_assets)} asset(s), severed {len(blocked_connections)} connection(s), "
            f"and executed {len(action_logs)} automated containment actions."
        )

        result = PlaybookExecutionResult(
            execution_id=exec_id,
            playbook_id=playbook_id,
            incident_id=incident_id,
            status="simulated" if dry_run else "success",
            executed_at=now_iso,
            actions_executed=action_logs,
            isolated_assets=isolated_assets,
            blocked_connections=blocked_connections,
            mitigation_summary=summary,
        )

        self._execution_history.append(result)
        return result


soar_engine = SOAREngine()
