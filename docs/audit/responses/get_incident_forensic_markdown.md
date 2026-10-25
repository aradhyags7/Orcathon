# DeceptiTrace Incident Forensic Report: `sim-74468f`

**Report ID**: `rpt-sim-74468f`  
**Generated**: 2026-10-25T07:42:48Z  
**Scenario**: `credential_lateral_movement`  
**Incident Status**: **INCIDENT_CONTAINED** (HIGH)  

---

## 1. Executive Summary

Adversary lateral movement detected and intercepted across 5 network nodes. 2 decoy tripwires were sprung with 0 false positives. Critical production databases and assets remained protected.

- **Deception Effectiveness**: 100% of sensitive assets safeguarded
- **Detection Latency**: 1.0s (Deterministic Canary Alert)
- **Containment Action**: Active Quarantine & Host Isolation

### Telemetry & Impact Metrics

| Metric | Value |
| :--- | :--- |
| Total Telemetry Events | `4` |
| Decoy Tripwires Sprung | `2` |
| Alerts Generated | `2` |
| Network Assets Traversed | `5` |

---

## 2. MITRE ATT&CK® Matrix Mapping

| Tactic | Technique ID | Technique Name |
| :--- | :--- | :--- |
| Lateral Movement | `T1021.002` | SMB/Windows Admin Shares |
| Discovery | `T1083` | File and Directory Discovery |
| Discovery | `T1046` | Network Service Discovery |
| Credential Access | `T1552` | Unsecured Credentials |

---

## 3. Attack Path & Forensics Timeline

| Step | Timestamp | Asset ID | Action Observed |
| :---: | :--- | :--- | :--- |
| 1 | `2026-10-25T07:42:48Z` | `employee-pc-01` | Initial Compromise: employee-pc-01 |
| 2 | `2026-10-25T07:42:49Z` | `decoy-payroll-file` | Decoy Intercept: decoy-payroll-file |
| 3 | `2026-10-25T07:42:50Z` | `finance-server-01` | Lateral Network Movement |
| 4 | `2026-10-25T07:42:51Z` | `honey-credential-01` | Decoy Intercept: honey-credential-01 |

---

## 4. Indicators of Compromise (IOCs)

- **Adversary & Target IPv4 Addresses**: `10.0.0.5`, `203.0.113.44`
- **Tripped Decoy Files**: `Executive_Salaries_2026.xlsx`
- **Intercepted Honey Credentials**: `aws_admin_svc_key`, `engineering_intern`
- **Observed Network Ports**: `445`, `5432`
- **Observed Protocols**: `SMB`, `TCP`

---

## 5. Automated SOAR & Containment Recommendations

1. Isolate compromised host via firewall API (SOAR Playbook active)
1. Invalidate exposed honey-credentials and rotate internal service accounts
1. Verify file integrity and deploy additional breadcrumb traps along lateral routes
1. Export telemetry dataset to Adaption Labs for defensive threat detection fine-tuning

*(Report generated autonomously by DeceptiTrace Cyber Deception Platform - Orcathon 2026)*