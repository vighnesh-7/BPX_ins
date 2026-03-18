from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from services.claim_service import get_all_claims, get_claim_by_id, approve_claim, reject_claim
from workflow.claim_workflow import process_claim_pipeline
from agents.state import ClaimState

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/claims")
def list_claims(db: Session = Depends(get_db)):
    return get_all_claims(db)

@router.get("/claims/{claim_id}")
def get_claim_details(claim_id: str, db: Session = Depends(get_db)):
    claim = get_claim_by_id(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

@router.post("/process/{claim_id}")
def process_claim(claim_id: str, db: Session = Depends(get_db)):
    claim = get_claim_by_id(db, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
        
    initial_state: ClaimState = {
        "schema_id": claim.claim_id,
        "claim_id": claim.claim_id,
        "documents": [], # In reality, fetch from document_service
        "document_valid": claim.document_valid or False,
        "fraud_score": claim.fraud_score or 0.0,
        "medical_summary": claim.medical_summary or "",
        "policy_valid": claim.policy_valid or False,
        "settlement_amount": claim.settlement_amount or 0.0,
        "confidence_score": claim.confidence_score or 0.0,
        "status": claim.status or "submitted",
        "claiming_amt": claim.claiming_amt or 0.0
    }
    
    final_state = process_claim_pipeline(initial_state)
    
    # Update DB claim with new state values
    claim.document_valid = final_state.get("document_valid", False)
    claim.fraud_score = final_state.get("fraud_score", 0.0)
    claim.medical_summary = final_state.get("medical_summary", "")
    claim.policy_valid = final_state.get("policy_valid", False)
    claim.settlement_amount = final_state.get("settlement_amount", 0.0)
    claim.confidence_score = final_state.get("confidence_score", 0.0)
    claim.status = final_state.get("status", claim.status)
    
    db.commit()
    db.refresh(claim)
    
    return {"message": "Pipeline completed successfully", "final_state": final_state}

@router.post("/approve/{claim_id}")
def approve(claim_id: str, db: Session = Depends(get_db)):
    return approve_claim(db, claim_id)

@router.post("/reject/{claim_id}")
def reject(claim_id: str, db: Session = Depends(get_db)):
    return reject_claim(db, claim_id)
