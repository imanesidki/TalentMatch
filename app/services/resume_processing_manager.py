import os
import time
import logging
from app.utils.file_parser import FileParser
from app.services.resume_processor import ResumeProcessor
from app.services.matching_skills import calculate_skills_score
from app.services.s3_service import S3Service
from sqlalchemy.orm import Session
from app.models.models import Score, Resume, Candidate
from typing import Dict, List, Any

# Set up logging
logger = logging.getLogger(__name__)

class ResumeProcessingManager:
    def __init__(self, job_description, original_job_description, weighting, db_session: Session = None, job_id: int = None):
        self.resume_processor = ResumeProcessor(job_description)
        self.file_parser = FileParser()
        self.weighting = weighting
        self.original_job_description = original_job_description
        self.s3_service = S3Service()
        self.db_session = db_session
        self.job_id = job_id
        self.processed_files = 0
        self.failed_files = 0
        logger.info(f"ResumeProcessingManager initialized for job_id={job_id}")

    def process_single_resume(self, file_path, is_s3_path=False, resume_id=None, candidate_id=None):
        """
        Process a single resume file
        
        Args:
            file_path: Path to the resume file (local or S3)
            is_s3_path: Whether the file_path is an S3 key
            resume_id: The resume ID in the database (if known)
            candidate_id: The candidate ID in the database (if known)
            
        Returns:
            Dictionary with processing results or None if processing failed
        """
        start_time = time.time()
        logger.info(f"Starting to process resume: {file_path}, is_s3_path={is_s3_path}, resume_id={resume_id}")
        
        try:
            # Extract text using appropriate method based on path type
            logger.info(f"Extracting text from resume file: {file_path}")
            resume_text = self.file_parser.extract_text_from_file(
                file_path, 
                is_s3_path=is_s3_path, 
                s3_service=self.s3_service if is_s3_path else None
            )
            
            if not resume_text:
                logger.error(f"Error: Could not extract text from {file_path}")
                self.failed_files += 1
                return None
                
            logger.info(f"Successfully extracted text from {file_path}. Text length: {len(resume_text)} characters")
            logger.info(f"Processing resume with AI models for job matching")
            result, data = self.resume_processor.process_resume(resume_text)
            
            if result and data:
                logger.info(f"AI processing completed successfully for {file_path}")
                
                # Calculate comprehensive score
                logger.info("Calculating skills score")
                data_skills = calculate_skills_score(data['skills'], self.original_job_description)
                
                score_edu = float(result['education']['match_percentage'].strip("%"))
                score_exp = float(result['experience']['match_percentage'].strip("%"))
                score_ski = data_skills['match_percentage']
                
                logger.info(f"Match scores - Education: {score_edu}, Experience: {score_exp}, Skills: {score_ski}")
                
                # Calculate weighted score
                weighted_score = (
                    (score_edu * self.weighting['education']) + 
                    (score_ski * self.weighting['skills']) + 
                    (score_exp * self.weighting['experience'])
                )
                
                logger.info(f"Final weighted score: {weighted_score}")

                # Prepare data extracted for database
                data_extracted = { 
                    'skills': data['skills'],
                    'education': result['education'],
                    'experience': result['experience'],
                    'matched_skills': data_skills['matched_skills'],
                    'missing_skills': data_skills['missing_skills'],
                    'score_education': score_edu,
                    'score_experience': score_exp,
                    'score_skills': score_ski,
                    'total_score': weighted_score,
                    'summary': data['summary']
                }

                logger.info(f"Data extracted: {data_extracted}")
                
                # Store in database if session available
                if self.db_session and self.job_id and resume_id:
                    logger.info(f"Storing results in database for resume_id={resume_id}, job_id={self.job_id}")
                    personal_info = self.resume_processor.anonymizer.info
                    self._store_in_database(data_extracted, resume_id, personal_info)
                else:
                    logger.info("Skipping database storage (missing db_session, job_id, or resume_id)")
                
                self.processed_files += 1
                process_time = time.time() - start_time
                logger.info(f"Resume processing completed in {process_time:.2f} seconds")
                return data_extracted
            else:
                logger.error(f"Error: AI processing failed for {file_path}")
                self.failed_files += 1
                return None
                
        except Exception as e:
            logger.exception(f"Error processing resume {file_path}: {str(e)}")
            self.failed_files += 1
            return None
            
    def _store_in_database(self, data, resume_id, personal_info=None):
        """Store processing results in the database"""
        try:
            # Create score record
            logger.info(f"Creating Score record for resume_id={resume_id}, job_id={self.job_id}")
            score = Score(
                job_id=self.job_id,
                resume_id=resume_id,
                score=data['total_score'],
                matching_skills=data['matched_skills'],
                missing_skills=data['missing_skills']
            )
            
            # Update resume with extracted information
            logger.info(f"Updating Resume record with extracted information")
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
                logger.info(f"Processing experience data: {data['experience']}")
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
                logger.info(f"Processing education data: {data['education']}")
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
                
                logger.info(f"Resume record updated successfully with experience and education data")
                
                # Update candidate information if personal_info is available
                if personal_info and resume.candidate_id:
                    self._update_candidate_info(resume.candidate_id, personal_info)
            else:
                logger.warning(f"Resume record with id={resume_id} not found in database")
            
            # Add and commit changes
            self.db_session.add(score)
            self.db_session.commit()
            logger.info(f"Database transaction committed successfully")
            
        except Exception as e:
            self.db_session.rollback()
            logger.exception(f"Database error: {str(e)}")
            
    def _update_candidate_info(self, candidate_id, personal_info):
        """Update candidate information with extracted personal details"""
        try:
            logger.info(f"Updating candidate information for candidate_id={candidate_id}")
            candidate = self.db_session.query(Candidate).filter(Candidate.candidate_id == candidate_id).first()
            
            if candidate:
                # Only update if the fields are empty or the new data is better
                if personal_info.get('name') and (not candidate.name or candidate.name == "Unknown"):
                    candidate.name = personal_info.get('name')
                    logger.info(f"Updated candidate name to: {candidate.name}")
                    
                if personal_info.get('email') and (not candidate.email or '@example.com' in candidate.email):
                    candidate.email = personal_info.get('email')
                    logger.info(f"Updated candidate email to: {candidate.email}")
                    
                if personal_info.get('phone_number') and not candidate.phone:
                    candidate.phone = personal_info.get('phone_number')
                    logger.info(f"Updated candidate phone to: {candidate.phone}")
                    
                logger.info(f"Candidate information updated successfully")
            else:
                logger.warning(f"Candidate with id={candidate_id} not found in database")
                
        except Exception as e:
            logger.exception(f"Error updating candidate information: {str(e)}")
            # Don't raise the exception so it doesn't affect the main transaction

    def process_resume_directory(self, directory_path):
        """Process all resumes in a local directory (for testing)"""
        logger.info(f"Processing all resumes in directory: {directory_path}")
        file_count = 0
        
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            file_count += 1
            logger.info(f"Processing file {file_count}: {filename}")
            self.process_single_resume(file_path)
            
        logger.info(f"Directory processing complete. Processed: {self.processed_files}, Failed: {self.failed_files}")
            
    def process_s3_resumes(self, s3_keys, resume_map=None):
        """
        Process resumes stored in S3
        
        Args:
            s3_keys: List of S3 keys for resumes to process
            resume_map: Dictionary mapping S3 keys to resume_ids in the database
            
        Returns:
            Dictionary with processing statistics
        """
        logger.info(f"Starting batch processing of {len(s3_keys)} resumes from S3")
        start_time = time.time()
        
        if not resume_map:
            resume_map = {}
            logger.info("No resume_map provided, using empty map")
        else:
            logger.info(f"Resume map provided with {len(resume_map)} entries")
            
        results = []
        
        for idx, s3_key in enumerate(s3_keys):
            resume_id = resume_map.get(s3_key)
            logger.info(f"Processing S3 file {idx+1}/{len(s3_keys)}: {s3_key}, mapped to resume_id={resume_id}")
            result = self.process_single_resume(s3_key, is_s3_path=True, resume_id=resume_id)
            if result:
                results.append(result)
        
        total_time = time.time() - start_time
        logger.info(f"Batch processing complete in {total_time:.2f} seconds. Processed: {self.processed_files}, Failed: {self.failed_files}")
        
        return {
            "total_files": len(s3_keys),
            "processed_files": self.processed_files,
            "failed_files": self.failed_files,
            "processing_time_seconds": total_time
        }

def process_job(job_description):
    logger.info("Processing job description text")
    keyWords = [
        'description',
        'responsibilities',
        'requirements',
        'nice_to_have'
    ]
    text = ""
    for key in keyWords:
        if key in job_description:
            if isinstance(job_description[key], str):
                text += key + ": " + job_description[key] + "\n"
            else:
                text += key + ": " + ', '.join(job_description[key]) + "\n"
    
    logger.info(f"Job description processed, generated {len(text)} characters of text")
    return text

async def process_all_resumes(job_id, resume_s3_keys, job_description_data, weighting, db_session):
    """
    Process multiple resumes against a job description asynchronously
    
    Args:
        job_id: The job ID
        resume_s3_keys: List of S3 keys for the resumes
        job_description_data: Dictionary containing job description data
        weighting: Dictionary with weights for different categories
        db_session: SQLAlchemy database session
        
    Returns:
        Dictionary with processing statistics
    """
    logger.info(f"Starting async resume processing for job_id={job_id} with {len(resume_s3_keys)} resumes")
    logger.info(f"Weights: {weighting}")
    
    try:
        # Process job description
        logger.info("Processing job description data")
        job_text = process_job(job_description_data)
        
        # Get resume IDs from database
        logger.info("Retrieving resume records from database")
        resume_map = {}
        for s3_key in resume_s3_keys:
            filename = os.path.basename(s3_key)
            resume = db_session.query(Resume).filter(
                Resume.file_path == s3_key,
                Resume.job_id == job_id
            ).first()
            
            if resume:
                resume_map[s3_key] = resume.resume_id
                logger.info(f"Found resume in DB: {s3_key} -> resume_id={resume.resume_id}")
            else:
                logger.warning(f"Resume not found in DB: {s3_key}")
        
        logger.info(f"Found {len(resume_map)} matching resume records in database")
        
        # Initialize manager and process resumes
        logger.info("Initializing ResumeProcessingManager")
        manager = ResumeProcessingManager(
            job_text, 
            job_description_data, 
            weighting,
            db_session=db_session,
            job_id=job_id
        )
        
        logger.info("Starting batch processing of resumes")
        result = manager.process_s3_resumes(resume_s3_keys, resume_map)
        logger.info(f"Processing complete: {result}")
        return result
    
    except Exception as e:
        logger.exception(f"Error in process_all_resumes: {str(e)}")
        return {
            "error": str(e),
            "total_files": len(resume_s3_keys) if resume_s3_keys else 0,
            "processed_files": 0,
            "failed_files": 0
        }
    
