from sqlalchemy.orm import Session
from app.models.models import Job
from app.schemas.schemas import JobCreate, JobUpdate
from typing import List, Optional, Dict, Any


def get_job(db: Session, job_id: int):
    return db.query(Job).filter(Job.job_id == job_id).first()


def get_jobs(db: Session, skip: int = 0, limit: int = 80):
    return db.query(Job).offset(skip).limit(limit).all()


def create_job(db: Session, job: JobCreate):
    db_job = Job(
        title=job.title,
        department=job.department,
        location=job.location,
        type=job.type,
        salary=job.salary,
        description=job.description,
        status=job.status,
        responsibilities=job.responsibilities,
        requirements=job.requirements,
        nice_to_have=job.nice_to_have,
        benefits=job.benefits,
        skills=job.skills,
        created_by=job.created_by
    )
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job


def update_job(db: Session, job_id: int, job: JobUpdate):
    db_job = get_job(db, job_id)
    if db_job is None:
        return None
        
    # Prepare update data dictionary
    update_data = job.dict(exclude_unset=True)
    
    # Update the job attributes
    for key, value in update_data.items():
        setattr(db_job, key, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job


def delete_job(db: Session, job_id: int):
    db_job = get_job(db, job_id)
    if db_job:
        db.delete(db_job)
        db.commit()
        return True
    return False 