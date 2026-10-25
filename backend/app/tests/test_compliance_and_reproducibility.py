import pytest
import os
from unittest.mock import patch
from fastapi.testclient import TestClient
from ..main import app
from ..services.adaption_client import AdaptionClient, CACHED_CSV_PATH
from ..repositories.memory_store import store

client = TestClient(app)


# ---------------------------------------------------------------------------
# (a) Adaption Fallback Tests
# ---------------------------------------------------------------------------

def test_adaption_fallback_when_key_unset():
    """When ADAPTION_API_KEY is not configured, client must gracefully fall back to cached CSV."""
    with patch.dict(os.environ, {"ADAPTION_API_KEY": ""}, clear=True):
        fallback_client = AdaptionClient()
        status = fallback_client.get_status()
        assert status["api_key_configured"] is False
        assert status["source"] == "cached"
        assert status["cached_corpus_available"] is True

        decoys = fallback_client.load_cached_decoys()
        assert len(decoys) >= 3
        # Ensure cached CSV fields match expected structure
        payroll = next((d for d in decoys if d["id"] == "decoy-payroll-file"), None)
        assert payroll is not None
        assert "Executive Salary" in payroll["name"]
        assert "content_preview" in payroll


@pytest.mark.anyio
async def test_adaption_fallback_on_invalid_key_or_error():
    """When an invalid key or network timeout triggers an exception during upload, it falls back to local engine."""
    fallback_client = AdaptionClient()
    mock_datasets = type("MockDatasets", (), {
        "upload_file": lambda *args, **kwargs: (_ for _ in ()).throw(RuntimeError("Adaption 401 Unauthorized / Timeout"))
    })()
    fallback_client._sdk_client = type("MockSDK", (), {"datasets": mock_datasets})()

    res = await fallback_client.curate_telemetry_dataset([
        {"is_decoy_interaction": True, "source_asset_id": "src", "target_asset_id": "tgt", "event_type": "decoy_triggered", "message": "Breach probe"}
    ])
    assert res["source"] in ("cached", "template")
    assert res["status"] == "curated_local"
    assert res["records_processed"] == 1


def test_adaption_get_decoy_content_fallback():
    """Verify get_decoy_content retrieves cached corporate realistic content with token injection."""
    fallback_client = AdaptionClient()
    content, source = fallback_client.get_decoy_content("decoy-payroll-file", "CANARY_TOKEN_9999")
    assert source in ("cached", "template")
    assert "CANARY_TOKEN_9999" in content


# ---------------------------------------------------------------------------
# (b) Reset Determinism Test
# ---------------------------------------------------------------------------

def test_simulation_reset_determinism():
    """
    Asserts reproducibility across runs:
    Run simulation -> Reset -> Run again -> Assert exact match on:
    - Events count
    - Alerts count
    - Assets affected
    - Attack path step count, hop sequence, and bases
    """
    # Run 1
    client.post("/api/reset")
    res1 = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    assert res1.status_code == 200
    data1 = res1.json()

    # Reset
    reset_res = client.post("/api/reset")
    assert reset_res.status_code == 200

    # Verify reset cleared active simulations and alerts
    events_after_reset = client.get("/api/events").json()["events"]
    assert len(events_after_reset) == 0
    alerts_after_reset = client.get("/api/alerts").json()["alerts"]
    assert len(alerts_after_reset) == 0

    # Run 2
    res2 = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    assert res2.status_code == 200
    data2 = res2.json()

    # Compare exact counts and metrics
    assert data1["summary"]["events_count"] == data2["summary"]["events_count"] == 4
    assert data1["summary"]["alerts_count"] == data2["summary"]["alerts_count"]
    assert data1["summary"]["assets_affected"] == data2["summary"]["assets_affected"]
    assert data1["summary"]["total_assets"] == data2["summary"]["total_assets"]
    assert data1["summary"]["real_assets_count"] == data2["summary"]["real_assets_count"]
    assert data1["summary"]["decoy_assets_count"] == data2["summary"]["decoy_assets_count"]

    # Compare attack path hops and bases
    path1 = data1["attack_path"]
    path2 = data2["attack_path"]
    assert len(path1) == len(path2) == 4

    for p1, p2 in zip(path1, path2):
        assert p1["step"] == p2["step"]
        assert p1["from_asset_id"] == p2["from_asset_id"]
        assert p1["to_asset_id"] == p2["to_asset_id"]
        assert p1["via_asset_id"] == p2["via_asset_id"]
        assert p1["basis"] == p2["basis"]
        assert p1["label"] == p2["label"]


# ---------------------------------------------------------------------------
# (c) Strict Schema Contract Verification
# ---------------------------------------------------------------------------

def test_schema_contract_compliance():
    """
    Validates that every field specified in contracts/api-contract.md
    is present and correctly typed in live API responses.
    """
    client.post("/api/reset")
    run_res = client.post("/api/simulations/run", json={"scenario_id": "credential_lateral_movement"})
    assert run_res.status_code == 200
    sim = run_res.json()
    sim_id = sim["simulation_id"]

    # 1. SimulationResult top-level fields
    for field in ["simulation_id", "scenario_id", "status", "started_at", "completed_at", "summary", "events", "alerts", "attack_path"]:
        assert field in sim, f"Missing SimulationResult field: {field}"

    # 2. SimulationSummary contract fields
    summary = sim["summary"]
    for field in ["events_count", "alerts_count", "assets_affected", "total_assets", "real_assets_count", "decoy_assets_count", "intruders_count", "decoy_interactions_count"]:
        assert field in summary, f"Missing SimulationSummary field: {field}"

    # 3. SecurityEvent contract fields
    assert len(sim["events"]) > 0
    evt = sim["events"][0]
    for field in ["id", "simulation_id", "session_id", "timestamp", "event_type", "source_asset_id", "target_asset_id", "severity", "message", "is_decoy_interaction", "metadata"]:
        assert field in evt, f"Missing SecurityEvent field: {field}"

    # 4. AttackPathStep contract fields
    assert len(sim["attack_path"]) > 0
    step = sim["attack_path"][0]
    for field in ["step", "event_id", "from_asset_id", "to_asset_id", "via_asset_id", "basis", "asset_id", "label", "timestamp"]:
        assert field in step, f"Missing AttackPathStep field: {field}"
    assert step["basis"] in ("recorded", "inferred")

    # 5. Assets contract fields
    assets_res = client.get("/api/assets")
    assert assets_res.status_code == 200
    assets = assets_res.json()["assets"]
    assert len(assets) >= 6
    for a in assets:
        for field in ["id", "name", "kind", "status", "is_decoy", "description"]:
            assert field in a, f"Missing Asset field: {field}"
        if a["is_decoy"]:
            assert "canary_token" in a
            assert "content_preview" in a
            assert a["content_source"] in ("adaption", "cached", "template", "hand-authored template")

    # 6. Baseline comparison contract fields
    baseline_res = client.get("/api/baseline")
    assert baseline_res.status_code == 200
    bdata = baseline_res.json()
    for field in ["title", "description", "source", "total_samples", "samples", "evaluation"]:
        assert field in bdata, f"Missing baseline field: {field}"
    assert len(bdata["samples"]) > 0
    sample = bdata["samples"][0]
    for s_field in ["id", "name", "category", "prompt", "template_baseline", "adaption_generated", "source", "canary_token_placeholder"]:
        assert s_field in sample, f"Missing sample field: {s_field}"

    # 7. Adaption status contract fields
    status_res = client.get("/api/adaption/status")
    assert status_res.status_code == 200
    sdata = status_res.json()
    for field in ["sdk_available", "sdk_version", "api_key_configured", "source", "pipeline", "cached_corpus_available"]:
        assert field in sdata, f"Missing status field: {field}"
