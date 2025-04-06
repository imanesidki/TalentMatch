from app.models.models import Score, Resume, Candidate
from app.job_matcher.utils.file_parser import FileParser
from app.services.s3_service import S3Service
from sqlalchemy.orm import Session
import time
import logging

# Set up logging
logger = logging.getLogger(__name__)

class s3_process_resumes:
    def __init__(self,db_session: Session = None, job_id: int = None):
        self.db_session = db_session
        self.job_id = job_id
        self.file_parser = FileParser()
        self.s3_service = S3Service()
        self.processed_files = 0
        self.failed_files = 0

    def store_in_database(self, data, resume_id):
        """Store processing results in the database"""
        try:
            # Create score record
            score = Score(
                job_id=self.job_id,
                resume_id=resume_id,
                score=data['totalScore'],
                matching_skills=data['matched_skills'],
                missing_skills=data['missing_skills'],
                extra_skills=data['extra_skills'],
            )
            
            # Update resume with extracted information
            resume = self.db_session.query(Resume).filter(Resume.resume_id == resume_id).first()
            if resume:
                # Handle summary which can be either a string or a dictionary
                if isinstance(data['summary'], dict):
                    resume.summary = data['summary'].get('summary', '')
                else:
                    resume.summary = data['summary']
                
                # Handle skills which can be structured differently
                hard_skills = data['skills'].get('hard_skills', []) if isinstance(data['skills'], dict) else []
                soft_skills = data['skills'].get('soft_skills', []) if isinstance(data['skills'], dict) else []
                resume.skills = hard_skills + soft_skills
                
                # Handle experience data - extract and format appropriately
                if isinstance(data['experience'], dict):
                    # Handle the new format with 'companies' list
                    companies = data['experience'].get('companies', [])
                    if companies:
                        # Format companies data
                        experience_text = []
                        for company in companies:
                            if isinstance(company, dict):
                                company_name = company.get('name', 'Unknown')
                                role = company.get('role', 'Unknown')
                                years = company.get('years', 'Unknown')
                                achievements = company.get('key_achievements', [])
                                
                                # Format achievements as bullet points
                                achievements_text = ""
                                if achievements:
                                    achievements_text = "\n• " + "\n• ".join(achievements)
                                
                                exp_entry = f"{role} at {company_name}, {years} years{achievements_text}"
                                experience_text.append(exp_entry)
                        
                        resume.experience = "\n\n".join(experience_text) if experience_text else "No experience found"
                    else:
                        # Try with positions as fallback
                        positions = data['experience'].get('positions', [])
                        if positions:
                            # Format positions data
                            experience_text = []
                            for pos in positions:
                                if isinstance(pos, dict):
                                    company = pos.get('company', 'Unknown')
                                    title = pos.get('title', 'Unknown')
                                    duration = pos.get('duration', 'Unknown')
                                    description = pos.get('description', '')
                                    exp_entry = f"{title} at {company}, {duration} - {description}"
                                    experience_text.append(exp_entry)
                            
                            resume.experience = "\n\n".join(experience_text) if experience_text else "No experience found"
                        else:
                            # No companies or positions found, use the match percentage info
                            match_info = data['experience'].get('match_percentage', '')
                            total_years = data['experience'].get('total_years', '')
                            resume.experience = f"Match: {match_info}, Total Years: {total_years}"
                else:
                    # Just store as string if it's already a string
                    resume.experience = str(data['experience'])
                
                # Handle education data - extract and format appropriately
                if isinstance(data['education'], dict):
                    # Check if we have a single education entry directly in the dict
                    if 'degree' in data['education'] and 'university' in data['education']:
                        # Format the single education entry
                        degree = data['education'].get('degree', 'Unknown')
                        field = data['education'].get('field', '')
                        university = data['education'].get('university', 'Unknown')
                        year = data['education'].get('year', '')
                        
                        education_text = f"{degree} in {field} from {university}, {year}"
                        resume.education = education_text
                    else:
                        # Try the array format as fallback
                        degrees = data['education'].get('degrees', [])
                        if degrees:
                            # Format degrees data
                            education_text = []
                            for deg in degrees:
                                if isinstance(deg, dict):
                                    institution = deg.get('institution', deg.get('university', 'Unknown'))
                                    degree = deg.get('degree', 'Unknown')
                                    field = deg.get('field', '')
                                    year = deg.get('year', '')
                                    edu_entry = f"{degree} in {field} from {institution}, {year}"
                                    education_text.append(edu_entry)
                            
                            resume.education = "\n".join(education_text) if education_text else "No education found"
                        else:
                            # No degrees found, use the match percentage info
                            match_info = data['education'].get('match_percentage', '')
                            highest = data['education'].get('highest_degree', '')
                            field = data['education'].get('field', '')
                            resume.education = f"Match: {match_info}, Highest: {highest}, Field: {field}"
                else:
                    # Just store as string if it's already a string
                    resume.education = str(data['education'])
                                
                # Update candidate information if personal_info is available
                if resume.candidate_id:
                    self.update_candidate_info(resume.candidate_id, data)
            else:
                logger.warning(f"Resume record with id={resume_id} not found in database")
            
            # Add and commit changes
            self.db_session.add(score)
            self.db_session.commit()
            logger.info(f"Database transaction committed successfully")
            
        except Exception as e:
            self.db_session.rollback()
            logger.exception(f"Database error: {str(e)}")
            
    def update_candidate_info(self, candidate_id, personal_info):
        """Update candidate information with extracted personal details"""
        try:
            candidate = self.db_session.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
            
            if candidate:
                # Only update if the fields are empty or the new data is better
                if personal_info.get('name') and (not candidate.name or candidate.name == "Unknown"):
                    candidate.name = personal_info.get('name')
                    
                if personal_info.get('email') and (not candidate.email or '@example.com' in candidate.email):
                    candidate.email = personal_info.get('email')
                    
                if personal_info.get('phone_number') and not candidate.phone:
                    candidate.phone = personal_info.get('phone_number')
                    
                logger.info(f"Candidate information updated successfully")
            else:
                logger.warning(f"Candidate with id={candidate_id} not found in database")
                
        except Exception as e:
            logger.exception(f"Error updating candidate information: {str(e)}")
            # Don't raise the exception so it doesn't affect the main transaction
            
        logger.info(f"Directory processing complete. Processed: {self.processed_files}, Failed: {self.failed_files}")
            
    def process_s3_resumes(self, s3_keys, manager):
        logger.info(f"Starting batch processing of {s3_keys} resumes from S3")
        start_time = time.time()
        
        for s3_key in s3_keys:
            resume_text = self.file_parser.extract_text_from_file(s3_key, s3_service=self.s3_service)
            
            if not resume_text:
                logger.error(f"Error: Could not extract text from {s3_key}")
                self.failed_files += 1
                continue

            result = manager.process_single_resume(resume_text)
            if not result:
                self.failed_files += 1
                continue
            
            resumedb = self.db_session.query(Resume).filter(Resume.file_path == s3_key, Resume.job_id == self.job_id).first()
            if not resumedb:
                self.failed_files += 1
                continue
            
            # Store in database if session available
            resume_id = resumedb.resume_id
            if self.db_session and self.job_id and resume_id:
                self.store_in_database(result, resume_id)
            
            self.processed_files += 1
        
        return {
            "total_files": len(s3_keys),
            "processed_files": self.processed_files,
            "failed_files": self.failed_files,
            "processing_time_seconds": time.time() - start_time
        }
