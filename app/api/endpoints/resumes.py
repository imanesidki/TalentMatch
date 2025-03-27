from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.db.database import get_db
from app.models.models import Resume, Score
from app.schemas.schemas import Resume as ResumeSchema, Score as ScoreSchema
from app.services.resume_processor import ResumeProcessor
from app.services.resume_matching_service import ResumeMatchingService
from app.services.matching_skills import calculate_weighted_score
from app.services.s3_service import S3Service
from app.crud import resume as resume_crud
from app.crud import job as job_crud
from app.crud import score as score_crud

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
    skills_weight: float = Form(0.7),
    education_weight: float = Form(0.1),
    experience_weight: float = Form(0.2),
    db: Session = Depends(get_db),
    s3_service: S3Service = Depends(lambda: S3Service())
):
    """
    Process all resumes in the S3 bucket for a specific job.
    
    This endpoint processes all resumes in the S3 bucket for a specific job using
    the matching algorithm with custom weights.
    
    Args:
        job_id: The ID of the job to match against
        skills_weight: Weight for skills matching (default: 0.7)
        education_weight: Weight for education matching (default: 0.1)
        experience_weight: Weight for experience matching (default: 0.2)
    """
    # Check if job exists
    job = job_crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
    
    # List all resumes in the S3 bucket
    resume_files = s3_service.list_files()
    if not resume_files:
        return {
            "message": "No resumes found in S3 bucket",
            "job_id": job_id,
            "processed_count": 0
        }
    
    # Set up weights
    weights = {
        'skills': skills_weight,
        'education': education_weight,
        'experience': experience_weight
    }
    
    # Process each resume
    processed_count = 0
    matching_service = ResumeMatchingService(db)
    
    for s3_key in resume_files:
        try:
            # Download file from S3
            temp_file_path, filename = s3_service.download_file(s3_key)
            
            # Extract email from filename or use a placeholder
            candidate_email = f"{filename.split('.')[0]}@example.com"
            
            # Process the resume
            matching_service.process_file(
                file_path=temp_file_path,
                job_id=job_id,
                weights=weights,
                candidate_email=candidate_email
            )
            
            processed_count += 1
            
        except Exception as e:
            print(f"Error processing {s3_key}: {str(e)}")
    
    # Return the result
    return {
        "message": f"Batch processing completed. {processed_count} resumes processed.",
        "job_id": job_id,
        "processed_count": processed_count
    }

@router.post("/update-weights")
async def update_weights(
    job_id: int = Form(...),
    skills_weight: float = Form(0.7),
    education_weight: float = Form(0.1),
    experience_weight: float = Form(0.2),
    db: Session = Depends(get_db)
):
    """
    Update the matching weights for a job and recalculate all scores.
    
    This endpoint updates the weights used for matching and recalculates
    all scores for resumes associated with the specified job.
    
    Args:
        job_id: The ID of the job to update weights for
        skills_weight: Weight for skills matching (default: 0.7)
        education_weight: Weight for education matching (default: 0.1)
        experience_weight: Weight for experience matching (default: 0.2)
    """
    # Check if job exists
    job = job_crud.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"Job with ID {job_id} not found")
    
    # Set up weights
    weights = {
        'skills': skills_weight,
        'education': education_weight,
        'experience': experience_weight
    }
    
    # Get all scores for this job
    scores = score_crud.get_scores_by_job(db, job_id)
    
    # Update each score
    updated_count = 0
    for score in scores:
        try:
            # Recalculate weighted score
            weighted_score = calculate_weighted_score(
                score.score_skills or 0,
                score.score_education or 0,
                score.score_experience or 0,
                weights
            )
            
            # Update score
            score_crud.update_score(db, score.id, {"score": weighted_score})
            updated_count += 1
            
        except Exception as e:
            print(f"Error updating score {score.id}: {str(e)}")
    
    # Return the result
    return {
        "message": f"Weights updated. {updated_count} scores recalculated.",
        "job_id": job_id,
        "updated_count": updated_count,
        "weights": weights
    }

@router.get("/job/{job_id}/scores", response_model=List[ScoreSchema])
def get_scores_by_job(
    job_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all scores for a specific job
    
    This endpoint retrieves all scores for resumes associated with the specified job.
    
    Args:
        job_id: The ID of the job to get scores for
        skip: Number of records to skip (for pagination)
        limit: Maximum number of records to return (for pagination)
    """
    scores = score_crud.get_scores_by_job(db, job_id, skip, limit)
    return scores
