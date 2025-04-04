from pydantic import BaseModel, EmailStr, Field, validator
from typing import List, Optional, Set
from datetime import datetime
from enum import Enum

class JobStatus(str, Enum):
    ACTIVE = "active"
    CLOSED = "closed"

# Job schemas
class JobBase(BaseModel):
    title: str
    department: Optional[str] = None
    location: Optional[str] = None
    type: str
    salary: Optional[str] = None
    description: str
    status: JobStatus = JobStatus.ACTIVE
    responsibilities: Optional[List[str]] = []
    requirements: Optional[List[str]] = []
    nice_to_have: Optional[List[str]] = []
    benefits: Optional[List[str]] = []
    skills: List[str] = []

class JobCreate(JobBase):
    created_by: Optional[int] = None

class JobUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    salary: Optional[str] = None
    description: Optional[str] = None
    status: Optional[JobStatus] = None
    responsibilities: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    nice_to_have: Optional[List[str]] = None
    benefits: Optional[List[str]] = None
    skills: Optional[List[str]] = None

class Job(JobBase):
    job_id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[int] = None

    class Config:
        from_attributes = True

# Candidate schemas
class CandidateBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None

class CandidateCreate(CandidateBase):
    pass

class Candidate(CandidateBase):
    candidate_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ResumeInfo(BaseModel):
    resume_id: int
    job_id: int
    summary: Optional[str] = None
    skills: Optional[List[str]] = []
    experience: Optional[str] = None
    education: Optional[str] = None
    file_path: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CandidateResponse(CandidateBase):
    candidate_id: int
    score: float
    # Add resume details as an embedded object
    resume: Optional[ResumeInfo] = None
    summary: Optional[str] = None
    skills: Optional[List[str]] = []
    experience: Optional[str] = None
    education: Optional[str] = None
    matching_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    extra_skills: Optional[List[str]] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Resume schemas
class ResumeBase(BaseModel):
    job_id: int
    summary: Optional[str] = None
    skills: Optional[List[str]] = []
    experience: Optional[str] = None
    education: Optional[str] = None
    file_path: Optional[str] = None

class ResumeCreate(ResumeBase):
    candidate_id: int

class Resume(ResumeBase):
    resume_id: int
    candidate_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Score schemas
class ScoreBase(BaseModel):
    job_id: int
    resume_id: int
    score: float
    matching_skills: Optional[List[str]] = []
    missing_skills: Optional[List[str]] = []
    extra_skills: Optional[List[str]] = []

class ScoreCreate(ScoreBase):
    pass

class Score(ScoreBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Recruiter schemas
class RecruiterBase(BaseModel):
    email: EmailStr
    firstname: str
    lastname: str

class RecruiterCreate(RecruiterBase):
    password: str
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one number')
        if not any(not char.isalnum() for char in v):
            raise ValueError('Password must contain at least one special character')
        return v

class RecruiterResponse(RecruiterBase):
    id: int
    is_active: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Add the login schema
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# Note schemas
class NoteBase(BaseModel):
    resume_id: int
    text: str

class NoteCreate(NoteBase):
    recruiter_id: int

class Note(NoteBase):
    id: int
    recruiter_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 