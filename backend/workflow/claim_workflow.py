from langgraph.graph import StateGraph, END
from agents.state import ClaimState
from agents.intake_agent import run_intake_agent
from agents.document_validation_agent import run_document_validation_agent
from agents.fraud_detection_agent import run_fraud_detection_agent
from agents.medical_review_agent import run_medical_review_agent
from agents.policy_verification_agent import run_policy_verification_agent
from agents.settlement_agent import run_settlement_agent
from agents.confidence_agent import run_confidence_agent

# Initialize LangGraph
workflow = StateGraph(ClaimState)

# Add Nodes
workflow.add_node("intake", run_intake_agent)
workflow.add_node("document", run_document_validation_agent)
workflow.add_node("fraud", run_fraud_detection_agent)
workflow.add_node("medical", run_medical_review_agent)
workflow.add_node("policy", run_policy_verification_agent)
workflow.add_node("settlement", run_settlement_agent)
workflow.add_node("confidence", run_confidence_agent)

# Define Edges (Sequential Pipeline)
workflow.set_entry_point("intake")
workflow.add_edge("intake", "document")
workflow.add_edge("document", "fraud")
workflow.add_edge("fraud", "medical")
workflow.add_edge("medical", "policy")
workflow.add_edge("policy", "settlement")
workflow.add_edge("settlement", "confidence")
workflow.add_edge("confidence", END)

# Compile Graph
claim_pipeline = workflow.compile()

def process_claim_pipeline(initial_state: ClaimState) -> ClaimState:
    """Run the LangGraph pipeline for a single claim."""
    # claim_pipeline.invoke returns the final State
    # Note: In a real environment, you might use async/await
    final_state = claim_pipeline.invoke(initial_state)
    return final_state
