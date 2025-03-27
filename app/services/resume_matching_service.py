from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Job, Resume, Score
from app.services.matching_skills import calculate_skills_score, calculate_weighted_score, prepare_job_for_matching
from app.services.resume_processor2 import ResumeProcessor
from app.utils.file_parser import FileParser
from app.utils.bias_free_resume import ResumeAnonymizerPersonalData
from app.crud import score as score_crud
from app.crud import resume as resume_crud
from app.crud import job as job_crud
from app.crud import candidate as candidate_crud
from app.schemas.schemas import ScoreCreate, ResumeCreate, CandidateCreate

class ResumeMatchingService:
    def __init__(self, db: Session):
        self.db = db
        self.file_parser = FileParser()
        self.anonymizer = ResumeAnonymizerPersonalData()
    
    def process_single_resume(self, 
                             resume_text: str, 
                             job_id: int, 
                             weights: Dict[str, float],
                             candidate_email: str,
                             candidate_name: Optional[str] = None,
                             file_path: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a single resume against a job with custom weights
        
        Args:
            resume_text: The text content of the resume
            job_id: The ID of the job to match against
            weights: Dictionary with weights for skills, education, and experience
            candidate_email: Email of the candidate
            candidate_name: Name of the candidate (optional)
            file_path: Path to the resume file in S3 (optional)
            
        Returns:
            Dictionary with processing results
        """
        # Get the job from the database
        job = job_crud.get_job(self.db, job_id)
        if not job:
            raise ValueError(f"Job with ID {job_id} not found")
        
        # Prepare job data for matching
        job_data = prepare_job_for_matching(job)
        
        # Process the resume text
        # First anonymize the resume
        personal_data = self.anonymizer.get_data_resume(resume_text)
        anonymized_text = self.anonymizer.anonymize_text(resume_text, personal_data)
        
        # Process the resume with LLM
        processor = ResumeProcessor(self._format_job_description(job))
        result, data = processor.process_resume(anonymized_text)
        
        if not result or not data:
            raise ValueError("Failed to process resume")
        
        # Calculate scores
        skills_score = calculate_skills_score(data['skills'], job)
        
        # Extract numeric scores
        score_edu = float(result['education']['match_percentage'].strip("%"))
        score_exp = float(result['experience']['match_percentage'].strip("%"))
        score_skills = skills_score['match_percentage']
        
        # Calculate weighted score
        weighted_score = calculate_weighted_score(
            score_skills, 
            score_edu, 
            score_exp, 
            weights
        )
        
        # Prepare data for database
        extracted_data = {
            'skills': data['skills'],
            'education': result['education'],
            'experience': result['experience'],
            'matched_skills': skills_score['matched_skills'],
            'missing_skills': skills_score['missing_skills'],
            'ScoreEducation': score_edu,
            'ScoreExperience': score_exp,
            'ScoreSkills': score_skills,
            'totalScore': weighted_score,
            'summary': data['summary']
        }
        
        # Store in database
        # 1. Create or get candidate
        candidate_data = CandidateCreate(
            email=candidate_email,
            name=candidate_name or personal_data.get('name', "Unknown"),
            phone=personal_data.get('phone_number')
        )
        candidate = candidate_crud.get_or_create_candidate(self.db, candidate_data)
        
        # 2. Create or update resume
        resume_data = ResumeCreate(
            candidate_id=candidate.candidate_id,
            job_id=job_id,
            summary=extracted_data.get("summary"),
            skills=extracted_data.get("skills", {}).get("hard_skills", []) + 
                   extracted_data.get("skills", {}).get("soft_skills", []),
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
                    "skills": extracted_data.get("skills", {}).get("hard_skills", []) + 
                              extracted_data.get("skills", {}).get("soft_skills", []),
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
            "score": score,
            "extracted_data": extracted_data
        }
    
    def process_file(self, 
                    file_path: str, 
                    job_id: int, 
                    weights: Dict[str, float],
                    candidate_email: str,
                    candidate_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Process a resume file against a job with custom weights
        
        Args:
            file_path: Path to the resume file
            job_id: The ID of the job to match against
            weights: Dictionary with weights for skills, education, and experience
            candidate_email: Email of the candidate
            candidate_name: Name of the candidate (optional)
            
        Returns:
            Dictionary with processing results
        """
        # Extract text from file
        resume_text = self.file_parser.extract_text_from_file(file_path)
        if not resume_text:
            raise ValueError(f"Could not extract text from {file_path}")
        
        # Process the resume text
        return self.process_single_resume(
            resume_text=resume_text,
            job_id=job_id,
            weights=weights,
            candidate_email=candidate_email,
            candidate_name=candidate_name,
            file_path=file_path
        )
    
    def process_multiple_files(self, 
                              file_paths: List[str], 
                              job_id: int, 
                              weights: Dict[str, float]) -> List[Dict[str, Any]]:
        """
        Process multiple resume files against a job with custom weights
        
        Args:
            file_paths: List of paths to resume files
            job_id: The ID of the job to match against
            weights: Dictionary with weights for skills, education, and experience
            
        Returns:
            List of dictionaries with processing results
        """
        results = []
        for file_path in file_paths:
            try:
                # Extract email from filename or use a placeholder
                filename = file_path.split("/")[-1]
                candidate_email = f"{filename.split('.')[0]}@example.com"
                
                result = self.process_file(
                    file_path=file_path,
                    job_id=job_id,
                    weights=weights,
                    candidate_email=candidate_email
                )
                results.append(result)
            except Exception as e:
                # Log the error and continue with the next file
                print(f"Error processing {file_path}: {str(e)}")
        
        return results
    
    def _format_job_description(self, job) -> str:
        """
        Format job data into a string for the resume processor
        
        Args:
            job: Job model from the database
            
        Returns:
            Formatted job description string
        """
        sections = [
            ("description", job.description),
            ("responsibilities", job.responsibilities),
            ("requirements", job.requirements),
            ("nice_to_have", job.nice_to_have)
        ]
        
        text = ""
        for key, value in sections:
            if isinstance(value, str) and value:
                text += f"{key}: {value}\n"
            elif isinstance(value, list) and value:
                text += f"{key}: {', '.join(value)}\n"
        
        return text
