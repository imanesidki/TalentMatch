from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean, Float, Table, DateTime, func, ARRAY
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class JobStatus(enum.Enum):
    ACTIVE = "active"
    CLOSED = "closed"

class Job(Base):
    __tablename__ = "jobs"

    job_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String, nullable=True)
    location = Column(String, nullable=True)
    type = Column(String, nullable=False)  # Full-time, Part-time, Contract, etc.
    salary = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    status = Column(String, default=JobStatus.ACTIVE.value)
    responsibilities = Column(ARRAY(Text), default=[], nullable=True)
    requirements = Column(ARRAY(Text), default=[], nullable=True)
    nice_to_have = Column(ARRAY(Text), default=[], nullable=True)
    benefits = Column(ARRAY(Text), default=[], nullable=True)
    skills = Column(ARRAY(String), default=[], nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("recruiters.id"), nullable=True)
    
    # Relationships
    # Update the relationship to one-to-many
    resumes = relationship("Resume", back_populates="job")
    scores = relationship("Score", back_populates="job")
    recruiter = relationship("Recruiter", back_populates="jobs")

class Candidate(Base):
    __tablename__ = "candidates"

    candidate_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="candidate", uselist=False)

class Resume(Base):
    __tablename__ = "resumes"

    resume_id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("candidates.candidate_id"), unique=True)
    # Add job_id foreign key for the one-to-many relationship
    job_id = Column(Integer, ForeignKey("jobs.job_id"), nullable=False)
    summary = Column(Text, nullable=True)
    skills = Column(ARRAY(String), default=[], nullable=True)
    experience = Column(Text, nullable=True)
    education = Column(Text, nullable=True)
    file_path = Column(String, nullable=True)  # Path to the stored resume file
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    candidate = relationship("Candidate", back_populates="resume")
    # Update the relationship to many-to-one
    job = relationship("Job", back_populates="resumes")
    scores = relationship("Score", back_populates="resume")
    notes = relationship("Note", back_populates="resume")

class Score(Base):
    __tablename__ = "scores"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.job_id"))
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"))
    score = Column(Float)
    matching_skills = Column(ARRAY(String), default=[], nullable=True)
    missing_skills = Column(ARRAY(String), default=[], nullable=True)
    extra_skills = Column(ARRAY(String), default=[], nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    job = relationship("Job", back_populates="scores")
    resume = relationship("Resume", back_populates="scores")

class Recruiter(Base):
    __tablename__ = "recruiters"

    id = Column(Integer, primary_key=True, index=True)
    firstname = Column(String, nullable=False)
    lastname = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    notes = relationship("Note", back_populates="recruiter")
    jobs = relationship("Job", back_populates="recruiter")

class Note(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    recruiter_id = Column(Integer, ForeignKey("recruiters.id"))
    resume_id = Column(Integer, ForeignKey("resumes.resume_id"))
    text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    recruiter = relationship("Recruiter", back_populates="notes")
    resume = relationship("Resume", back_populates="notes")