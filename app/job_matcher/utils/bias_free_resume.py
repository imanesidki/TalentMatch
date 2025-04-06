import re
import logging

# Set up logging
logger = logging.getLogger(__name__)

class ResumeAnonymizerPersonalData:
    def __init__(self):
        self.bias_sensitive_terms = {
            'gender_markers': ['he/him', 'she/her', 'they/them'],
            'age_indicators': ['years old', 'age:', 'DOB:', 'date of birth'],
            'marital_status': ['married', 'single', 'divorced', 'widowed'],
            'nationality_markers': ['citizenship', 'nationality'],
            'protected_characteristics': ['race', 'ethnicity', 'religion', 'sexual orientation', 'disability status']
        }
        self.info = {'name': None, 'email': None, 'phone_number': None}

        self.pattern_name = r'\b[A-Z][a-z]*\s+[A-Z][a-z]*\b|\b[A-Z]+(?:\s+[A-Z]+)+\b'
        self.pattern_email = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        self.pattern_phone = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'

    def get_data(self, text):
        try:
            # Extract personal data
            self.info['name'] = self.extract_data(text, self.pattern_name)
            self.info['email'] = self.extract_data(text, self.pattern_email)
            self.info['phone_number'] = self.extract_data(text, self.pattern_phone)
            
            return self.info
        
        except Exception as e:
            logger.exception("Error during data extraction")
            return self.info

    def extract_data(self, text, pattern):
        matches = re.search(pattern, text)
        return matches[0] if matches else None

    def anonymize_text(self, text, data):
        try:
            working_text = text

            # Replace personal information
            for key, value in data.items():
                if value:
                    working_text = re.sub(re.escape(value), '[anonym]', working_text, flags=re.IGNORECASE)

            # Replace bias-sensitive terms
            for terms in self.bias_sensitive_terms.values():
                for term in terms:
                    working_text = re.sub(r'\b' + re.escape(term) + r'\b', '[anonym]', working_text, flags=re.IGNORECASE)

            return working_text

        except Exception as e:
            logger.exception("Error during anonymization")
            return text
