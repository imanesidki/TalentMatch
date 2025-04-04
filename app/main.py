import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.database import engine
from app.models import models
from app.api.api import api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),  # Log to console
    ]
)

# Set up a specific logger for resume processing with a bit more detail
resume_logger = logging.getLogger("app.services")
resume_logger.setLevel(logging.INFO)

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
    allow_origins=[
        "http://localhost:3000",
        "https://talent-match-gamma.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include API router
app.include_router(api_router, prefix="/api")

@app.get("/", tags=["status"])
def read_root():
    logging.info("Root endpoint accessed")
    return {"message": "Welcome to TalentMatch API"}

@app.get("/health", tags=["status"])
def health_check():
    logging.info("Health check endpoint accessed")
    return {"status": "healthy"} 