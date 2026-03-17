from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from services.document_service import save_uploaded_document

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/upload/{claim_id}")
def upload_document(claim_id: str, document_type: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        return save_uploaded_document(db, claim_id, document_type, file)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
