# app/services/s3_service.py
import os
import boto3
import logging
import time
from fastapi import UploadFile, HTTPException
from io import BytesIO
import tempfile

from dotenv import load_dotenv

load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

class S3Service:
    def __init__(self):
        # Initialize S3 client from environment variables
        logger.info("Initializing S3Service")
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "gammachallenge")
        self.prefix = "resumes/"
        logger.info(f"S3Service initialized with bucket: {self.bucket_name}, prefix: {self.prefix}")
    
    def upload_file(self, file: UploadFile) -> str:
        """
        Upload a file to S3 bucket
        Returns the S3 key of the uploaded file
        """
        start_time = time.time()
        logger.info(f"Starting S3 upload for file: {file.filename}, size: {file.size if hasattr(file, 'size') else 'unknown'}, content-type: {file.content_type}")
        
        try:
            # Read file content
            file_content = file.file.read()
            content_size = len(file_content)
            logger.info(f"Read {content_size} bytes from file {file.filename}")
            
            # Create S3 key (folder/filename.pdf)
            s3_key = f"{self.prefix}{file.filename}"
            logger.info(f"Generated S3 key: {s3_key}")
            
            # Upload file to S3
            logger.info(f"Uploading to S3 bucket: {self.bucket_name}")
            self.s3_client.upload_fileobj(
                BytesIO(file_content),
                self.bucket_name,
                s3_key,
                ExtraArgs={"ContentType": file.content_type}
            )
            
            # Rewind the file for future reads
            file.file.seek(0)
            
            elapsed_time = time.time() - start_time
            logger.info(f"S3 upload completed for {s3_key} in {elapsed_time:.2f} seconds")
            return s3_key
        
        except Exception as e:
            logger.exception(f"S3 upload failed for {file.filename}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
    
    def download_file(self, s3_key: str) -> tuple:
        """
        Download a file from S3 bucket
        Returns a tuple of (file_content, filename)
        """
        start_time = time.time()
        logger.info(f"Starting S3 download for key: {s3_key}")
        
        try:
            # Extract filename from S3 key
            filename = os.path.basename(s3_key)
            logger.info(f"Extracted filename: {filename}")
            
            # Create a temporary file to store the download
            logger.info("Creating temporary file for download")
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                logger.info(f"Temporary file created at: {temp_file.name}")
                
                # Download file from S3 to the temporary file
                logger.info(f"Downloading from bucket: {self.bucket_name}")
                self.s3_client.download_file(
                    self.bucket_name,
                    s3_key,
                    temp_file.name
                )
            
            elapsed_time = time.time() - start_time
            logger.info(f"S3 download completed for {s3_key} to {temp_file.name} in {elapsed_time:.2f} seconds")
            return temp_file.name, filename
        
        except Exception as e:
            logger.exception(f"S3 download failed for {s3_key}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"S3 download failed: {str(e)}")
    
    def list_files(self) -> list:
        """
        List all PDF files in the S3 bucket prefix
        Returns a list of S3 keys
        """
        logger.info(f"Listing files in bucket: {self.bucket_name}, prefix: {self.prefix}")
        
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=self.prefix
            )
            
            # Extract file keys from response
            if 'Contents' in response:
                file_keys = [item['Key'] for item in response['Contents'] if item['Key'].endswith('.pdf')]
                logger.info(f"Found {len(file_keys)} PDF files in S3")
                return file_keys
            
            logger.info("No files found in S3 bucket/prefix")
            return []
            
        except Exception as e:
            logger.exception(f"S3 list operation failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"S3 list operation failed: {str(e)}")
    
    def delete_file(self, s3_key: str) -> bool:
        """
        Delete a file from S3 bucket
        Returns True if successful
        """
        logger.info(f"Deleting file from S3: {s3_key}")
        
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            logger.info(f"File deleted successfully: {s3_key}")
            return True
            
        except Exception as e:
            logger.exception(f"S3 deletion failed for {s3_key}: {str(e)}")
            raise HTTPException(status_code=500, detail=f"S3 deletion failed: {str(e)}")