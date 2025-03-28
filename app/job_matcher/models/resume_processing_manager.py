import os
import time
from app.job_matcher.utils.file_parser import FileParser
from app.job_matcher.models.resume_processor import ResumeProcessor
from app.job_matcher.models.matching_skills import calculate_skills_score

class ResumeProcessingManager:
    def __init__(self, job_text, job_data, Weighting):
        self.resume_processor = ResumeProcessor(job_text)
        self.file_parser = FileParser()
        self.weighting = Weighting
        self.job_data = job_data

    def process_single_resume(self, resume_text, file_name, key):

        result, data, personale_data = self.resume_processor.process_resume(resume_text)
        if result and data and personale_data:

            # Calculate comprehensive score
            skills_score_data = calculate_skills_score(data['skills'], self.job_data)
            
            education_score = float(result['education']['match_percentage'].strip("%"))
            experience_score = float(result['experience']['match_percentage'].strip("%"))
            skills_score = skills_score_data['match_percentage']

            # Calculate weighted score
            weighted_score = (
                (education_score * self.weighting['education']) + 
                (skills_score * self.weighting['skills']) + 
                (experience_score * self.weighting['experience'])
            )

            # pass to dataBase :  
            extracted_data = {
                'name':personale_data['name'],
                'email':personale_data['email'],
                'phone_number':personale_data['phone_number'],
                'skills': data['skills'],
                'education': result['education'],
                'experience': result['experience'],
                'matched_skills': skills_score_data['matched_skills'],
                'missing_skills': skills_score_data['missing_skills'],
                'ScoreEducation': education_score,
                'ScoreExperience': experience_score,
                'ScoreSkills': skills_score,
                'totalScore': weighted_score,
                'summary': data['summary']
            }

        else :
            raise Exception("Error : Unable to parse file ", file_name)

def get_job_description(job_descreption):
    keyWords = [
        'description',
        'responsibilities',
        'requirements',
        'nice_to_have'
    ]
    text = ""
    for key in keyWords:
        if type(job_descreption[key]) == str:
            text += key + ": " + job_descreption[key] + "\n"
        else:
            text += key + ": " + ', '.join(job_descreption[key]) + "\n"
    
    return text

def process_all_resumes(data):
    print(data)
    return
    job_text = get_job_description(data['job_descreption'])

    manager = ResumeProcessingManager(job_text, data['job_descreption'], data['weights'])
    manager.process_single_resume(data['file_content'], data['file_name'], data['s3_key'])

    
