from app.utils.bias_free_resume import ResumeAnonymizerPersonalData
from app.utils.prompt import COMBINED_PROMPT, SUMMARY_RESUME_PROMPT
from typing import Dict, Any
from app.services.globals import LLM
from langchain_core.output_parsers import JsonOutputParser
import time
import json
import re
import logging

# Set up logging
logger = logging.getLogger(__name__)

class ResumeProcessor:

    def __init__(self, job_descreption):
        logger.info("Initializing ResumeProcessor")
        self.parser = JsonOutputParser()
        self.job_descreption = job_descreption
        self.anonymizer = ResumeAnonymizerPersonalData()
        logger.info("ResumeProcessor initialized successfully")
    
    def process_resume(self, resume_text):
        start_time = time.time()
        logger.info(f"Starting resume processing with AI. Text length: {len(resume_text)} characters")
        
        try:
            logger.info("Anonymizing personal data from resume")
            personale_data = self.anonymizer.get_data_resume(resume_text)
            logger.info(f"Personal data extracted: {personale_data}")
            
            resume_text = self.anonymizer.anonymize_text(resume_text, personale_data)
            logger.info("Resume text anonymized successfully")

            logger.info("Processing resume with LLM for job matching")
            data = self.parse_resume_with_llm(
                {"resume_text": resume_text, "job_description": self.job_descreption}, 
                COMBINED_PROMPT
            )
            
            logger.info("Processing resume with LLM for summary generation")
            summary = self.parse_resume_with_llm(
                {"resume_text": resume_text}, 
                SUMMARY_RESUME_PROMPT
            )
            
            elapsed_time = time.time() - start_time
            logger.info(f"Resume AI processing completed in {elapsed_time:.2f} seconds")
            
            if data and summary:
                logger.info("Both job matching and summary generation successful")
            else:
                logger.warning(f"Issues in AI processing - Job matching: {'Success' if data else 'Failed'}, Summary: {'Success' if summary else 'Failed'}")
                
            return data, summary
        except Exception as e:
            logger.exception(f"Error in resume processing: {str(e)}")
            return None, None

    def parse_resume_with_llm(self, data, thePrompt):
        prompt_name = "COMBINED_PROMPT" if "job_description" in data else "SUMMARY_RESUME_PROMPT"
        logger.info(f"Calling LLM with {prompt_name}")
        start_time = time.time()

        LangChain = thePrompt | LLM | self.parser
        try:
            logger.info("Invoking LLM...")
            response = LangChain.invoke(data)
            
            elapsed_time = time.time() - start_time
            logger.info(f"LLM invocation completed in {elapsed_time:.2f} seconds")

            if isinstance(response, str):
                logger.info("LLM returned string response, attempting to correct JSON")
                corrected_response = self.correct(response)
                
                # Log structure after correction
                if isinstance(corrected_response, dict):
                    logger.info(f"Corrected JSON structure keys: {list(corrected_response.keys())}")
                    # Log education and experience structures specifically
                    if 'education' in corrected_response:
                        edu = corrected_response['education']
                        logger.info(f"Education data type: {type(edu)}, Structure: {edu}")
                    if 'experience' in corrected_response:
                        exp = corrected_response['experience']
                        logger.info(f"Experience data type: {type(exp)}, Structure: {exp}")
                return corrected_response
            
            # Log structure of parsed response
            if isinstance(response, dict):
                logger.info(f"LLM returned structured response with keys: {list(response.keys())}")
                # Log education and experience structures specifically
                if 'education' in response:
                    edu = response['education']
                    logger.info(f"Education data type: {type(edu)}, Structure: {edu}")
                if 'experience' in response:
                    exp = response['experience']
                    logger.info(f"Experience data type: {type(exp)}, Structure: {exp}")
            else:
                logger.info(f"LLM returned non-dict response of type: {type(response)}")
                
            return response
            
        except Exception as e:
            logger.exception(f"Error in LLM processing: {str(e)}")
            return None
        

    def correct(self, input_json):
        logger.info("Attempting to correct malformed JSON from LLM")
        
        try:
            json.loads(input_json)
            logger.info("JSON is already valid, no correction needed")
            return input_json
        except json.JSONDecodeError:
            logger.info("JSON is invalid, applying corrections")
            try:
                # Remove comments (single and multi-line)
                input_json = re.sub(r'//.*?\n|/\*.*?\*/', '', input_json, flags=re.DOTALL)
                
                # add missing quotes around keys
                input_json = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)(\s*:)', r'\1"\2"\3', input_json)
                
                # replace single quotes with double quotes
                input_json = input_json.replace("'", '"')
                
                # remove trailing commas
                input_json = re.sub(r',\s*}', '}', input_json)
                input_json = re.sub(r',\s*\]', ']', input_json)
                
                # handle unquoted special values
                input_json = input_json.replace('True', 'true')
                input_json = input_json.replace('False', 'false')
                input_json = input_json.replace('None', 'null')
                
                # Verify the corrected JSON is valid
                try:
                    json.loads(input_json)
                    logger.info("JSON correction successful")
                    return input_json
                except json.JSONDecodeError as e:
                    logger.error(f"JSON correction failed: {str(e)}")
                    raise ValueError("Unable to correct JSON format")
            except Exception as e:
                logger.exception(f"Error during JSON correction: {str(e)}")
                raise ValueError("Unable to correct JSON format")