from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.models.models import Resume, Score
from app.schemas.schemas import Resume as ResumeSchema, Score as ScoreSchema
from app.services.resume_processor import ResumeProcessor
from app.services.s3_service import S3Service
from app.crud import resume as resume_crud

router = APIRouter()

@router.post("/process", response_model=Dict[str, Any])
async def process_resume(
    job_id: int = Form(...),
    candidate_email: str = Form(...),
    candidate_name: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    extracted_data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db),
    s3_service: S3Service = Depends(lambda: S3Service())
):
    """
    Process a resume and store the extracted data in the database.
    
    This endpoint accepts:
    - job_id: The ID of the job the resume is for
    - candidate_email: The email of the candidate
    - candidate_name: The name of the candidate (optional)
    - file: The resume file (optional)
    - extracted_data: The data extracted from the resume
    
    The extracted_data should contain:
    - skills: List of skills
    - education: Education information
    - experience: Experience information
    - matched_skills: List of skills that match the job
    - missing_skills: List of skills required by the job but missing from the resume
    - ScoreEducation: Education score
    - ScoreExperience: Experience score
    - ScoreSkills: Skills score
    - totalScore: Overall score
    - summary: Resume summary
    """
    # Upload file to S3 if provided
    file_path = None
    if file:
        if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
            raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed")
        file_path = s3_service.upload_file(file)
    
    # Process the resume data
    try:
        processor = ResumeProcessor(db)
        result = processor.process_resume_data(
            extracted_data=extracted_data,
            candidate_email=candidate_email,
            candidate_name=candidate_name,
            job_id=job_id,
            file_path=file_path
        )
        
        return {
            "message": "Resume processed successfully",
            "candidate_id": result["candidate"].candidate_id,
            "resume_id": result["resume"].resume_id,
            "score_id": result["score"].id,
            "total_score": result["score"].score
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing resume: {str(e)}")

@router.get("/{resume_id}", response_model=ResumeSchema)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a resume by ID
    """
    resume = resume_crud.get_resume(db, resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    
    return resume

@router.get("/job/{job_id}", response_model=List[ResumeSchema])
def get_resumes_by_job(
    job_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all resumes for a specific job
    """
    resumes = resume_crud.get_resumes_by_job(db, job_id, skip, limit)
    return resumes

@router.post("/batch-process")
async def batch_process_resumes(
    job_id: int = Form(...),
    db: Session = Depends(get_db),
    s3_service: S3Service = Depends(lambda: S3Service())
):
    """
    Process all resumes in the S3 bucket for a specific job.
    
    This endpoint is a placeholder for the future integration with your teammate's code.
    It will list all resumes in the S3 bucket, process them, and store the results in the database.
    """
    # This is a placeholder for the future integration
    # You'll need to integrate your teammate's code here
    
    # List all resumes in the S3 bucket
    resume_files = s3_service.list_files()
    
    # Process each resume
    processed_count = 0
    
    # Return the result
    return {
        "message": f"Batch processing completed. {processed_count} resumes processed.",
        "job_id": job_id,
        "processed_count": processed_count
    }
