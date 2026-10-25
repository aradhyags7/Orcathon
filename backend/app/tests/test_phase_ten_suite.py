import pytest
from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)

@pytest.fixture(autouse=True)
def clean_state():
    client.post("/api/reset")
    yield
    client.post("/api/reset")

# Test 1: Health
def test_1_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}

# Test 2: Assets
def test_2_assets_inventory():
    res = client.get("/api/assets")
    assert res.status_code == 200
    assets = res.json()["assets"]
    assert len(assets) >= 4

    asset_ids = [a["id"] for a in assets]
    # Confirm unique IDs
    assert len(asset_ids) == len(set(asset_ids))

    # Confirm decoy assets are marked correctly
    decoys = [a for a in assets if a["is_decoy"]]
    assert len(decoys) >= 2
    assert any(d["id"] == "decoy-payroll-file" for d in decoys)

# Test 3: Simulation
def test_3_simulation_execution():
    res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "completed"
    assert data["scenario_id"] == "credential_lateral_movement"

    # Confirm all events reference valid assets
    assets_res = client.get("/api/assets")
    valid_ids = {a["id"] for a in assets_res.json()["assets"]}

    for evt in data["events"]:
        assert evt["source_asset_id"] in valid_ids
        assert evt["target_asset_id"] in valid_ids

# Test 4: Detection
def test_4_detection_rules():
    res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    data = res.json()
    events = data["events"]
    alerts = data["alerts"]

    # Each qualifying decoy interaction generates an alert
    decoy_events = [e for e in events if e["is_decoy_interaction"]]
    assert len(decoy_events) >= 2
    assert len(alerts) >= 2

    # Alerts reference existing events
    event_ids = {e["id"] for e in events}
    for alert in alerts:
        assert alert["event_id"] in event_ids
        assert len(alert["evidence"]) > 0
        assert len(alert["recommended_actions"]) > 0

    # Ordinary events do not trigger decoy alerts
    normal_events = [e for e in events if not e["is_decoy_interaction"]]
    alerted_event_ids = {a["event_id"] for a in alerts}
    for normal_e in normal_events:
        assert normal_e["id"] not in alerted_event_ids

# Test 5: Incident reconstruction
def test_5_incident_reconstruction():
    res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    data = res.json()
    attack_path = data["attack_path"]
    events = data["events"]

    assert len(attack_path) == len(events)

    # Ordered chronologically
    timestamps = [step["timestamp"] for step in attack_path]
    assert timestamps == sorted(timestamps)

    # Every step references a recorded event
    event_ids = {e["id"] for e in events}
    for step in attack_path:
        assert step["event_id"] in event_ids

    # Consistent summary counts
    assert data["summary"]["events_count"] == len(events)
    assert data["summary"]["alerts_count"] == len(data["alerts"])

# Test 6: Reset
def test_6_reset_demo_state():
    # Run simulation
    client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    
    # Verify events exist
    events_before = client.get("/api/events").json()["events"]
    assert len(events_before) > 0

    # Reset
    reset_res = client.post("/api/reset")
    assert reset_res.status_code == 200
    assert reset_res.json() == {"status": "ok"}

    # Verify events and alerts are cleared
    events_after = client.get("/api/events").json()["events"]
    alerts_after = client.get("/api/alerts").json()["alerts"]
    assert len(events_after) == 0
    assert len(alerts_after) == 0

    # Base assets remain intact
    assets = client.get("/api/assets").json()["assets"]
    assert len(assets) >= 4

# Test 7: Adaption
def test_7_adaption_integration():
    sim_res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    sim_id = sim_res.json()["simulation_id"]

    adapt_res = client.post(f"/api/simulations/{sim_id}/adaption-analysis")
    assert adapt_res.status_code == 200
    adapt_data = adapt_res.json()
    assert "adaption_integration" in adapt_data
    integration = adapt_data["adaption_integration"]
    assert "provider" in integration or "status" in integration

    # Test Adaptive Data curation endpoint
    curate_res = client.post("/api/adaption/curate-dataset")
    assert curate_res.status_code == 200
    curate_data = curate_res.json()
    assert curate_data["records_processed"] >= 4
    assert curate_data["data_quality_index"] > 0.9

# Test 8: Multiple Scenarios & MITRE ATT&CK Tags
def test_8_multiple_scenarios_and_mitre():
    # List scenarios
    scenarios_res = client.get("/api/scenarios")
    assert scenarios_res.status_code == 200
    scenarios = scenarios_res.json()["scenarios"]
    assert len(scenarios) == 3
    scenario_ids = [s["id"] for s in scenarios]
    assert "credential_lateral_movement" in scenario_ids
    assert "ransomware_canary_recon" in scenario_ids
    assert "insider_credential_dump" in scenario_ids

    # Run ransomware scenario
    rw_res = client.post("/api/simulations/run", json={"scenario_id": "ransomware_canary_recon"})
    assert rw_res.status_code == 200
    rw_data = rw_res.json()
    assert rw_data["scenario_id"] == "ransomware_canary_recon"
    
    # Check MITRE ATT&CK tags present on events and alerts
    for evt in rw_data["events"]:
        assert "mitre_attack" in evt
        if evt["mitre_attack"]:
            assert "technique_id" in evt["mitre_attack"]
            assert "technique_name" in evt["mitre_attack"]

    for alert in rw_data["alerts"]:
        assert alert["mitre_attack"] is not None
        assert alert["mitre_attack"]["technique_id"] == "T1486"

# Test 9: Active Threat Containment (SOAR)
def test_9_active_containment():
    sim_res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    alert = sim_res.json()["alerts"][0]
    alert_id = alert["id"]
    source_asset = alert["source_asset_id"]

    # Execute containment
    contain_res = client.post(f"/api/alerts/{alert_id}/contain")
    assert contain_res.status_code == 200
    contain_data = contain_res.json()
    assert contain_data["status"] == "contained"
    assert contain_data["isolated_asset"] == source_asset

    # Verify graph reflects isolated asset and blocked edges
    graph_res = client.get("/api/graph")
    nodes = {n["id"]: n for n in graph_res.json()["nodes"]}
    assert nodes[source_asset]["status"] == "isolated"

    edges = graph_res.json()["edges"]
    blocked_edges = [e for e in edges if e["source"] == source_asset or e["target"] == source_asset]
    assert all(e["status"] == "blocked" for e in blocked_edges)
