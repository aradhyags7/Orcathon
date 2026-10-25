from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from ...services.stream_service import stream_service

router = APIRouter(tags=["Live Telemetry Streaming (SSE)"])


@router.post(
    "/simulations/stream",
    summary="Execute and stream attack simulation telemetry in real-time via Server-Sent Events (SSE)",
)
async def stream_new_simulation(
    scenario_id: str = Query("credential_lateral_movement", description="Scenario identifier"),
    delay: float = Query(0.35, description="Delay in seconds between event frames (use 0 for instant)", ge=0.0, le=5.0),
):
    """Streams real-time simulation events: security_event, node_update, alert_triggered, attack_path_step, simulation_completed."""
    return StreamingResponse(
        stream_service.stream_new_simulation(scenario_id=scenario_id, delay_seconds=delay),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get(
    "/simulations/{simulation_id}/stream",
    summary="Replay existing simulation over Server-Sent Events (SSE)",
)
async def stream_existing_simulation(
    simulation_id: str,
    delay: float = Query(0.35, description="Delay between frames in seconds", ge=0.0, le=5.0),
):
    return StreamingResponse(
        stream_service.stream_existing_simulation(simulation_id=simulation_id, delay_seconds=delay),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
