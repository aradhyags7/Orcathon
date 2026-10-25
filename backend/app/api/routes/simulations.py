from fastapi import APIRouter, HTTPException
from ...models.simulation import SimulationRunRequest, SimulationResult, ErrorResponse, ErrorDetail
from ...services.simulation_engine import simulation_engine
from ...repositories.memory_store import store

router = APIRouter(prefix="/simulations", tags=["Simulations"])

@router.post("/run", response_model=SimulationResult)
def run_simulation(request: SimulationRunRequest = SimulationRunRequest()) -> SimulationResult:
    return simulation_engine.run_scenario(request.scenario_id)

@router.get("/{simulation_id}", response_model=SimulationResult, responses={404: {"model": ErrorResponse}})
def get_simulation(simulation_id: str):
    sim = store.get_simulation(simulation_id)
    if not sim:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "SIMULATION_NOT_FOUND", "message": "The requested simulation does not exist."}},
        )
    return sim
