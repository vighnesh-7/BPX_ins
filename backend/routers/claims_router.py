from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from schemas.claim_schema import ClaimCreate, ClaimOut
from services.claim_service import create_claim, get_claim_by_id

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=ClaimOut)
def submit_claim(claim: ClaimCreate, db: Session = Depends(get_db)):
    return create_claim(db, claim)

@router.get("/{claim_id}", response_model=ClaimOut)
def get_claim_status(claim_id: str, db: Session = Depends(get_db)):
    db_claim = get_claim_by_id(db, claim_id)
    if not db_claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    # Simulate agent pipeline status (for demo, you can expand this with real agent outputs)
    agent_status = {
        "intake_agent": "completed",
        "document_validation_agent": "completed",
        "fraud_detection_agent": "completed",
        "medical_review_agent": "completed",
        "policy_verification_agent": "completed",
        "settlement_agent": "completed",
        "confidence_agent": "completed",
    }
    claim_dict = db_claim.__dict__.copy()
    claim_dict["agent_status"] = agent_status
    return claim_dict
