from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any

from app.db.database import get_db
from app.models.models import Job, Candidate, Resume, Score, Recruiter, JobStatus
from app.core.auth import get_current_active_user
from app.schemas.schemas import RecruiterResponse

router = APIRouter()


@router.get("/stats", response_model=Dict[str, Any])
async def get_dashboard_stats(
    current_user: Recruiter = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics:
    - Total candidates
    - Active jobs
    - Recent candidate growth
    - Recent job growth
    """
    # Get total candidates count
    total_candidates = db.query(func.count(Candidate.candidate_id)).scalar()
    
    # Get candidates added in the last month
    from datetime import datetime, timedelta
    one_month_ago = datetime.utcnow() - timedelta(days=30)
    
    new_candidates = db.query(func.count(Candidate.candidate_id)).filter(
        Candidate.created_at >= one_month_ago
    ).scalar()
    
    # Get active jobs count
    active_jobs_count = db.query(func.count(Job.job_id)).filter(
        Job.status == JobStatus.ACTIVE.value
    ).scalar()
    
    # Get new jobs in the last month
    new_jobs = db.query(func.count(Job.job_id)).filter(
        Job.created_at >= one_month_ago
    ).scalar()
    
    return {
        "total_candidates": total_candidates,
        "new_candidates": new_candidates,
        "active_jobs": active_jobs_count,
        "new_jobs": new_jobs
    }


@router.get("/recent-candidates", response_model=List[Dict[str, Any]])
async def get_recent_candidates(
    limit: int = 5,
    current_user: Recruiter = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get recently added candidates with their highest match scores
    """
    recent_candidates = db.query(
        Candidate.candidate_id,
        Candidate.name,
        Candidate.email,
        Resume.resume_id,
        func.max(Score.score).label("max_score"),
        func.min(Job.title).label("job_title")  # Using min() just to get one job title
    ).join(
        Resume, Resume.candidate_id == Candidate.candidate_id
    ).join(
        Score, Score.resume_id == Resume.resume_id, isouter=True
    ).join(
        Job, Job.job_id == Resume.job_id
    ).group_by(
        Candidate.candidate_id, Candidate.name, Candidate.email, Resume.resume_id
    ).order_by(
        desc(Candidate.created_at)
    ).limit(limit).all()
    
    result = []
    for candidate in recent_candidates:
        result.append({
            "id": candidate.candidate_id,
            "name": candidate.name,
            "email": candidate.email,
            "job": candidate.job_title,
            "score": float(candidate.max_score) if candidate.max_score else None
        })
    
    return result


@router.get("/job-postings", response_model=List[Dict[str, Any]])
async def get_job_postings(
    limit: int = 5,
    current_user: Recruiter = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get active job postings with candidate counts and average scores
    """
    job_postings = db.query(
        Job.job_id,
        Job.title,
        Job.type,
        Job.department,
        Job.location,
        Job.created_at,
        func.count(Resume.resume_id).label("candidate_count"),
        func.avg(Score.score).label("avg_score")
    ).outerjoin(
        Resume, Resume.job_id == Job.job_id
    ).outerjoin(
        Score, Score.resume_id == Resume.resume_id
    ).filter(
        Job.status == JobStatus.ACTIVE.value
    ).group_by(
        Job.job_id, Job.title, Job.department, Job.location, Job.type, Job.created_at
    ).order_by(
        desc(Job.created_at)
    ).limit(limit).all()
    
    result = []
    for job in job_postings:
        result.append({
            "id": job.job_id,
            "title": job.title,
            "type": job.type,
            "department": job.department,
            "location": job.location,
            "created_at": job.created_at,
            "candidate_count": job.candidate_count,
            "avg_score": float(job.avg_score) if job.avg_score else None
        })
    
    return result


@router.get("/activity", response_model=Dict[str, List[int]])
async def get_activity_data(
    current_user: Recruiter = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get candidate matching activity for the past 30 days
    """
    from datetime import datetime, timedelta
    
    # Calculate date range for the past 30 days
    today = datetime.utcnow().date()
    start_date = today - timedelta(days=29)  # 30 days including today
    
    # Initialize data structure with zeros
    matches_data = [0] * 30
    applications_data = [0] * 30
    
    # Get resume submissions (applications) by day
    applications = db.query(
        func.date(Resume.created_at).label("date"),
        func.count().label("count")
    ).filter(
        func.date(Resume.created_at) >= start_date,
        func.date(Resume.created_at) <= today
    ).group_by(
        func.date(Resume.created_at)
    ).all()
    
    # Get score calculations (matches) by day
    matches = db.query(
        func.date(Score.created_at).label("date"),
        func.count().label("count")
    ).filter(
        func.date(Score.created_at) >= start_date,
        func.date(Score.created_at) <= today
    ).group_by(
        func.date(Score.created_at)
    ).all()
    
    # Fill in the data arrays
    for app in applications:
        day_diff = (app.date - start_date).days
        if 0 <= day_diff < 30:
            applications_data[day_diff] = app.count
    
    for match in matches:
        day_diff = (match.date - start_date).days
        if 0 <= day_diff < 30:
            matches_data[day_diff] = match.count
    
    return {
        "matches": matches_data,
        "applications": applications_data
    }


@router.get("/user", response_model=RecruiterResponse)
async def get_current_user(
    current_user: Recruiter = Depends(get_current_active_user)
):
    """
    Get the current user's information for the dashboard
    """
    return current_user 