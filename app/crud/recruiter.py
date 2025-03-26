from sqlalchemy.orm import Session
from typing import Optional

from app.models.models import Recruiter
from app.schemas.schemas import RecruiterCreate
from app.core.security import get_password_hash, verify_password

def get_recruiter(db: Session, recruiter_id: int):
    """Get a recruiter by ID."""
    return db.query(Recruiter).filter(Recruiter.id == recruiter_id).first()

def get_recruiter_by_email(db: Session, email: str):
    """Get a recruiter by email."""
    return db.query(Recruiter).filter(Recruiter.email == email).first()

def create_recruiter(db: Session, recruiter: RecruiterCreate):
    """Create a new recruiter."""
    # Hash the password
    hashed_password = get_password_hash(recruiter.password)
    
    # Create the recruiter model instance
    db_recruiter = Recruiter(
        firstname=recruiter.firstname,
        lastname=recruiter.lastname,
        email=recruiter.email,
        password=hashed_password
    )
    
    # Add and commit to the database
    db.add(db_recruiter)
    db.commit()
    db.refresh(db_recruiter)
    
    return db_recruiter

def authenticate_recruiter(db: Session, email: str, password: str) -> Optional[Recruiter]:
    """Authenticate a recruiter by email and password."""
    # Get the recruiter by email
    recruiter = get_recruiter_by_email(db, email)
    
    # If recruiter doesn't exist or password is incorrect, return None
    if not recruiter or not verify_password(password, recruiter.password):
        return None
    
    return recruiter 