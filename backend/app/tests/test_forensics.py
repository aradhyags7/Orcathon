import pytest
from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)


def test_forensics_lifecycle():
    # 1. Run a simulation first
    sim_res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    assert sim_res.status_code == 200
    sim_data = sim_res.json()
    sim_id = sim_data["simulation_id"]
    assert sim_id.startswith("sim-")

    # 2. Test JSON Forensic Report
    report_res = client.get(f"/api/incidents/{sim_id}/forensic-report")
    assert report_res.status_code == 200
    report = report_res.json()
    assert report["incident_id"] == sim_id
    assert report["executive_summary"]["status"] == "INCIDENT_CONTAINED"
    assert "mitre_attack_matrix" in report
    assert len(report["mitre_attack_matrix"]) > 0
    assert "attack_milestones" in report
    assert len(report["attack_milestones"]) > 0
    assert "indicators_of_compromise" in report

    # 3. Test Markdown Forensic Report
    md_res = client.get(f"/api/incidents/{sim_id}/forensic-report/markdown")
    assert md_res.status_code == 200
    assert md_res.headers["content-type"].startswith("text/markdown")
    assert f"# DeceptiTrace Incident Forensic Report: `{sim_id}`" in md_res.text
    assert "## 1. Executive Summary" in md_res.text
    assert "## 2. MITRE ATT&CK" in md_res.text

    # 4. Test IOCs Extraction
    iocs_res = client.get(f"/api/incidents/{sim_id}/iocs")
    assert iocs_res.status_code == 200
    iocs_data = iocs_res.json()
    assert iocs_data["fidelity"] == "100%_deterministic_decoy_tripwire"
    iocs = iocs_data["iocs"]
    assert len(iocs["decoy_files"]) > 0 or len(iocs["honey_credentials"]) > 0
    assert "Executive_Salaries_2026.xlsx" in iocs["decoy_files"]

    # 5. Test STIX 2.1 Threat Intel Bundle
    stix_res = client.get(f"/api/incidents/{sim_id}/stix-bundle")
    assert stix_res.status_code == 200
    stix = stix_res.json()
    assert stix["type"] == "bundle"
    assert stix["spec_version"] == "2.1"
    assert "id" in stix
    assert isinstance(stix["objects"], list)
    assert len(stix["objects"]) >= 5

    # Verify key STIX object types
    obj_types = {o["type"] for o in stix["objects"]}
    assert "identity" in obj_types
    assert "threat-actor" in obj_types
    assert "attack-pattern" in obj_types
    assert "indicator" in obj_types
    assert "relationship" in obj_types
    assert "course-of-action" in obj_types

    # 6. Test simulation alias routes
    alias_res = client.get(f"/api/simulations/{sim_id}/stix-bundle")
    assert alias_res.status_code == 200
    assert alias_res.json()["type"] == "bundle"

    # 7. Test 404 handling
    err_res = client.get("/api/incidents/nonexistent-sim-999/forensic-report")
    assert err_res.status_code == 404
    assert err_res.json()["error"]["code"] == "INCIDENT_NOT_FOUND"
