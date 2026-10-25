from fastapi import APIRouter, HTTPException
from fastapi.responses import PlainTextResponse, JSONResponse
from ...repositories.memory_store import store
from ...services.forensic_service import forensic_service
from ...models.simulation import ErrorResponse

router = APIRouter(tags=["Forensics & Threat Intelligence"])


def _get_simulation_or_404(sim_id: str):
    sim = store.get_simulation(sim_id)
    if not sim:
        raise HTTPException(
            status_code=404,
            detail={"error": {"code": "INCIDENT_NOT_FOUND", "message": f"Incident or simulation '{sim_id}' not found."}},
        )
    return sim


# --- Forensics Report Endpoints (under /incidents and /simulations) ---

@router.get(
    "/incidents/{incident_id}/forensic-report",
    summary="Get full incident forensic report in structured JSON",
    responses={404: {"model": ErrorResponse}},
)
def get_incident_forensic_report(incident_id: str):
    sim = _get_simulation_or_404(incident_id)
    return forensic_service.generate_forensic_report(sim)


@router.get(
    "/incidents/{incident_id}/forensic-report/markdown",
    summary="Download incident forensic report in formatted Markdown",
    response_class=PlainTextResponse,
    responses={404: {"model": ErrorResponse}},
)
def get_incident_forensic_markdown(incident_id: str):
    sim = _get_simulation_or_404(incident_id)
    report = forensic_service.generate_forensic_report(sim)
    md_content = forensic_service.generate_markdown_report(report)
    return PlainTextResponse(
        content=md_content,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="forensic-report-{incident_id}.md"'},
    )


@router.get(
    "/incidents/{incident_id}/iocs",
    summary="Extract high-fidelity Indicators of Compromise (IOCs) from incident",
    responses={404: {"model": ErrorResponse}},
)
def get_incident_iocs(incident_id: str):
    sim = _get_simulation_or_404(incident_id)
    return forensic_service.extract_iocs(sim)


@router.get(
    "/incidents/{incident_id}/stix-bundle",
    summary="Export OASIS STIX 2.1 Threat Intelligence bundle",
    responses={404: {"model": ErrorResponse}},
)
def get_incident_stix_bundle(incident_id: str):
    sim = _get_simulation_or_404(incident_id)
    bundle = forensic_service.generate_stix21_bundle(sim)
    return JSONResponse(
        content=bundle,
        media_type="application/json",
        headers={"Content-Disposition": f'attachment; filename="stix21-bundle-{incident_id}.json"'},
    )


# --- Aliases under /simulations/{id}/... ---

@router.get("/simulations/{simulation_id}/forensic-report", include_in_schema=False)
def get_simulation_forensic_report(simulation_id: str):
    return get_incident_forensic_report(simulation_id)


@router.get("/simulations/{simulation_id}/forensic-report/markdown", include_in_schema=False)
def get_simulation_forensic_markdown(simulation_id: str):
    return get_incident_forensic_markdown(simulation_id)


@router.get("/simulations/{simulation_id}/iocs", include_in_schema=False)
def get_simulation_iocs(simulation_id: str):
    return get_incident_iocs(simulation_id)


@router.get("/simulations/{simulation_id}/stix-bundle", include_in_schema=False)
def get_simulation_stix_bundle(simulation_id: str):
    return get_incident_stix_bundle(simulation_id)
