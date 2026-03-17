import os
from pydantic_settings import BaseSettings

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Settings(BaseSettings):
    DATABASE_URL: str = f"sqlite:///{os.path.join(BASE_DIR, 'storage', 'bpx_claims.db')}"
    UPLOAD_DIR: str = os.path.join(BASE_DIR, 'storage', 'uploads')
    LANGGRAPH_ENABLED: bool = True
    CONFIDENCE_THRESHOLD: float = 0.9

settings = Settings()
