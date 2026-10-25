from ..models.mitre import (
    MitreCoverageReport,
    TacticCoverage,
    TechniqueCoverage,
)
from ..repositories.memory_store import store


class MitreService:
    """Computes enterprise MITRE ATT&CK deception coverage matrix and gap analysis."""

    def get_coverage_report(self) -> MitreCoverageReport:
        assets = store.get_assets()
        decoys = [a for a in assets if a.is_decoy]

        tactics: list[TacticCoverage] = [
            TacticCoverage(
                tactic_id="TA0006",
                tactic_name="Credential Access",
                coverage_score=100.0,
                status="ACTIVE_DECOY_PROTECTION",
                techniques=[
                    TechniqueCoverage(
                        technique_id="T1552",
                        technique_name="Unsecured Credentials",
                        status="ACTIVE_DECOY_PROTECTION",
                        assigned_decoys=["honey-credential-01"],
                        detection_rule="RULE_HONEY_TOKEN_AWS_ACCESS",
                    ),
                    TechniqueCoverage(
                        technique_id="T1003",
                        technique_name="OS Credential Dumping",
                        status="ACTIVE_DECOY_PROTECTION",
                        assigned_decoys=["decoy-admin-credential"],
                        detection_rule="RULE_DUMPED_NTLM_CANARY_ALERT",
                    ),
                ],
            ),
            TacticCoverage(
                tactic_id="TA0007",
                tactic_name="Discovery",
                coverage_score=100.0,
                status="ACTIVE_DECOY_PROTECTION",
                techniques=[
                    TechniqueCoverage(
                        technique_id="T1083",
                        technique_name="File and Directory Discovery",
                        status="ACTIVE_DECOY_PROTECTION",
                        assigned_decoys=["decoy-payroll-file"],
                        detection_rule="RULE_CANARY_FILE_READ",
                    ),
                    TechniqueCoverage(
                        technique_id="T1046",
                        technique_name="Network Service Discovery",
                        status="TELEMETRY_MONITORED",
                        assigned_decoys=[],
                        detection_rule="RULE_OUTBOUND_PORT_SCAN",
                    ),
                ],
            ),
            TacticCoverage(
                tactic_id="TA0008",
                tactic_name="Lateral Movement",
                coverage_score=90.0,
                status="ACTIVE_DECOY_PROTECTION",
                techniques=[
                    TechniqueCoverage(
                        technique_id="T1021.002",
                        technique_name="SMB/Windows Admin Shares",
                        status="ACTIVE_DECOY_PROTECTION",
                        assigned_decoys=["decoy-server-01"],
                        detection_rule="RULE_DECOY_HOST_INTERACTION",
                    ),
                    TechniqueCoverage(
                        technique_id="T1021.004",
                        technique_name="SSH Lateral Movement",
                        status="TELEMETRY_MONITORED",
                        assigned_decoys=[],
                        detection_rule="RULE_ANOMALOUS_SSH_SESSION",
                    ),
                ],
            ),
            TacticCoverage(
                tactic_id="TA0040",
                tactic_name="Impact",
                coverage_score=85.0,
                status="ACTIVE_DECOY_PROTECTION",
                techniques=[
                    TechniqueCoverage(
                        technique_id="T1486",
                        technique_name="Data Encrypted for Impact",
                        status="ACTIVE_DECOY_PROTECTION",
                        assigned_decoys=["decoy-payroll-file"],
                        detection_rule="RULE_PRE_ENCRYPTION_TRIPWIRE",
                    ),
                ],
            ),
            TacticCoverage(
                tactic_id="TA0005",
                tactic_name="Defense Evasion",
                coverage_score=80.0,
                status="ACTIVE_DECOY_PROTECTION",
                techniques=[
                    TechniqueCoverage(
                        technique_id="T1078.004",
                        technique_name="Cloud Accounts",
                        status="ACTIVE_DECOY_PROTECTION",
                        assigned_decoys=["honey-credential-01"],
                        detection_rule="RULE_ROGUE_CLOUD_CANARY_AUTH",
                    ),
                ],
            ),
            TacticCoverage(
                tactic_id="TA0009",
                tactic_name="Collection",
                coverage_score=40.0,
                status="DEFENSE_GAP",
                techniques=[
                    TechniqueCoverage(
                        technique_id="T1005",
                        technique_name="Data from Local System",
                        status="TELEMETRY_MONITORED",
                        assigned_decoys=[],
                        detection_rule="RULE_SUSPICIOUS_DATA_STAGING",
                    ),
                    TechniqueCoverage(
                        technique_id="T1114",
                        technique_name="Email Collection",
                        status="DEFENSE_GAP",
                        assigned_decoys=[],
                        detection_rule="UNMONITORED_GAP",
                    ),
                ],
            ),
        ]

        scores = [t.coverage_score for t in tactics]
        overall = round(sum(scores) / len(scores), 1)

        gaps = [
            "TA0009 (Collection): No monitored canary email inbox deployed for T1114.",
            "TA0010 (Exfiltration): DNS tunneling canary token not yet seeded.",
            "TA0003 (Persistence): Monitored decoy cron job / scheduled task needed on Linux servers.",
        ]

        recommendations = [
            "Deploy Canary Database View on finance-server-01 to protect customer records against SQL dumping.",
            "Seed breadcrumb canary tokens into developer .bash_history on employee workstations.",
            "Configure SOAR Playbook 'playbook-rapid-containment' to auto-isolate hosts upon critical tripwire alerts.",
            "Export high-quality curated incident dataset to Adaption Labs for fine-tuning autonomous cyber defense agents.",
        ]

        return MitreCoverageReport(
            platform="DeceptiTrace Cyber Deception & Attack-Path Reconstruction",
            overall_coverage_pct=overall,
            active_decoys_count=len(decoys),
            tactics=tactics,
            defense_gaps=gaps,
            strategic_recommendations=recommendations,
        )


mitre_service = MitreService()
