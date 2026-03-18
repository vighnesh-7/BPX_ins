def compute_confidence_score(fraud_score: float, document_valid: bool, policy_valid: bool) -> float:
    """
    Compute final confidence score.
    confidence_score = (1 - fraud_score)*0.4 + (document_valid)*0.2 + (policy_valid)*0.2 + 0.2
    """
    doc_val = 1.0 if document_valid else 0.0
    pol_val = 1.0 if policy_valid else 0.0
    
    # safeguard for None
    fs = fraud_score if fraud_score is not None else 0.5
    
    score = (1 - fs) * 0.4 + (doc_val) * 0.2 + (pol_val) * 0.2 + 0.2
    return round(score, 4)
