import pathlib
import os
import docx2txt
import PyPDF2
import logging

# Set up logging
logger = logging.getLogger(__name__)

class FileParser:

    def extract_text_from_file(self, file_path, s3_service=None):
        logger.info(f"Starting text extraction from 'S3 key': {file_path}")
        
        try:
            if not s3_service:
                raise ValueError("S3Service must be provided for S3 paths")
            
            # Download from S3 to temp file and extract text
            temp_file_path, _ = s3_service.download_file(file_path)
            extension = pathlib.Path(file_path).suffix.lower()
            
            result = self.extract_from_file(temp_file_path, extension)
            
            # Clean up the temp file
            if os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                
            return result
        
        except Exception as e:
            logger.exception(f"Error reading file: {e}")
        
        return None

    def extract_from_file(self, file_path, extension):
        if extension == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif extension in [".doc", ".docx"]:
            return docx2txt.process(file_path).strip()
        elif extension == ".txt":
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read().strip()
        else:
            logger.error(f"Unsupported file type: {extension}")
            raise ValueError(f"Unsupported file type: {extension}")

    def extract_text_from_pdf(self, file_path):
        text = ""
        try:
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                num_pages = len(reader.pages)
                for page in range(num_pages):
                    page_text = reader.pages[page].extract_text()
                    text += page_text + "\n"
        
            return text.strip()
        except Exception as e:
            logger.exception(f"Error with PyPDF2: {e}")
            return ""
