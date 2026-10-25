from fastapi import APIRouter, HTTPException
from ...models.simulation import SimulationRunRequest, SimulationResult, ErrorResponse
from ...services.simulation_engine import simulation_engine
from ...services.adaption_client import adaption_client
from ...repositories.memory_store import store

router = APIRouter(tags=["Simulations & Incidents"])

@router.post("/simulations/run", response_model=SimulationResult)
def run_simulation(request: SimulationRunRequest = SimulationRunRequest()) -> SimulationResult:
    return simulation_engine.run_scenario(request.scenario_id)

@router.get("/simulations/{simulation_id}", response_model=SimulationResult, responses={404: {"model": ErrorResponse}})
def get_simulation(simulation_id: str):
    sim = store.get_simulation(simulation_id)
    if not sim:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "SIMULATION_NOT_FOUND", "message": "The requested simulation does not exist."}},
        )
    return sim

@router.get("/incidents/{incident_id}", response_model=SimulationResult, responses={404: {"model": ErrorResponse}})
def get_incident(incident_id: str):
    sim = store.get_simulation(incident_id)
    if not sim:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "INCIDENT_NOT_FOUND", "message": "The requested incident does not exist."}},
        )
    return sim

@router.post("/simulations/{simulation_id}/adaption-analysis")
async def run_adaption_analysis(simulation_id: str):
    sim = store.get_simulation(simulation_id)
    if not sim:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "SIMULATION_NOT_FOUND", "message": "The requested simulation does not exist."}},
        )
    analysis = await adaption_client.analyze_incident(sim.model_dump())
    return {
        "simulation_id": simulation_id,
        "adaption_integration": analysis,
    }
