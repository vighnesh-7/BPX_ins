from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, date

class ClaimBase(BaseModel):
    policy_number: str
    claimant_name: str
    incident_type: str
    incident_description: str
    # incident_date: Optional[date] = Field(default=None, description="Date of the incident")
    claiming_amt : float 

class ClaimCreate(ClaimBase):
    pass

class ClaimOut(ClaimBase):
    claim_id: str
    status: str
    confidence_score: float
    settlement_amount: float
    created_at: datetime

    class Config:
        orm_mode = True
