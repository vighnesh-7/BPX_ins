from agents.state import ClaimState

def run_document_validation_agent(state: ClaimState) -> ClaimState:
    """Stub for Document Validation Agent processing."""
    state["document_valid"] = True
    state["status"] = "fraud_check"
    return state
