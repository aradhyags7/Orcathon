# DeceptiTrace Comprehensive Audit & Verification Report
**Auditor Role:** Skeptical QA & Security Engineer  
**Audit Target:** DeceptiTrace Repository (Orcathon Track 3: Cyber Deception & Adaption Labs Prize Track)  
**Branch Audited:** `backend` (Commit `5660465`)  
**Audit Date:** 2026-10-25T07:45:00Z  
**Execution Environment:** Windows (PowerShell) / Python 3.14.5 / Node.js  

---

## 1. Audit Verification Matrix

| Area | Check | Result | Evidence (Exact Command & Output or File:Line) |
| :--- | :--- | :---: | :--- |
| **A. Environment** | Python dependencies pinned | **FAIL** | [backend/requirements.txt:1-8](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/requirements.txt#L1-L8): uses unpinned ranges (`fastapi>=0.115.0,<1.0.0`, `adaption>=0.15.0`) instead of exact hashes or `==`. |
| **A. Environment** | Full pytest suite pass & runtime | **PASS** | `.\backend\.venv\Scripts\pytest -v` &rarr; `15 passed, 1 warning in 0.86s`. |
| **A. Environment** | Backend uvicorn health check | **PASS** | `GET http://127.0.0.1:8000/api/health` &rarr; HTTP 200 `{"status": "ok"}`. |
| **A. Environment** | Frontend clean build (`npm run build`) | **FAIL** | `npm run build` failed with 2 errors: `NetworkGraph.tsx(25,9): error TS6133: 'nodeMap' declared but never read` and `lib/api.ts(3,30): error TS2339: Property 'env' does not exist on type 'ImportMeta'`. |
| **A. Environment** | Frontend package lockfile presence | **FAIL** | `frontend/package-lock.json` is missing on `backend` branch (only present on `integration`). |
| **B. Endpoints** | All API endpoints exist in code | **PASS** | 23 endpoints registered in OpenAPI schema and callable via HTTPX. Saved to `docs/audit/responses/*.json`. |
| **B. Endpoints** | Error handling: 404 for unknown simulation | **PASS** | `GET /api/simulations/sim-unknown-999` &rarr; HTTP 404 `{"error": {"code": "SIMULATION_NOT_FOUND", "message": "The requested simulation does not exist."}}`. |
| **B. Endpoints** | Error handling: 400 for malformed payload | **PASS** | `POST /api/simulations/run` with body `"not a json"` &rarr; HTTP 400 `{"error": {"code": "VALIDATION_ERROR", "message": "Invalid request parameters or payload format."}}`. |
| **B. Endpoints** | Error handling: invalid scenario id | **FAIL** | `POST /api/simulations/run` with `{"scenario_id": "invalid_xyz"}` &rarr; Returns **HTTP 200 OK** with silent fallback to default scenario ([simulation_engine.py:119](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/simulation_engine.py#L119)) instead of 400/422. |
| **B. Endpoints** | Reset determinism & state restoration | **PASS** | `POST /api/reset` followed by two identical runs: initial state restored cleanly (`assets_equal: true`, `graph_equal: true`, `events: 0`, `alerts: 0`). Run 1 & Run 2 produce identical event sequences and alerts. |
| **B. Endpoints** | Schema & type alignment with frontend types | **FAIL** | Frontend `StatCards.tsx` expects `total_assets`, `real_assets_count`, `decoy_assets_count`, `intruders_count`, `decoy_interactions_count` which do not exist in backend `SimulationSummary` ([simulation.py:23-27](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/models/simulation.py#L23-L27)). Node `ip` is absent from `Asset` model. |
| **B. Endpoints** | ISO 8601 UTC timestamps ending in `Z` | **PASS** | All simulation, alert, and event timestamps match format `YYYY-MM-DDTHH:MM:SSZ` (e.g. `2026-10-25T07:42:48Z`). |
| **C. Logic** | Alerts triggered only on `is_decoy` assets | **PASS** | [detection_engine.py:25-28](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/detection_engine.py#L25-L28) checks `(target_asset.is_decoy) or event.is_decoy_interaction`. Non-decoy events return empty alert list. |
| **C. Logic** | Attack path computed vs replayed | **FAIL** | [attack_path.py:8-37](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/attack_path.py#L8-L37) simply sorts events by timestamp and maps index 1 to source asset, index > 1 to target asset. It performs no graph traversal or token linkage. |
| **C. Logic** | Hop evidence distinguishes recorded vs inferred | **FAIL** | `AttackPathStep` model ([simulation.py:16-22](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/models/simulation.py#L16-L22)) contains no `evidence_type` or `is_inferred` field. UI legend claims "Inferred Movement" with no backend backing. |
| **C. Logic** | Absence of real network operations | **PASS** | Grep scan for `socket`, `subprocess`, `scapy`, `nmap`, `ping` across `backend/app` confirmed 0 real network socket creations or shell process invocations. |
| **D. Adaption** | Official Adaption SDK installation | **PASS** | `adaption==0.15.0` installed in `.venv`. Verified `from adaption import Adaption; client = Adaption(api_key="...")`. |
| **D. Adaption** | Live end-to-end cloud pipeline execution | **UNVERIFIED** | `ADAPTION_API_KEY` is not set in environment or `backend/.env`. Cloud upload and model adaptation could not be executed live. |
| **D. Adaption** | Error handling and graceful fallback | **PASS** | Tested with invalid key `apt_invalid_test_key_...` &rarr; SDK threw 403 Forbidden, caught gracefully in [adaption_client.py:127-129](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/adaption_client.py#L127-L129), degraded to local curated response without crashing. |
| **D. Adaption** | Quality Index (0.974, 0.982, 0.965) origin | **HARDCODED** | Literal constants in [adaption_client.py:94,123,141,172](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/adaption_client.py#L94-L172). Neither `client.datasets.get_evaluation()` nor `client.datasets.adapt()` is ever called. |
| **D. Adaption** | Main demo flow impact | **FAIL** | Adaption output does not affect the main dashboard flow, network graph, or alert cards. It operates purely as an isolated export endpoint (`/api/adaption/*`). |
| **E. Claims** | "100% fidelity / zero false positives" | **HARDCODED** | Literal strings `"100%_deterministic_decoy_tripwire"` and float `0.0` hardcoded in [forensic_service.py:83-84](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/forensic_service.py#L83-L84). |
| **E. Claims** | "1.0s time-to-detection" | **HARDCODED** | Literal string `"1.0s (Deterministic Canary Alert)"` hardcoded in [forensic_service.py:132](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/forensic_service.py#L132) despite timestamp logic existing. |
| **E. Claims** | "100% data loss prevented" | **HARDCODED** | Literal string `"100% of sensitive assets safeguarded"` hardcoded in [forensic_service.py:133](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/forensic_service.py#L133). |
| **E. Claims** | "82.5% MITRE coverage score" | **HARDCODED** | Hardcoded tactic scores (100, 100, 90, 85, 80, 40) in [mitre_service.py:15-127](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/mitre_service.py#L15-L127); the 82.5% is an average of literal constants. |
| **E. Claims** | Simulated SOAR actions described as real | **FAIL** | [soar_engine.py:146,162,174,183](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/soar_engine.py#L146-L183) logs text claiming Layer 2/3 firewall quarantine, TCP RST injection, and rolling 500MB PCAP recorder without a "simulated" label. |
| **F. Scope** | Frontend backend endpoint consumption | **FAIL** | Frontend consumes only 4 endpoints (`checkHealth`, `getGraph`, `runSimulation`, `resetDemo`). 19 endpoints (STIX 2.1, SOAR, MITRE Heatmap, Forensics, SSE) have **zero UI consumers**. |
| **F. Scope** | CORS configuration | **PASS** | Preflight `OPTIONS /api/health` with `Origin: http://localhost:5173` returns HTTP 200, `Access-Control-Allow-Origin: http://localhost:5173`, `Access-Control-Allow-Credentials: true`. |
| **F. Scope** | Real-time SSE streaming via `curl -N` | **PASS** | `curl.exe -N -X POST http://127.0.0.1:8000/api/simulations/stream?delay=0` streamed 6 sequential event types in order and terminated cleanly with exit code 0. |
| **G. Security** | `.gitignore` covers secrets, venvs, and node_modules | **PASS** | [.gitignore:1-45](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/.gitignore#L1-L45) includes `.env`, `.venv/`, `node_modules/`, `*.key`, `*.pem`, `*.tsbuildinfo`. |
| **G. Security** | Git history secret scan | **PASS** | `docs/audit/scan_secrets.py` inspected every commit across all branches for regex patterns (`pt_live_`, `apt_`, `sk-`, `api_key=`). Output: `Total secret hits found: 0`. |
| **G. Security** | Frontend secret exposure | **PASS** | Grep for `VITE_` in `frontend/` showed only `VITE_API_BASE_URL`. Zero secrets bundled into client code. |
| **G. Security** | Error response stack trace leaks | **PASS** | 400 and 404 responses return clean JSON envelopes (`{"error": {"code": "...", "message": "..."}}`) without tracebacks. |
| **H. Reliability** | 10 consecutive simulation runs | **PASS** | 10 sequential API calls executed with 0 failures, 1.38ms average latency, and zero memory leaks. |

---

## 2. Identified FAILs Ordered by Severity

### 🔴 BLOCKER (Breaks Build, Demo, or Sponsor Eligibility)
1. **Frontend Build Failure on `backend` Branch**:
   - `npm run build` fails with 2 compilation errors: `NetworkGraph.tsx(25,9): error TS6133` (unused variable `nodeMap`) and `lib/api.ts(3,30): error TS2339` (missing `env` on `ImportMeta` due to missing `/// <reference types="vite/client" />` in `vite-env.d.ts`).
   - `frontend/package-lock.json` is missing on `backend` branch.
2. **Adaption Output Disconnected from Primary Demo**:
   - The Adaption curation pipeline (`/api/adaption/*`) is completely decoupled from the frontend UI and attack flow. Judges watching the UI see zero visual indication of Adaption's presence or data.
3. **Hardcoded Data Quality & Confidence Metrics**:
   - `data_quality_index: 0.974` and `0.982` are literal hardcoded floats in [adaption_client.py:123,141](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/adaption_client.py#L123-L141). Neither `client.datasets.get_evaluation()` nor local heuristic computation is performed.

### 🟠 HIGH Severity
4. **Invalid Scenario ID Returns 200 OK**:
   - `POST /api/simulations/run` with `{"scenario_id": "invalid_xyz"}` returns HTTP 200 with a silent fallback to `credential_lateral_movement` ([simulation_engine.py:119](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/simulation_engine.py#L119)) instead of an HTTP 400/422 validation error.
5. **Contract Mismatch: `SimulationSummary` Fields**:
   - Frontend UI (`StatCards.tsx`) expects `total_assets`, `real_assets_count`, `decoy_assets_count`, `intruders_count`, `decoy_interactions_count`. The backend `SimulationSummary` model only provides `events_count`, `alerts_count`, and `assets_affected`.
6. **Attack Path is Sequenced, Not Computed**:
   - [attack_path.py](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/attack_path.py) does not perform graph traversal or token correlation across nodes. It naively maps `idx=1` to source asset and `idx>1` to target asset from a timestamp-sorted list.

### 🟡 MEDIUM Severity
7. **Simulated SOAR Actions Described as Real Infrastructure Operations**:
   - SOAR logs claim "Host quarantined at Layer 2/3 firewall boundaries", "TCP RST injected", and "Rolling forensic PCAP recorder armed (buffer: 500MB)". These must be explicitly labeled as "Simulated Action / Sandbox Mock".
8. **Hardcoded Forensic Report Strings**:
   - `"1.0s (Deterministic Canary Alert)"` and `"100% of sensitive assets safeguarded"` are hardcoded string literals in [forensic_service.py:132-133](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/app/services/forensic_service.py#L132-L133).
9. **Missing Recorded vs Inferred Hop Flag**:
   - `AttackPathStep` has no field indicating whether a hop was directly observed telemetry or inferred movement, despite UI legend claiming inferred hops.

### 🟢 LOW Severity
10. **19 Unconsumed Backend Endpoints**:
    - STIX 2.1 bundle export, SOAR playbooks, MITRE coverage heatmap, and SSE stream endpoints have no frontend UI consumer and can only be invoked via raw API calls.
11. **Unpinned Python Dependencies**:
    - [requirements.txt](file:///c:/Users/ASUS/OneDrive/Desktop/Orcathon/backend/requirements.txt) uses version ranges (`>=`, `<`) instead of strict pinned dependencies (`==`).

---

## 3. Unsupported Claims & Proposed Honest Wording

| Location | Claimed Text | Reality in Code | Proposed Honest Wording |
| :--- | :--- | :--- | :--- |
| `forensic_service.py:83` | `"fidelity": "100%_deterministic_decoy_tripwire"` | Hardcoded string literal | `"fidelity": "high_confidence_decoy_trap"` |
| `forensic_service.py:84` | `"false_positive_rate": 0.0` | Hardcoded float literal | `"false_positive_rate": "near_zero_by_design"` |
| `forensic_service.py:132` | `"time_to_first_decoy_tripwire": "1.0s (Deterministic Canary Alert)"` | Hardcoded string literal | Calculate real delta: `(first_decoy_event_time - started_at).total_seconds()` |
| `forensic_service.py:133` | `"data_loss_prevented": "100% of sensitive assets safeguarded"` | Hardcoded string literal | `"data_loss_prevented": f"{uncompromised_count}/{total_real} production assets protected"` |
| `adaption_client.py:141` | `"data_quality_index": 0.974` | Hardcoded float literal | Compute locally from token density, label balance, and schema validity: `round(computed_quality_score, 3)` |
| `mitre_service.py:15-127` | Hardcoded tactic scores (100, 90, 85, 80, 40) | Static dictionary | Dynamically compute: `(monitored_techniques / total_tactic_techniques) * 100` |
| `soar_engine.py:146` | `"Host 'employee-pc-01' quarantined at Layer 2/3 firewall boundaries."` | In-memory status update only | `"[SIMULATED] Host 'employee-pc-01' quarantined via simulated firewall boundary rule."` |
| `soar_engine.py:162` | `"TCP RST injected for connection... Network path severed."` | In-memory edge status update | `"[SIMULATED] Network connection severed via simulated TCP RST injection."` |
| `soar_engine.py:183` | `"Rolling forensic PCAP recorder armed (buffer: 500MB)..."` | Pure mock log | `"[SIMULATED] Forensic packet capture recorder armed for adversary subnet."` |

---

## 4. Sponsor Prize Evaluation

### *"Is the Adaption integration real, used by the application, and demonstrable to a judge?"*

**Verdict: Partially Real SDK Integration, but Disconnected from Demo Flow.**  
The integration with Adaption Labs uses the official `adaption==0.15.0` Python SDK and correctly implements client authentication (`Adaption(api_key=...)`), file serialization into `.jsonl`, and graceful exception handling when credentials are missing or invalid. However, in its current state, **it is not demonstrable in the primary demo**: the dataset quality scores (`0.974`, `0.982`) are hardcoded constants rather than values retrieved from Adaption's evaluation endpoints, and the output is strictly confined to an isolated backend export endpoint (`/api/adaption/*`) that is never called or displayed by the frontend dashboard. To win the sponsor prize under scrutiny, the application must compute data metrics honestly or fetch them from the SDK, display a clear "Adaption Labs" telemetry badge in the UI, and prove that Adaption's dataset curation directly enhances the deception incident analysis.

---

### Audit State: Complete
*Phase 1 Audit complete. Awaiting user approval before proceeding to Phase 2 fixes.*
