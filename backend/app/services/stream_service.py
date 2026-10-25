import asyncio
import json
from typing import AsyncGenerator
from ..models.simulation import SimulationResult
from .simulation_engine import simulation_engine
from ..repositories.memory_store import store


class StreamService:
    """Streams live cyber deception attack simulations over Server-Sent Events (SSE)."""

    def format_sse(self, event_type: str, data: dict) -> str:
        """Format an SSE frame according to the W3C EventSource standard."""
        payload = json.dumps(data)
        return f"event: {event_type}\ndata: {payload}\n\n"

    async def stream_new_simulation(
        self,
        scenario_id: str = "credential_lateral_movement",
        delay_seconds: float = 0.35,
    ) -> AsyncGenerator[str, None]:
        """Execute a scenario and stream events progressively in real-time."""
        # 1. Run simulation through the engine (which updates in-memory store and builds alerts)
        result: SimulationResult = simulation_engine.run_scenario(scenario_id)

        # 2. Emit simulation started
        yield self.format_sse("simulation_started", {
            "simulation_id": result.simulation_id,
            "scenario_id": result.scenario_id,
            "started_at": result.started_at,
            "total_events": len(result.events),
        })

        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)

        # Map alerts by event_id for instant correlation
        alerts_by_evt = {a.event_id: a for a in result.alerts}
        path_by_evt = {p.event_id: p for p in result.attack_path}

        # 3. Stream each event sequentially
        for idx, evt in enumerate(result.events):
            # Security Event frame
            yield self.format_sse("security_event", {
                "step_index": idx + 1,
                "event": evt.model_dump(),
            })

            # Node Status Update frame
            target_status = "alert" if evt.is_decoy_interaction else "compromised"
            yield self.format_sse("node_update", {
                "asset_id": evt.target_asset_id,
                "status": target_status,
                "is_decoy": evt.is_decoy_interaction,
            })

            # Decoy Alert frame (if this event triggered an alert)
            if evt.id in alerts_by_evt:
                alert = alerts_by_evt[evt.id]
                yield self.format_sse("alert_triggered", {
                    "alert": alert.model_dump(),
                    "tripwire_sprung": True,
                })

            # Attack Path Milestone frame
            if evt.id in path_by_evt:
                step = path_by_evt[evt.id]
                yield self.format_sse("attack_path_step", {
                    "step": step.step,
                    "asset_id": step.asset_id,
                    "label": step.label,
                    "timestamp": step.timestamp,
                })

            if delay_seconds > 0:
                await asyncio.sleep(delay_seconds)

        # 4. Stream completion summary
        yield self.format_sse("simulation_completed", {
            "simulation_id": result.simulation_id,
            "scenario_id": result.scenario_id,
            "status": "completed",
            "completed_at": result.completed_at,
            "summary": result.summary.model_dump(),
        })

    async def stream_existing_simulation(
        self,
        simulation_id: str,
        delay_seconds: float = 0.35,
    ) -> AsyncGenerator[str, None]:
        """Replay an existing simulation over SSE stream."""
        sim = store.get_simulation(simulation_id)
        if not sim:
            yield self.format_sse("error", {
                "code": "SIMULATION_NOT_FOUND",
                "message": f"Simulation '{simulation_id}' not found.",
            })
            return

        yield self.format_sse("simulation_started", {
            "simulation_id": sim.simulation_id,
            "scenario_id": sim.scenario_id,
            "started_at": sim.started_at,
            "replay": True,
        })

        if delay_seconds > 0:
            await asyncio.sleep(delay_seconds)

        alerts_by_evt = {a.event_id: a for a in sim.alerts}
        path_by_evt = {p.event_id: p for p in sim.attack_path}

        for idx, evt in enumerate(sim.events):
            yield self.format_sse("security_event", {
                "step_index": idx + 1,
                "event": evt.model_dump(),
            })

            if evt.id in alerts_by_evt:
                yield self.format_sse("alert_triggered", {
                    "alert": alerts_by_evt[evt.id].model_dump(),
                })

            if evt.id in path_by_evt:
                yield self.format_sse("attack_path_step", {
                    "step": path_by_evt[evt.id].model_dump(),
                })

            if delay_seconds > 0:
                await asyncio.sleep(delay_seconds)

        yield self.format_sse("simulation_completed", {
            "simulation_id": sim.simulation_id,
            "summary": sim.summary.model_dump(),
        })


stream_service = StreamService()
