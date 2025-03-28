import pathlib
import os
import docx2txt
import PyPDF2
import tempfile
import logging
import time
from io import BytesIO

# Set up logging
logger = logging.getLogger(__name__)

class FileParser:

    def extract_text_from_file(self, file_path, is_s3_path=False, s3_service=None):
        """
        Extract text from a file, either local or from S3
        
        Args:
            file_path: Path to file (local path or S3 key)
            is_s3_path: Whether the file_path is an S3 key
            s3_service: S3Service instance if is_s3_path is True
            
        Returns:
            Extracted text or None if extraction failed
        """
        start_time = time.time()
        logger.info(f"Starting text extraction from {'S3 key' if is_s3_path else 'local file'}: {file_path}")
        
        try:
            if is_s3_path:
                if not s3_service:
                    logger.error("S3Service must be provided for S3 paths")
                    raise ValueError("S3Service must be provided for S3 paths")
                
                # Download from S3 to temp file and extract text
                logger.info(f"Downloading file from S3: {file_path}")
                temp_file_path, _ = s3_service.download_file(file_path)
                extension = pathlib.Path(file_path).suffix.lower()
                logger.info(f"File downloaded to temporary path: {temp_file_path}, extension: {extension}")
                
                result = self._extract_from_file(temp_file_path, extension)
                
                # Clean up the temp file
                if os.path.exists(temp_file_path):
                    logger.info(f"Removing temporary file: {temp_file_path}")
                    os.remove(temp_file_path)
                    
                elapsed_time = time.time() - start_time
                text_length = len(result) if result else 0
                logger.info(f"Text extraction completed in {elapsed_time:.2f} seconds. Extracted {text_length} characters")
                return result
            else:
                # Process regular local file
                if not os.path.exists(file_path):
                    logger.error(f"File not found: {file_path}")
                    raise FileNotFoundError(f"File not found: {file_path}")
                    
                extension = pathlib.Path(file_path).suffix.lower()
                logger.info(f"Processing local file with extension: {extension}")
                result = self._extract_from_file(file_path, extension)
                
                elapsed_time = time.time() - start_time
                text_length = len(result) if result else 0
                logger.info(f"Text extraction completed in {elapsed_time:.2f} seconds. Extracted {text_length} characters")
                return result
        
        except Exception as e:
            logger.exception(f"Error reading file: {e}")
        
        return None

    def _extract_from_file(self, file_path, extension):
        """Internal method to extract text based on file extension"""
        logger.info(f"Extracting text from file {file_path} with extension {extension}")
        
        if extension == ".pdf":
            return self.extract_text_from_pdf(file_path)
        elif extension in [".doc", ".docx"]:
            logger.info(f"Processing Word document with docx2txt")
            return docx2txt.process(file_path).strip()
        elif extension == ".txt":
            logger.info(f"Processing text file")
            with open(file_path, "r", encoding="utf-8") as file:
                return file.read().strip()
        else:
            logger.error(f"Unsupported file type: {extension}")
            raise ValueError(f"Unsupported file type: {extension}")

    def extract_text_from_pdf(self, file_path):
        logger.info(f"Extracting text from PDF: {file_path}")
        start_time = time.time()
        text = ""
        try:
            with open(file_path, "rb") as file:
                reader = PyPDF2.PdfReader(file)
                num_pages = len(reader.pages)
                logger.info(f"PDF has {num_pages} pages")
                
                for page in range(num_pages):
                    logger.info(f"Processing page {page+1}/{num_pages}")
                    page_text = reader.pages[page].extract_text()
                    text += page_text + "\n"
                    
            elapsed_time = time.time() - start_time
            logger.info(f"PDF text extraction completed in {elapsed_time:.2f} seconds. Extracted {len(text)} characters")
            return text.strip()
        except Exception as e:
            logger.exception(f"Error with PyPDF2: {e}")
            return ""
