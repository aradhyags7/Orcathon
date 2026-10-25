from fastapi import APIRouter
from .health import router as health_router
from .assets import router as assets_router
from .graph import router as graph_router
from .simulations import router as simulations_router
from .events import router as events_router
from .alerts import router as alerts_router
from .reset import router as reset_router
from .forensics import router as forensics_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(assets_router)
api_router.include_router(graph_router)
api_router.include_router(simulations_router)
api_router.include_router(events_router)
api_router.include_router(alerts_router)
api_router.include_router(reset_router)
api_router.include_router(forensics_router)

__all__ = ["api_router"]
