from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)

def test_run_simulation_and_reset():
    # 1. Reset
    reset_res = client.post("/api/reset")
    assert reset_res.status_code == 200
    assert reset_res.json() == {"status": "ok"}

    # 2. Check assets
    assets_res = client.get("/api/assets")
    assert assets_res.status_code == 200
    assets = assets_res.json()["assets"]
    assert len(assets) >= 5
    assert any(a["is_decoy"] for a in assets)

    # 3. Run simulation
    sim_res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    assert sim_res.status_code == 200
    data = sim_res.json()
    assert data["status"] == "completed"
    assert data["summary"]["events_count"] == 4
    assert data["summary"]["alerts_count"] >= 2
    assert len(data["attack_path"]) == 4

    sim_id = data["simulation_id"]

    # 4. Fetch specific simulation
    get_sim = client.get(f"/api/simulations/{sim_id}")
    assert get_sim.status_code == 200
    assert get_sim.json()["simulation_id"] == sim_id

    # 5. Check incident alias
    inc_res = client.get(f"/api/incidents/{sim_id}")
    assert inc_res.status_code == 200
    assert inc_res.json()["simulation_id"] == sim_id

    # 6. Check Adaption analysis endpoint
    adapt_res = client.post(f"/api/simulations/{sim_id}/adaption-analysis")
    assert adapt_res.status_code == 200
    assert "adaption_integration" in adapt_res.json()

    # 7. Check events & alerts filter
    events_res = client.get(f"/api/events?simulation_id={sim_id}")
    assert events_res.status_code == 200
    assert len(events_res.json()["events"]) == 4

    alerts_res = client.get(f"/api/alerts?simulation_id={sim_id}")
    assert alerts_res.status_code == 200
    assert len(alerts_res.json()["alerts"]) >= 2


def test_unknown_scenario_returns_400():
    res = client.post("/api/simulations/run", json={"scenario_id": "non_existent_exploit_99"})
    assert res.status_code == 400
    data = res.json()
    assert "error" in data
    assert data["error"]["code"] == "UNKNOWN_SCENARIO"
    assert "non_existent_exploit_99" in data["error"]["message"]

