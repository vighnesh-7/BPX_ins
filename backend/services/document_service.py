import os
from fastapi import UploadFile
from sqlalchemy.orm import Session
from models.document_model import Document
from app.config import settings
from fastapi import UploadFile

def save_file(upload_dir: str, file: UploadFile) -> str:
    file_location = os.path.join(upload_dir, file.filename)
    with open(file_location, "wb") as buffer:
        buffer.write(file.file.read())
    return file_location


def save_uploaded_document(db: Session, claim_id: str, document_type: str, file: UploadFile):
    upload_dir = os.path.join(settings.UPLOAD_DIR, f"claim_{claim_id}")
    os.makedirs(upload_dir, exist_ok=True)
    file_path = save_file(upload_dir, file)
    db_doc = Document(
        claim_id=claim_id,
        document_type=document_type,
        file_path=file_path
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    return {"file_path": file_path, "document_type": document_type}
