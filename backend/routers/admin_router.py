from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from services.claim_service import get_all_claims, get_claim_by_id, approve_claim, reject_claim
# from workflow.claim_workflow import process_claim_pipeline

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
    return {"message": "Simulating claim processing for claim_id: " + claim_id}

@router.post("/approve/{claim_id}")
def approve(claim_id: str, db: Session = Depends(get_db)):
    return approve_claim(db, claim_id)

@router.post("/reject/{claim_id}")
def reject(claim_id: str, db: Session = Depends(get_db)):
    return reject_claim(db, claim_id)
