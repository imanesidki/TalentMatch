from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.models.models import Score
from app.schemas.schemas import ScoreCreate, ScoreBase


def get_score(db: Session, score_id: int) -> Optional[Score]:
    """Get a score by ID."""
    return db.query(Score).filter(Score.id == score_id).first()


def get_score_by_resume_and_job(db: Session, resume_id: int, job_id: int) -> Optional[Score]:
    """Get a score by resume ID and job ID."""
    return db.query(Score).filter(
        Score.resume_id == resume_id,
        Score.job_id == job_id
    ).first()


def get_scores_by_job(db: Session, job_id: int, skip: int = 0, limit: int = 100) -> List[Score]:
    """Get all scores for a specific job."""
    return db.query(Score).filter(Score.job_id == job_id).offset(skip).limit(limit).all()


def get_scores_by_resume(db: Session, resume_id: int) -> List[Score]:
    """Get all scores for a specific resume."""
    return db.query(Score).filter(Score.resume_id == resume_id).all()


def create_score(db: Session, score: ScoreCreate) -> Score:
    """Create a new score."""
    db_score = Score(
        job_id=score.job_id,
        resume_id=score.resume_id,
        score=score.score,
        score_education=score.score_education,
        score_experience=score.score_experience,
        score_skills=score.score_skills,
        matching_skills=score.matching_skills,
        missing_skills=score.missing_skills,
        extra_skills=score.extra_skills
    )
    db.add(db_score)
    db.commit()
    db.refresh(db_score)
    return db_score


def update_score(db: Session, score_id: int, score_data: Dict[str, Any]) -> Optional[Score]:
    """Update a score."""
    db_score = get_score(db, score_id)
    if db_score is None:
        return None
    
    # Update the score attributes
    for key, value in score_data.items():
        if hasattr(db_score, key):
            setattr(db_score, key, value)
    
    db.commit()
    db.refresh(db_score)
    return db_score


def delete_score(db: Session, score_id: int) -> bool:
    """Delete a score."""
    db_score = get_score(db, score_id)
    if db_score:
        db.delete(db_score)
        db.commit()
        return True
    return False


def update_or_create_score(db: Session, score: ScoreCreate) -> Score:
    """Update an existing score or create a new one if it doesn't exist."""
    db_score = get_score_by_resume_and_job(db, score.resume_id, score.job_id)
    
    if db_score:
        # Update existing score
        db_score.score = score.score
        db_score.score_education = score.score_education
        db_score.score_experience = score.score_experience
        db_score.score_skills = score.score_skills
        db_score.matching_skills = score.matching_skills
        db_score.missing_skills = score.missing_skills
        db_score.extra_skills = score.extra_skills
        db.commit()
        db.refresh(db_score)
        return db_score
    else:
        # Create new score
        return create_score(db, score)
