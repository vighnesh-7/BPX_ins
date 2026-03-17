from fastapi import FastAPI
from app.config import settings
from app.database import engine, Base
from routers import claims_router, admin_router, upload_router
import os
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BPX Claims Processing Dashboard")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(claims_router.router, prefix="/claims", tags=["Claims"])
app.include_router(admin_router.router, prefix="/admin", tags=["Admin"])
app.include_router(upload_router.router, prefix="/claims", tags=["Uploads"])

@app.get("/")
def root():
    return {"message": "BPX Claims Processing API is running."}
