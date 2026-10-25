from fastapi import APIRouter
from ...models.simulation import ResetResponse
from ...repositories.memory_store import store

router = APIRouter(tags=["Reset"])

@router.post("/reset", response_model=ResetResponse)
def reset_simulation() -> ResetResponse:
    store.reset()
    return ResetResponse(status="ok")
