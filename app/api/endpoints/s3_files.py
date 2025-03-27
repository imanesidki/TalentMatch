# app/api/endpoints/s3_files.py
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from typing import List

from app.services.s3_service import S3Service
import os

router = APIRouter(prefix="/s3", tags=["files"])

# Dependency to get S3 service
def get_s3_service():
    return S3Service()

@router.post("/upload", status_code=201)
async def upload_file(
    file: UploadFile = File(...),
    s3_service: S3Service = Depends(get_s3_service)
):
    """Upload a file to S3"""
    # Validate file type
    if not file.filename.lower().endswith(('.pdf', '.docx', '.doc')):
        raise HTTPException(status_code=400, detail="Only PDF and Word documents are allowed")
    
    # Upload to S3
    s3_key = s3_service.upload_file(file)
    
    return {
        "filename": file.filename,
        "s3_key": s3_key,
        "message": "File uploaded successfully"
    }

@router.get("/files", response_model=List[str])
async def list_files(s3_service: S3Service = Depends(get_s3_service)):
    """List all files in S3 bucket"""
    files = s3_service.list_files()
    return files

@router.get("/download/{file_key:path}")
async def download_file(
    file_key: str,
    s3_service: S3Service = Depends(get_s3_service)
):
    """Download a file from S3"""
    try:
        # Download from S3
        temp_file_path, filename = s3_service.download_file(file_key)
        
        # Return file response (will be deleted after response is sent)
        return FileResponse(
            path=temp_file_path,
            filename=filename,
            media_type="application/octet-stream"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{file_key:path}")
async def delete_file(
    file_key: str,
    s3_service: S3Service = Depends(get_s3_service)
):
    """Delete a file from S3"""
    success = s3_service.delete_file(file_key)
    return {"message": "File deleted successfully"}