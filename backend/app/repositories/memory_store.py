from typing import Optional
from ..models.asset import Asset, NetworkEdge, GraphResponse
from ..models.event import SecurityEvent
from ..models.alert import Alert
from ..models.simulation import SimulationResult

BASE_ASSETS: list[Asset] = [
    Asset(
        id="employee-pc-01",
        name="Employee Workstation",
        kind="endpoint",
        status="healthy",
        is_decoy=False,
        description="Simulated engineering laptop on internal VLAN segment 10.0.1.15",
    ),
    Asset(
        id="file-server-01",
        name="Corporate File Share",
        kind="server",
        status="healthy",
        is_decoy=False,
        description="Centralized SMB network share storing team documentation and assets",
    ),
    Asset(
        id="finance-server-01",
        name="Production Finance Host",
        kind="server",
        status="healthy",
        is_decoy=False,
        description="High-security application server hosting payroll and transactional databases",
    ),
    Asset(
        id="decoy-payroll-file",
        name="Executive Salary Decoy",
        kind="decoy_file",
        status="healthy",
        is_decoy=True,
        description="Monitored decoy spreadsheet (Executive_Salaries_2026.xlsx) with canary token",
    ),
    Asset(
        id="honey-credential-01",
        name="Planted AWS Admin Honey-Token",
        kind="honey_credential",
        status="healthy",
        is_decoy=True,
        description="Planted AWS IAM credential with zero authorized business functions",
    ),
]

BASE_EDGES: list[NetworkEdge] = [
    NetworkEdge(source="employee-pc-01", target="file-server-01", status="normal"),
    NetworkEdge(source="employee-pc-01", target="decoy-payroll-file", status="normal"),
    NetworkEdge(source="file-server-01", target="finance-server-01", status="normal"),
    NetworkEdge(source="file-server-01", target="honey-credential-01", status="normal"),
]

class MemoryStore:
    def __init__(self) -> None:
        self.reset()

    def reset(self) -> None:
        self._assets: dict[str, Asset] = {a.id: a.model_copy() for a in BASE_ASSETS}
        self._edges: list[NetworkEdge] = [e.model_copy() for e in BASE_EDGES]
        self._events: list[SecurityEvent] = []
        self._alerts: list[Alert] = []
        self._simulations: dict[str, SimulationResult] = {}

    def get_assets(self) -> list[Asset]:
        return list(self._assets.values())

    def get_asset(self, asset_id: str) -> Optional[Asset]:
        return self._assets.get(asset_id)

    def get_graph(self) -> GraphResponse:
        # Determine traversed nodes and edges based on events
        traversed_node_ids = {e.source_asset_id for e in self._events} | {e.target_asset_id for e in self._events}
        alerted_node_ids = {a.target_asset_id for a in self._alerts} | {a.source_asset_id for a in self._alerts}
        
        updated_nodes: list[Asset] = []
        for asset in self._assets.values():
            status = "alert" if asset.id in alerted_node_ids else ("suspicious" if asset.id in traversed_node_ids else "healthy")
            updated_nodes.append(asset.model_copy(update={"status": status}))

        active_pairs = {(e.source_asset_id, e.target_asset_id) for e in self._events}
        decoy_target_ids = {a.id for a in self._assets.values() if a.is_decoy}

        updated_edges: list[NetworkEdge] = []
        for edge in self._edges:
            is_active = (edge.source, edge.target) in active_pairs or (edge.target, edge.source) in active_pairs
            is_suspicious = is_active and (edge.target in decoy_target_ids or edge.source in decoy_target_ids)
            edge_status = "suspicious" if is_suspicious else ("traversed" if is_active else "normal")
            updated_edges.append(edge.model_copy(update={"status": edge_status}))

        return GraphResponse(nodes=updated_nodes, edges=updated_edges)

    def add_simulation(self, result: SimulationResult) -> None:
        self._simulations[result.simulation_id] = result
        self._events.extend(result.events)
        self._alerts.extend(result.alerts)

    def get_simulation(self, simulation_id: str) -> Optional[SimulationResult]:
        return self._simulations.get(simulation_id)

    def get_events(self, simulation_id: Optional[str] = None) -> list[SecurityEvent]:
        if simulation_id:
            return [e for e in self._events if e.simulation_id == simulation_id]
        return list(self._events)

    def get_alerts(self, simulation_id: Optional[str] = None) -> list[Alert]:
        if simulation_id:
            return [a for a in self._alerts if a.simulation_id == simulation_id]
        return list(self._alerts)

store = MemoryStore()
