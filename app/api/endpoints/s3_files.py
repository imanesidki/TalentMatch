# app/api/endpoints/s3_files.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse
from typing import List, Dict
import time

from app.services.s3_service import S3Service
from app.services.resume_processing_service import start_resume_processing, resume_processing_service
from sqlalchemy.orm import Session
from app.db.database import get_db
import os
from sqlalchemy.sql import func
from app.models.models import Candidate, Resume

router = APIRouter(prefix="/s3", tags=["files"])

# Dependency to get S3 service
def get_s3_service():
    return S3Service()

@router.post("/upload", status_code=201)
async def upload_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    job_id: int = Form(...),
    skill_weight: float = Form(...),
    experience_weight: float = Form(...),
    education_weight: float = Form(...),
    s3_service: S3Service = Depends(get_s3_service),
    db: Session = Depends(get_db)
):
    """
    Upload multiple resume files to S3 and start processing
    
    This endpoint handles both the file upload to S3 and initiates the background 
    processing of those resumes against a job description.
    """
    uploaded_files = []
    errors = []
    s3_keys = []
    
    for file in files:
        # Validate file type
        if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
            errors.append(f"Invalid file type for {file.filename}: Only PDF and Word documents are allowed")
            continue
        
        try:
            # Upload to S3
            s3_key = s3_service.upload_file(file)
            s3_keys.append(s3_key)
            
            # Create a candidate record with placeholder data
            candidate = create_or_update_candidate(db, "Unknown", "unknown@example.com", None)
            
            # Create a resume record linked to the candidate and job
            resume = create_resume_record(db, candidate.candidate_id, job_id, s3_key)
            
            uploaded_files.append({
                "filename": file.filename,
                "s3_key": s3_key,
                "resume_id": resume.resume_id,
                "candidate_id": candidate.candidate_id
            })
            
        except Exception as e:
            errors.append(f"Failed to upload {file.filename}: {str(e)}")
    
    if not uploaded_files and errors:
        raise HTTPException(status_code=400, detail={"errors": errors})
    
    # Normalize weights to ensure they sum to 1.0
    total_weight = skill_weight + experience_weight + education_weight
    weighting = {
        "skills": skill_weight / total_weight,
        "experience": experience_weight / total_weight,
        "education": education_weight / total_weight
    }
    
    # Start processing in the background
    processing_result = start_resume_processing(
        job_id=job_id,
        resume_s3_keys=s3_keys,
        weighting=weighting,
        background_tasks=background_tasks,
        db=db
    )
    
    return {
        "uploaded_files": uploaded_files,
        "job_id": job_id,
        "weights": weighting,
        "processing_status": processing_result,
        "message": f"Successfully uploaded {len(uploaded_files)} files and started processing",
        "errors": errors if errors else None
    }

@router.post("/process-resumes")
async def process_resumes(
    job_id: int,
    s3_keys: List[str],
    weighting: Dict[str, float],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Start processing resumes in the background
    
    This endpoint initiates the background processing of resumes that were previously 
    uploaded to S3. The process involves extracting text from the resumes, comparing 
    against the job description, calculating match scores, and storing results in the database.
    
    - job_id: ID of the job to match against
    - s3_keys: List of S3 keys for the resumes to process
    - weighting: Dictionary with weights for different matching categories:
                 {"skills": 0.4, "experience": 0.4, "education": 0.2}
    """
    # Validate weighting
    expected_keys = {"skills", "experience", "education"}
    if not all(key in weighting for key in expected_keys):
        raise HTTPException(
            status_code=400, 
            detail=f"Weighting must include all categories: {', '.join(expected_keys)}"
        )
    
    if sum(weighting.values()) != 1.0:
        raise HTTPException(
            status_code=400,
            detail="Weighting values must sum to 1.0"
        )
    
    # Start the processing task
    result = start_resume_processing(
        job_id=job_id,
        resume_s3_keys=s3_keys,
        weighting=weighting,
        background_tasks=background_tasks,
        db=db
    )
    
    return result

@router.get("/process-status/{job_id}")
async def get_process_status(job_id: int):
    """
    Get the status of a resume processing job
    
    Returns the current status of a background resume processing task for a specific job.
    """
    status = resume_processing_service.get_processing_status(job_id)
    return status

@router.get("/files", response_model=List[str])
async def list_files(s3_service: S3Service = Depends(get_s3_service)):
    """List all files in S3 bucket"""
    files = s3_service.list_files()
    return files

@router.get("/download/{file_key:path}")
async def download_file(
    file_key: str,
    s3_service: S3Service = Depends(get_s3_service)
):
    """Download a file from S3"""
    try:
        # Download from S3
        temp_file_path, filename = s3_service.download_file(file_key)
        
        # Return file response (will be deleted after response is sent)
        return FileResponse(
            path=temp_file_path,
            filename=filename,
            media_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{file_key:path}")
async def delete_file(
    file_key: str,
    s3_service: S3Service = Depends(get_s3_service)
):
    """Delete a file from S3"""
    success = s3_service.delete_file(file_key)
    return {"message": "File deleted successfully"}

# Helper functions for candidate and resume creation
def create_or_update_candidate(db: Session, name: str, email: str, phone: str = None):
    """Create a new candidate or update existing one"""
    # For placeholder emails, generate a unique email to avoid unique constraint errors
    if email == "unknown@example.com":
        # Generate a unique email using timestamp to avoid collision
        unique_id = int(time.time() * 1000)
        email = f"unknown_{unique_id}@example.com"
    
    # Check if candidate with this email already exists
    existing = None
    if email and '@example.com' not in email:
        existing = db.query(Candidate).filter(Candidate.email == email).first()
    
    if existing:
        # Update existing candidate if needed
        if name and name != "Unknown" and existing.name == "Unknown":
            existing.name = name
        if phone and not existing.phone:
            existing.phone = phone
        db.commit()
        return existing
    
    # Create new candidate
    candidate = Candidate(
        name=name,
        email=email,
        phone=phone
    )
    db.add(candidate)
    db.commit()
    db.refresh(candidate)
    return candidate

def create_resume_record(db: Session, candidate_id: int, job_id: int, file_path: str):
    """Create a new resume record"""
    resume = Resume(
        candidate_id=candidate_id,
        job_id=job_id,
        file_path=file_path,
        created_at=func.now()
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume