from typing import Optional
from fastapi import APIRouter, Query
from ...models.event import EventsResponse
from ...repositories.memory_store import store

router = APIRouter(tags=["Events"])

@router.get("/events", response_model=EventsResponse)
def get_events(simulation_id: Optional[str] = Query(None, description="Optional simulation ID filter")) -> EventsResponse:
    events = store.get_events(simulation_id)
    return EventsResponse(events=events)
