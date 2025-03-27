
from models.resume_processing_manager import process_all_resumes
import time
import gc

Job_description_dict = {
        "title": "Senior Software Engineer",
        "department": "Engineering",
        "location": "San Francisco, CA",
        "type": "Full-time",
        "salary": "$150,000 - $180,000 per year",
        "description": "We are seeking a highly skilled Senior Software Engineer to join our innovative technology team. The ideal candidate will have extensive experience in developing scalable web applications and working with modern technology stacks.",
        "status": "active",
        "responsibilities": [
            "Design and implement scalable backend services",
            "Collaborate with cross-functional teams",
            "Participate in code reviews and mentor junior developers",
            "Contribute to architectural decisions",
            "Ensure high-quality software delivery"
        ],
        "requirements": [
            "7+ years of software engineering experience",
            "Proficiency in Python and JavaScript",
            "Experience with microservices architecture",
            "Strong understanding of RESTful API design",
            "Bachelor's degree in Computer Science or related field"
        ],
        "nice_to_have": [
            "Experience with cloud platforms (AWS, GCP)",
            "Knowledge of machine learning frameworks",
            "Contributions to open-source projects",
            "Experience with containerization technologies"
        ],
        "benefits": [
            "Competitive salary",
            "Comprehensive health insurance",
            "401(k) matching",
            "Remote work flexibility",
            "Professional development budget",
            "Annual performance bonus"
        ],
        "hard_skills": [
            "Python",
            "JavaScript",
            "React",
            "Docker",
            "Kubernetes",
            "SQL",
            "API Design"
        ],
        "soft_skills": [
            "Teamwork",
        ]
}

weighting = {
    'skills': 0.7,
    'education': 0.1,
    'experience': 0.2,
}

def hello():
    start_time = time.time()
    resumes_path = "resumes"
 
    process_all_resumes(resumes_path, Job_description_dict,weighting)
    

    print(f"\n\n✅ Done! Total time: {time.time() - start_time:.2f}s")

if __name__ == "__main__":
    gc.disable()
    hello()
    gc.enable()




