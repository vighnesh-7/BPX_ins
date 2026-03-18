from sqlalchemy.orm import Session
from models.claim_model import Claim
from schemas.claim_schema import ClaimCreate
from typing import List
import uuid

def create_claim(db: Session, claim: ClaimCreate) -> Claim:
    db_claim = Claim(
        claim_id=str(uuid.uuid4()),
        policy_number=claim.policy_number,
        claimant_name=claim.claimant_name,
        incident_type=claim.incident_type,
        incident_description=claim.incident_description,
        bank_details=claim.bank_details,
        claiming_amt=claim.claiming_amt,
        # incident_date=claim.incident_date,
        status="submitted"
    )
    db.add(db_claim)
    db.commit()
    db.refresh(db_claim)
    return db_claim

def get_claim_by_id(db: Session, claim_id: str) -> Claim:
    return db.query(Claim).filter(Claim.claim_id == claim_id).first()

def get_all_claims(db: Session) -> List[Claim]:
    return db.query(Claim).all()

def approve_claim(db: Session, claim_id: str):
    claim = get_claim_by_id(db, claim_id)
    if not claim:
        return {"error": "Claim not found"}
    claim.status = "approved"
    db.commit()
    return {"status": "approved"}

def reject_claim(db: Session, claim_id: str):
    claim = get_claim_by_id(db, claim_id)
    if not claim:
        return {"error": "Claim not found"}
    claim.status = "rejected"
    db.commit()
    return {"status": "rejected"}
