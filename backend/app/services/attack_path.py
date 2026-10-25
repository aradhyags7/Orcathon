from typing import Optional
from ..models.event import SecurityEvent
from ..models.simulation import AttackPathStep


class AttackPathReconstructor:
    """
    Computes multi-hop intrusion sequences from observed telemetry events.
    Correlates canary tokens and credentials across hosts to distinguish
    directly recorded network connections from inferred lateral pivots.
    """

    def reconstruct(self, events: list[SecurityEvent]) -> list[AttackPathStep]:
        if not events:
            return []

        # 1. Chronological sort (guarantees determinism regardless of input order)
        sorted_events = sorted(events, key=lambda e: e.timestamp)

        # 2. Group by session_id
        sessions: dict[str, list[SecurityEvent]] = {}
        for evt in sorted_events:
            sess = evt.session_id or "sess-default"
            sessions.setdefault(sess, []).append(evt)

        steps: list[AttackPathStep] = []
        step_counter = 1

        for session_id, sess_events in sessions.items():
            # Track canary tokens discovered during this session: token -> (host_where_found, decoy_asset_id)
            tokens_found: dict[str, tuple[str, str]] = {}

            for idx, event in enumerate(sess_events):
                from_asset = event.source_asset_id
                to_asset = event.target_asset_id
                via_asset: Optional[str] = None
                basis = "recorded"

                # Check if this event touches a canary token / decoy
                token = event.canary_token or event.metadata.get("canary_token") or event.metadata.get("credential_alias")
                if event.is_decoy_interaction and token:
                    tokens_found[str(token)] = (event.source_asset_id, event.target_asset_id)
                    via_asset = event.target_asset_id

                # Check if this event reuses a previously acquired canary token
                reused_token = event.canary_token or event.metadata.get("credential_alias") or event.metadata.get("credential")
                if reused_token and str(reused_token) in tokens_found and not event.is_decoy_interaction:
                    # Inferred hop: adversary pivots from where the token was stolen to this new target
                    orig_host, orig_decoy = tokens_found[str(reused_token)]
                    from_asset = orig_host
                    to_asset = event.target_asset_id
                    via_asset = orig_decoy
                    basis = "inferred"
                elif event.is_decoy_interaction:
                    # Decoy tripwire hop
                    from_asset = event.source_asset_id
                    to_asset = event.target_asset_id
                    via_asset = event.target_asset_id
                    basis = "recorded"
                else:
                    # Standard recorded network telemetry hop
                    from_asset = event.source_asset_id
                    to_asset = event.target_asset_id
                    basis = "recorded"

                # Formulate descriptive label
                if basis == "inferred":
                    label = f"Inferred Pivot: {from_asset} -> {to_asset} (via {via_asset})"
                elif event.is_decoy_interaction:
                    label = f"Decoy Intercept: {to_asset}"
                elif idx == 0:
                    label = f"Initial Compromise: {from_asset}"
                else:
                    label = f"Recorded Telemetry: {from_asset} -> {to_asset}"

                steps.append(
                    AttackPathStep(
                        step=step_counter,
                        event_id=event.id,
                        from_asset_id=from_asset,
                        to_asset_id=to_asset,
                        via_asset_id=via_asset,
                        basis=basis,
                        asset_id=to_asset,
                        label=label,
                        timestamp=event.timestamp,
                    )
                )
                step_counter += 1

        return steps


attack_path_reconstructor = AttackPathReconstructor()
