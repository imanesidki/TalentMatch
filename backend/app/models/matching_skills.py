import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Dict, List, Any

def calculate_score(resume_skills, job_description, Skills):

    resume_skills = set([x.lower() for x in resume_skills])

    job_skills = set([x.lower() for x in job_description[Skills]])

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

def calculate_skills_score(resume_data, job_description):
    # Calculate individual section scores
    technical_skills_score = calculate_score(resume_data['hard_skills'], job_description,'hard_skills')
    soft_skills_score = calculate_score(resume_data['soft_skills'], job_description,'soft_skills')
    print(technical_skills_score, soft_skills_score)

    # Combine technical and soft skills scores with adjustable weights
    technical_weight: float = 0.8 
    soft_weight: float = 0.2
    total_score = ((technical_weight * technical_skills_score['total_score']) + (soft_weight * soft_skills_score['total_score'])) / (technical_weight + soft_weight)
    
    result = {
        'match_percentage': total_score,
        'matched_skills': technical_skills_score["matched_skills"] + soft_skills_score["matched_skills"],
        'missing_skills': technical_skills_score["missing_skills"] + soft_skills_score["missing_skills"],
    }
    return result

def calculate_weighted_score(skill_score, educataion_score, expirence_score, weighted):
    pass