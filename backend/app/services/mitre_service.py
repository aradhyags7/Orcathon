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
        active_decoy_ids = {a.id for a in decoys}

        tactics_spec = [
            {
                "tactic_id": "TA0006",
                "tactic_name": "Credential Access",
                "techniques": [
                    TechniqueCoverage(
                        technique_id="T1552",
                        technique_name="Unsecured Credentials",
                        status="ACTIVE_DECOY_PROTECTION" if "honey-credential-01" in active_decoy_ids else "TELEMETRY_MONITORED",
                        assigned_decoys=["honey-credential-01"] if "honey-credential-01" in active_decoy_ids else [],
                        detection_rule="RULE_HONEY_TOKEN_AWS_ACCESS",
                    ),
                    TechniqueCoverage(
                        technique_id="T1003",
                        technique_name="OS Credential Dumping",
                        status="ACTIVE_DECOY_PROTECTION" if "decoy-admin-credential" in active_decoy_ids else "TELEMETRY_MONITORED",
                        assigned_decoys=["decoy-admin-credential"] if "decoy-admin-credential" in active_decoy_ids else [],
                        detection_rule="RULE_DUMPED_NTLM_CANARY_ALERT",
                    ),
                ],
            },
            {
                "tactic_id": "TA0007",
                "tactic_name": "Discovery",
                "techniques": [
                    TechniqueCoverage(
                        technique_id="T1083",
                        technique_name="File and Directory Discovery",
                        status="ACTIVE_DECOY_PROTECTION" if "decoy-payroll-file" in active_decoy_ids else "TELEMETRY_MONITORED",
                        assigned_decoys=["decoy-payroll-file"] if "decoy-payroll-file" in active_decoy_ids else [],
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
            },
            {
                "tactic_id": "TA0008",
                "tactic_name": "Lateral Movement",
                "techniques": [
                    TechniqueCoverage(
                        technique_id="T1021.002",
                        technique_name="SMB/Windows Admin Shares",
                        status="ACTIVE_DECOY_PROTECTION" if "decoy-payroll-file" in active_decoy_ids else "TELEMETRY_MONITORED",
                        assigned_decoys=["decoy-payroll-file"] if "decoy-payroll-file" in active_decoy_ids else [],
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
            },
            {
                "tactic_id": "TA0040",
                "tactic_name": "Impact",
                "techniques": [
                    TechniqueCoverage(
                        technique_id="T1486",
                        technique_name="Data Encrypted for Impact",
                        status="ACTIVE_DECOY_PROTECTION" if "decoy-payroll-file" in active_decoy_ids else "TELEMETRY_MONITORED",
                        assigned_decoys=["decoy-payroll-file"] if "decoy-payroll-file" in active_decoy_ids else [],
                        detection_rule="RULE_PRE_ENCRYPTION_TRIPWIRE",
                    ),
                ],
            },
            {
                "tactic_id": "TA0005",
                "tactic_name": "Defense Evasion",
                "techniques": [
                    TechniqueCoverage(
                        technique_id="T1078.004",
                        technique_name="Cloud Accounts",
                        status="ACTIVE_DECOY_PROTECTION" if "honey-credential-01" in active_decoy_ids else "TELEMETRY_MONITORED",
                        assigned_decoys=["honey-credential-01"] if "honey-credential-01" in active_decoy_ids else [],
                        detection_rule="RULE_ROGUE_CLOUD_CANARY_AUTH",
                    ),
                ],
            },
            {
                "tactic_id": "TA0009",
                "tactic_name": "Collection",
                "techniques": [
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
            },
        ]

        tactics: list[TacticCoverage] = []
        for spec in tactics_spec:
            techs = spec["techniques"]
            tech_scores = []
            for t in techs:
                if t.status == "ACTIVE_DECOY_PROTECTION":
                    tech_scores.append(100.0)
                elif t.status == "TELEMETRY_MONITORED":
                    tech_scores.append(50.0)
                else:
                    tech_scores.append(0.0)
            score = round(sum(tech_scores) / len(tech_scores), 1) if tech_scores else 0.0
            status = "ACTIVE_DECOY_PROTECTION" if score >= 75.0 else ("TELEMETRY_MONITORED" if score >= 50.0 else "DEFENSE_GAP")
            tactics.append(
                TacticCoverage(
                    tactic_id=spec["tactic_id"],
                    tactic_name=spec["tactic_name"],
                    coverage_score=score,
                    status=status,
                    techniques=techs,
                )
            )

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
