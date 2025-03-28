import os
import asyncio
import logging
from sqlalchemy.orm import Session
from fastapi import BackgroundTasks, HTTPException, Depends
from app.db.database import get_db
from app.services.resume_processing_manager import process_all_resumes
from app.services.s3_service import S3Service
from app.models.models import Job, Resume
from typing import List, Dict, Any

# Set up logging
logger = logging.getLogger(__name__)

class ResumeProcessingService:
    def __init__(self):
        self.s3_service = S3Service()
        self._processing_jobs = {}  # Store job_id -> status mapping

    async def process_resumes_for_job(self, 
                                      job_id: int, 
                                      resume_s3_keys: List[str], 
                                      weighting: Dict[str, float],
                                      db: Session):
        """
        Process all resumes for a job asynchronously and store results in database
        
        Args:
            job_id: The job ID
            resume_s3_keys: List of S3 keys for the uploaded resumes
            weighting: Dictionary with weights for different categories
            db: Database session
            
        Returns:
            Dictionary with processing status
        """
        try:
            logger.info(f"Starting resume processing for job ID: {job_id}")
            # Track this job as in-progress
            self._processing_jobs[job_id] = {
                "status": "processing", 
                "total": len(resume_s3_keys),
                "processed": 0,
                "failed": 0
            }
            
            # Get job details from database
            job = db.query(Job).filter(Job.job_id == job_id).first()
            if not job:
                logger.error(f"Job with ID {job_id} not found")
                self._processing_jobs[job_id] = {"status": "failed", "error": f"Job with ID {job_id} not found"}
                return {"status": "failed", "error": f"Job with ID {job_id} not found"}
            
            # Extract job description data with proper defaults for required fields
            job_description_data = {
                "description": job.description or "",
                "responsibilities": job.responsibilities or [],
                "requirements": job.requirements or [],
                "nice_to_have": job.nice_to_have or [],
                "hard_skills": job.skills or [],  # Assuming skills field contains hard skills
                "soft_skills": [],  # Initialize with empty list
                "title": job.title or "",
                "department": job.department or "",
                "location": job.location or "",
                "type": job.type or ""
            }
            
            # Log the job description data for debugging
            logger.info(f"Job description data prepared: {job_description_data}")
            
            # Process resumes asynchronously
            result = await process_all_resumes(
                job_id=job_id,
                resume_s3_keys=resume_s3_keys,
                job_description_data=job_description_data,
                weighting=weighting,
                db_session=db
            )
            logger.info(f"Resume processing completed for job ID: {job_id}")
            
            # Update job status
            self._processing_jobs[job_id] = {
                "status": "completed", 
                "total": result.get("total_files", 0),
                "processed": result.get("processed_files", 0),
                "failed": result.get("failed_files", 0)
            }
            
            return {
                "status": "completed", 
                "message": f"Successfully processed {result.get('processed_files', 0)} out of {result.get('total_files', 0)} resumes"
            }
            
        except Exception as e:
            logger.error(f"Error processing resumes for job ID {job_id}: {str(e)}")
            self._processing_jobs[job_id] = {"status": "failed", "error": str(e)}
            return {"status": "failed", "error": str(e)}
    
    def get_processing_status(self, job_id: int):
        """Get the current processing status for a job"""
        if job_id not in self._processing_jobs:
            logger.warning(f"No processing job found for job ID: {job_id}")
            return {"status": "unknown", "message": "No processing job found for this job ID"}
        
        logger.info(f"Returning processing status for job ID: {job_id}")
        return self._processing_jobs[job_id]

# Singleton instance 
resume_processing_service = ResumeProcessingService()

def start_resume_processing(
    job_id: int,
    resume_s3_keys: List[str],
    weighting: Dict[str, float],
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Start resume processing in a background task
    
    Args:
        job_id: The job ID
        resume_s3_keys: List of S3 keys for the uploaded resumes
        weighting: Dictionary with weights for different categories
        background_tasks: FastAPI BackgroundTasks
        db: Database session
        
    Returns:
        Dictionary with task status information
    """
    logger.info(f"Starting resume processing for job ID: {job_id}")
    # Initial status
    resume_processing_service._processing_jobs[job_id] = {
        "status": "starting", 
        "total": len(resume_s3_keys),
        "processed": 0,
        "failed": 0
    }
    
    # Add the processing task to background tasks
    async def process_task():
        db_session = next(get_db())
        try:
            await resume_processing_service.process_resumes_for_job(
                job_id=job_id, 
                resume_s3_keys=resume_s3_keys, 
                weighting=weighting,
                db=db_session
            )
        finally:
            db_session.close()
    
    background_tasks.add_task(process_task)
    logger.info(f"Resume processing for job ID {job_id} has been added to background tasks")
    
    return {
        "status": "started",
        "job_id": job_id,
        "message": f"Processing of {len(resume_s3_keys)} resumes has been started in the background"
    } 