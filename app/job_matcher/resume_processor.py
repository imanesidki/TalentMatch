from app.job_matcher.utils.bias_free_resume import ResumeAnonymizerPersonalData
from app.job_matcher.matching_skills import calculate_skills_score
from app.job_matcher.utils.prompt import COMBINED_PROMPT, SUMMARY_RESUME_PROMPT
from app.job_matcher.utils.globals import LLM
from langchain_core.output_parsers import JsonOutputParser
import logging

# Set up logging
logger = logging.getLogger(__name__)

class ResumeProcessor:

    def __init__(self, job_descreption, original_job_description, weighting):
        self.anonymizer = ResumeAnonymizerPersonalData()
        self.original_job_description = original_job_description
        self.weighting = weighting
        self.parser = JsonOutputParser()
        self.job_descreption = job_descreption
    
    def process_single_resume(self, resume_text):
        try:
            result, data, personale_data = self.process_resume(resume_text)
            
            if result and data and personale_data:

                # Calculate comprehensive score
                data_skills = calculate_skills_score(data['skills'], self.original_job_description)
                
                education_score = float(result['education']['match_percentage'].strip("%"))
                experience_score = float(result['experience']['match_percentage'].strip("%"))
                skills_score = data_skills['match_percentage']
                            
                # Calculate weighted score
                weighted_score = (
                    (education_score * self.weighting['education']) + 
                    (skills_score * self.weighting['skills']) + 
                    (experience_score * self.weighting['experience'])
                )

                # Prepare data extracted for database
                data_extracted = {
                    'name':personale_data['name'],
                    'email':personale_data['email'],
                    'phone_number':personale_data['phone_number'],
                    'skills': data['skills'],
                    'education': result['education'],
                    'experience': result['experience'],
                    'matched_skills': data_skills['matched_skills'],
                    'missing_skills': data_skills['missing_skills'],
                    'extra_skills': data_skills['extra_skills'],
                    'ScoreEducation': education_score,
                    'ScoreExperience': experience_score,
                    'ScoreSkills': skills_score,
                    'totalScore': weighted_score,
                    'summary': data['summary']
                }

                return data_extracted
            else:
                logger.error(f"Error: AI processing failed")
                return None
                
        except Exception as e:
            logger.exception(f"Error processing resume: {str(e)}")
            return None


    def process_resume(self, resume_text):
        logger.info(f"Starting resume processing with AI.")
        
        try:
            personale_data = self.anonymizer.get_data(resume_text)
            resume_text = self.anonymizer.anonymize_text(resume_text, personale_data)
            
            data_llm = {"resume_text": resume_text, "job_description": self.job_descreption}
            data = self.parse_resume_with_llm(data_llm, COMBINED_PROMPT)
            
            summary = self.parse_resume_with_llm({"resume_text": resume_text}, SUMMARY_RESUME_PROMPT)

            return data, summary, personale_data
        
        except Exception as e:
            logger.exception(f"Error in resume processing\n {str(e)}")
            return None, None, None

    def parse_resume_with_llm(self, data, thePrompt):
        LangChain = thePrompt | LLM | self.parser
        try:
            response = LangChain.invoke(data)
            return response
            
        except Exception as e:
            raise Exception("Parsed resume contains no meaningful data")
    