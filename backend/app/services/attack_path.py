from ..models.event import SecurityEvent
from ..models.simulation import AttackPathStep

class AttackPathReconstructor:
    """Reconstructs the intrusion sequence and timeline from observed security events."""

    def reconstruct(self, events: list[SecurityEvent]) -> list[AttackPathStep]:
        # Sort events chronologically
        sorted_events = sorted(events, key=lambda e: e.timestamp)
        steps: list[AttackPathStep] = []

        labels = {
            "connection": "Initial Ingress / Infiltration",
            "decoy_triggered": "Decoy Tripwire Tripped",
            "file_access": "Lateral Network Movement",
            "credential_attempt": "Privilege Escalation Probe",
        }

        for idx, event in enumerate(sorted_events, start=1):
            # Target asset represents the step reached
            label = labels.get(event.event_type, "Observed Asset Activity")
            if event.is_decoy_interaction:
                label = f"Decoy Intercept: {event.target_asset_id}"
            elif idx == 1:
                label = f"Initial Compromise: {event.source_asset_id}"

            steps.append(
                AttackPathStep(
                    step=idx,
                    event_id=event.id,
                    asset_id=event.target_asset_id if idx > 1 else event.source_asset_id,
                    label=label,
                    timestamp=event.timestamp,
                )
            )

        return steps

attack_path_reconstructor = AttackPathReconstructor()
