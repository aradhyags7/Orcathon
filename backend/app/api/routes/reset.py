from fastapi import APIRouter
from ...models.simulation import ResetResponse
from ...repositories.memory_store import store
from ...services.detection_engine import detection_engine

router = APIRouter(tags=["Reset"])

@router.post("/reset", response_model=ResetResponse)
def reset_simulation() -> ResetResponse:
    store.reset()
    detection_engine.reset()
    return ResetResponse(status="ok")
