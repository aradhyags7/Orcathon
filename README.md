# DeceptiTrace — Autonomous Cyber Deception & Attack-Path Reconstruction

> **Orcathon Track 3: Cybersecurity & Threat Intelligence**  
> **Sponsor Prize Track: Best Use of Adaption Labs (Adaptive Data Engine)**  
> **Team**: **Aradhya** (Backend, Deception Engine & Adaption Pipeline) & **Akash** (Frontend, Visualization & Threat Experience)

---

## 🎯 Executive Summary

Modern Security Operations Centers (SOCs) face an overwhelming dilemma: **alert fatigue** from thousands of low-fidelity perimeter warnings, and **blind spots** once an adversary penetrates internal networks. Traditional detection relies on reactive signatures that attackers routinely bypass.

**DeceptiTrace** flips the asymmetric advantage back to defenders through **Active Cyber Deception**. By automatically weaving enterprise-realistic canary documents, honey credentials, and high-interaction honeypots into network topology, DeceptiTrace converts the internal network into a minefield:

1. **Zero False Positives**: Legitimate employees have zero operational reason to access planted decoy credentials or canary files. Any touch is an immediate, high-fidelity intrusion indicator.
2. **Deterministic Attack-Path Reconstruction**: Rebuilds the adversary's lateral hops chronologically, explicitly separating **observed interactions** from **graph-inferred movement**.
3. **Synthetic Decoy Realism powered by Adaption Labs**: Generates organization-tailored deception content indistinguishable from real corporate assets, ensuring adversaries cannot fingerprint synthetic decoys.
4. **Automated Response (SOAR)**: Triggers instant asset containment and produces structured forensic reports ready for SOC escalation.

---

## 🏗️ System Architecture

DeceptiTrace is architected with a strict **contract-first, decoupled architecture**:

```
Orcathon/
├── contracts/                  # Strict JSON schema specifications (Single Source of Truth)
│   └── api-contract.md         # Data models, endpoint specifications & error formats
├── backend/                    # Python / FastAPI Cyber Deception Engine
│   ├── app/
│   │   ├── api/routes/         # REST endpoints (health, graph, simulations, alerts, soar, forensics, adaption)
│   │   ├── core/               # Configuration, security controls, and error handlers
│   │   ├── models/             # Pydantic schemas (Assets, Events, Alerts, AttackPathStep, SOAR)
│   │   ├── repositories/       # High-throughput in-memory state repository
│   │   ├── services/           # Detection engine, Attack-path graph traversal, SOAR, Adaption SDK
│   │   └── tests/              # 25-test compliance, reproducibility, and audit verification suite
│   └── requirements.txt        # Pinned production dependencies
├── frontend/                   # React 18 / TypeScript / Vite Single-Screen SOC Dashboard
│   ├── src/
│   │   ├── components/         # Interactive SVG Network Topology, Timeline, Canary Traps, Alert Details
│   │   ├── hooks/              # Real-time simulation state machine & clock telemetry
│   │   ├── lib/                # API client bridge & CSV report exporter
│   │   ├── data/               # High-fidelity mock fallback dataset
│   │   └── styles.css          # Premium single-screen 3-column (52% / 24% / 24%) CSS architecture
│   └── package.json
└── docs/                       # Verification audit logs, Adaption integration guide, STIX schemas
```

---

## ⚡ Core Capabilities

### 1. Interactive 3-Column Single-Screen SOC Dashboard
Designed specifically for real-time cyber incident monitoring within a strict `100dvh` viewport:
- **Left Column (52%)**: 
  - **Dynamic SVG Topology Canvas**: Renders corporate endpoints, servers, canary files, and honeypots. Nodes transition dynamically from nominal to compromised/alerted states with active attack-vector visual indicators.
  - **Attack-Path Analysis**: Step-by-step chronological breadcrumb trail tracking ingress, weaponization, decoy triggers, and lateral pivots.
- **Middle Column (24%)**:
  - **Real-Time Incident Timeline**: Microsecond-stamped sequence of security events connected with directional progression arrows.
  - **Decoy Tripwires Panel**: Live monitoring of configured canary assets (`payroll_records_fake.xlsx`, `admin_decoy` credentials, `10.0.0.50` honeypot server) with active status indicators.
- **Right Column (24%)**:
  - **Comprehensive Alert Details**: Full contextual incident inspection including MITRE tactics, source/target labels, evidence chains, and recommended SOC containment actions.

### 2. Multi-Hop Attack-Path Reconstruction Engine
Rather than presenting isolated log entries, DeceptiTrace executes graph pathfinding across interaction graphs to answer: *Where did the adversary enter? Which systems did they traverse? What were they looking for?*
- **Observed Steps (`basis: "recorded"`)**: Directly verified telemetry events (e.g., HTTP exploit, decoy file access).
- **Inferred Steps (`basis: "inferred"`)**: Topology-based path deduction where an adversary pivoted between unmonitored intermediary hosts before triggering a downstream canary.

### 3. MITRE ATT&CK Framework Alignment

| Stage | ATT&CK Technique | Description | Deception Vector |
| :--- | :--- | :--- | :--- |
| **Initial Access** | `T1190` Exploit Public-Facing Application | Remote exploit targeting edge web server | Monitored DMZ web node |
| **Discovery** | `T1083` File & Directory Discovery | Adversary discovers payroll directory | `payroll_records_fake.xlsx` |
| **Credential Access**| `T1078` Valid Accounts | Harvesting planted cloud administrator key | `admin_decoy` honey token |
| **Lateral Movement** | `T1021` Remote Services | SSH pivot toward internal database | Route-diverted to honeypot `10.0.0.50` |
| **Impact / Target** | `T1046` Network Service Discovery | Scanning production PostgreSQL database | Target protected; 0 data compromised |

### 4. Adaption Labs Adaptive Data Pipeline (Sponsor Prize Track)
Adversaries immediately discard poorly crafted, templated decoys. DeceptiTrace integrates the **Adaption Labs SDK** (`adaption`) to generate realistic corporate decoys tailored to simulated enterprise environments:
- **Synthetic Context Generation**: Generates high-entropy compensation bands, executive bonus schedules, and platform architecture blueprints.
- **Zero-Leakage Local Canary Injection**: Sensitive canary beacon signatures are injected locally by the backend *after* model synthesis, ensuring canary tokens are never transmitted to external LLM providers.
- **Graceful Deterministic Fallback**: Automatic offline caching guarantees the demonstration runs reliably even without network connectivity or API quotas.

### 5. Automated Containment (SOAR) & Forensic Export
- **One-Click Remediation**: Isolate compromised assets and terminate active lateral sessions with sub-second execution.
- **SIEM-Ready CSV Export**: Instant generation and browser download of complete incident reports containing evidence logs, alert details, and triage recommendations.

---

## 🚀 Quickstart Guide

### Prerequisites
- **Python**: 3.10+ (Tested on Python 3.14)
- **Node.js**: 18+ (npm 9+)

### 1. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux / macOS:
# source .venv/bin/activate

# Install pinned dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
* Interactive API Documentation (Swagger): `http://127.0.0.1:8000/docs`
* Health Endpoint: `http://127.0.0.1:8000/api/health`

### 2. Frontend Setup
```bash
# In a separate terminal, navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
* Web Dashboard: `http://localhost:5173`

---

## 🧪 Verification & Test Suite

DeceptiTrace has been audited with an automated test suite covering API contracts, deterministic path generation, SOAR isolation, and schema compliance:

```bash
# Run full backend test suite
pytest backend/app/tests -v
```
**Test Results:** `25 passed in ~0.9s` across 7 test modules:
- `test_simulation.py`: Simulation lifecycle and scenario execution.
- `test_attack_path_computation.py`: Graph traversal and recorded vs. inferred basis validation.
- `test_compliance_and_reproducibility.py`: Determinism, seed repeatability, and fallback validation.
- `test_advanced_features.py`: Adaption curation and metric integrity.
- `test_forensics.py`: IOC extraction and forensic markdown generation.
- `test_health.py`: Liveness and readiness endpoints.
- `test_phase_ten_suite.py`: Multi-hop security event correlations.

```bash
# Verify frontend production build
cd frontend
npm run build
```
**Build Result:** `tsc -b && vite build` completed in `~1.5s` with `0 errors`.

---

## 🛡️ Security & Privacy Disclosures

- **Secrets Handling**: Environment variables (such as `ADAPTION_API_KEY`) are read strictly from runtime environment configurations and are never hardcoded or committed to git history.
- **Canary Token Isolation**: Tokens are stored and injected strictly in local memory/storage to eliminate third-party leakage.
- **Non-Invasive Architecture**: All network simulation actions operate within an isolated, sandboxed software telemetry environment.

---

## 👥 The Team

| Team Member | Role | Core Contributions |
| :--- | :--- | :--- |
| **Aradhya** | Backend & Detection Engine | FastAPI Architecture, Graph Pathfinding Engine, Adaption Labs SDK Integration, SOAR & MITRE Alignment, Pytest Suite |
| **Akash** | Frontend & Threat Visualization | React 18 + TypeScript Dashboard, Single-Screen 3-Column Layout, Real-Time SVG Topology Canvas, Incident Timeline, Alert Details |

---

*Developed for Orcathon 2026 • Track 3: Cybersecurity & Threat Intelligence*
