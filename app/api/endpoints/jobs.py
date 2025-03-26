from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
from typing import List, Optional
from sqlalchemy.orm import Session

from app.schemas.schemas import Job, JobCreate, JobUpdate
from app.crud import job as crud_job
from app.db.database import get_db

router = APIRouter()


@router.post("/", response_model=Job, status_code=status.HTTP_201_CREATED)
def create_job(
    job: JobCreate, 
    db: Session = Depends(get_db)
):
    """
    Create a new job posting.
    
    - **title**: Job title (required)
    - **type**: Job type (e.g., Full-time, Part-time) (required)
    - **description**: Job description (required)
    - **skills**: List of required skills (required)
    - **department**: Department the job is in
    - **location**: Job location
    - **salary**: Salary range
    - **responsibilities**: Job responsibilities
    - **requirements**: Job requirements
    - **nice_to_have**: Nice-to-have qualifications
    - **benefits**: Job benefits
    """
    return crud_job.create_job(db=db, job=job)


@router.get("/{job_id}", response_model=Job)
def read_job(
    job_id: int = Path(..., title="The ID of the job to get", ge=1),
    db: Session = Depends(get_db)
):
    """
    Get a specific job by ID.
    
    - **job_id**: ID of the job to retrieve
    """
    db_job = crud_job.get_job(db, job_id=job_id)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job


@router.get("/", response_model=List[Job])
def read_jobs(
    skip: int = Query(0, title="Number of records to skip", ge=0),
    limit: int = Query(100, title="Maximum number of records to return", ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Retrieve jobs with pagination.
    
    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return (for pagination)
    """
    jobs = crud_job.get_jobs(db, skip=skip, limit=limit)
    return jobs


@router.put("/{job_id}", response_model=Job)
def update_job(
    job_id: int = Path(..., title="The ID of the job to update", ge=1),
    job: JobUpdate = ...,
    db: Session = Depends(get_db)
):
    """
    Update a job posting.
    
    - **job_id**: ID of the job to update
    - **Request body**: Job fields to update (all fields are optional)
    """
    db_job = crud_job.update_job(db, job_id=job_id, job=job)
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    return db_job


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(
    job_id: int = Path(..., title="The ID of the job to delete", ge=1),
    db: Session = Depends(get_db)
):
    """
    Delete a job posting.
    
    - **job_id**: ID of the job to delete
    """
    success = crud_job.delete_job(db, job_id=job_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job not found")
    return None 