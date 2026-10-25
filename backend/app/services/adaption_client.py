import logging
from typing import Any, Optional
import httpx
from ..core.config import settings

logger = logging.getLogger(__name__)

class AdaptionClient:
    """Client for Adaption Labs API with timeout protection and fallback telemetry analysis."""

    def __init__(self) -> None:
        self.api_key = settings.ADAPTION_API_KEY
        self.project_id = settings.ADAPTION_PROJECT_ID
        self.base_url = "https://api.adaptionlab.com/v1"

    async def analyze_incident(self, incident_payload: dict[str, Any]) -> dict[str, Any]:
        """Enriches an incident analysis using Adaption Labs dataset/model processing."""
        if not self.api_key:
            return {
                "status": "simulated_local",
                "provider": "Adaption Labs (Local Fallback)",
                "enriched_confidence": 0.94,
                "threat_actor_profile": "APT-Simulation-CanaryHunter",
                "recommended_deception_pivot": "Deploy additional dynamic honey-tokens on file-server-01 SMB share.",
                "note": "To enable live cloud analysis, supply ADAPTION_API_KEY in backend/.env",
            }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(
                    f"{self.base_url}/datasets/analyze",
                    headers=headers,
                    json={
                        "project_id": self.project_id,
                        "data": incident_payload,
                    },
                )
                if response.status_code == 200:
                    return {
                        "status": "live",
                        "provider": "Adaption Labs Live API",
                        "data": response.json(),
                    }
                else:
                    logger.warning(f"Adaption API returned status {response.status_code}: {response.text}")
                    return {
                        "status": "api_error",
                        "status_code": response.status_code,
                        "fallback": "Standard deterministic rule engine applied.",
                    }
        except Exception as e:
            logger.warning(f"Adaption API connection exception: {e}")
            return {
                "status": "connection_failed",
                "error": str(e),
                "fallback": "Standard deterministic rule engine applied.",
            }

adaption_client = AdaptionClient()
