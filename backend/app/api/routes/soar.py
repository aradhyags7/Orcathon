from fastapi import APIRouter, HTTPException
from ...models.soar import (
    PlaybooksResponse,
    ExecutionsResponse,
    PlaybookExecutionRequest,
    PlaybookExecutionResult,
)
from ...services.soar_engine import soar_engine
from ...models.simulation import ErrorResponse

router = APIRouter(prefix="/soar", tags=["Automated SOAR Defense Engine"])


@router.get("/playbooks", response_model=PlaybooksResponse, summary="List all pre-configured automated defense playbooks")
def list_playbooks() -> PlaybooksResponse:
    return PlaybooksResponse(playbooks=soar_engine.list_playbooks())


@router.get("/executions", response_model=ExecutionsResponse, summary="List historical SOAR playbook execution records")
def list_executions() -> ExecutionsResponse:
    return ExecutionsResponse(executions=soar_engine.get_executions())


@router.post(
    "/playbooks/{playbook_id}/execute",
    response_model=PlaybookExecutionResult,
    summary="Execute an automated containment playbook against an incident",
    responses={404: {"model": ErrorResponse}},
)
def execute_playbook(playbook_id: str, request: PlaybookExecutionRequest) -> PlaybookExecutionResult:
    try:
        return soar_engine.execute_playbook(
            playbook_id=playbook_id,
            incident_id=request.incident_id,
            alert_id=request.alert_id,
            dry_run=request.dry_run,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "SOAR_EXECUTION_FAILED", "message": str(e)}},
        )
