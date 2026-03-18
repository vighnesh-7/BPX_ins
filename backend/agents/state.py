from typing import TypedDict, List
from schemas.document_schema import DocumentOut

class ClaimState(TypedDict):
    schema_id: str # The conversation uses claim_id: str
    claim_id: str
    documents: List[dict]
    document_valid: bool
    fraud_score: float
    medical_summary: str
    policy_valid: bool
    settlement_amount: float
    confidence_score: float
    status: str
