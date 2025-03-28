from app.job_matcher.utils.bias_free_resume import ResumeAnonymizerPersonalData
from app.job_matcher.utils.prompt import COMBINED_PROMPT, SUMMARY_RESUME_PROMPT
from app.job_matcher.models.globals import LLM
from typing import Dict, Any
from langchain_core.output_parsers import JsonOutputParser
import time
import json
import re

class ResumeProcessor:

    def __init__(self, job_descreption):
        self.parser = JsonOutputParser()
        self.job_descreption = job_descreption
        self.anonymizer =  ResumeAnonymizerPersonalData()
    
    def process_resume(self, resume_text):

        personale_data = self.anonymizer.get_data_resume(resume_text)
        resume_text = self.anonymizer.anonymize_text(resume_text, personale_data)

        data = self.parse_resume_with_llm({"resume_text":resume_text, "job_description":self.job_descreption}, COMBINED_PROMPT)
        summary = self.parse_resume_with_llm({"resume_text":resume_text}, SUMMARY_RESUME_PROMPT)

        return data, summary, personale_data

    def parse_resume_with_llm(self, data, thePrompt):

        LangChain = thePrompt | LLM | self.parser
        try:
            response = LangChain.invoke(data)

            if isinstance(response, str):
                return self.correct(response)                    
            return response
            
        except Exception as e:
            print(str(e))
            return None
        

    def correct(self, input_json):
        
        try:
            json.loads(input_json)
        except json.JSONDecodeError:
            input_json = re.sub(r'//.*?\n|/\*.*?\*/', '', input_json, flags=re.DOTALL)
            input_json = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)(\s*:)', r'\1"\2"\3', input_json)
            input_json = input_json.replace("'", '"')
            input_json = re.sub(r',\s*}', '}', input_json)
            input_json = re.sub(r',\s*\]', ']', input_json)
            input_json = input_json.replace('True', 'true')
            input_json = input_json.replace('False', 'false')
            input_json = input_json.replace('None', 'null')
            try:
                json.loads(input_json)
                return input_json
            except json.JSONDecodeError:
                raise ValueError("Unable to correct JSON format")