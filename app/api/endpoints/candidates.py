from fastapi import APIRouter, Depends, HTTPException, status, Path
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.db.database import get_db
from app.models.models import Candidate, Resume, Score
from app.schemas.schemas import CandidateResponse

router = APIRouter()

@router.get("/job/{job_id}", response_model=List[CandidateResponse])
def get_candidates_by_job(
    job_id: int = Path(..., title="The ID of the job to get candidates for", ge=1),
    db: Session = Depends(get_db)
):
    """
    Get all candidates for a specific job, sorted by their matching score.
    
    - **job_id**: ID of the job to get candidates for
    
    Returns detailed candidate information including:
    - Personal details (name, email, phone)
    - Resume information (summary, skills, experience, education)
    - Score details (matching skills, missing skills, extra skills)
    """
    # Query to get candidates with their resumes and scores for the specified job
    candidates = (
        db.query(Candidate, Resume, Score)
        .join(Resume, Candidate.candidate_id == Resume.candidate_id)
        .join(Score, Resume.resume_id == Score.resume_id)
        .filter(Resume.job_id == job_id)
        .order_by(desc(Score.score))
        .all()
    )
    
    if not candidates:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No candidates found for job with ID {job_id}"
        )
    
    # Transform the results into the response format
    return [
        CandidateResponse(
            candidate_id=candidate.candidate_id,
            name=candidate.name,
            email=candidate.email,
            phone=candidate.phone,
            score=score.score,
            resume=resume,  # Include the whole resume object
            summary=resume.summary,
            skills=resume.skills,
            experience=resume.experience,
            education=resume.education,
            matching_skills=score.matching_skills,
            missing_skills=score.missing_skills,
            extra_skills=score.extra_skills,
            created_at=candidate.created_at,
            updated_at=candidate.updated_at
        )
        for candidate, resume, score in candidates
    ]

@router.get("/{candidate_id}", response_model=CandidateResponse)
def get_candidate(
    candidate_id: int = Path(..., title="The ID of the candidate to get", ge=1),
    db: Session = Depends(get_db)
):
    """
    Get a specific candidate by ID, including their resume and score information.
    
    - **candidate_id**: ID of the candidate to retrieve
    
    Returns detailed candidate information including:
    - Personal details (name, email, phone)
    - Resume information (summary, skills, experience, education)
    - Score details (matching skills, missing skills, extra skills)
    """
    # First check if the candidate exists
    candidate = db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
    
    if not candidate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Candidate with ID {candidate_id} not found"
        )
    
    # Query to get the candidate with their most recent resume and score
    result = (
        db.query(Candidate, Resume, Score)
        .join(Resume, Candidate.candidate_id == Resume.candidate_id)
        .join(Score, Resume.resume_id == Score.resume_id, isouter=True)  # outer join to include resumes without scores
        .filter(Candidate.candidate_id == candidate_id)
        .order_by(desc(Score.score))  # Get the highest score in case there are multiple
        .first()
    )
    
    # If we found a complete result with resume and score
    if result:
        candidate, resume, score = result
        return CandidateResponse(
            candidate_id=candidate.candidate_id,
            name=candidate.name,
            email=candidate.email,
            phone=candidate.phone,
            score=score.score if score else 0.0,
            resume=resume,  # Include the whole resume object
            summary=resume.summary,
            skills=resume.skills,
            experience=resume.experience,
            education=resume.education,
            matching_skills=score.matching_skills if score else [],
            missing_skills=score.missing_skills if score else [],
            extra_skills=score.extra_skills if score else [],
            created_at=candidate.created_at,
            updated_at=candidate.updated_at
        )
    
    # Check if the candidate has a resume but no score
    resume = db.query(Resume).filter(Resume.candidate_id == candidate_id).first()
    
    if resume:
        return CandidateResponse(
            candidate_id=candidate.candidate_id,
            name=candidate.name,
            email=candidate.email,
            phone=candidate.phone,
            score=0.0,  # Default score when no matching found
            resume=resume,  # Include the whole resume object
            summary=resume.summary,
            skills=resume.skills,
            experience=resume.experience,
            education=resume.education,
            matching_skills=[],
            missing_skills=[],
            extra_skills=[],
            created_at=candidate.created_at,
            updated_at=candidate.updated_at
        )
    
    # If candidate has no resume or scores yet
    return CandidateResponse(
        candidate_id=candidate.candidate_id,
        name=candidate.name,
        email=candidate.email,
        phone=candidate.phone,
        score=0.0,
        resume=None,
        summary=None,
        skills=[],
        experience=None,
        education=None,
        matching_skills=[],
        missing_skills=[],
        extra_skills=[],
        created_at=candidate.created_at,
        updated_at=candidate.updated_at
    )
