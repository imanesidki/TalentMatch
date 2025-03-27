from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any

from app.models.models import Candidate
from app.schemas.schemas import CandidateCreate, CandidateBase


def get_candidate(db: Session, candidate_id: int) -> Optional[Candidate]:
    """Get a candidate by ID."""
    return db.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()


def get_candidate_by_email(db: Session, email: str) -> Optional[Candidate]:
    """Get a candidate by email."""
    return db.query(Candidate).filter(Candidate.email == email).first()


def get_candidates(db: Session, skip: int = 0, limit: int = 100) -> List[Candidate]:
    """Get all candidates with pagination."""
    return db.query(Candidate).offset(skip).limit(limit).all()


def create_candidate(db: Session, candidate: CandidateCreate) -> Candidate:
    """Create a new candidate."""
    db_candidate = Candidate(
        name=candidate.name,
        email=candidate.email,
        phone=candidate.phone
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def update_candidate(db: Session, candidate_id: int, candidate_data: Dict[str, Any]) -> Optional[Candidate]:
    """Update a candidate."""
    db_candidate = get_candidate(db, candidate_id)
    if db_candidate is None:
        return None
    
    # Update the candidate attributes
    for key, value in candidate_data.items():
        if hasattr(db_candidate, key):
            setattr(db_candidate, key, value)
    
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def delete_candidate(db: Session, candidate_id: int) -> bool:
    """Delete a candidate."""
    db_candidate = get_candidate(db, candidate_id)
    if db_candidate:
        db.delete(db_candidate)
        db.commit()
        return True
    return False


def get_or_create_candidate(db: Session, candidate: CandidateCreate) -> Candidate:
    """Get an existing candidate by email or create a new one if they don't exist."""
    db_candidate = get_candidate_by_email(db, candidate.email)
    
    if db_candidate:
        # Update existing candidate with any new information
        if candidate.name and candidate.name != db_candidate.name:
            db_candidate.name = candidate.name
        if candidate.phone and candidate.phone != db_candidate.phone:
            db_candidate.phone = candidate.phone
        db.commit()
        db.refresh(db_candidate)
        return db_candidate
    else:
        # Create new candidate
        return create_candidate(db, candidate)
