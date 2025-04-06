from difflib import SequenceMatcher
from statistics import mean

def calculate_score(resume_skills, job_description, Skills):
    resume_skills = set(x.lower() for x in resume_skills)
    job_skills = set(x.lower() for x in job_description[Skills])

    matched_skills = job_skills.intersection(resume_skills)
    exact_match_score = len(matched_skills) / len(job_skills) if job_skills else 0

    partial_scores = []
    unmatched_job_skills = job_skills - matched_skills
    unmatched_resume_skills = resume_skills - matched_skills

    if unmatched_job_skills and unmatched_resume_skills:
        for job_skill in unmatched_job_skills:
            best_similarity = max(
                SequenceMatcher(None, job_skill, resume_skill).ratio()
                for resume_skill in unmatched_resume_skills
            )
            if best_similarity > 0.7:
                partial_scores.append(best_similarity)

    partial_match_score = mean(partial_scores) if partial_scores else 0
    score = (0.7 * exact_match_score + 0.3 * partial_match_score) * 100
    return {
        'total_score': score,
        'matched_skills': list(matched_skills),
        'missing_skills': list(unmatched_job_skills),
        'extra_skills': list(resume_skills - job_skills),
    }

def calculate_skills_score(resume_data, job_description):
    # Calculate individual section scores
    technical_skills_score = calculate_score(resume_data['hard_skills'], job_description,'hard_skills')
    soft_skills_score = calculate_score(resume_data['soft_skills'], job_description,'soft_skills')

    # Combine technical and soft skills scores with adjustable weights
    technical_weight: float = 0.8 
    soft_weight: float = 0.2
    total_score = ((technical_weight * technical_skills_score['total_score']) + (soft_weight * soft_skills_score['total_score'])) / (technical_weight + soft_weight)
    result = {
        'match_percentage': total_score,
        'matched_skills': technical_skills_score["matched_skills"] + soft_skills_score["matched_skills"],
        'missing_skills': technical_skills_score["missing_skills"] + soft_skills_score["missing_skills"],
        'extra_skills': technical_skills_score["extra_skills"] + soft_skills_score["extra_skills"]
    }
    return result