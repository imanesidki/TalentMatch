import os
import logging
from app.services.s3_process_resumes import s3_process_resumes
from app.job_matcher.resume_processor import ResumeProcessor
from app.models.models import Resume

# Set up logging
logger = logging.getLogger(__name__)

def get_job_description_text(job_description):
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
    return text

async def process_all_resumes(job_id, resume_s3_keys, job_description_data, weighting, db_session):
    logger.info(f"Starting async resume processing for job_id={job_id} with {len(resume_s3_keys)} resumes")
    
    try:
        # Process job description
        job_text = get_job_description_text(job_description_data)
        
        manager = ResumeProcessor(job_text, job_description_data, weighting)
        process = s3_process_resumes(db_session=db_session,job_id=job_id)

        return process.process_s3_resumes(resume_s3_keys, manager)
    
    except Exception as e:
        logger.exception(f"Error in process_all_resumes: {str(e)}")
        return {
            "error": str(e),
            "total_files": len(resume_s3_keys) if resume_s3_keys else 0,
            "processed_files": 0,
            "failed_files": 0
        }
    
