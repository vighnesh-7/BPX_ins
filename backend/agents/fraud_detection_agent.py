from agents.state import ClaimState

def run_fraud_detection_agent(state: ClaimState) -> ClaimState:
    """Stub for Fraud Detection Agent processing."""
    state["fraud_score"] = 0.1
    state["status"] = "medical_review"
    return state
