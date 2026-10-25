from typing import Optional
from fastapi import APIRouter, Query
from ...models.alert import AlertsResponse
from ...repositories.memory_store import store

router = APIRouter(tags=["Alerts"])

@router.get("/alerts", response_model=AlertsResponse)
def get_alerts(simulation_id: Optional[str] = Query(None, description="Optional simulation ID filter")) -> AlertsResponse:
    alerts = store.get_alerts(simulation_id)
    return AlertsResponse(alerts=alerts)
