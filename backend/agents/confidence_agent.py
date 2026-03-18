from agents.state import ClaimState
from utils.scoring_utils import compute_confidence_score

def run_confidence_agent(state: ClaimState) -> ClaimState:
    """Stub for Confidence Scoring Agent processing."""
    score = compute_confidence_score(
        fraud_score=state.get("fraud_score", 0.0),
        document_valid=state.get("document_valid", False),
        policy_valid=state.get("policy_valid", False)
    )
    state["confidence_score"] = score
    
    if score >= 0.9:
        state["status"] = "approved"
    else:
        state["status"] = "manual_review"
    return state
