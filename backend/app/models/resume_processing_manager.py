import os
import time
from utils.file_parser import FileParser
from models.resume_processor import ResumeProcessor
from models.matching_skills import calculate_skills_score

class ResumeProcessingManager:
    def __init__(self, job_descreption, origine_job_descreption, Weighting):
        self.resume_processor = ResumeProcessor(job_descreption)
        self.file_parser = FileParser()
        self.weighting = Weighting
        self.origine_job_descreption = origine_job_descreption

    def process_single_resume(self, file_path):
        """Process a single resume file"""
        resume_text = self.file_parser.extract_text_from_file(file_path)
        if not resume_text:
            raise "Error: Could not extract text from {file_path}"
        result, data = self.resume_processor.process_resume(resume_text)
        if result and data:
            # Calculate comprehensive score
            data_skills = calculate_skills_score(data['skills'], self.origine_job_descreption)
            
            score_edu = float(result['education']['match_percentage'].strip("%"))
            score_exp = float(result['experience']['match_percentage'].strip("%"))
            score_ski = data_skills['match_percentage']
            # Calculate weighted score
            weighted_score = (
                (score_edu * self.weighting['education']) + 
                (score_ski * self.weighting['skills']) + 
                (score_exp * self.weighting['experience'])
            )

            # pass to dataBase :  
            DataExtracted = { 
                'skills': data['skills'],
                'education': result['education'],
                'experience': result['experience'],
                'matched_skills': data_skills['matched_skills'],
                'missing_skills': data_skills['missing_skills'],
                'ScoreEducation': score_edu,
                'ScoreExperience': score_exp,
                'ScoreSkills': score_ski,
                'totalScore': weighted_score,
                'summary': data['summary']
            }

            print(DataExtracted)
        else :
            print("Error : This file Cant Parse", file_path)
       

    def process_resume_directory(self, directory_path):
        """Process all resumes in a directory processing"""
    
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            self.process_single_resume(file_path)


def process_job(job_descreption):
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

def process_all_resumes(resumes_path, job_description_data, Weighting):
    """Main method to process resumes against a job description"""
    job_text = process_job(job_description_data)

    manager = ResumeProcessingManager(job_text, job_description_data, Weighting)
    manager.process_resume_directory(resumes_path)
    
