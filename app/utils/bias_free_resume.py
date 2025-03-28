from app.services.globals import NLP, MATCHER
import re
import os
import io
import logging
import time

# Set up logging
logger = logging.getLogger(__name__)

class ResumeAnonymizerPersonalData:
    def __init__(self):
        logger.info("Initializing ResumeAnonymizerPersonalData")
        # Lists to help remove potential bias indicators
        self.bias_sensitive_terms = {
            'gender_markers': ['he/him', 'she/her', 'they/them'],
            'age_indicators': ['years old', 'age:', 'DOB:', 'date of birth'],
            'marital_status': ['married', 'single', 'divorced', 'widowed'],
            'nationality_markers': ['citizenship', 'nationality'],
            'protected_characteristics': [
                'race', 'ethnicity', 'religion', 
                'sexual orientation', 'disability status'
            ]
        }
        
        self.info = {
            'name': None,
            'email': None,
            'phone_number': None
        }
        logger.info("ResumeAnonymizerPersonalData initialized successfully")

    def get_data_resume(self, text):
        """Parse the single resume file"""
        logger.info(f"Extracting personal data from resume text. Text length: {len(text)} characters")
        start_time = time.time()
        
        # Process text
        try:
            logger.info("Processing text with NLP model")
            nlp_doc = NLP(text)
            
            # Extract information
            logger.info("Extracting name")
            name = self.extract_name(nlp_doc, MATCHER)
            
            logger.info("Extracting email")
            email = self.extract_email(text)
            
            logger.info("Extracting phone number")
            phone = self.extract_mobile_number(text)
            
            # Update info dictionary
            self.info['name'] = name
            self.info['email'] = email
            self.info['phone_number'] = phone
            
            elapsed_time = time.time() - start_time
            logger.info(f"Personal data extraction completed in {elapsed_time:.2f} seconds")
            logger.info(f"Extracted data: name={name}, email={email}, phone={phone}")
            
            return self.info
    
        except Exception as e:
            logger.exception(f"Error processing resume for personal data: {str(e)}")
            return None

    def extract_name(self, nlp_doc, matcher):
        logger.info("Attempting to extract name using pattern matching")
        pattern = [{'POS': 'PROPN'}, {'POS': 'PROPN'}]
        matcher.add('NAME', [pattern])
        matches = matcher(nlp_doc)
        for match_id, start, end in matches:
            name = nlp_doc[start:end].text
            logger.info(f"Name extracted via pattern matching: {name}")
            return name
            
        logger.info("Pattern matching failed, trying entity recognition")
        for ent in nlp_doc.ents:
            if ent.label_ == 'PERSON':
                name = ent.text
                logger.info(f"Name extracted via entity recognition: {name}")
                return name
                
        logger.warning("Failed to extract name from resume")
        return None

    def extract_email(self, text):
        logger.info("Extracting email with regex pattern")
        pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(pattern, text)
        if match:
            email = match.group(0)
            logger.info(f"Email extracted: {email}")
            return email
        else:
            logger.warning("No email found in text")
            return None

    def extract_mobile_number(self, text):
        logger.info("Extracting phone number with regex pattern")
        # Common phone number patterns
        pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        match = re.search(pattern, text)
        if match:
            phone = match.group(0)
            logger.info(f"Phone number extracted: {phone}")
            return phone
        else:
            logger.warning("No phone number found in text")
            return None

    def anonymize_text(self, text, info):
        """Anonymize specific info and other sensitive data"""
        logger.info(f"Starting anonymization of resume text. Text length: {len(text)} characters")
        start_time = time.time()
        
        working_text = text
        
        # Build patterns for personal info replacement
        logger.info("Creating replacement patterns for personal information")
        specific_patterns = {}
        if info.get('name'):
            specific_patterns['name'] = re.compile(re.escape(info['name']), re.IGNORECASE)
        if info.get('email'):
            specific_patterns['email'] = re.compile(re.escape(info['email']), re.IGNORECASE)
        if info.get('phone_number'):
            specific_patterns['phone_number'] = re.compile(re.escape(info['phone_number']))
        
        # Replace specific info with [anonym]
        replacements = 0
        for key, pattern in specific_patterns.items():
            logger.info(f"Replacing {key} instances")
            new_text, count = pattern.subn('[anonym]', working_text)
            working_text = new_text
            replacements += count
            logger.info(f"Replaced {count} instances of {key}")

        # Anonymize named entities
        logger.info("Processing text for named entity anonymization")
        doc = NLP(working_text)
        entities_to_anonymize = frozenset(['PERSON', 'GPE', 'ORG'])
        result = []
        last_end = 0
        entity_count = 0

        for ent in doc.ents:
            if ent.label_ in entities_to_anonymize:
                result.append(working_text[last_end:ent.start_char])
                # Don't append the entity text - effectively removing it
                entity_count += 1
                last_end = ent.end_char
            else:
                continue

        result.append(working_text[last_end:])
        anonymized_text = ''.join(result).strip()
        
        elapsed_time = time.time() - start_time
        char_diff = len(text) - len(anonymized_text)
        logger.info(f"Anonymization completed in {elapsed_time:.2f} seconds")
        logger.info(f"Replaced {replacements} personal info instances and {entity_count} named entities")
        logger.info(f"Character count changed by {char_diff} ({len(text)} -> {len(anonymized_text)})")
        
        return anonymized_text

