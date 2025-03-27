# app/services/s3_service.py
import os
import boto3
from fastapi import UploadFile, HTTPException
from io import BytesIO
import tempfile

class S3Service:
    def __init__(self):
        # Initialize S3 client from environment variables
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            region_name=os.getenv("AWS_REGION", "us-east-1")
        )
        self.bucket_name = os.getenv("S3_BUCKET_NAME", "gammachallenge")
        self.prefix = "resumes/"
    
    def upload_file(self, file: UploadFile) -> str:
        """
        Upload a file to S3 bucket
        Returns the S3 key of the uploaded file
        """
        try:
            # Read file content
            file_content = file.file.read()
            
            # Create S3 key (folder/filename.pdf)
            s3_key = f"{self.prefix}{file.filename}"
            
            # Upload file to S3
            self.s3_client.upload_fileobj(
                BytesIO(file_content),
                self.bucket_name,
                s3_key,
                ExtraArgs={"ContentType": file.content_type}
            )
            
            # Rewind the file for future reads
            file.file.seek(0)
            
            return s3_key
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
    
    def download_file(self, s3_key: str) -> tuple:
        """
        Download a file from S3 bucket
        Returns a tuple of (file_content, filename)
        """
        try:
            # Extract filename from S3 key
            filename = os.path.basename(s3_key)
            
            # Create a temporary file to store the download
            with tempfile.NamedTemporaryFile(delete=False) as temp_file:
                # Download file from S3 to the temporary file
                self.s3_client.download_file(
                    self.bucket_name,
                    s3_key,
                    temp_file.name
                )
            
            return temp_file.name, filename
        
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 download failed: {str(e)}")
    
    def list_files(self) -> list:
        """
        List all PDF files in the S3 bucket prefix
        Returns a list of S3 keys
        """
        try:
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=self.prefix
            )
            
            # Extract file keys from response
            if 'Contents' in response:
                return [item['Key'] for item in response['Contents'] if item['Key'].endswith('.pdf')]
            return []
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 list operation failed: {str(e)}")
    
    def delete_file(self, s3_key: str) -> bool:
        """
        Delete a file from S3 bucket
        Returns True if successful
        """
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"S3 deletion failed: {str(e)}")