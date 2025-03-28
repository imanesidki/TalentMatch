from sqlalchemy.orm import Session
from app.db.database import get_db, engine
from app.models.models import Candidate, Resume, Score, Job
import random
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sample resume summaries
sample_summaries = [
    "Dynamic software engineer with {experience_years} years of experience in developing scalable applications using {skill1}, {skill2}, and {skill3}. Passionate about clean code and efficient solutions.",
    "Results-driven {position} with a proven track record in delivering high-quality solutions. Experienced in {skill1}, {skill2}, and {skill3} with a focus on performance optimization.",
    "Innovative {position} with {experience_years} years of experience in {industry}. Proficient in {skill1}, {skill2}, and {skill3} with a strong commitment to best practices and continuous learning.",
    "Detail-oriented {position} with extensive knowledge of {skill1} and {skill2}. Experienced in building robust applications with a focus on user experience and maintainability.",
    "Versatile and proactive {position} with {experience_years}+ years of hands-on experience. Strong expertise in {skill1}, {skill2}, and {skill3} with a passion for solving complex problems."
]

# Industries for summaries
industries = [
    "fintech", "healthcare", "e-commerce", "social media", "enterprise software", 
    "cybersecurity", "cloud computing", "mobile app development", "data analytics"
]

def enhance_candidate_data():
    """
    Enhance existing candidate data with more detailed resume information
    where it's missing or incomplete.
    """
    db = next(get_db())
    try:
        candidates = db.query(Candidate).all()
        logger.info(f"Found {len(candidates)} candidates to enhance")
        
        for candidate in candidates:
            # Get the candidate's resume
            resume = db.query(Resume).filter(Resume.candidate_id == candidate.candidate_id).first()
            
            if not resume:
                logger.warning(f"Candidate {candidate.name} (ID: {candidate.candidate_id}) has no resume. Skipping...")
                continue
                
            # Check for job and score
            job = db.query(Job).filter(Job.job_id == resume.job_id).first()
            score = db.query(Score).filter(Score.resume_id == resume.resume_id).first()
            
            if not job or not score:
                logger.warning(f"Candidate {candidate.name} has incomplete job or score data. Skipping...")
                continue
                
            # Enhance resume information if needed
            updated = False
            
            # Extract experience years from the experience string if possible
            experience_years = "5"  # Default
            if resume.experience:
                years_match = resume.experience.split(" years")[0].split(" ")[-1]
                if years_match.isdigit():
                    experience_years = years_match
            
            # Extract position from experience if possible
            position = "Professional"
            if resume.experience:
                position_match = re.search(r'as an? (.+?) at', resume.experience, re.IGNORECASE) 
                if not position_match:
                    position_match = re.search(r'in (.+?) at', resume.experience, re.IGNORECASE)
                if position_match:
                    position = position_match.group(1)
            
            # Enhance summary if missing or minimal
            if not resume.summary or len(resume.summary) < 50:
                # Get skills to use in the summary
                skills = resume.skills if resume.skills else job.skills
                skills_to_use = random.sample(skills, min(3, len(skills))) if skills else ["programming", "problem-solving", "teamwork"]
                
                # Create a detailed summary
                summary_template = random.choice(sample_summaries)
                resume.summary = summary_template.format(
                    experience_years=experience_years,
                    position=position,
                    industry=random.choice(industries),
                    skill1=skills_to_use[0] if len(skills_to_use) > 0 else "programming",
                    skill2=skills_to_use[1] if len(skills_to_use) > 1 else "problem-solving",
                    skill3=skills_to_use[2] if len(skills_to_use) > 2 else "teamwork"
                )
                updated = True
                
            # Ensure there are skills
            if not resume.skills or len(resume.skills) == 0:
                # Use job skills or generic skills if needed
                if job and job.skills:
                    resume.skills = job.skills
                else:
                    resume.skills = ["Python", "JavaScript", "SQL", "Git", "Agile"]
                updated = True
                
            # Ensure experience is detailed
            if not resume.experience or len(resume.experience) < 20:
                companies = ["Google", "Microsoft", "Amazon", "Facebook", "Netflix", "Apple", "Salesforce", "Uber", "Airbnb", "Twitter"]
                resume.experience = f"{experience_years} years as a {position} at {random.choice(companies)}"
                updated = True
                
            # Ensure education is provided
            if not resume.education or len(resume.education) < 20:
                degrees = ["Bachelor's", "Master's", "PhD"]
                fields = ["Computer Science", "Software Engineering", "Information Technology", "Data Science"]
                schools = ["MIT", "Stanford", "Berkeley", "Carnegie Mellon", "Harvard", "Georgia Tech", "Caltech", "UCLA"]
                resume.education = f"{random.choice(degrees)} in {random.choice(fields)} from {random.choice(schools)}"
                updated = True
                
            # Update the resume if changes were made
            if updated:
                db.add(resume)
                logger.info(f"Enhanced resume data for {candidate.name} (ID: {candidate.candidate_id})")
                
        # Commit all changes
        db.commit()
        logger.info("Successfully enhanced candidate data")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error enhancing candidate data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    enhance_candidate_data() 