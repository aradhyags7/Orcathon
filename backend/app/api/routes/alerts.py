from typing import Optional
from fastapi import APIRouter, Query, HTTPException
from ...models.alert import AlertsResponse
from ...repositories.memory_store import store

router = APIRouter(tags=["Alerts"])

@router.get("/alerts", response_model=AlertsResponse)
def get_alerts(simulation_id: Optional[str] = Query(None, description="Optional simulation ID filter")) -> AlertsResponse:
    alerts = store.get_alerts(simulation_id)
    return AlertsResponse(alerts=alerts)

@router.post("/alerts/{alert_id}/contain")
def contain_threat(alert_id: str):
    result = store.contain_alert(alert_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "ALERT_NOT_FOUND", "message": f"Alert with ID {alert_id} not found."}},
        )
    return result
