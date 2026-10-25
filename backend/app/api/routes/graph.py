from fastapi import APIRouter
from ...models.asset import GraphResponse
from ...repositories.memory_store import store

router = APIRouter(tags=["Graph"])

@router.get("/graph", response_model=GraphResponse)
def get_graph() -> GraphResponse:
    return store.get_graph()
