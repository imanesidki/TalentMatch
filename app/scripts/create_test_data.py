from sqlalchemy.orm import Session
from app.db.database import get_db, engine
from app.models.models import Base, Candidate, Resume, Score, Job
from app.models.models import JobStatus
import random
from datetime import datetime, timedelta
import logging
import sys

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample data
job_titles = [
    "Software Engineer", 
    "Data Scientist", 
    "Product Manager", 
    "UX Designer", 
    "DevOps Engineer"
]

candidate_names = [
    "John Smith", 
    "Emily Johnson", 
    "Michael Davis", 
    "Sarah Wilson", 
    "David Brown", 
    "Lisa Miller", 
    "Robert Taylor", 
    "Jessica Anderson", 
    "Thomas Martinez", 
    "Jennifer Garcia"
]

skills_pool = [
    "Python", "JavaScript", "React", "Node.js", "SQL", "NoSQL", "AWS", 
    "Docker", "Kubernetes", "CI/CD", "Machine Learning", "Data Analysis", 
    "TensorFlow", "PyTorch", "Git", "Agile", "Scrum", "UI/UX", "Figma", 
    "Adobe XD", "Product Management", "A/B Testing", "DevOps", "Linux", 
    "Networking", "Security", "REST API", "GraphQL", "TypeScript", "Go"
]

education_backgrounds = [
    "Bachelor's in Computer Science from MIT",
    "Master's in Data Science from Stanford",
    "Bachelor's in Software Engineering from Berkeley",
    "PhD in Machine Learning from CMU",
    "Master's in UX Design from RISD",
    "Bachelor's in Information Technology from Georgia Tech",
    "Master's in Computer Engineering from Caltech",
    "Bachelor's in Statistics from UCLA",
    "Master's in HCI from Michigan",
    "Bachelor's in MIS from NYU"
]

experiences = [
    "5 years of software development experience at Google",
    "3 years as a data scientist at Amazon",
    "7 years in product management at Facebook",
    "4 years as a UX designer at Apple",
    "6 years in DevOps at Microsoft",
    "2 years as a frontend developer at Netflix",
    "8 years as a backend engineer at Uber",
    "3 years in machine learning at Twitter",
    "5 years as a full-stack developer at Airbnb",
    "4 years in cloud infrastructure at Salesforce"
]

def delete_all_data(db):
    """Delete all data from the database in the correct order to respect foreign keys."""
    logger.info("Deleting all existing data...")
    db.query(Score).delete()
    db.query(Resume).delete()
    db.query(Candidate).delete()
    db.query(Job).delete()
    db.commit()
    logger.info("All existing data deleted.")

def create_test_data(force=False):
    db = next(get_db())
    # Print connection info without revealing password
    connection_info = str(db.bind.engine.url).replace(':password', ':***')
    print(f"Connecting to database: {connection_info}")
    
    try:
        # Check if we already have data
        existing_jobs = db.query(Job).count()
        existing_candidates = db.query(Candidate).count()
        
        if (existing_jobs > 0 or existing_candidates > 0) and not force:
            logger.info("Data already exists in database.")
            logger.info(f"Existing jobs: {existing_jobs}, Existing candidates: {existing_candidates}")
            logger.info("Skipping test data creation. Use --force to override.")
            return
        
        # If force is True or no data exists, proceed with data creation
        if existing_jobs > 0 or existing_candidates > 0:
            delete_all_data(db)
            
        # Create test jobs
        jobs = []
        for i, title in enumerate(job_titles):
            # Randomly select 4-8 skills for each job
            job_skills = random.sample(skills_pool, random.randint(4, 8))
            
            job = Job(
                title=title,
                type="Full-time",
                department=f"Department {i+1}",
                location=f"Location {i+1}",
                description=f"Description for {title}",
                skills=job_skills,
                salary=f"${random.randint(80, 150)}k - ${random.randint(151, 200)}k",
                responsibilities=[f"Responsibility {j+1} for {title}" for j in range(3)],
                requirements=[f"Requirement {j+1} for {title}" for j in range(3)],
                benefits=[f"Benefit {j+1}" for j in range(3)],
                status=JobStatus.ACTIVE.value
            )
            db.add(job)
            db.flush()
            jobs.append(job)
        
        db.commit()
        logger.info(f"Created {len(jobs)} test jobs")
        
        # Create candidates with resumes and scores - each candidate only applies to ONE job
        for i, name in enumerate(candidate_names):
            # Create candidate
            candidate = Candidate(
                name=name,
                email=f"{name.lower().replace(' ', '.')}@example.com",
                phone=f"+1-555-{100+i:03d}-{1000+i:04d}"
            )
            db.add(candidate)
            db.flush()
            
            # Assign one job to each candidate (ensure unique constraint is satisfied)
            job = jobs[i % len(jobs)]  # Distribute candidates evenly across jobs
            
            # Randomly select candidate skills (5-10 skills)
            candidate_skills = random.sample(skills_pool, random.randint(5, 10))
            
            # Calculate matching, missing and extra skills
            matching_skills = list(set(candidate_skills) & set(job.skills))
            missing_skills = list(set(job.skills) - set(candidate_skills))
            extra_skills = list(set(candidate_skills) - set(job.skills))
            
            # Calculate score based on skill matching (0.0 to 1.0)
            score_value = len(matching_skills) / len(job.skills) if job.skills else 0
            score_value = min(1.0, score_value + random.uniform(-0.1, 0.1))  # Add some randomness
            score_value = max(0.0, min(1.0, score_value))  # Ensure score is between 0 and 1
            
            # Create resume
            resume = Resume(
                candidate_id=candidate.candidate_id,
                job_id=job.job_id,
                summary=f"Experienced professional with expertise in {', '.join(candidate_skills[:3])}",
                skills=candidate_skills,
                experience=random.choice(experiences),
                education=random.choice(education_backgrounds),
                file_path=f"/uploads/resumes/candidate_{candidate.candidate_id}_job_{job.job_id}.pdf"
            )
            db.add(resume)
            db.flush()
            
            # Create score
            score = Score(
                job_id=job.job_id,
                resume_id=resume.resume_id,
                score=score_value,
                matching_skills=matching_skills,
                missing_skills=missing_skills,
                extra_skills=extra_skills
            )
            db.add(score)
            
            db.commit()
            logger.info(f"Created candidate {name} applying for job {job.title}")
        
        logger.info("Test data creation completed successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating test data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    force = '--force' in sys.argv
    create_test_data(force=force) 