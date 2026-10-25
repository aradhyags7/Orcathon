import random
from datetime import datetime, timezone, timedelta
from ..models.event import SecurityEvent
from ..services.attack_path import attack_path_reconstructor
from ..services.simulation_engine import simulation_engine


def test_shuffled_events_deterministic_order():
    base_time = datetime(2026, 10, 25, 12, 0, 0, tzinfo=timezone.utc)
    events = [
        SecurityEvent(
            id=f"evt-{i}",
            simulation_id="sim-test",
            session_id="sess-001",
            timestamp=(base_time + timedelta(seconds=i * 10)).strftime("%Y-%m-%dT%H:%M:%SZ"),
            event_type="connection" if i == 0 else "file_access",
            source_asset_id=f"host-{i}",
            target_asset_id=f"host-{i+1}",
            severity="low",
            message=f"Event {i}",
            is_decoy_interaction=False,
            metadata={},
        )
        for i in range(5)
    ]

    ordered_steps = attack_path_reconstructor.reconstruct(events)

    # Shuffle copy
    shuffled = list(events)
    random.seed(42)
    random.shuffle(shuffled)
    assert [e.id for e in shuffled] != [e.id for e in events]

    shuffled_steps = attack_path_reconstructor.reconstruct(shuffled)

    # Identical order and content
    assert len(shuffled_steps) == len(ordered_steps) == 5
    for s_step, o_step in zip(shuffled_steps, ordered_steps):
        assert s_step.step == o_step.step
        assert s_step.event_id == o_step.event_id
        assert s_step.timestamp == o_step.timestamp
        assert s_step.from_asset_id == o_step.from_asset_id
        assert s_step.to_asset_id == o_step.to_asset_id
        assert s_step.basis == o_step.basis


def test_removing_decoy_event_modifies_path_safely():
    base_time = datetime(2026, 10, 25, 12, 0, 0, tzinfo=timezone.utc)
    ev1 = SecurityEvent(
        id="evt-1",
        simulation_id="sim-test",
        session_id="sess-001",
        timestamp=(base_time + timedelta(seconds=0)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        event_type="connection",
        source_asset_id="employee-pc",
        target_asset_id="file-server",
        severity="low",
        message="SMB ingress",
        is_decoy_interaction=False,
        metadata={},
    )
    ev2_decoy = SecurityEvent(
        id="evt-2",
        simulation_id="sim-test",
        session_id="sess-001",
        timestamp=(base_time + timedelta(seconds=10)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        event_type="decoy_triggered",
        source_asset_id="employee-pc",
        target_asset_id="decoy-payroll-file",
        severity="high",
        message="Decoy tripwire",
        is_decoy_interaction=True,
        canary_token="canary_doc_8841",
        metadata={"canary_token": "canary_doc_8841"},
    )
    ev3 = SecurityEvent(
        id="evt-3",
        simulation_id="sim-test",
        session_id="sess-001",
        timestamp=(base_time + timedelta(seconds=20)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        event_type="file_access",
        source_asset_id="file-server",
        target_asset_id="finance-db",
        severity="medium",
        message="Probe",
        is_decoy_interaction=False,
        metadata={},
    )

    full_path = attack_path_reconstructor.reconstruct([ev1, ev2_decoy, ev3])
    assert len(full_path) == 3
    assert full_path[1].event_id == "evt-2"

    # Remove the middle decoy event
    truncated_path = attack_path_reconstructor.reconstruct([ev1, ev3])
    assert len(truncated_path) == 2
    assert [p.step for p in truncated_path] == [1, 2]
    assert [p.event_id for p in truncated_path] == ["evt-1", "evt-3"]


def test_token_reuse_inferred_pivot():
    base_time = datetime(2026, 10, 25, 12, 0, 0, tzinfo=timezone.utc)
    ev1_tripwire = SecurityEvent(
        id="evt-trip",
        simulation_id="sim-test",
        session_id="sess-001",
        timestamp=(base_time + timedelta(seconds=0)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        event_type="decoy_triggered",
        source_asset_id="compromised-host-a",
        target_asset_id="decoy-admin-vault",
        severity="high",
        message="Admin decoy accessed",
        is_decoy_interaction=True,
        canary_token="CANARY_ROOT_TOKEN_773",
        metadata={"canary_token": "CANARY_ROOT_TOKEN_773"},
    )
    ev2_reuse = SecurityEvent(
        id="evt-reuse",
        simulation_id="sim-test",
        session_id="sess-001",
        timestamp=(base_time + timedelta(seconds=15)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        event_type="credential_attempt",
        source_asset_id="intermediate-pivot",
        target_asset_id="core-banking-db",
        severity="critical",
        message="Authentication attempted using canary root token",
        is_decoy_interaction=False,
        canary_token="CANARY_ROOT_TOKEN_773",
        metadata={"credential": "CANARY_ROOT_TOKEN_773"},
    )

    steps = attack_path_reconstructor.reconstruct([ev1_tripwire, ev2_reuse])
    assert len(steps) == 2

    step1 = steps[0]
    assert step1.basis == "recorded"
    assert step1.from_asset_id == "compromised-host-a"
    assert step1.to_asset_id == "decoy-admin-vault"

    step2 = steps[1]
    assert step2.basis == "inferred"
    assert step2.from_asset_id == "compromised-host-a"  # origin host where token was taken
    assert step2.to_asset_id == "core-banking-db"
    assert step2.via_asset_id == "decoy-admin-vault"
    assert "Inferred Pivot" in step2.label


def test_scenario_run_produces_enriched_summary_and_path():
    result = simulation_engine.run_scenario("credential_lateral_movement")
    assert result.status == "completed"
    assert result.summary.total_assets >= 6
    assert result.summary.real_assets_count >= 3
    assert result.summary.decoy_assets_count >= 3
    assert result.summary.decoy_interactions_count >= 2

    # Check attack path step schema
    path = result.attack_path
    assert len(path) == 4
    for step in path:
        assert step.from_asset_id != ""
        assert step.to_asset_id != ""
        assert step.basis in ("recorded", "inferred")

    # In credential_lateral_movement, step 3 is an inferred pivot reusing the payroll canary token
    inferred_steps = [s for s in path if s.basis == "inferred"]
    assert len(inferred_steps) >= 1
    assert inferred_steps[0].via_asset_id == "decoy-payroll-file"
