from typing import Literal
from pydantic import BaseModel, Field

CoverageStatus = Literal["ACTIVE_DECOY_PROTECTION", "TELEMETRY_MONITORED", "DEFENSE_GAP"]


class TechniqueCoverage(BaseModel):
    technique_id: str = Field(..., description="e.g. T1083")
    technique_name: str = Field(..., description="e.g. File and Directory Discovery")
    status: CoverageStatus = Field(..., description="Protection level")
    assigned_decoys: list[str] = Field(default_factory=list, description="IDs of decoys protecting this technique")
    detection_rule: str = Field(..., description="Detection rule triggered upon breach")


class TacticCoverage(BaseModel):
    tactic_id: str = Field(..., description="e.g. TA0006")
    tactic_name: str = Field(..., description="e.g. Credential Access")
    coverage_score: float = Field(..., description="Coverage percentage from 0.0 to 100.0")
    status: CoverageStatus = Field(..., description="Overall status of this tactic")
    techniques: list[TechniqueCoverage] = Field(default_factory=list)


class MitreCoverageReport(BaseModel):
    platform: str = Field(default="DeceptiTrace Cyber Deception & Attack-Path Reconstruction")
    overall_coverage_pct: float = Field(..., description="Percentage of key enterprise attack tactics with active deception tripwires")
    active_decoys_count: int = Field(..., description="Total active canary tokens and decoy assets deployed")
    tactics: list[TacticCoverage] = Field(default_factory=list)
    defense_gaps: list[str] = Field(default_factory=list, description="Tactics requiring additional decoy coverage")
    strategic_recommendations: list[str] = Field(default_factory=list, description="Hardening recommendations for CISO/SOC")
