from pydantic import BaseModel
from datetime import datetime

class DocumentBase(BaseModel):
    document_type: str

class DocumentCreate(DocumentBase):
    pass

class DocumentOut(DocumentBase):
    id: int
    claim_id: str
    file_path: str
    uploaded_at: datetime

    class Config:
        orm_mode = True
