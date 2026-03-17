from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database import Base

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    claim_id = Column(String, index=True)
    document_type = Column(String)
    file_path = Column(String)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
