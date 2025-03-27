import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Any, Optional

def calculate_score(resume_skills, job_skills):
    """
    Calculate the match score between resume skills and job skills
    
    Args:
        resume_skills: List of skills from the resume
        job_skills: List of skills from the job
        
    Returns:
        Dictionary with score and matched/missing skills
    """
    resume_skills = set([x.lower() for x in resume_skills])
    job_skills = set([x.lower() for x in job_skills])

    # Exact match for skills
    matched_skills = job_skills.intersection(resume_skills)
    missing_skills = job_skills - matched_skills
    exact_match_score = len(matched_skills) / len(job_skills) if job_skills else 0

    # Partial match using TF-IDF and cosine similarity for technical skills
    if job_skills and resume_skills:
        vectorizer = TfidfVectorizer(stop_words='english')
        technical_matrix = vectorizer.fit_transform(list(job_skills) + list(resume_skills))
        technical_similarity_matrix = cosine_similarity(technical_matrix)
        significant_technical_similarities = technical_similarity_matrix[:len(job_skills), len(job_skills):]
        significant_technical_similarities = significant_technical_similarities[significant_technical_similarities > 0.5]
        partial_match_score = np.mean(significant_technical_similarities) if significant_technical_similarities.size > 0 else 0
    else:
        partial_match_score = 0

    # Overall score
    score = (0.7 * exact_match_score + 0.3 * partial_match_score) * 100

    # Generate detailed scoring breakdown
    category_scores = {
        'total_score': score,
        'matched_skills': list(matched_skills),
        'missing_skills': list(missing_skills),
    }

    return  category_scores

def calculate_skills_score(resume_data, job):
    """
    Calculate the skills score between resume data and job
    
    Args:
        resume_data: Dictionary containing resume skills data
        job: Job model from the database
        
    Returns:
        Dictionary with match percentage and matched/missing skills
    """
    # Split job skills into hard and soft skills (if not already split)
    # For now, we'll consider all job skills as hard skills
    job_hard_skills = job.skills if hasattr(job, 'skills') else []
    
    # Default empty list for soft skills if not present
    job_soft_skills = []
    
    # Calculate individual section scores
    technical_skills_score = calculate_score(
        resume_data.get('hard_skills', []), 
        job_hard_skills
    )
    
    soft_skills_score = calculate_score(
        resume_data.get('soft_skills', []), 
        job_soft_skills
    )
    
    # Combine technical and soft skills scores with adjustable weights
    technical_weight: float = 0.8 
    soft_weight: float = 0.2
    
    # Calculate total score
    if technical_skills_score['total_score'] > 0 or soft_skills_score['total_score'] > 0:
        total_score = ((technical_weight * technical_skills_score['total_score']) + 
                      (soft_weight * soft_skills_score['total_score'])) / (technical_weight + soft_weight)
    else:
        total_score = 0
    
    result = {
        'match_percentage': total_score,
        'matched_skills': technical_skills_score["matched_skills"] + soft_skills_score["matched_skills"],
        'missing_skills': technical_skills_score["missing_skills"] + soft_skills_score["missing_skills"],
    }
    return result

def calculate_weighted_score(skill_score: float, education_score: float, experience_score: float, 
                            weights: Dict[str, float]) -> float:
    """
    Calculate the weighted score based on component scores and weights
    
    Args:
        skill_score: Score for skills matching
        education_score: Score for education matching
        experience_score: Score for experience matching
        weights: Dictionary with weights for each component
        
    Returns:
        Weighted total score
    """
    # Normalize weights to ensure they sum to 1.0
    total_weight = sum(weights.values())
    normalized_weights = {k: v/total_weight for k, v in weights.items()}
    
    # Calculate weighted score
    weighted_score = (
        skill_score * normalized_weights.get('skills', 0.0) +
        education_score * normalized_weights.get('education', 0.0) +
        experience_score * normalized_weights.get('experience', 0.0)
    )
    
    return weighted_score

def prepare_job_for_matching(job) -> Dict[str, Any]:
    """
    Convert a job model to the format expected by the matching algorithm
    
    Args:
        job: Job model from the database
        
    Returns:
        Dictionary with job data in the format expected by the matching algorithm
    """
    return {
        'hard_skills': job.skills if hasattr(job, 'skills') else [],
        'soft_skills': [],  # Currently not separated in the job model
        'description': job.description if hasattr(job, 'description') else "",
        'responsibilities': job.responsibilities if hasattr(job, 'responsibilities') else [],
        'requirements': job.requirements if hasattr(job, 'requirements') else [],
        'nice_to_have': job.nice_to_have if hasattr(job, 'nice_to_have') else []
    }
