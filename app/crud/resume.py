from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.models.models import Resume, Candidate
from app.schemas.schemas import ResumeCreate, ResumeBase


def get_resume(db: Session, resume_id: int) -> Optional[Resume]:
    """Get a resume by ID."""
    return db.query(Resume).filter(Resume.resume_id == resume_id).first()


def get_resume_by_candidate(db: Session, candidate_id: int) -> Optional[Resume]:
    """Get a resume by candidate ID."""
    return db.query(Resume).filter(Resume.candidate_id == candidate_id).first()


def get_resumes_by_job(db: Session, job_id: int, skip: int = 0, limit: int = 100) -> List[Resume]:
    """Get all resumes for a specific job."""
    return db.query(Resume).filter(Resume.job_id == job_id).offset(skip).limit(limit).all()


def create_resume(db: Session, resume: ResumeCreate) -> Resume:
    """Create a new resume."""
    db_resume = Resume(
        candidate_id=resume.candidate_id,
        job_id=resume.job_id,
        summary=resume.summary,
        skills=resume.skills,
        experience=resume.experience,
        education=resume.education,
        file_path=resume.file_path
    )
    db.add(db_resume)
    db.commit()
    db.refresh(db_resume)
    return db_resume


def update_resume(db: Session, resume_id: int, resume_data: Dict[str, Any]) -> Optional[Resume]:
    """Update a resume."""
    db_resume = get_resume(db, resume_id)
    if db_resume is None:
        return None
    
    # Update the resume attributes
    for key, value in resume_data.items():
        if hasattr(db_resume, key):
            setattr(db_resume, key, value)
    
    db.commit()
    db.refresh(db_resume)
    return db_resume


def delete_resume(db: Session, resume_id: int) -> bool:
    """Delete a resume."""
    db_resume = get_resume(db, resume_id)
    if db_resume:
        db.delete(db_resume)
        db.commit()
        return True
    return False
