import os
from typing import List

def extract_text_from_pdf(file_path: str) -> str:
    """Placeholder for PDF text extraction."""
    return "Extracted text from " + file_path

def validate_file_type(filename: str, allowed_extensions: List[str]) -> bool:
    """Check if a file ends in an allowed extension."""
    ext = os.path.splitext(filename)[1].lower()
    return ext in allowed_extensions
