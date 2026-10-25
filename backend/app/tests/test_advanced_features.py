import pytest
from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)


def test_soar_playbooks_lifecycle():
    # 1. Run simulation to have an active incident
    sim_res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    assert sim_res.status_code == 200
    sim_id = sim_res.json()["simulation_id"]

    # 2. List playbooks
    pb_res = client.get("/api/soar/playbooks")
    assert pb_res.status_code == 200
    playbooks = pb_res.json()["playbooks"]
    assert len(playbooks) >= 3
    pb_ids = [p["id"] for p in playbooks]
    assert "playbook-rapid-containment" in pb_ids
    assert "playbook-active-deception-tarpit" in pb_ids
    assert "playbook-threat-intel-export" in pb_ids

    # 3. Dry-run execution
    dry_res = client.post(
        "/api/soar/playbooks/playbook-rapid-containment/execute",
        json={"incident_id": sim_id, "dry_run": True},
    )
    assert dry_res.status_code == 200
    dry_data = dry_res.json()
    assert dry_data["status"] == "simulated"
    assert len(dry_data["actions_executed"]) == 3
    assert all(a["status"] == "simulated" for a in dry_data["actions_executed"])

    # 4. Live execution
    live_res = client.post(
        "/api/soar/playbooks/playbook-rapid-containment/execute",
        json={"incident_id": sim_id, "dry_run": False},
    )
    assert live_res.status_code == 200
    live_data = live_res.json()
    assert live_data["status"] == "success"
    assert len(live_data["isolated_assets"]) > 0
    assert len(live_data["blocked_connections"]) > 0
    assert all(a["status"] == "completed" for a in live_data["actions_executed"])

    # 5. Check execution history
    exec_res = client.get("/api/soar/executions")
    assert exec_res.status_code == 200
    executions = exec_res.json()["executions"]
    assert len(executions) >= 2


def test_mitre_coverage_matrix():
    res = client.get("/api/mitre/coverage")
    assert res.status_code == 200
    report = res.json()
    assert "overall_coverage_pct" in report
    assert report["overall_coverage_pct"] > 70.0
    assert report["active_decoys_count"] >= 3
    assert len(report["tactics"]) >= 5
    assert len(report["defense_gaps"]) > 0
    assert len(report["strategic_recommendations"]) > 0

    # Verify specific tactic contents
    tactic_names = [t["tactic_name"] for t in report["tactics"]]
    assert "Credential Access" in tactic_names
    assert "Discovery" in tactic_names
    assert "Lateral Movement" in tactic_names


def test_sse_telemetry_streaming():
    # Test instant stream (delay=0)
    with client.stream("POST", "/api/simulations/stream?scenario_id=credential_lateral_movement&delay=0") as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]

        content = response.iter_text()
        full_text = "".join(list(content))

        assert "event: simulation_started" in full_text
        assert "event: security_event" in full_text
        assert "event: node_update" in full_text
        assert "event: alert_triggered" in full_text
        assert "event: simulation_completed" in full_text
