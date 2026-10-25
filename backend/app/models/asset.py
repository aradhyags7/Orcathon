from typing import Literal
from pydantic import BaseModel, Field

AssetKind = Literal["endpoint", "server", "decoy_file", "honey_credential"]
AssetStatus = Literal["healthy", "suspicious", "alert", "isolated"]
EdgeStatus = Literal["normal", "traversed", "suspicious", "blocked"]

class Asset(BaseModel):
    id: str = Field(..., description="Unique asset identifier")
    name: str = Field(..., description="Human-readable asset name")
    kind: AssetKind = Field(..., description="Classification of the asset")
    status: AssetStatus = Field(default="healthy", description="Current health/alert status")
    is_decoy: bool = Field(default=False, description="True if asset is a deception tripwire/decoy")
    description: str = Field(default="", description="Asset description or purpose")
    canary_token: Optional[str] = Field(default=None, description="Locally generated canary token embedded in decoy")
    content_source: Literal["adaption", "cached", "template"] = Field(default="template", description="Source of decoy content")
    content_preview: Optional[str] = Field(default=None, description="Preview of generated decoy content")

class AssetsResponse(BaseModel):
    assets: list[Asset]

class NetworkEdge(BaseModel):
    source: str = Field(..., description="Source asset ID")
    target: str = Field(..., description="Target asset ID")
    status: EdgeStatus = Field(default="normal", description="Traversal/suspicion status of edge")

class GraphResponse(BaseModel):
    nodes: list[Asset] = Field(..., description="All topology nodes")
    edges: list[NetworkEdge] = Field(..., description="All topology connections")
