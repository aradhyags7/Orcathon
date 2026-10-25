import os
import sys
import json
import time
import random
from datetime import datetime, timezone
import httpx

BASE_URL = "http://127.0.0.1:8000"
RESP_DIR = "docs/audit/responses"
os.makedirs(RESP_DIR, exist_ok=True)

audit_results = {}

def run_audit():
    client = httpx.Client(base_url=BASE_URL, timeout=10.0)
    
    # -------------------------------------------------------------
    # 1. ENDPOINT RESPONSES & CONTRACT VERIFICATION
    # -------------------------------------------------------------
    endpoints_to_test = [
        ("GET", "/api/health", None, "get_health.json"),
        ("GET", "/api/scenarios", None, "get_scenarios.json"),
        ("GET", "/api/assets", None, "get_assets.json"),
        ("GET", "/api/graph", None, "get_graph.json"),
        ("POST", "/api/simulations/run", {"scenario_id": "credential_lateral_movement"}, "post_simulations_run.json"),
        ("GET", "/api/events", None, "get_events.json"),
        ("GET", "/api/alerts", None, "get_alerts.json"),
        ("GET", "/api/adaption/status", None, "get_adaption_status.json"),
        ("POST", "/api/adaption/curate-dataset", {}, "post_adaption_curate_dataset.json"),
        ("GET", "/api/adaption/export-dataset", None, "get_adaption_export_dataset.txt"),
        ("GET", "/api/soar/playbooks", None, "get_soar_playbooks.json"),
        ("GET", "/api/soar/executions", None, "get_soar_executions.json"),
        ("GET", "/api/mitre/coverage", None, "get_mitre_coverage.json"),
    ]

    last_sim_id = None
    last_alert_id = None

    for method, path, payload, outfile in endpoints_to_test:
        try:
            if method == "GET":
                r = client.get(path)
            else:
                r = client.post(path, json=payload if payload else None)
            
            filepath = os.path.join(RESP_DIR, outfile)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(r.text)
            
            audit_results[f"{method} {path}"] = {
                "status": r.status_code,
                "saved_to": filepath,
                "content_type": r.headers.get("content-type"),
            }

            if path == "/api/simulations/run" and r.status_code == 200:
                data = r.json()
                last_sim_id = data.get("simulation_id")
            elif path == "/api/alerts" and r.status_code == 200:
                data = r.json()
                alerts = data.get("alerts", [])
                if alerts:
                    last_alert_id = alerts[0].get("id")
        except Exception as e:
            audit_results[f"{method} {path}"] = {"error": str(e)}

    # Test dynamic endpoints using sim_id
    if last_sim_id:
        dyn_endpoints = [
            ("GET", f"/api/simulations/{last_sim_id}", None, "get_simulation_by_id.json"),
            ("GET", f"/api/incidents/{last_sim_id}", None, "get_incident_by_id.json"),
            ("GET", f"/api/incidents/{last_sim_id}/forensic-report", None, "get_incident_forensic_report.json"),
            ("GET", f"/api/incidents/{last_sim_id}/forensic-report/markdown", None, "get_incident_forensic_markdown.md"),
            ("GET", f"/api/incidents/{last_sim_id}/iocs", None, "get_incident_iocs.json"),
            ("GET", f"/api/incidents/{last_sim_id}/stix-bundle", None, "get_incident_stix_bundle.json"),
            ("POST", f"/api/simulations/{last_sim_id}/adaption-analysis", {}, "post_simulation_adaption_analysis.json"),
            ("POST", "/api/soar/playbooks/playbook-rapid-containment/execute", {"incident_id": last_sim_id}, "post_soar_execute.json"),
        ]
        for method, path, payload, outfile in dyn_endpoints:
            try:
                if method == "GET":
                    r = client.get(path)
                else:
                    r = client.post(path, json=payload if payload else None)
                
                filepath = os.path.join(RESP_DIR, outfile)
                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(r.text)
                
                audit_results[f"{method} {path}"] = {
                    "status": r.status_code,
                    "saved_to": filepath,
                    "content_type": r.headers.get("content-type"),
                }
            except Exception as e:
                audit_results[f"{method} {path}"] = {"error": str(e)}

    # Test alert containment
    if last_alert_id:
        try:
            r = client.post(f"/api/alerts/{last_alert_id}/contain")
            filepath = os.path.join(RESP_DIR, "post_alert_contain.json")
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(r.text)
            audit_results[f"POST /api/alerts/{last_alert_id}/contain"] = {
                "status": r.status_code,
                "saved_to": filepath,
            }
        except Exception as e:
            audit_results["POST alert contain"] = {"error": str(e)}

    # Reset endpoint
    try:
        r = client.post("/api/reset")
        filepath = os.path.join(RESP_DIR, "post_reset.json")
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(r.text)
        audit_results["POST /api/reset"] = {"status": r.status_code, "saved_to": filepath}
    except Exception as e:
        audit_results["POST /api/reset"] = {"error": str(e)}

    # -------------------------------------------------------------
    # 2. ERROR HANDLING
    # -------------------------------------------------------------
    error_tests = {}
    # 404 unknown simulation
    r_404 = client.get("/api/simulations/sim-unknown-999")
    error_tests["unknown_sim_404"] = {
        "status": r_404.status_code,
        "body": r_404.json() if r_404.headers.get("content-type", "").startswith("application/json") else r_404.text,
    }

    # Invalid scenario id
    r_invalid_scen = client.post("/api/simulations/run", json={"scenario_id": "non_existent_scenario_123"})
    error_tests["invalid_scenario_id"] = {
        "status": r_invalid_scen.status_code,
        "body": r_invalid_scen.json() if r_invalid_scen.headers.get("content-type", "").startswith("application/json") else r_invalid_scen.text,
    }

    # Malformed body (invalid json / bad types)
    r_bad_body = client.post("/api/simulations/run", content="not a json", headers={"Content-Type": "application/json"})
    error_tests["malformed_json_body"] = {
        "status": r_bad_body.status_code,
        "body": r_bad_body.json() if r_bad_body.headers.get("content-type", "").startswith("application/json") else r_bad_body.text,
    }

    # -------------------------------------------------------------
    # 3. DETERMINISM & RESET INTEGRITY
    # -------------------------------------------------------------
    # Reset first
    client.post("/api/reset")
    initial_assets = client.get("/api/assets").json()
    initial_graph = client.get("/api/graph").json()
    initial_events = client.get("/api/events").json()
    initial_alerts = client.get("/api/alerts").json()

    # Run scenario once
    run1 = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"}).json()
    
    # Reset
    client.post("/api/reset")
    post_reset_assets = client.get("/api/assets").json()
    post_reset_graph = client.get("/api/graph").json()
    post_reset_events = client.get("/api/events").json()
    post_reset_alerts = client.get("/api/alerts").json()

    # Run scenario second time
    run2 = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"}).json()

    determinism_tests = {
        "initial_state_restored": {
            "assets_equal": initial_assets == post_reset_assets,
            "graph_equal": initial_graph == post_reset_graph,
            "events_empty": len(post_reset_events.get("events", [])) == 0,
            "alerts_empty": len(post_reset_alerts.get("alerts", [])) == 0,
        },
        "run1_vs_run2": {
            "events_count_equal": len(run1.get("events", [])) == len(run2.get("events", [])),
            "alerts_count_equal": len(run1.get("alerts", [])) == len(run2.get("alerts", [])),
            "path_steps_equal": len(run1.get("attack_path", [])) == len(run2.get("attack_path", [])),
            "same_sim_id": run1.get("simulation_id") == run2.get("simulation_id"),
            "event_messages_equal": [e["message"] for e in run1.get("events", [])] == [e["message"] for e in run2.get("events", [])],
            "timestamps_identical": [e["timestamp"] for e in run1.get("events", [])] == [e["timestamp"] for e in run2.get("events", [])],
        }
    }

    # -------------------------------------------------------------
    # 4. CORS CHECK FOR http://localhost:5173
    # -------------------------------------------------------------
    cors_resp = client.options(
        "/api/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        }
    )
    cors_check = {
        "status": cors_resp.status_code,
        "access_control_allow_origin": cors_resp.headers.get("access-control-allow-origin"),
        "access_control_allow_credentials": cors_resp.headers.get("access-control-allow-credentials"),
    }

    # -------------------------------------------------------------
    # 5. RELIABILITY: 10 CONSECUTIVE RUNS
    # -------------------------------------------------------------
    latencies = []
    failures = 0
    for i in range(10):
        t0 = time.time()
        res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
        dt = time.time() - t0
        latencies.append(dt)
        if res.status_code != 200:
            failures += 1

    reliability_check = {
        "runs": 10,
        "failures": failures,
        "avg_latency_ms": round((sum(latencies) / len(latencies)) * 1000, 2),
        "min_latency_ms": round(min(latencies) * 1000, 2),
        "max_latency_ms": round(max(latencies) * 1000, 2),
    }

    # Compile audit summary
    summary = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "endpoints_called": len(audit_results),
        "audit_results": audit_results,
        "error_tests": error_tests,
        "determinism_tests": determinism_tests,
        "cors_check": cors_check,
        "reliability_check": reliability_check,
    }

    with open("docs/audit/audit_summary.json", "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print("Audit run complete. Summary saved to docs/audit/audit_summary.json")

if __name__ == "__main__":
    run_audit()
