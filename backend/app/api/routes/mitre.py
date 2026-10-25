from fastapi import APIRouter
from ...models.mitre import MitreCoverageReport
from ...services.mitre_service import mitre_service

router = APIRouter(prefix="/mitre", tags=["MITRE ATT&CK Defense Coverage"])


@router.get("/coverage", response_model=MitreCoverageReport, summary="Get enterprise MITRE ATT&CK deception coverage matrix and gap analysis")
def get_mitre_coverage() -> MitreCoverageReport:
    return mitre_service.get_coverage_report()
