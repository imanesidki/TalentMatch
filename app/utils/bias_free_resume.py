from app.services.globals import NLP, MATCHER
import re
import os
import io

class ResumeAnonymizerPersonalData:
    def __init__(self):
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

    def get_data_resume(self, text):
        """Parse the single resume file"""        
        # Process text
        try:
            nlp_doc = NLP(text)
            
            # Extract information
            name = self.extract_name(nlp_doc, MATCHER)
            email = self.extract_email(text)
            phone = self.extract_mobile_number(text)
            
            # Update info dictionary
            self.info['name'] = name
            self.info['email'] = email
            self.info['phone_number'] = phone
            
            return self.info
    
        except Exception as e:
            print(f"Error processing: {str(e)}")
            return None

    def extract_name(self, nlp_doc, matcher):
        pattern = [{'POS': 'PROPN'}, {'POS': 'PROPN'}]
        matcher.add('NAME', [pattern])
        matches = matcher(nlp_doc)
        for match_id, start, end in matches:
            return nlp_doc[start:end].text
        for ent in nlp_doc.ents:
            if ent.label_ == 'PERSON':
                return ent.text
        return None

    def extract_email(self, text):
        pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        match = re.search(pattern, text)
        return match.group(0) if match else None

    def extract_mobile_number(self, text):
        # Common phone number patterns
        pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        match = re.search(pattern, text)
        return match.group(0) if match else None

    def anonymize_text(self, text, info):
        """Anonymize specific info and other sensitive data"""
        working_text = text
        
        specific_patterns = {}
        if info.get('name'):
            specific_patterns['name'] = re.compile(re.escape(info['name']), re.IGNORECASE)
        if info.get('email'):
            specific_patterns['email'] = re.compile(re.escape(info['email']), re.IGNORECASE)
        if info.get('phone_number'):
            specific_patterns['phone_number'] = re.compile(re.escape(info['phone_number']))
        
        # Replace specific info with [anonym]
        for key, pattern in specific_patterns.items():
            working_text = pattern.sub('[anonym]', working_text)

        # Anonymize named entities
        doc = NLP(working_text)
        entities_to_anonymize = frozenset(['PERSON', 'GPE', 'ORG'])
        result = []
        last_end = 0

        for ent in doc.ents:
            result.append(working_text[last_end:ent.start_char])
            last_end = ent.end_char

        result.append(working_text[last_end:])
        return ''.join(result).strip()
