from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from app.crud import candidate as candidate_crud
from app.crud import resume as resume_crud
from app.crud import score as score_crud
from app.schemas.schemas import CandidateCreate, ResumeCreate, ScoreCreate

class ResumeProcessor:
    def __init__(self, db: Session):
        self.db = db
    
    def process_resume_data(
        self, 
        extracted_data: Dict[str, Any], 
        candidate_email: str,
        candidate_name: Optional[str] = None,
        job_id: int = None,
        file_path: Optional[str] = None
    ):
        """
        Process extracted resume data and store in database
        
        Args:
            extracted_data: Dictionary containing extracted resume data
            candidate_email: Email of the candidate
            candidate_name: Name of the candidate (optional)
            job_id: ID of the job the resume is for
            file_path: Path to the resume file in S3
            
        Returns:
            Dictionary with created/updated records
        """
        if not job_id:
            raise ValueError("Job ID is required")
            
        # 1. Create or get candidate
        candidate_data = CandidateCreate(
            email=candidate_email,
            name=candidate_name or "Unknown",
            phone=None  # Phone not available from extraction
        )
        candidate = candidate_crud.get_or_create_candidate(self.db, candidate_data)
        
        # 2. Create or update resume
        resume_data = ResumeCreate(
            candidate_id=candidate.candidate_id,
            job_id=job_id,
            summary=extracted_data.get("summary"),
            skills=extracted_data.get("skills", []),
            experience=extracted_data.get("experience"),
            education=extracted_data.get("education"),
            file_path=file_path
        )
        
        # Check if resume already exists for this candidate
        existing_resume = resume_crud.get_resume_by_candidate(self.db, candidate.candidate_id)
        
        if existing_resume:
            # Update existing resume
            resume = resume_crud.update_resume(
                self.db, 
                existing_resume.resume_id, 
                {
                    "job_id": job_id,
                    "summary": extracted_data.get("summary"),
                    "skills": extracted_data.get("skills", []),
                    "experience": extracted_data.get("experience"),
                    "education": extracted_data.get("education"),
                    "file_path": file_path if file_path else existing_resume.file_path
                }
            )
        else:
            # Create new resume
            resume = resume_crud.create_resume(self.db, resume_data)
        
        # 3. Create or update score
        score_data = ScoreCreate(
            resume_id=resume.resume_id,
            job_id=job_id,
            score=extracted_data.get("totalScore", 0.0),
            score_education=extracted_data.get("ScoreEducation"),
            score_experience=extracted_data.get("ScoreExperience"),
            score_skills=extracted_data.get("ScoreSkills"),
            matching_skills=extracted_data.get("matched_skills", []),
            missing_skills=extracted_data.get("missing_skills", []),
            extra_skills=[]  # Not provided in extraction
        )
        
        score = score_crud.update_or_create_score(self.db, score_data)
        
        return {
            "candidate": candidate,
            "resume": resume,
            "score": score
        }
