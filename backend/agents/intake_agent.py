from agents.state import ClaimState

def run_intake_agent(state: ClaimState) -> ClaimState:
    """Stub for Intake Agent processing."""
    # Updates state: documents, status
    state["status"] = "document_validation"
    return state
