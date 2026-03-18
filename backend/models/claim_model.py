from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base
import uuid

class Claim(Base):
    __tablename__ = "claims"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, unique=True, index=True, default=lambda: str(uuid.uuid4()))
    policy_number = Column(String, index=True)
    claimant_name = Column(String)
    incident_type = Column(String)
    incident_description = Column(String)
    # incident_date = Column(Date)
    bank_details = Column(String, nullable=True)
    claiming_amt = Column(Float, default=0.0)
    status = Column(String, default="submitted")
    confidence_score = Column(Float, default=0.0)
    settlement_amount = Column(Float, default=0.0)
    
    # LangGraph Output States
    document_valid = Column(Boolean, default=False)
    fraud_score = Column(Float, nullable=True)
    medical_summary = Column(String, nullable=True)
    policy_valid = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
