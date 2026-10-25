from fastapi import APIRouter
from ...models.asset import AssetsResponse
from ...repositories.memory_store import store

router = APIRouter(tags=["Assets"])

@router.get("/assets", response_model=AssetsResponse)
def get_assets() -> AssetsResponse:
    return AssetsResponse(assets=store.get_assets())
