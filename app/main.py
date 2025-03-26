from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.database import get_db, engine
from app.models import models
from app.api.api import api_router

# Create database tables
models.Base.metadata.create_all(bind=engine)

# Create FastAPI app with more detailed metadata for Swagger UI
app = FastAPI(
    title="TalentMatch API",
    description="API for the TalentMatch application, managing jobs, candidates, resumes, and more.",
    version="1.0.0",
    openapi_tags=[
        {
            "name": "jobs",
            "description": "Operations with job postings",
        },
    ],
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include API router
app.include_router(api_router, prefix="/api")

@app.get("/", tags=["status"])
def read_root():
    return {"message": "Welcome to TalentMatch API"}

@app.get("/health", tags=["status"])
def health_check():
    return {"status": "healthy"} 